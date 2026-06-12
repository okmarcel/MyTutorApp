export class ApiError extends Error {
  status: number;
  path: string;
  body?: unknown;

  constructor(opts: { status: number; path: string; body?: unknown }) {
    super(`API ${opts.status} for ${opts.path}`);
    this.status = opts.status;
    this.path = opts.path;
    this.body = opts.body;
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

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";
  const url = `${base}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...init.headers }
  });

  const body = await safeJson(res);
  if (!res.ok) throw new ApiError({ status: res.status, path, body });
  return body as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}
