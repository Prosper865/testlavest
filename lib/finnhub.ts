import "server-only";

// Minimal Finnhub client. The key is read on the server only (FINNHUB_API_KEY in .env or .env.local).

const API = "https://finnhub.io/api/v1";

export function hasFinnhubKey() {
  return Boolean(process.env.FINNHUB_API_KEY);
}

/** GET a Finnhub endpoint with response caching. Throws on HTTP errors; returns null when no key is set. */
export async function finnhubGet<T>(path: string, params: Record<string, string>, revalidateSeconds: number): Promise<T | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  const query = new URLSearchParams({ ...params, token: key });
  const response = await fetch(`${API}${path}?${query}`, { next: { revalidate: revalidateSeconds }, signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error(`Finnhub ${path} responded ${response.status}`);
  return response.json() as Promise<T>;
}
