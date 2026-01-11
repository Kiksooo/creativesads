export async function parseApiError(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    try {
      const data = await res.json();
      // Try to extract error message from standardized error format
      if (data?.error) {
        if (typeof data.error === 'string') {
          return `${data.error} (${res.status})`;
        }
        if (data.error.message) {
          return `${data.error.message} (${res.status})`;
        }
        if (data.error.code) {
          return `${data.error.code}: ${data.error.message || 'Unknown error'} (${res.status})`;
        }
      }
      // Fallback to message field
      if (data?.message) {
        return `${data.message} (${res.status})`;
      }
      return `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  }

  return `Server error (${res.status}). Check API logs.`;
}


