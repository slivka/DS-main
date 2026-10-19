/**
 * Kontext „jen pro čtení“ dialogu záznamu · vlastní příznak a jednotné vykreslení hodnoty
 * · nesmí měnit hodnotu ani platit mimo RecordDialog.
 */
import { createContext, useContext, type ReactNode } from "react";

import { useDsTexts } from "../../../ds-texts";
import { FieldValue } from "./field-value";

const RecordReadOnlyContext = createContext(false);

/** Vlastnosti poskytovatele režimu jen pro čtení. */
export interface RecordReadOnlyProviderProps {
  /** `true` = DS vstupy uvnitř se vykreslí jako `FieldValue`. */
  value: boolean;
  /** Obsah formuláře. */
  children?: ReactNode;
}

/** Poskytovatel režimu jen pro čtení; nastavuje ho RecordDialog. */
export function RecordReadOnlyProvider({ value, children }: RecordReadOnlyProviderProps) {
  return <RecordReadOnlyContext.Provider value={value}>{children}</RecordReadOnlyContext.Provider>;
}

/** Vrací `true`, pokud se vstup nachází v dialogu záznamu jen pro čtení. */
export function useRecordReadOnly(): boolean {
  return useContext(RecordReadOnlyContext);
}

/** Vlastnosti hodnoty vstupu vykresleného jen pro čtení. */
export interface ReadOnlyControlValueProps {
  /** Zobrazovaný text; prázdný → „—“. */
  children?: ReactNode;
  /** Id původního ovládání (kvůli odkazům popisku a chyb). */
  id?: string | undefined;
  /** Zarovnání čísel vpravo. */
  numeric?: boolean;
  /** Víceřádková hodnota: zalomí text a smí růst (jen u `Textarea`). */
  multiline?: boolean;
  /** Přístupný název (např. popisek zaškrtávátka). */
  ariaLabel?: string | undefined;
}

/** Hodnota vstupu v režimu jen pro čtení – stejná výška a zarovnání jako vstup. */
export function ReadOnlyControlValue({
  children,
  id,
  numeric,
  multiline,
  ariaLabel,
}: ReadOnlyControlValueProps) {
  const empty = useDsTexts().recordDialog.emptyValue;
  const isEmpty = children === null || children === undefined || children === "";
  return (
    <FieldValue
      id={id}
      data-read-only-control=""
      aria-label={ariaLabel}
      className={
        numeric
          ? "justify-end text-right font-mono tabular-nums"
          : multiline
            ? "h-auto min-h-[var(--control-h)] items-start py-1.5 [&>div:first-child]:whitespace-pre-wrap [&>div:first-child]:break-words"
            : undefined
      }
    >
      {isEmpty ? empty : children}
    </FieldValue>
  );
}

/** Text „Ano / Ne“ zaškrtávátka v režimu jen pro čtení. */
export function useYesNoText(checked: boolean): string {
  const texts = useDsTexts().recordDialog;
  return checked ? texts.valueYes : texts.valueNo;
}
