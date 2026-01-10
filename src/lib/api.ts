import { getToken, clearToken } from './auth';
import { parseApiError } from './http';

export interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { requireAuth = true, headers = {}, body, ...restOptions } = options;

  // Support both /api/ and /api/v1/ paths
  // If path already starts with /api/, use it as-is
  // Otherwise, prepend /api/v1/ for backward compatibility
  let url: string;
  if (path.startsWith('/api/')) {
    url = path;
  } else if (path.startsWith('/api/v1')) {
    url = path;
  } else {
    url = `/api/v1${path}`;
  }
  
  const token = getToken();
  
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Only set Content-Type if body is not FormData
  if (!(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (requireAuth && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const res = await fetch(url, {
      ...restOptions,
      method: restOptions.method || 'GET',
      headers: requestHeaders,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Handle 401 - session expired
    if (res.status === 401) {
      clearToken();
      // Redirect to login page (will be handled by component if needed)
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${locale}/login`;
      }
      return {
        error: 'Session expired. Please login again.',
        status: 401,
      };
    }

    // Check if response is JSON
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        error: 'Server error, check logs',
        status: res.status,
      };
    }

    if (!res.ok) {
      const errorMessage = await parseApiError(res);
      return {
        error: errorMessage,
        status: res.status,
      };
    }

    const data = await res.json().catch(() => null);
    return {
      data: data as T,
      status: res.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        error: 'Request timeout. Please try again.',
        status: 0,
      };
    }
    
    // Retry logic for network errors (1 retry)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const retryRes = await fetch(url, {
          ...restOptions,
          method: restOptions.method || 'GET',
          headers: requestHeaders,
          body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        });
        
        if (retryRes.ok) {
          const retryData = await retryRes.json().catch(() => null);
          return {
            data: retryData as T,
            status: retryRes.status,
          };
        }
      } catch (retryError) {
        // Ignore retry error, fall through to original error
      }
    }
    
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

export async function apiGet<T = unknown>(
  path: string,
  queryParams?: Record<string, string>,
  options?: ApiOptions
): Promise<{ data?: T; error?: string; status: number }> {
  let url = path;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }
  return apiFetch<T>(url, { ...options, method: 'GET' });
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: ApiOptions
): Promise<{ data?: T; error?: string; status: number }> {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: body as BodyInit | undefined,
  });
}

export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  options?: ApiOptions
): Promise<{ data?: T; error?: string; status: number }> {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: formData,
  });
}

