import { API_CONFIG } from '../config/api';

export class ApiError extends Error {
  readonly detail: unknown;
  readonly retryAfterSeconds: number | null;
  readonly requestId: string | null;

  constructor(
    message: string,
    readonly status?: number,
    detail: unknown = null,
    headers?: Headers,
  ) {
    super(message);
    this.name = 'ApiError';
    this.detail = detail;
    const retryAfter = headers?.get('Retry-After');
    this.retryAfterSeconds = retryAfter ? Number(retryAfter) || null : null;
    this.requestId = headers?.get('X-Request-ID') ?? null;
  }
}

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

function errorMessage(payload: unknown, status: number) {
  if (
    payload &&
    typeof payload === 'object' &&
    'detail' in payload &&
    typeof payload.detail === 'string'
  ) {
    return payload.detail;
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  return 'API request failed with status ' + status;
}

export async function apiRequestWithMeta<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
  const hasBody = init?.body !== undefined && init.body !== null;

  try {
    const response = await fetch(API_CONFIG.baseUrl + path, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      signal: controller.signal,
    });

    const contentType = response.headers.get('Content-Type') ?? '';
    let payload: unknown = null;

    if (response.status !== 204) {
      payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        errorMessage(payload, response.status),
        response.status,
        payload,
        response.headers,
      );
    }

    return {
      data: payload as T,
      headers: response.headers,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('API request timed out');
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API error',
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return (await apiRequestWithMeta<T>(path, init)).data;
}
