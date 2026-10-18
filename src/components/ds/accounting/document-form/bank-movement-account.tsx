/** Protiúčet pohybu · vlastní rozvržení režimů · nesmí vybírat účet výpisu. */
import { Input } from "../../../ui/input";
import { OptionSelect } from "../../form/option-select";
import { SectionHeading } from "../../layout/section-heading";
import { Field } from "../../layout/form-field-layout";
import { useDsTexts } from "../../../../ds-texts";
import type { DocumentHeaderValue } from "./document-form-types";

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
}

/** Český účet nebo IBAN bez mazání druhého režimu. */
export function BankMovementAccount({
  value,
  patch,
  bankCodes = [],
  bankCodeOptions,
  disabled,
}: BankMovementAccountProps) {
  const t = useDsTexts().documentEdit;
  const iban = value.bankAccountKind === "iban";
  return (
    <>
      <SectionHeading>{t.counteraccountSection}</SectionHeading>
      <div data-slot="bank-movement-account" className="grid grid-cols-20 gap-3">
        <Field
          label={t.accountKind}
          htmlFor="document-bankAccountKind"
          span={4}
          className="col-span-20"
        >
          <OptionSelect
            id="document-bankAccountKind"
            value={iban ? "iban" : "domestic"}
            allowEmpty={false}
            disabled={disabled}
            options={[
              { value: "domestic", label: t.domesticAccount },
              { value: "iban", label: t.iban },
            ]}
            onChange={(kind) => patch({ bankAccountKind: kind === "iban" ? "iban" : "domestic" })}
          />
        </Field>
        <Field
          label={iban ? t.iban : t.accountNumber}
          htmlFor="document-movement-account"
          span={8}
          className="col-span-20"
        >
          <Input
            id="document-movement-account"
            value={iban ? (value.bankIban ?? "") : (value.bankAccount ?? "")}
            formatPattern={iban ? undefined : t.accountPattern}
            disabled={disabled}
            onChange={(event) =>
              patch(
                iban
                  ? { bankIban: event.target.value.toUpperCase() }
                  : { bankAccount: event.target.value },
              )
            }
          />
        </Field>
        <Field
          label={iban ? t.swift : t.bankCode}
          htmlFor="document-bank-code"
          span={8}
          className="col-span-20"
        >
          {iban ? (
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
