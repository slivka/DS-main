/** Ovládací prvek měny dokladu. */
import { useId } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { OptionSelect } from "../../form/option-select";
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
  currencyOptions,
  currenciesPresent,
  t,
}: Args) {
  const currencyReasonId = useId();
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
      aria-describedby={currencyReason ? currencyReasonId : undefined}
      className="flex h-11 w-[6.5rem] items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-normal tabular-nums"
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
      triggerClassName="h-11"
    />
  ) : (
    fixedCurrency
  );
  return currencyControl;
}
