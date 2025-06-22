import { urls } from "./urls";
import { useAuthStore } from "./auth";

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;
  isTimeout: boolean;

  constructor(
    message: string,
    options: {
      status?: number;
      isNetworkError?: boolean;
      isTimeout?: boolean;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status || 0;
    this.isNetworkError = options.isNetworkError || false;
    this.isTimeout = options.isTimeout || false;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

const defaultOptions: ApiClientOptions = {
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Lightweight API client that standardizes errors but lets React Query handle retries
 */
export class ApiClient {
  private options: ApiClientOptions;
  private controller: AbortController;

  constructor(options: ApiClientOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.controller = new AbortController();
  }

  /**
   * Make an API request with standardized error handling
   */
  async request<T = unknown>(
    url: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    this.controller = new AbortController();

    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }

    const authState = useAuthStore.getState();
    if (
      authState.token &&
      authState.isAuthenticated &&
      !url.includes("login")
    ) {
      headers.set("Authorization", `Bearer ${authState.token}`);
    }

    const timeoutId = setTimeout(() => {
      this.controller.abort();
    }, timeout || this.options.timeout || 15000);

    try {
      if (!navigator.onLine) {
        throw new ApiError("Network connection is unavailable", {
          isNetworkError: true,
        });
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: this.controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().setIsAuthenticated(false);
          useAuthStore.getState().setUser(null);
          useAuthStore.getState().setToken(null);
          window.location.href = "/login";
          throw new ApiError("Authentication required", {
            status: response.status,
          });
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `HTTP Error ${response.status}`;

        throw new ApiError(errorMessage, {
          status: response.status,
        });
      }

      if (response.status !== 204) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      } else if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("Request timed out", { isTimeout: true });
      } else if (error instanceof Error) {
        throw new ApiError(error.message, { isNetworkError: true });
      } else {
        throw new ApiError("Unknown error occurred");
      }
    }
  }

  /**
   * Abort any current requests
   */
  abort() {
    this.controller.abort();
  }

  /**
   * Get a user-friendly error message
   */
  static getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.isNetworkError)
        return "Network connection is unavailable. Please check your internet connection.";
      if (error.isTimeout) return "Request timed out. Please try again later.";

      switch (error.status) {
        case 400:
          return "Invalid request. Please check your input and try again.";
        case 401:
          return "Authentication required. Please sign in to continue.";
        case 403:
          return "You don't have permission to access this resource.";
        case 404:
          return "The requested resource was not found.";
        case 429:
          return "Too many requests. Please try again later.";
        case 500:
          return "A server error occurred. Our team has been notified.";
        default:
          return (
            error.message || "An unexpected error occurred. Please try again."
          );
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Utility methods for common HTTP methods
   */
  async get<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T = unknown, D = unknown>(
    url: string,
    data: D,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      },
      timeout
    );
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data: D,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      },
      timeout
    );
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data: D,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    return this.request<T>(
      url,
      {
        ...options,
        method: "PATCH",
        body: JSON.stringify(data),
      },
      timeout
    );
  }

  async delete<T = unknown>(
    url: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" }, timeout);
  }
}

// Create default clients for each API endpoint
export const joystickApi = new ApiClient({
  baseUrl: urls.joystick,
});

export const streamApi = new ApiClient({
  baseUrl: urls.stream_api,
});

// Helper function to create full URLs with base URL
export function createUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
