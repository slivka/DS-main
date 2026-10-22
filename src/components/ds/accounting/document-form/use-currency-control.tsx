/** Ovládací prvek měny dokladu. */
import { useId } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { OptionSelect } from "../../form/option-select";
import { FieldValue } from "../../form/field-value";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";
interface Args {
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  can: (k: DocumentHeaderField) => boolean;
  currencyLocked: boolean;
  readOnly: boolean;
  identityVariant: string;
  currencyDisabledReason?: string;
  /** Obecný důvod uzamčení měny (2.128.0); má přednost a kreslí FieldValue se zámkem. */
  lockedReason?: string;
  currencyOptions: { value: string; label: string; selectedLabel?: string }[];
  currenciesPresent: boolean;
  t: DocumentFormTexts;
}
/** Vrátí rozměrově shodný výběr nebo rámeček zamčené měny s vysvětlením. */
export function useCurrencyControl({
  value,
  patch,
  can,
  currencyLocked,
  readOnly,
  identityVariant,
  currencyDisabledReason,
  lockedReason,
  currencyOptions,
  currenciesPresent,
  t,
}: Args) {
  const currencyReasonId = useId();
  // Obecný zámek (2.128.0): hodnota jen pro čtení se zámkem a důvodem v bublině.
  if (lockedReason) {
    return (
      <FieldValue
        id="document-currency"
        lockedReason={lockedReason}
        className="w-[6.5rem] tabular-nums"
      >
        {value.currency}
      </FieldValue>
    );
  }
  const currencyFixed =
    currencyLocked ||
    readOnly ||
    !can("currency") ||
    identityVariant === "cashBank" ||
    Boolean(currencyDisabledReason);
  const currencyReason =
    currencyDisabledReason ?? (!readOnly && !can("currency") ? t.currencyDisabled : undefined);
  // Pevná i volitelná měna sdílí rozměry; změna režimu neposouvá částku.
  const fixedCurrency = (
    <div
      id="document-currency"
      data-currency-fixed=""
      aria-readonly="true"
      aria-disabled="true"
      aria-describedby={currencyReason ? currencyReasonId : undefined}
      className="ds-disabled-control flex h-[var(--control-h)] w-[6.5rem] items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-normal tabular-nums"
    >
      {value.currency}
    </div>
  );
  const currencyControl = currencyFixed ? (
    currencyReason ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div tabIndex={0} aria-describedby={currencyReasonId}>
            {fixedCurrency}
            <span id={currencyReasonId} className="sr-only">
              {currencyReason}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{currencyReason}</TooltipContent>
      </Tooltip>
    ) : (
      fixedCurrency
    )
  ) : currenciesPresent ? (
    <OptionSelect
      id="document-currency"
      allowEmpty={false}
      value={value.currency}
      onChange={(currency) => patch({ currency })}
      options={currencyOptions}
      triggerClassName="h-[var(--control-h)]"
    />
  ) : (
    fixedCurrency
  );
  return currencyControl;
}
