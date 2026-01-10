export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Проверяем content-type
  const contentType = response.headers.get("content-type") || "";
  
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    console.error("Non-JSON response:", response.status, contentType, text.slice(0, 200));
    
    return {
      error: {
        code: "INVALID_RESPONSE",
        message: `Server returned non-JSON response (${response.status}). Please try again later.`,
      },
    };
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    // Если API вернул ошибку в формате { error: { code, message } }
    if (json?.error) {
      return { error: json.error };
    }
    
    // Если API вернул ошибку в другом формате
    return {
      error: {
        code: `HTTP_${response.status}`,
        message: json?.message || `Request failed with status ${response.status}`,
        details: json,
      },
    };
  }

  // Успешный ответ
  return { data: json };
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = `/api/v1${url}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error("API request failed:", error);
    
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        error: {
          code: "NETWORK_ERROR",
          message: "Network error. Please check your connection and try again.",
        },
      };
    }

    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

export async function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiGet<T = unknown>(
  path: string,
  queryParams?: Record<string, string>
): Promise<ApiResponse<T>> {
  let url = path;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }
  return apiRequest<T>(url, {
    method: "GET",
  });
}

