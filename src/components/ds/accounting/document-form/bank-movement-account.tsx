/** Protiúčet pohybu · vlastní rozvržení režimů · nesmí vybírat účet výpisu. */
import { Input } from "../../../ui/input";
import { Landmark } from "lucide-react";
import { FieldToggleButton } from "../../form/field-toggle-button";
import { accountFromCzIban, isValidIban } from "../../../../lib/bank-account";
import { OptionSelect } from "../../form/option-select";
import { FieldValue } from "../../form/field-value";
import { SectionHeading } from "../../layout/section-heading";
import { Field } from "../../layout/form-field-layout";
import { useDsTexts } from "../../../../ds-texts";
import type { DocumentHeaderField, DocumentHeaderValue } from "./document-form-types";

/** Vlastnosti protiúčtu bankovního pohybu. */
export interface BankMovementAccountProps {
  /** Řízená hlavička. */
  value: DocumentHeaderValue;
  /** Změna hlavičky. */
  patch: (next: Partial<DocumentHeaderValue>) => void;
  /** Kódy bank dodané aplikací (bez názvů). */
  bankCodes?: string[];
  /** Kódy bank s názvy z aplikace; nabídka i pole „0100 – Komerční banka“. */
  bankCodeOptions?: Array<{ code: string; name: string }>;
  /** Zakázání editace. */
  disabled?: boolean;
  /** Chyby polí z projekce pruhu (rámeček + ikona + bublina). */
  fieldErrors?: Partial<Record<DocumentHeaderField, string>>;
  /** Varování polí z projekce pruhu (žlutě). */
  fieldWarnings?: Partial<Record<DocumentHeaderField, string>>;
  /** Obecný důvod uzamčení pole (2.128.0); pole se vykreslí jen pro čtení se zámkem. */
  lockReason?: (key: DocumentHeaderField) => string | undefined;
}

/** Český účet nebo IBAN bez mazání druhého režimu. */
export function BankMovementAccount({
  value,
  patch,
  bankCodes = [],
  bankCodeOptions,
  disabled,
  fieldErrors,
  fieldWarnings,
  lockReason,
}: BankMovementAccountProps) {
  const ds = useDsTexts();
  const t = ds.documentEdit;
  const iban = value.bankAccountKind === "iban";
  const accountLocked = lockReason?.(iban ? "bankIban" : "bankAccount");
  const codeLocked = lockReason?.(iban ? "bankSwift" : "bankCode");
  const invalidIban =
    iban && value.bankIban && !isValidIban(value.bankIban)
      ? ds.documentForm.invalidIban
      : undefined;
  const changeAccount = (text: string) => {
    const normalized = text.replace(/\s/g, "").toUpperCase();
    if (/^[A-Z]{2}\d{2}/.test(normalized)) {
      const domestic = accountFromCzIban(text);
      patch(
        domestic
          ? {
              bankAccountKind: "domestic",
              bankAccount: domestic.prefix
                ? `${domestic.prefix}-${domestic.number}`
                : domestic.number,
              bankCode: domestic.bankCode,
              bankIban: normalized,
            }
          : { bankAccountKind: "iban", bankIban: normalized },
      );
    } else patch(iban ? { bankIban: text.toUpperCase() } : { bankAccount: text });
  };
  return (
    <>
      <SectionHeading>{t.counteraccountSection}</SectionHeading>
      <div data-slot="bank-movement-account" className="grid grid-cols-20 gap-3">
        <Field
          label={t.counterpartyAccount}
          htmlFor="document-movement-account"
          span={12}
          className="col-span-20"
          error={iban ? (fieldErrors?.bankIban ?? invalidIban) : fieldErrors?.bankAccount}
          warning={iban ? fieldWarnings?.bankIban : fieldWarnings?.bankAccount}
        >
          {accountLocked ? (
            <FieldValue
              id="document-movement-account"
              aria-labelledby="document-movement-account-label"
              lockedReason={accountLocked}
              className="font-mono tabular-nums"
            >
              {iban ? (value.bankIban ?? "") : (value.bankAccount ?? "")}
            </FieldValue>
          ) : (
            <div className="relative min-w-0 [--field-feedback-offset:calc(var(--field-toggle-space)+0.25rem)]">
              <Input
                id="document-movement-account"
                value={iban ? (value.bankIban ?? "") : (value.bankAccount ?? "")}
                formatPattern={iban ? undefined : t.accountPattern}
                disabled={disabled}
                className="pr-[calc(var(--field-toggle-space)+3.5rem)]"
                onChange={(event) => changeAccount(event.target.value)}
              />
              <span className="absolute right-[var(--field-toggle-space)] top-0 flex h-[var(--control-h)] items-center text-xs text-muted-foreground pointer-events-none">
                {iban ? t.iban : t.domesticAccountShort}
              </span>
              <FieldToggleButton
                icon={Landmark}
                pressed={iban}
                label={t.accountKind}
                pressedTooltip={t.iban}
                unpressedTooltip={t.domesticAccountShort}
                disabled={disabled}
                onPressedChange={(next) => patch({ bankAccountKind: next ? "iban" : "domestic" })}
              />
            </div>
          )}
        </Field>
        <Field
          label={iban ? t.swift : t.bankCode}
          htmlFor="document-bank-code"
          span={8}
          className="col-span-20"
          error={iban ? fieldErrors?.bankSwift : fieldErrors?.bankCode}
          warning={iban ? fieldWarnings?.bankSwift : fieldWarnings?.bankCode}
        >
          {codeLocked ? (
            <FieldValue
              id="document-bank-code"
              aria-labelledby="document-bank-code-label"
              lockedReason={codeLocked}
              className="font-mono tabular-nums"
            >
              {iban ? (value.bankSwift ?? "") : (value.bankCode ?? "")}
            </FieldValue>
          ) : iban ? (
            <Input
              id="document-bank-code"
              value={value.bankSwift ?? ""}
              disabled={disabled}
              onChange={(event) => patch({ bankSwift: event.target.value.toUpperCase() })}
            />
          ) : (
            <OptionSelect
              id="document-bank-code"
              value={value.bankCode}
              searchable
              disabled={disabled}
              options={
                bankCodeOptions
                  ? bankCodeOptions.map((option) => {
                      const label = t.bankCodeOption
                        .replace("{code}", option.code)
                        .replace("{name}", option.name);
                      return { value: option.code, label, searchText: label };
                    })
                  : bankCodes.map((code) => ({ value: code, label: code }))
              }
              onChange={(bankCode) => patch({ bankCode })}
            />
          )}
        </Field>
      </div>
    </>
  );
}
