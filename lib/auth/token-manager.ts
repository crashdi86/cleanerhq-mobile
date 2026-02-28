import { tokenStorage, type StoredTokens } from "./token-storage";
import { AppState, type AppStateStatus } from "react-native";

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 60 * 1000; // check every 60 seconds

type RefreshFunction = (refreshToken: string) => Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}>;

class TokenManagerImpl {
  private static instance: TokenManagerImpl;
  private refreshPromise: Promise<string> | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private refreshFn: RefreshFunction | null = null;
  private onLogoutCb: (() => void) | null = null;

  private constructor() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  static getInstance(): TokenManagerImpl {
    if (!TokenManagerImpl.instance) {
      TokenManagerImpl.instance = new TokenManagerImpl();
    }
    return TokenManagerImpl.instance;
  }

  /** Call once during app init to inject the refresh API call and logout handler */
  configure(refreshFn: RefreshFunction, onLogout: () => void): void {
    this.refreshFn = refreshFn;
    this.onLogoutCb = onLogout;
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await tokenStorage.getTokens();
    if (!tokens) return null;

    const expiresAt = new Date(tokens.expiresAt).getTime();
    const now = Date.now();

    if (now >= expiresAt) {
      // Token is expired — try to refresh
      return this.refresh();
    }

    if (expiresAt - now < REFRESH_THRESHOLD_MS) {
      // Token expires soon — refresh proactively but don't block
      this.refresh().catch(() => {});
    }

    return tokens.accessToken;
  }

  async saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    await tokenStorage.saveTokens({ accessToken, refreshToken, expiresAt });
    this.startProactiveRefresh();
  }

  /**
   * Refresh the token. Concurrent callers share the same promise
   * to avoid the thundering herd problem.
   */
  async refresh(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<string> {
    if (!this.refreshFn) throw new Error("TokenManager not configured");

    const tokens = await tokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      this.handleRefreshFailure();
      throw new Error("No refresh token available");
    }

    try {
      const result = await this.refreshFn(tokens.refreshToken);
      await this.saveTokens(
        result.access_token,
        result.refresh_token,
        result.expires_in
      );
      return result.access_token;
    } catch {
      this.handleRefreshFailure();
      throw new Error("Token refresh failed");
    }
  }

  private handleRefreshFailure(): void {
    this.stopProactiveRefresh();
    tokenStorage.clearTokens();
    this.onLogoutCb?.();
  }

  startProactiveRefresh(): void {
    this.stopProactiveRefresh();
    this.refreshInterval = setInterval(async () => {
      const tokens = await tokenStorage.getTokens();
      if (!tokens) return;
      const expiresAt = new Date(tokens.expiresAt).getTime();
      if (expiresAt - Date.now() < REFRESH_THRESHOLD_MS) {
        this.refresh().catch(() => {});
      }
    }, CHECK_INTERVAL_MS);
  }

  stopProactiveRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async logout(): Promise<void> {
    this.stopProactiveRefresh();
    await tokenStorage.clearTokens();
    this.onLogoutCb?.();
  }

  private handleAppStateChange = (nextState: AppStateStatus): void => {
    if (nextState === "active") {
      this.startProactiveRefresh();
    } else {
      this.stopProactiveRefresh();
    }
  };
}

export const TokenManager = TokenManagerImpl.getInstance();
