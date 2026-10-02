/**
 * Ruční účet přijatého dokladu.
 * Vlastní: volbu tuzemského nebo zahraničního tvaru a jeho okamžitou validaci.
 * Nesmí: vybírat účet partnera ani měnit režim platebního příkazu.
 */
import { Input } from "../../ui/input";
import { isValidCzAccount, isValidIban, parseCzAccount } from "../../../lib/bank-account";
import { cn } from "../../../lib/utils";

/** Ručně zadaný účet přijatého dokladu. */
export interface ManualBankAccountValue {
  /** Tuzemské číslo účtu nebo zahraniční číslo bez IBAN. */
  text: string;
  /** IBAN. */
  iban: string;
  /** SWIFT/BIC. */
  swift: string;
}

/** Chyby ručně zadaného účtu. */
export interface ManualBankAccountErrors {
  /** Chyba čísla účtu. */
  text?: string;
  /** Chyba IBAN. */
  iban?: string;
  /** Chyba SWIFT/BIC. */
  swift?: string;
}

/** Ověří český účet, IBAN a SWIFT podle měny dokladu. */
export function validateManualBankAccount(
  value: ManualBankAccountValue,
  isHomeCurrency: boolean,
  bankCodes: string[] = [],
): ManualBankAccountErrors {
  const errors: ManualBankAccountErrors = {};
  const compactText = value.text.replace(/\s/g, "");
  const compactIban = value.iban.replace(/\s/g, "").toUpperCase();
  const compactSwift = value.swift.replace(/\s/g, "").toUpperCase();
  if (compactIban && !isValidIban(compactIban)) errors.iban = "IBAN není platný";
  if (compactSwift && !/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(compactSwift))
    errors.swift = "SWIFT/BIC musí mít 8 nebo 11 znaků";
  if (isHomeCurrency && compactText) {
    const [account = "", code = ""] = compactText.split("/");
    const parsed = parseCzAccount(account);
    if (!parsed || !isValidCzAccount(parsed.prefix, parsed.number))
      errors.text = "Číslo účtu není platné";
    else if (bankCodes.length && !bankCodes.includes(code)) errors.text = "Kód banky není platný";
  }
  if (!isHomeCurrency && !compactIban && compactText && !compactSwift)
    errors.swift = "Doplňte SWIFT/BIC";
  return errors;
}

/** Vlastnosti ručního bankovního účtu. */
export interface ReceivedBankAccountFieldProps {
  /** Řízená hodnota. */
  value: ManualBankAccountValue;
  /** Změna hodnoty. */
  onChange: (value: ManualBankAccountValue) => void;
  /** Doklad je v domácí měně. */
  isHomeCurrency: boolean;
  /** Povolené kódy bank. */
  bankCodes?: string[];
  /** Zakázání editace. */
  disabled?: boolean;
  /** Hlášení validačních chyb. */
  onValidationChange?: (errors: ManualBankAccountErrors) => void;
}

/** Ruční účet s validací českého účtu nebo IBAN a SWIFT. */
export function ReceivedBankAccountField(props: ReceivedBankAccountFieldProps) {
  const errors = validateManualBankAccount(props.value, props.isHomeCurrency, props.bankCodes);
  const patch = (next: Partial<ManualBankAccountValue>) => {
    const value = { ...props.value, ...next };
    props.onChange(value);
    props.onValidationChange?.(
      validateManualBankAccount(value, props.isHomeCurrency, props.bankCodes),
    );
  };
  return (
    <div className="grid min-w-0 gap-2 @container @min-[32rem]:grid-cols-2">
      <div className={cn("min-w-0", !props.isHomeCurrency && "@min-[32rem]:col-span-2")}>
        <Input
          aria-label={props.isHomeCurrency ? "Číslo účtu" : "Číslo účtu bez IBAN"}
          value={props.value.text}
          disabled={props.disabled}
          inputMode={props.isHomeCurrency ? "numeric" : "text"}
          onChange={(event) => patch({ text: event.target.value })}
          aria-invalid={Boolean(errors.text)}
          className="font-mono tabular-nums"
        />
        {errors.text ? <p className="mt-1 text-xs text-destructive">{errors.text}</p> : null}
      </div>
      <div className="min-w-0">
        <Input
          aria-label="IBAN"
          value={props.value.iban}
          disabled={props.disabled}
          onChange={(event) => patch({ iban: event.target.value.toUpperCase() })}
          aria-invalid={Boolean(errors.iban)}
          className="font-mono uppercase tabular-nums"
        />
        {errors.iban ? <p className="mt-1 text-xs text-destructive">{errors.iban}</p> : null}
      </div>
      <div className="min-w-0">
        <Input
          aria-label="SWIFT/BIC"
          value={props.value.swift}
          disabled={props.disabled}
          maxLength={11}
          onChange={(event) => patch({ swift: event.target.value.toUpperCase() })}
          aria-invalid={Boolean(errors.swift)}
          className="font-mono uppercase tabular-nums"
        />
        {errors.swift ? <p className="mt-1 text-xs text-destructive">{errors.swift}</p> : null}
      </div>
    </div>
  );
}