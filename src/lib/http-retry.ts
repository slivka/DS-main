// Sdíjená síťová vrstva pro ARES a obchodní rejstřík: opakování dotazu při
// dočasné chybě a sloučení souběžných dotazů na stejný klíč.

export type RetryOptions = {
  /** Počet pokusů celkem (včetně prvního). */
  attempts?: number;
  /** Základní prodleva mezi pokusy v ms – roste exponenciálně. */
  baseDelayMs?: number;
  /** Volitelný popis služby do chybové hlášky. */
  label?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 429 a 5xx jsou dočasné (přetížení), 4xx jinak ne – ty opakovat nemá smysl. */
const retryableStatus = (status: number) => status === 408 || status === 429 || status >= 500;

/**
 * fetch s opakováním při výpadku sítě, přetížení (429) nebo chybě serveru (5xx).
 * Odpověď s trvalou chybou (např. 404) se vrací rovnou volajícímu.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  { attempts = 3, baseDelayMs = 400, label = "Služba" }: RetryOptions = {},
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < Math.max(1, attempts); i++) {
    if (i > 0) await sleep(baseDelayMs * 2 ** (i - 1));
    try {
      const res = await fetch(url, init);
      if (retryableStatus(res.status) && i < attempts - 1) {
        lastError = new Error(`${label} vrátíla chybu ${res.status}.`);
        continue;
      }
      return res;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} je dočasně nedostupná, zkuste to prosím znovu.`);
}

const inflight = new Map<string, Promise<unknown>>();

/** Souběžné dotazy na stejný klíč sdílejí jeden běh (a tím i jedno volání API). */
export function dedupeInflight<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = run().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
