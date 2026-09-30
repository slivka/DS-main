import { forwardRef } from "react";
import { LookupField, type LookupFieldProps } from "./lookup-field";

/** Normalizace IČO: jen číslice, nejvýše 8 znaků. */
export function normalizeIcoInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export interface IcoFieldProps extends Omit<
  LookupFieldProps,
  "onAction" | "searchLabel" | "refreshLabel"
> {
  /**
   * Vyhledání v registru. Vraťte `true`, pokud se údaje podařilo doplnit –
   * ikona se potom přepne na „Aktualizovat z rejstříku“; `false` ji nechá beze změny.
   */
  onLookup: () => Promise<boolean | void> | boolean | void;
  /** Výchozí true: jen číslice, max. 8; vložené mezery a jiné znaky odstraní. */
  digitsOnly?: boolean;
  lookupLabel?: string;
  refreshLabel?: string;
}

/**
 * Sdílené pole pro IČO s tlačítkem registru přímo v poli (postavené na `LookupField`).
 * Lupa = ještě jsme nevyhledávali, ⟳ = IČO bylo při otevření vyplněné nebo bylo doplněno z registru.
 */
export const IcoField = forwardRef<HTMLInputElement, IcoFieldProps>(function IcoField(
  {
    onLookup,
    onChange,
    digitsOnly = true,
    placeholder = "Zadejte IČO",
    lookupLabel = "Vyhledat v rejstříku",
    refreshLabel = "Aktualizovat z rejstříku",
    ...props
  },
  ref,
) {
  return (
    <LookupField
      ref={ref}
      {...props}
      placeholder={placeholder}
      inputMode={digitsOnly ? "numeric" : props.inputMode}
      onChange={(next) => onChange(digitsOnly ? normalizeIcoInput(next) : next)}
      onAction={onLookup}
      searchLabel={lookupLabel}
      refreshLabel={refreshLabel}
    />
  );
});
