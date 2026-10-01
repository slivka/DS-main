/**
 * Jazyk knihovny: provider a hook textů.
 * Vlastní: DsTextsProvider, useDsTexts, slučování přepisů a veřejné re-exporty textů.
 * Nesmí: obsahovat samotné texty (cs.ts, sk.ts) ani jejich typy (types.ts).
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { DS_TEXTS_CS } from "./cs";
import { DS_TEXTS_SK } from "./sk";
import type { DsLocale, DsTexts } from "./types";

export * from "./types";
export { DS_TEXTS_CS } from "./cs";
export { DS_TEXTS_SK } from "./sk";

const DsTextsContext = createContext<DsTexts>(DS_TEXTS_CS);
/** Props kořenového provideru jazyka. */
export interface DsTextsProviderProps {
  children: ReactNode;
  locale?: DsLocale;
  texts?: Partial<DsTexts>;
}
function mergeTextKey<K extends keyof DsTexts>(
  result: DsTexts,
  key: K,
  value: DsTexts[K] | undefined,
) {
  const current = result[key];
  result[key] =
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    current &&
    typeof current === "object"
      ? { ...current, ...value }
      : (value as DsTexts[K]);
}
function mergeTexts(base: DsTexts, patch?: Partial<DsTexts>): DsTexts {
  if (!patch) return base;
  const result: DsTexts = { ...base };
  for (const key of Object.keys(patch) as (keyof DsTexts)[]) {
    mergeTextKey(result, key, patch[key]);
  }
  return result;
}
/** Nastaví jazyk knihovny pro celý podstrom; `texts` přepíše jednotlivé oblasti. */
export function DsTextsProvider({ children, locale, texts }: DsTextsProviderProps) {
  const value = useMemo(
    () => mergeTexts(locale === "sk" ? DS_TEXTS_SK : DS_TEXTS_CS, texts),
    [locale, texts],
  );
  return <DsTextsContext.Provider value={value}>{children}</DsTextsContext.Provider>;
}
/** Aktuální texty knihovny (bez provideru čeština). */
export function useDsTexts() {
  return useContext(DsTextsContext);
}
