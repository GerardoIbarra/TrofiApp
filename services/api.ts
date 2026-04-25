import { AuthStorage } from '@/features/auth/services/authStorage';

/**
 * Centralized API client for TrofiApp with Silent Refresh logic.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | null;
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  // 1. Get access token and add to headers
  const token = await AuthStorage.getAccessToken();
  
  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(headers as Record<string, string>),
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchRequest = async () => {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...rest,
      headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let response = await fetchRequest();

  // 2. Handle Unauthorized (401) - Silent Refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      // If already refreshing, wait for the new token
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        authHeaders['Authorization'] = `Bearer ${newToken}`;
        return request<T>(endpoint, options);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      // Attempt to refresh
      const refreshRes = await fetch(`${BASE_URL}/v1/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const { access } = await refreshRes.json();
        await AuthStorage.saveAccessToken(access);
        processQueue(null, access);
        
        // Retry original request
        authHeaders['Authorization'] = `Bearer ${access}`;
        return request<T>(endpoint, options);
      } else {
        // Refresh failed, clear session
        await AuthStorage.clearSession();
        processQueue(new Error('Session expired'), null);
        // You might want to trigger a global redirect here, 
        // usually handled by AuthContext listening to state changes.
        throw new Error('Session expired');
      }
    } catch (err) {
      processQueue(err as Error, null);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || `API Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body, ...options }),

  put: <T>(endpoint: string, body: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PUT', body, ...options }),

  patch: <T>(endpoint: string, body: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PATCH', body, ...options }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};

export default api;
