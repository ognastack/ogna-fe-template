export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  aud?: string;
  role?: string;
}

export type AuthError = {
  code?: number;
  error_code?: string;
  msg?: string;
};

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ApiResult<T = object> = {
  data: T | null;
  error: AuthError | null;
};

// ✅ Type guard to safely detect AuthError
export function isAuthError(err: unknown): err is AuthError {
  return typeof err === "object" && err !== null && "msg" in err;
}

export class OgnaClient {
  private ognaBaseUrl: string;
  private authUrl: string;
  private session: Session | null = null;

  constructor(baseUrl: string) {
    this.ognaBaseUrl = baseUrl.replace(/\/+$/, "");
    this.authUrl = `${this.ognaBaseUrl}/auth`;

    if (typeof window !== "undefined") {
      this.loadSessionFromCookies();
    }
  }

  // -------------------------------
  // Session persistence
  // -------------------------------
  private loadSessionFromCookies(): void {
    const sessionCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ogna_session="));

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(
          decodeURIComponent(sessionCookie.split("=")[1])
        );
        this.session = sessionData;

        // Mirror token to localStorage if not already there
        if (
          typeof window !== "undefined" &&
          !localStorage.getItem("ogna_token")
        ) {
          localStorage.setItem("ogna_token", sessionData.access_token);
        }
      } catch (error) {
        console.error("Failed to parse session cookie:", error);
        this.clearSessionCookies();
      }
    }
  }

  private saveSessionToCookies(session: Session): void {
    if (typeof window === "undefined") return;

    const maxAge = session.expires_in || 3600;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    // Cookie readable by JS / middleware
    document.cookie = `ogna_token=${session.access_token}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

    // Store full session in cookie for client reload
    document.cookie = `ogna_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

    // Mirror token to localStorage for API calls
    localStorage.setItem("ogna_token", session.access_token);
  }

  private clearSessionCookies(): void {
    if (typeof window === "undefined") return;
    document.cookie = "ogna_token=; Path=/; Max-Age=0";
    document.cookie = "ogna_session=; Path=/; Max-Age=0";
    localStorage.removeItem("ogna_token");
  }

  // -------------------------------
  // Auth endpoints
  // -------------------------------
  async login(email: string, password: string): Promise<ApiResult<Session>> {
    const result = await this.authRequest<Session>(
      `${this.authUrl}/token?grant_type=password`,
      { email, password }
    );
    if (result.data) this.saveSessionToCookies(result.data);
    return result;
  }

  async signup(email: string, password: string): Promise<ApiResult<Session>> {
    const result = await this.authRequest<Session>(`${this.authUrl}/signup`, {
      email,
      password,
    });

    // If signup succeeds, mirror session like login
    if (result.data) {
      this.session = result.data;
      this.saveSessionToCookies(result.data);
    }

    return result;
  }

  async logout(): Promise<ApiResult> {
    if (!this.session) {
      return { data: null, error: { msg: "User not signed in" } };
    }

    try {
      const response = await fetch(`${this.authUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: { msg: errorData.msg || "Logout failed" } };
      }

      this.session = null;
      this.clearSessionCookies();
      return { data: {}, error: null };
    } catch (error) {
      return {
        data: null,
        error: { msg: error instanceof Error ? error.message : "Logout error" },
      };
    }
  }

  // -------------------------------
  // Helpers
  // -------------------------------
  getUser(): User | null {
    return this.session?.user ?? null;
  }

  getToken(): string | null {
    return typeof window !== "undefined"
      ? localStorage.getItem("ogna_token")
      : this.session?.access_token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getSession(): Session | null {
    return this.session;
  }

  setSession(session: Session | null): void {
    this.session = session;
    session ? this.saveSessionToCookies(session) : this.clearSessionCookies();
  }

  // -------------------------------
  // API requests using token from localStorage
  // -------------------------------
  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: object,
    init: RequestInit = {}
  ): Promise<ApiResult<T>> {
    try {
      const token = this.getToken();
      if (!token) return { data: null, error: { msg: "No token available" } };

      const url = `${this.ognaBaseUrl}/api/${
        path.startsWith("/") ? path : path
      }`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        ...(init.headers as Record<string, string>),
      };
      if (body) headers["Content-Type"] = "application/json";

      const res = await fetch(url, {
        ...init,
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          data: null,
          error: {
            msg: `API ${method} ${url} failed: ${res.status} ${errorText}`,
          },
        };
      }

      const json = (await res.json()) as T;
      return { data: json, error: null };
    } catch (err) {
      return {
        data: null,
        error: { msg: err instanceof Error ? err.message : "Network error" },
      };
    }
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>("GET", path, undefined, init);
  }

  post<T>(path: string, body: object, init?: RequestInit) {
    return this.request<T>("POST", path, body, init);
  }

  // Optional: keep put/delete if needed
  put<T>(path: string, body: object, init?: RequestInit) {
    return this.request<T>("PUT", path, body, init);
  }

  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>("DELETE", path, undefined, init);
  }

  // -------------------------------
  // Internal auth request
  // -------------------------------
  private async authRequest<T>(
    url: string,
    body: object
  ): Promise<ApiResult<T>> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return {
          data: null,
          error: {
            msg: errorData.msg || errorData.error_description || "Auth failed",
          },
        };
      }

      const data: Session = await res.json();
      this.session = data;
      this.saveSessionToCookies(data);

      return { data: data as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: { msg: err instanceof Error ? err.message : "Auth error" },
      };
    }
  }
}
