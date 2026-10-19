/**
 * Vazba VS formuláře dokladu · vlastní odvozený náhled, varování a změnu vazby ·
 * nesmí zapisovat odvozený VS (autoritou je databáze, ukládá se jen stav vazby).
 */
import type { DsTexts } from "../../../../ds-texts";
import {
  VS_RECEIVED_CODES,
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
  /**
   * Změna zdrojového čísla: při 0 nebo > 10 číslicích se vazba sama uvolní a VS zůstane
   * (náhled se převezme, nikdy se nezkracuje).
   */
  sourcePatch: (next: Partial<DocumentHeaderValue>) => Partial<DocumentHeaderValue>;
}

/** Vypočte stav vazby VS. */
export function variableSymbolLinkState(
  code: string,
  value: DocumentHeaderValue,
  patch: (next: Partial<DocumentHeaderValue>) => void,
  texts: DsTexts["documentEdit"],
): VariableSymbolLinkState {
  const supported = supportsVariableSymbolLink(code);
  const received = (VS_RECEIVED_CODES as readonly string[]).includes(code.toUpperCase());
  const derived = deriveVariableSymbol(variableSymbolSource({ code, ...value }));
  const linked = effectiveVariableSymbolLinked(
    code,
    value.variableSymbolLinked,
    value.variableSymbol,
    derived,
  );
  const warning =
    supported && received && !linked && derived.reason === "tooLong"
      ? texts.vsTooLong
      : supported && received && !linked && derived.reason === "noDigits"
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
              // Po odemčení zůstane hodnota z náhledu; při 0 / >10 číslicích uložený VS.
              variableSymbol: derived.value || value.variableSymbol || null,
            },
      ),
    sourcePatch: (next) => {
      if (!supported) return next;
      // Odvozený stav vazby se při změně zdroje zafixuje, jinak by ho nový náhled přepnul.
      if (value.variableSymbolLinked === undefined)
        next = { ...next, variableSymbolLinked: linked };
      if (!received || !linked) return next;
      const nextDerived = deriveVariableSymbol(variableSymbolSource({ code, ...value, ...next }));
      if (nextDerived.reason !== "tooLong" && nextDerived.reason !== "noDigits") return next;
      return {
        ...next,
        variableSymbolLinked: false,
        // Automatické uvolnění (0 / >10 číslic): zůstane uložený VS, jinak náhled.
        variableSymbol: value.variableSymbol || derived.value || null,
      };
    },
  };
}
