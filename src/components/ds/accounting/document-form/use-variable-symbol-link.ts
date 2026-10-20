/**
 * Vazba VS formuláře dokladu · vlastní odvozený náhled, varování a změnu vazby ·
 * nesmí zapisovat odvozený VS (autoritou je databáze, ukládá se jen stav vazby).
 */
import type { DsTexts } from "../../../../ds-texts";
import { useRef } from "react";
import {
  deriveVariableSymbol,
  effectiveVariableSymbolLinked,
  supportsVariableSymbolLink,
  variableSymbolSource,
} from "../variable-symbol-link";
import type { DocumentHeaderValue } from "./document-form-types";

/** Stav pole VS pro PaymentSection. */
export interface VariableSymbolLinkState {
  /** Druh dokladu vazbu podporuje. */
  supported: boolean;
  /** Efektivní stav vazby. */
  linked: boolean;
  /** Odvozený náhled. */
  derivedValue: string | null;
  /** Varování v poli VS (i v pruhu). */
  warning?: string;
  /** Změna vazby; odemčení předvyplní náhled jako vlastní VS. */
  onLinkedChange: (linked: boolean) => void;
  /** Změna zdroje pouze zafixuje výchozí vazbu; nikdy ji automaticky neuvolňuje. */
  sourcePatch: (next: Partial<DocumentHeaderValue>) => Partial<DocumentHeaderValue>;
}

/** Vypočte stav vazby VS. */
export function variableSymbolLinkState(
  code: string,
  value: DocumentHeaderValue,
  patch: (next: Partial<DocumentHeaderValue>) => void,
  texts: DsTexts["documentEdit"],
  lastValidValue?: string | null,
): VariableSymbolLinkState {
  const supported = supportsVariableSymbolLink(code);
  const derived = deriveVariableSymbol(variableSymbolSource({ code, ...value }));
  const linked = effectiveVariableSymbolLinked(
    code,
    value.variableSymbolLinked,
    value.variableSymbol,
    derived,
  );
  const warning =
    supported && linked && derived.reason === "tooLong"
      ? texts.vsTooLong
      : supported && linked && derived.reason === "noDigits"
        ? texts.vsNoDigits
        : undefined;
  return {
    supported,
    linked,
    derivedValue: derived.value,
    warning,
    onLinkedChange: (next) =>
      patch(
        next
          ? { variableSymbolLinked: true }
          : {
              variableSymbolLinked: false,
              // Paměť náhledu není uložený vlastní VS ani zápis odvozené hodnoty do DB.
              variableSymbol: derived.value ?? lastValidValue ?? null,
            },
      ),
    sourcePatch: (next) => {
      if (!supported) return next;
      // Odvozený stav vazby se při změně zdroje zafixuje, jinak by ho nový náhled přepnul.
      if (value.variableSymbolLinked === undefined)
        next = { ...next, variableSymbolLinked: linked };
      return next;
    },
  };
}

/** Paměť platného náhledu pro odemčení; oddělená podle identity a druhu dokladu. */
export function useVariableSymbolLink(
  code: string,
  value: DocumentHeaderValue,
  patch: (next: Partial<DocumentHeaderValue>) => void,
  texts: DsTexts["documentEdit"],
): VariableSymbolLinkState {
  const key = `${code}:${value.id ?? ""}`;
  const memory = useRef<{ key: string; value: string | null }>({ key, value: null });
  const derived = deriveVariableSymbol(variableSymbolSource({ code, ...value }));
  if (memory.current.key !== key) memory.current = { key, value: null };
  if (derived.value) memory.current.value = derived.value;
  return variableSymbolLinkState(code, value, patch, texts, memory.current.value);
}
