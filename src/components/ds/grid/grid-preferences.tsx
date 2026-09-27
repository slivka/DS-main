import { createContext, useContext, type ReactNode } from "react";

import type { GridDensity } from "./grid-zoom";

export type GridPreferenceValues = { zoom?: number; density?: GridDensity };

export interface GridPreferencesContextValue {
  getDefaults: (storageKey: string) => GridPreferenceValues | undefined;
  onDefaultsChange: (storageKey: string, values: Required<GridPreferenceValues>) => void;
}

const GridPreferencesContext = createContext<GridPreferencesContextValue | null>(null);

export interface GridPreferencesProviderProps extends GridPreferencesContextValue {
  children: ReactNode;
}

/** Firemní výchozí zoom a hustota nově otevřených gridů. */
export function GridPreferencesProvider({ getDefaults, onDefaultsChange, children }: GridPreferencesProviderProps) {
  return <GridPreferencesContext.Provider value={{ getDefaults, onDefaultsChange }}>{children}</GridPreferencesContext.Provider>;
}

export function useGridPreferences() {
  return useContext(GridPreferencesContext);
}