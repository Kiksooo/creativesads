export async function parseApiError(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    try {
      const data = await res.json();
      return data?.error?.message || data?.message || `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  }

  return `Server error (${res.status}). Check API logs.`;
}

