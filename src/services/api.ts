import { clearToken, getToken, saveToken } from "../utils/tokenStorage";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../interfaces/auth";
import type {
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../interfaces/task";

const API_BASE_URL = "/api/v1";
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 300;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export interface ApiClientResponse<T> {
  data: T;
  status: number;
  ok: boolean;
  headers: Headers;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  skipAuthRefresh?: boolean;
};

export class ApiError<T = unknown> extends Error {
  status: number;
  data?: T;

  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const toHeaders = (headers?: HeadersInit): Headers => {
  return new Headers(headers);
};

const normalizeBody = (body?: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream
  ) {
    return body;
  }

  return JSON.stringify(body);
};

const buildHeaders = (body: BodyInit | undefined, headers?: HeadersInit): Headers => {
  const merged = toHeaders(headers);
  const token = getToken();

  if (token) {
    merged.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined && !(body instanceof FormData) && !merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }

  return merged;
};

const getErrorMessage = (data: unknown, status: number): string => {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return `Request failed with status ${status}`;
};

const parseResponseData = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => undefined);
  }

  return response.text().catch(() => undefined);
};

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === "AbortError";
};

const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError || isAbortError(error);
};

const isRetriableStatus = (status: number): boolean => {
  return RETRYABLE_STATUS.has(status);
};

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
};

const getBackoffDelayMs = (baseDelayMs: number, attempt: number): number => {
  return baseDelayMs * 2 ** (attempt - 1);
};

let refreshPromise: Promise<string | null> | null = null;

const shouldAttemptAuthRefresh = (
  path: string,
  skipAuthRefresh?: boolean,
): boolean => {
  return !skipAuthRefresh && path !== "/auth/refresh" && path !== "/auth/logout";
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "same-origin",
      });

      const responseData = await parseResponseData(response);
      if (!response.ok) {
        return null;
      }

      const token =
        typeof responseData === "object" &&
        responseData !== null &&
        "data" in responseData &&
        typeof (responseData as { data: unknown }).data === "object" &&
        (responseData as { data: unknown }).data !== null &&
        "token" in ((responseData as { data: unknown }).data as Record<string, unknown>) &&
        typeof ((responseData as { data: unknown }).data as Record<string, unknown>).token === "string"
          ? (((responseData as { data: unknown }).data as Record<string, unknown>).token as string)
          : null;

      if (!token) {
        return null;
      }

      saveToken(token);
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const createRequestSignal = (
  timeoutMs: number,
  sourceSignal?: AbortSignal | null,
) => {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId =
    timeoutMs > 0
      ? window.setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeoutMs)
      : undefined;

  let onSourceAbort: (() => void) | undefined;
  if (sourceSignal) {
    if (sourceSignal.aborted) {
      controller.abort();
    } else {
      onSourceAbort = () => controller.abort();
      sourceSignal.addEventListener("abort", onSourceAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      if (sourceSignal && onSourceAbort) {
        sourceSignal.removeEventListener("abort", onSourceAbort);
      }
    },
  };
};

const request = async <T>(
  path: string,
  init: RequestOptions = {},
): Promise<ApiClientResponse<T>> => {
  const {
    body,
    timeoutMs: timeoutMsOption,
    retries: retriesOption,
    retryDelayMs: retryDelayMsOption,
    skipAuthRefresh,
    signal: sourceSignal,
    ...fetchInit
  } = init;

  const normalizedBody = normalizeBody(body);
  const retries = Math.max(0, retriesOption ?? DEFAULT_RETRIES);
  const attempts = retries + 1;
  const timeoutMs = timeoutMsOption ?? DEFAULT_TIMEOUT_MS;
  const retryDelayMs = retryDelayMsOption ?? DEFAULT_RETRY_DELAY_MS;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const signalState = createRequestSignal(timeoutMs, sourceSignal);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchInit,
        body: normalizedBody,
        signal: signalState.signal,
        headers: buildHeaders(normalizedBody, fetchInit.headers),
      });

      const responseData = await parseResponseData(response);

      if (!response.ok) {
        if (response.status === 401 && shouldAttemptAuthRefresh(path, skipAuthRefresh)) {
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            return request<T>(path, {
              ...init,
              skipAuthRefresh: true,
            });
          }

          clearToken();
          window.location.href = "/login";
        }

        if (attempt < attempts && isRetriableStatus(response.status)) {
          await wait(getBackoffDelayMs(retryDelayMs, attempt));
          continue;
        }

        throw new ApiError(
          getErrorMessage(responseData, response.status),
          response.status,
          responseData,
        );
      }

      return {
        data: responseData as T,
        status: response.status,
        ok: response.ok,
        headers: response.headers,
      };
    } catch (error) {
      const sourceSignalAborted = sourceSignal?.aborted ?? false;
      const canRetryNetworkError =
        attempt < attempts && !sourceSignalAborted && isNetworkError(error);

      if (canRetryNetworkError) {
        await wait(getBackoffDelayMs(retryDelayMs, attempt));
        continue;
      }

      if (signalState.didTimeout()) {
        throw new ApiError(
          `Request timed out after ${timeoutMs}ms`,
          408,
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new ApiError(error.message, 0);
      }

      throw new ApiError("Network request failed", 0);
    } finally {
      signalState.cleanup();
    }
  }

  throw new ApiError("Request failed", 0);
};

const api = {
  get: <T>(path: string, init: RequestOptions = {}) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: unknown, init: RequestOptions = {}) =>
    request<T>(path, { ...init, method: "POST", body }),

  put: <T>(path: string, body?: unknown, init: RequestOptions = {}) =>
    request<T>(path, { ...init, method: "PUT", body }),

  delete: <T>(path: string, init: RequestOptions = {}) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  refresh: () =>
    api.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      undefined,
      { skipAuthRefresh: true, retries: 0, credentials: "same-origin" },
    ),

  me: () => api.get<ApiResponse<User>>("/auth/me"),

  logout: () =>
    api.post<ApiResponse<void>>(
      "/auth/logout",
      undefined,
      { skipAuthRefresh: true, retries: 0 },
    ),

  googleLogin: (): void => {
    window.location.href = "/api/v1/auth/oauth2/authorize/google";
  },

  facebookLogin: (): void => {
    window.location.href = "/api/v1/auth/oauth2/authorize/facebook";
  },
};

export const userApi = {
  getAll: () => api.get<ApiResponse<User[]>>("/users"),
};

export const taskApi = {
  // Create a new task with optional file attachments
  create: (data: CreateTaskRequest, images?: File[] | FileList) => {
    const formData = new FormData();
    formData.append(
      "task",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );

    if (images) {
      for (const file of images) {
        formData.append("images", file);
      }
    }

    return api.post<ApiResponse<TaskResponse>>("/tasks", formData);
  },

  // Get a single task by ID
  getById: (id: number) => api.get<ApiResponse<TaskResponse>>(`/tasks/${id}`),

  // Get all tasks for current user
  getAll: () => api.get<ApiResponse<TaskResponse[]>>("/tasks"),

  // Get all tasks for a specific user
  getByUserId: (userId: number) =>
    api.get<ApiResponse<TaskResponse[]>>(`/tasks/user/${userId}`),

  // Update an existing task
  update: (id: number, data: UpdateTaskRequest, images?: File[] | FileList) => {
    const formData = new FormData();
    formData.append(
      "task",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );

    if (images) {
      for (const file of images) {
        formData.append("images", file);
      }
    }

    return api.put<ApiResponse<TaskResponse>>(`/tasks/${id}`, formData);
  },

  // Delete a task
  delete: (id: number) => api.delete<ApiResponse<void>>(`/tasks/${id}`),

  // Delete multiple tasks in one request
  deleteBatch: (taskIds: number[]) =>
    api.post<ApiResponse<void>>("/tasks/batch-delete", { taskIds }),

  // Delete an attachment
  deleteAttachment: (taskId: number, attachmentId: number) =>
    api.delete<ApiResponse<void>>(
      `/tasks/${taskId}/attachments/${attachmentId}`,
    ),
};
