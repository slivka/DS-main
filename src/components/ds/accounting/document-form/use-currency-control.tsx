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
/** Vrátí výběr měny nebo prostý zamčený kód s vysvětlením. */
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
  // Bez vnitřního odsazení a se šířkou podle obsahu: popisek „Měna“ začíná nad
  // prvním znakem a text končí u pravého okraje sekce.
  const fixedCurrency = (
    <div
      id="document-currency"
      data-currency-fixed=""
      aria-readonly="true"
      aria-describedby={currencyReason ? currencyReasonId : undefined}
      className="flex h-11 w-max items-center font-mono text-sm font-bold tabular-nums"
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
