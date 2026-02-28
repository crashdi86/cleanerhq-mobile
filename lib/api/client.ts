import { API_BASE_URL } from "@/constants/api";
import { TokenManager } from "@/lib/auth/token-manager";

// ── Response Types ──

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Array<{ path: string; message: string }>,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Rate Limit Tracking ──

let rateLimitState = { limit: 0, remaining: 0, reset: 0 };

export function getRateLimitState() {
  return { ...rateLimitState };
}

// ── Request Options ──

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

// ── Core Request Function ──

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, authenticated = true } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Inject Bearer token
  if (authenticated) {
    const token = await TokenManager.getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  if (__DEV__) {
    console.log(
      `[API] ${method} ${endpoint}`,
      body ? JSON.stringify(body).slice(0, 200) : ""
    );
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Track rate limit headers
  const rlLimit = response.headers.get("X-RateLimit-Limit");
  const rlRemaining = response.headers.get("X-RateLimit-Remaining");
  const rlReset = response.headers.get("X-RateLimit-Reset");
  if (rlLimit) rateLimitState.limit = parseInt(rlLimit, 10);
  if (rlRemaining) rateLimitState.remaining = parseInt(rlRemaining, 10);
  if (rlReset) rateLimitState.reset = parseInt(rlReset, 10);

  // Handle 401 with token refresh
  if (response.status === 401 && authenticated) {
    let errorBody: ApiErrorResponse | null = null;
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      throw new ApiError("UNAUTHORIZED", "Unauthorized", undefined, 401);
    }

    if (errorBody?.error?.code === "TOKEN_EXPIRED") {
      try {
        const newToken = await TokenManager.refresh();
        requestHeaders["Authorization"] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(retryResponse);
      } catch {
        throw new ApiError(
          "TOKEN_EXPIRED",
          "Session expired. Please log in again.",
          undefined,
          401
        );
      }
    }

    throw new ApiError(
      errorBody?.error?.code ?? "UNAUTHORIZED",
      errorBody?.error?.message ?? "Unauthorized",
      errorBody?.error?.details,
      401
    );
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;

  if (__DEV__) {
    console.log(
      `[API] Response ${response.status}`,
      JSON.stringify(json).slice(0, 300)
    );
  }

  if (!json.success) {
    const err = json as ApiErrorResponse;
    throw new ApiError(
      err.error.code,
      err.error.message,
      err.error.details,
      response.status
    );
  }

  return (json as ApiSuccessResponse<T>).data;
}

// ── Exported Typed Client ──

export const apiClient = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "DELETE" }),
};
