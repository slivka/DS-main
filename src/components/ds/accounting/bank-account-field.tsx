import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";

import { Input } from "../../ui/input";
import { OptionSelect } from "../form/option-select";
import { isValidCzAccount, parseCzAccount } from "../../../lib/bank-account";
import { cn } from "../../../lib/utils";

export interface BankAccountOption {
  number: string;
  bankCode: string;
  label?: string;
  currency?: string;
  default?: boolean;
}

export interface BankAccountFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  options?: BankAccountOption[];
  bankCodes?: string[];
  invalidAccountText?: string;
  invalidBankCodeText?: string;
  otherAccountText?: string;
  className?: string;
}

const OTHER = "__other_bank_account__";

/** Výběr partnerského účtu s možností zadat jiný český účet a ověřit jej. */
export const BankAccountField = forwardRef<HTMLInputElement, BankAccountFieldProps>(function BankAccountField({
  value,
  onChange,
  options = [],
  bankCodes,
  invalidAccountText = "Číslo účtu není platné.",
  invalidBankCodeText = "Kód banky není platný.",
  otherAccountText = "Jiný účet",
  disabled,
  readOnly,
  id,
  className,
  ...props
}, ref) {
  const optionValues = options.map((option) => `${option.number}/${option.bankCode}`);
  const selectedOption = optionValues.includes(value);
  const [otherSelected, setOtherSelected] = useState(() => Boolean(value) && !selectedOption);
  const manual = options.length === 0 || otherSelected || (Boolean(value) && !selectedOption);
  const compact = value.replace(/\s/g, "");
  const [accountPart = "", bankCode = ""] = compact.split("/");
  const parsed = parseCzAccount(accountPart);
  const hasCompleteValue = compact.length > 0 && compact.includes("/") && bankCode.length === 4;
  const bankCodeInvalid = hasCompleteValue && Boolean(bankCodes?.length) && !bankCodes?.includes(bankCode);
  const accountInvalid = hasCompleteValue && (!parsed || !isValidCzAccount(parsed.prefix, parsed.number));
  const error = bankCodeInvalid ? invalidBankCodeText : accountInvalid ? invalidAccountText : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      {options.length ? <OptionSelect
        id={manual ? undefined : id}
        value={manual ? OTHER : value}
        onChange={(next) => {
          if (next === OTHER) {
            setOtherSelected(true);
            return;
          }
          setOtherSelected(false);
          onChange(next);
        }}
        allowEmpty={false}
        disabled={disabled || readOnly}
        options={[
          ...options.map((option) => ({
            value: `${option.number}/${option.bankCode}`,
            label: [
              `${option.number}/${option.bankCode}`,
              option.label,
              option.currency,
            ].filter(Boolean).join(" - "),
            selectedLabel: `${option.number}/${option.bankCode}`,
          })),
          { value: OTHER, label: otherAccountText },
        ]}
      /> : null}
      {manual ? <Input
        {...props}
        ref={ref}
        id={id}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value.replace(/[^\d\-/\s]/g, ""))}
        className={cn("h-9 font-mono tabular-nums", options.length && "mt-2")}
      /> : null}
      {error ? <p role="alert" className="mt-1 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
});