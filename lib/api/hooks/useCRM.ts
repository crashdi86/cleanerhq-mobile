import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiQuery } from "@/lib/api/hooks";
import { apiClient, type ApiError } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { cacheStorage } from "@/lib/offline";
import type {
  AccountListItem,
  ContactListItem,
  CRMSearchResult,
} from "@/lib/api/types";

// ── Paginated Response Shape ──

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ── S6: Offline cache helpers ──

/**
 * Cache the first page of a paginated list for offline access.
 * Only caches when offset === 0 (first page) and no search filter.
 */
async function cacheFirstPage<T>(
  cacheKey: string,
  page: PaginatedResponse<T>,
  offset: number,
  hasSearchFilter: boolean,
): Promise<void> {
  // Only cache the unfiltered first page
  if (offset !== 0 || hasSearchFilter) return;
  try {
    await cacheStorage.set({
      key: cacheKey,
      entityType: "crm-list",
      data: JSON.stringify(page),
      syncedAt: Date.now(),
    });
  } catch {
    // Cache write failure is non-critical
  }
}

/**
 * Read cached first page as a fallback on network error.
 */
async function readCachedFirstPage<T>(
  cacheKey: string,
): Promise<PaginatedResponse<T> | null> {
  try {
    const cached = await cacheStorage.get(cacheKey);
    if (cached) {
      return JSON.parse(cached.data) as PaginatedResponse<T>;
    }
  } catch {
    // Cache read failure is non-critical
  }
  return null;
}

/**
 * Creates a queryFn with offline cache fallback for first page.
 */
function createCachedQueryFn<T>(
  fetchFn: (offset: number) => Promise<PaginatedResponse<T>>,
  cacheKey: string,
  hasSearchFilter: boolean,
) {
  return async ({ pageParam }: { pageParam: unknown }): Promise<PaginatedResponse<T>> => {
    const offset = pageParam as number;
    try {
      const result = await fetchFn(offset);
      // Cache first page for offline access
      void cacheFirstPage(cacheKey, result, offset, hasSearchFilter);
      return result;
    } catch (error) {
      // On network error for first page, try cache fallback
      if (offset === 0 && isNetworkError(error)) {
        const cached = await readCachedFirstPage<T>(cacheKey);
        if (cached) return cached;
      }
      throw error;
    }
  };
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("network") ||
      msg.includes("fetch") ||
      msg.includes("timeout") ||
      msg.includes("abort") ||
      msg.includes("econnrefused")
    ) {
      return true;
    }
  }
  return false;
}

// ── S1: Accounts List ──

const ACCOUNTS_CACHE_KEY = "crm:accounts:first-page";

/** Paginated accounts list with search + sort (offline cached first page) */
export function usePaginatedAccounts(search: string, sortBy: string) {
  const hasSearch = search.length > 0;

  const fetchFn = (offset: number) => {
    const params = new URLSearchParams();
    params.set("limit", "20");
    params.set("offset", String(offset));
    if (search) params.set("search", search);
    if (sortBy) params.set("sort_by", sortBy);
    return apiClient.get<PaginatedResponse<AccountListItem>>(
      `${ENDPOINTS.ACCOUNTS}?${params.toString()}`
    );
  };

  return useInfiniteQuery<PaginatedResponse<AccountListItem>, ApiError>({
    queryKey: ["accounts", "list", search, sortBy],
    queryFn: createCachedQueryFn(fetchFn, ACCOUNTS_CACHE_KEY, hasSearch),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    staleTime: 60_000,
  });
}

// ── S3: Contacts List ──

const CONTACTS_CACHE_KEY = "crm:contacts:first-page";

/** Paginated contacts list with search + optional account filter (offline cached first page) */
export function usePaginatedContacts(search: string, accountId?: string) {
  const hasFilter = search.length > 0 || !!accountId;

  const fetchFn = (offset: number) => {
    const params = new URLSearchParams();
    params.set("limit", "20");
    params.set("offset", String(offset));
    if (search) params.set("search", search);
    if (accountId) params.set("account_id", accountId);
    return apiClient.get<PaginatedResponse<ContactListItem>>(
      `${ENDPOINTS.CONTACTS}?${params.toString()}`
    );
  };

  return useInfiniteQuery<PaginatedResponse<ContactListItem>, ApiError>({
    queryKey: ["contacts", "list", search, accountId ?? ""],
    queryFn: createCachedQueryFn(fetchFn, CONTACTS_CACHE_KEY, hasFilter),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    staleTime: 60_000,
  });
}

// ── S5: Global CRM Search ──

/** Cross-entity CRM search (accounts, contacts, jobs) — no offline cache (transient) */
export function useCRMSearch(query: string) {
  return useApiQuery<CRMSearchResult>(
    ["crm-search", query],
    () =>
      apiClient.get<CRMSearchResult>(
        `${ENDPOINTS.CRM_SEARCH}?q=${encodeURIComponent(query)}`
      ),
    {
      staleTime: 30_000,
      enabled: query.length >= 2,
    }
  );
}
