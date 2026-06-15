export class ApiError extends Error {
  status: number;
  path: string;
  body?: unknown;
  constructor(opts: { status: number; path: string; body?: unknown }) {
    const msg =
        opts.body && typeof opts.body === "object" && "message" in opts.body
            ? String((opts.body as Record<string, unknown>).message)
            : `Błąd API: ${opts.status}`;
    super(msg);
    this.status = opts.status;
    this.path = opts.path;
    this.body = opts.body;
  }
  get fieldErrors(): Record<string, string> {
    if (this.body && typeof this.body === "object" && "fields" in this.body) {
      return (this.body as { fields: Record<string, string> }).fields;
    }
    return {};
  }
}
async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
export async function apiRequest<T>(
    path: string,
    init: RequestInit = {}
): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await safeJson(res);
  if (!res.ok) throw new ApiError({ status: res.status, path, body });
  return body as T;
}
export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}
export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}
export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}
export function apiDelete(path: string): Promise<void> {
  return apiRequest(path, { method: "DELETE" });
}