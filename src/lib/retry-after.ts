/**
 * Interprets Retry-After as delta-seconds or an HTTP date.
 * Returns the fallback for missing/invalid values and never returns a negative delay.
 */
export function parseRetryAfter(
  value: string | null | undefined,
  fallbackMs: number,
  nowMs = Date.now(),
): number {
  const normalized = value?.trim();
  if (!normalized) return fallbackMs;

  // RFC Retry-After delta-seconds is a non-negative decimal integer.
  if (/^\d+$/.test(normalized)) {
    const seconds = Number(normalized);
    return Number.isSafeInteger(seconds) ? seconds * 1_000 : fallbackMs;
  }

  // Do not let Date.parse reinterpret malformed numeric delta-seconds as dates.
  if (/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) return fallbackMs;

  const retryAt = Date.parse(normalized);
  if (!Number.isFinite(retryAt)) return fallbackMs;
  return Math.max(0, retryAt - nowMs);
}
