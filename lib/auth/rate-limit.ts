import "server-only";

// In-memory limiter for failed logins: 5 failures per key per 15 minutes. It resets when the
// server restarts and is per process; use a shared store (e.g. Redis) when running several servers.

const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

function recent(key: string, now: number) {
  return (failures.get(key) ?? []).filter(time => now - time < WINDOW_MS);
}

export function isRateLimited(key: string) {
  return recent(key, Date.now()).length >= MAX_FAILURES;
}

export function recordFailure(key: string) {
  const now = Date.now();
  failures.set(key, [...recent(key, now), now]);
}

export function clearFailures(key: string) {
  failures.delete(key);
}
