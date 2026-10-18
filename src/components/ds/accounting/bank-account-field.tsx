/**
 * Výběr nebo ruční zadání bankovního účtu.
 * Vlastní: režim a validaci účtu; důvod zákazu jako výzvu výběru.
 * Nesmí: měnit hodnotu podle dodavatele ani zobrazovat důvod pod polem.
 */
import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

import { Input } from "../../ui/input";
import { OptionSelect } from "../form/option-select";
import { InactiveTag } from "../data-display/inactive-tag";
import { formatIban, isValidCzAccount, parseCzAccount } from "../../../lib/bank-account";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";

/** Společné údaje účtu; úplnost zápisu zajišťuje BankAccountOption. */
export interface BankAccountOptionBase {
  /** Stabilní identifikátor účtu partnera. */
  id?: string;
  /** Tuzemské číslo, pokud účet používá tento zápis. */
  number?: string;
  /** Tuzemský kód banky. */
  bankCode?: string;
  /** Mezinárodní číslo účtu, s mezerami nebo bez nich. */
  iban?: string;
  /** Název účtu v nabídce. */
  label?: string;
  /** Značka měny z dat. */
  currency?: string;
  /** Výchozí účet partnera; hodnotu stále řídí aplikace. */
  default?: boolean;
  /** Neplatný účet se nenabízí; pokud je vybraný, zůstane viditelný. */
  invalid?: boolean;
}

/** Účet má úplnou tuzemskou dvojici nebo IBAN; stávající zápis zůstává platný. */
export type BankAccountOption = BankAccountOptionBase &
  ({ number: string; bankCode: string } | { iban: string });

/** Zápis účtu pro nabídku i vybranou hodnotu; tuzemská dvojice má přednost. */
function accountDisplay(option: BankAccountOption): string {
  return typeof option.number === "string" &&
    option.number &&
    typeof option.bankCode === "string" &&
    option.bankCode
    ? `${option.number}/${option.bankCode}`
    : formatIban(typeof option.iban === "string" ? option.iban : "");
}

/** Stabilní identifikátor výběru; IBAN bez ID se ukládá bez mezer. */
export function bankAccountOptionValue(option: BankAccountOption): string {
  return (
    option.id ??
    (typeof option.number === "string" &&
    option.number &&
    typeof option.bankCode === "string" &&
    option.bankCode
      ? `${option.number}/${option.bankCode}`
      : (typeof option.iban === "string" ? option.iban : "").replace(/\s/g, "").toUpperCase())
  );
}

export interface BankAccountFieldProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "placeholder"
> {
  value: string;
  onChange: (value: string) => void;
  options?: BankAccountOption[];
  bankCodes?: string[];
  invalidAccountText?: string;
  invalidBankCodeText?: string;
  otherAccountText?: string;
  className?: string;
  /** Režim pouze výběru bez volného zadání. */
  selectionOnly?: boolean;
  /** Poslední akce v nabídce. */
  onAddAccount?: (searchText: string) => void;
  /** Důvod zakázání vytvoření účtu. */
  addAccountDisabledReason?: string;
  /** Text akce přidání účtu. */
  addAccountText?: string;
  /** Výzva prázdného výběru; ruční vstup zůstává prázdný. */
  placeholder?: string;
  /** Důvod zákazu uvnitř výběru místo prázdné hodnoty; nikdy pod polem. */
  disabledReason?: string;
}

const OTHER = "__other_bank_account__";

/** Výběr partnerského účtu s možností zadat jiný český účet a ověřit jej. */
export const BankAccountField = forwardRef<HTMLInputElement, BankAccountFieldProps>(
  function BankAccountField(
    {
      value,
      onChange,
      options: suppliedOptions = [],
      bankCodes,
      invalidAccountText,
      invalidBankCodeText,
      otherAccountText,
      disabled,
      readOnly,
      id,
      className,
      selectionOnly = false,
      onAddAccount,
      addAccountDisabledReason,
      addAccountText,
      disabledReason,
      placeholder,
      onBlur,
      ...props
    },
    ref,
  ) {
    const { documentForm: texts } = useDsTexts();
    const resolvedInvalidAccountText = invalidAccountText ?? texts.bankAccountInvalid;
    const resolvedInvalidBankCodeText = invalidBankCodeText ?? texts.bankCodeInvalid;
    const resolvedOtherAccountText = otherAccountText ?? texts.otherBankAccount;
    const resolvedAddAccountText = addAccountText ?? texts.addBankAccount;
    // Typ chrání TS volání; data z API přesto mohou obsahovat neúplný účet.
    const options = suppliedOptions.filter(
      (option) =>
        Boolean(
          typeof option.number === "string" &&
          option.number.trim() &&
          typeof option.bankCode === "string" &&
          option.bankCode.trim(),
        ) || Boolean(typeof option.iban === "string" && option.iban.replace(/\s/g, "")),
    );
    const optionValue = bankAccountOptionValue;
    const optionValues = options.map(optionValue);
    const optionValuesKey = optionValues.join("\u0000");
    const selectedOption = optionValues.includes(value);
    const missingSelected = selectionOnly && Boolean(value) && !selectedOption;
    const [otherSelected, setOtherSelected] = useState(() => Boolean(value) && !selectedOption);
    const [touched, setTouched] = useState(false);
    // Hodnotu, kterou pole samo odeslalo, režim nepřepočítává (jinak by vstup „Jiný účet“ zmizel).
    const lastEmittedRef = useRef<string | null>(null);
    const lastOptionsKeyRef = useRef(optionValuesKey);
    useEffect(() => {
      const optionsChanged = lastOptionsKeyRef.current !== optionValuesKey;
      lastOptionsKeyRef.current = optionValuesKey;
      if (!optionsChanged && lastEmittedRef.current === value) return;
      lastEmittedRef.current = null;
      setOtherSelected(Boolean(value) && !optionValues.includes(value));
    }, [optionValuesKey, value]); // seznam je odvozený z řízených možností
    const emit = (next: string) => {
      lastEmittedRef.current = next;
      onChange(next);
    };
    const manual =
      !selectionOnly &&
      (options.length === 0 || otherSelected || (Boolean(value) && !selectedOption));
    const compact = value.replace(/\s/g, "");
    const [accountPart = "", bankCode = ""] = compact.split("/");
    const parsed = parseCzAccount(accountPart);
    const hasCompleteValue = compact.length > 0 && compact.includes("/") && bankCode.length === 4;
    const incomplete =
      touched &&
      compact.length > 0 &&
      (!compact.includes("/") || bankCode.length !== 4 || compact.split("/").length !== 2);
    const bankCodeInvalid =
      hasCompleteValue && Boolean(bankCodes?.length) && !bankCodes?.includes(bankCode);
    const accountInvalid =
      hasCompleteValue && (!parsed || !isValidCzAccount(parsed.prefix, parsed.number));
    const error = bankCodeInvalid
      ? resolvedInvalidBankCodeText
      : accountInvalid || incomplete
        ? resolvedInvalidAccountText
        : undefined;

    return (
      <div className={cn("min-w-0", className)}>
        {options.length || selectionOnly ? (
          <OptionSelect
            id={manual ? undefined : id}
            value={!manual && disabledReason ? "" : manual ? OTHER : value}
            placeholder={disabledReason ?? placeholder}
            placeholderValueLabel={disabledReason ?? placeholder}
            onChange={(next) => {
              if (next === OTHER) {
                setOtherSelected(true);
                return;
              }
              setOtherSelected(false);
              setTouched(false);
              emit(next);
            }}
            allowEmpty={false}
            searchable
            onCreate={onAddAccount}
            createLabel={resolvedAddAccountText}
            createDisabledReason={addAccountDisabledReason}
            selectedLabel={(option) =>
              option.inactive ? (
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{option.label}</span>
                  <InactiveTag label={texts.invalidBankAccount} />
                </span>
              ) : (
                (option.selectedLabel ?? option.label)
              )
            }
            ariaLabel={props["aria-label"]}
            disabled={disabled || readOnly || Boolean(disabledReason)}
            inactiveLabel={texts.invalidBankAccount}
            options={[
              ...(missingSelected
                ? [
                    {
                      value,
                      label: <span className="line-through">{texts.bankAccountMissing}</span>,
                      inactive: true,
                    },
                  ]
                : []),
              ...options
                .filter((option) => !option.invalid || optionValue(option) === value)
                .map((option) => ({
                  value: optionValue(option),
                  label: (
                    <span className={cn(option.invalid && "line-through")}>
                      {[option.label, accountDisplay(option), option.currency]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  ),
                  selectedLabel: accountDisplay(option),
                  searchText: [
                    option.label,
                    accountDisplay(option),
                    option.currency,
                    option.iban,
                    formatIban(typeof option.iban === "string" ? option.iban : ""),
                    typeof option.iban === "string" ? option.iban.replace(/\s/g, "") : undefined,
                  ]
                    .filter(Boolean)
                    .join(" "),
                  inactive: option.invalid,
                })),
              ...(selectionOnly
                  ? []
                  : [{ value: OTHER, label: resolvedOtherAccountText }]),
            ]}
          />
        ) : null}
        {manual ? (
          <Input
            {...props}
            ref={ref}
            id={id}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            inputMode="numeric"
            autoComplete="off"
            error={error}
            onChange={(event) =>
              emit(event.target.value.replace(/[^\d\-/\s]/g, "").replace(/\s/g, ""))
            }
            onBlur={(event) => {
              setTouched(true);
              onBlur?.(event);
            }}
            className={cn("h-[var(--control-h)] font-mono tabular-nums", options.length && "mt-2")}
          />
        ) : null}
      </div>
    );
  },
);
