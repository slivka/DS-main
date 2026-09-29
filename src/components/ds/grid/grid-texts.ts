import { DS_TEXTS_CS, useDsTexts, type GridTexts } from "../../../ds-texts";

export type { GridTexts } from "../../../ds-texts";
export const DEFAULT_GRID_TEXTS: GridTexts = DS_TEXTS_CS.grid;

/** Zpětně kompatibilní čisté sloučení českých výchozích textů. */
export function resolveGridTexts(texts?: Partial<GridTexts>): GridTexts {
  return { ...DEFAULT_GRID_TEXTS, ...texts };
}

/** Texty gridu: lokální props mají přednost před jazykem z DsTextsProvider. */
export function useResolvedGridTexts(texts?: Partial<GridTexts>): GridTexts {
  const context = useDsTexts();
  return { ...context.grid, ...texts };
}
