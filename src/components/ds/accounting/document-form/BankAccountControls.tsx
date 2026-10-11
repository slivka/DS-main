/**
 * Bankovní účty v hlavičce dokladu.
 * Vlastní: výběr firemního účtu a režimy účtu přijatého dokladu.
 * Nesmí: rozhodovat o druhu dokladu ani ukládat hodnotu.
 */
import type { ReactNode } from "react";
import { useDsTexts } from "../../../../ds-texts";

import { BankAccountField, type BankAccountOption } from "../bank-account-field";
import { PaymentOrderAccountField } from "../payment-order-account-field";
import {
  ReceivedBankAccountField,
  type ManualBankAccountErrors,
  type ManualBankAccountValue,
} from "../received-bank-account-field";
import { FieldValue } from "../../form/field-value";
import { OptionSelect } from "../../form/option-select";
import { Field } from "../../layout/RecordDialog";

/** Vlastnosti účtu přijatého dokladu. */
export interface ReceivedAccountControlProps {
  /** Režim protistrany. */
  counterpartyInput: "partner" | "manual";
  /** Vybraný účet partnera. */
  partnerAccountId?: string | null;
  /** Ručně zadaný účet. */
  manualValue?: ManualBankAccountValue;
  /** Nabídka účtů partnera. */
  options: BankAccountOption[];
  /** Povolené kódy bank. */
  bankCodes?: string[];
  /** Partner je vybraný. */
  hasPartner: boolean;
  /** Doklad je v domácí měně. */
  isHomeCurrency: boolean;
  /** Druh dokladu zná platební příkazy; jinak se přepínač nevykreslí. */
  paymentOrdersApplicable?: boolean;
  /** Zahrnout do platebních příkazů. */
  paymentOrderEnabled: boolean;
  /** Změna zahrnutí. */
  onPaymentOrderEnabledChange?: (enabled: boolean) => void;
  /** Změna účtu partnera. */
  onPartnerAccountChange: (id: string) => void;
  /** Změna ručního účtu. */
  onManualChange: (value: ManualBankAccountValue) => void;
  /** Hlášení validačních chyb. */
  onValidationChange?: (errors: ManualBankAccountErrors) => void;
  /** Přidání účtu partnera. */
  onAddAccount?: () => void;
  /** Zakázání editace. */
  disabled?: boolean;
  /** Přeložené texty. */
  texts: {
    bankAccount: string;
    bankAccountInvalid: string;
    bankCodeInvalid: string;
    otherBankAccount: string;
    addBankAccount: string;
    selectSupplierFirst: string;
    payByOrder: string;
    excludeFromPaymentOrders: string;
    paymentOrderDisabled: string;
    manualAccountNumber: string;
    manualAccountWithoutIban: string;
    invalidIban: string;
    invalidSwift: string;
    swiftRequired: string;
    bankCodeRequired: string;
    accountRequired: string;
    accountOrIban: string;
  };
}

/** Účet přijatého dokladu s přepínačem platebního příkazu. */
export function ReceivedAccountControl(props: ReceivedAccountControlProps) {
  const content =
    props.counterpartyInput === "partner" ? (
      <BankAccountField
        aria-label={props.texts.bankAccount}
        value={props.partnerAccountId ?? ""}
        onChange={props.onPartnerAccountChange}
        disabled={props.disabled || !props.hasPartner}
        options={props.options}
        bankCodes={props.bankCodes}
        invalidAccountText={props.texts.bankAccountInvalid}
        invalidBankCodeText={props.texts.bankCodeInvalid}
        otherAccountText={props.texts.otherBankAccount}
        selectionOnly
        onAddAccount={props.onAddAccount}
        addAccountText={props.texts.addBankAccount}
        disabledReason={!props.hasPartner ? props.texts.selectSupplierFirst : undefined}
      />
    ) : (
      <ReceivedBankAccountField
        value={props.manualValue ?? { text: "", iban: "", swift: "" }}
        onChange={props.onManualChange}
        isHomeCurrency={props.isHomeCurrency}
        bankCodes={props.bankCodes}
        disabled={props.disabled}
        onValidationChange={props.onValidationChange}
        texts={{
          accountLabel: props.texts.manualAccountNumber,
          accountWithoutIbanLabel: props.texts.manualAccountWithoutIban,
          validation: {
            account: props.texts.bankAccountInvalid,
            bankCode: props.texts.bankCodeInvalid,
            bankCodeRequired: props.texts.bankCodeRequired,
            iban: props.texts.invalidIban,
            swift: props.texts.invalidSwift,
            swiftRequired: props.texts.swiftRequired,
            accountRequired: props.texts.accountRequired,
            accountOrIban: props.texts.accountOrIban,
          },
        }}
      />
    );
  if (props.paymentOrdersApplicable === false) return content;
  return (
    <PaymentOrderAccountField
      enabled={props.paymentOrderEnabled}
      onEnabledChange={props.onPaymentOrderEnabledChange}
      enabledLabel={props.texts.payByOrder}
      disabledLabel={props.texts.excludeFromPaymentOrders}
      disabledReason={props.texts.paymentOrderDisabled}
    >
      {content}
    </PaymentOrderAccountField>
  );
}

/** Vlastnosti firemního účtu nad základními údaji. */
export interface CompanyAccountControlProps {
  /** Aktuální identifikátor. */
  value?: string | null;
  /** Změna účtu. */
  onChange: (id: string) => void;
  /** Položky nabídky. */
  options: Array<{ id: string; label: string; account: string; currency: string }>;
  /** Zakázání editace. */
  disabled?: boolean;
  /** Důvod prázdného zakázaného pole. */
  disabledReason?: string;
  /** Popisek. */
  label: string;
  /** Nabídka způsobů platby; s ní účet zabírá pravých 14 sloupců. */
  paymentMethodOptions?: Array<{ value: string; label: string }>;
  /** Vybraný způsob platby. */
  paymentMethodId?: string | null;
  /** Změna způsobu platby. */
  onPaymentMethodChange?: (id: string) => void;
  /** Způsob platby nelze editovat. */
  paymentMethodDisabled?: boolean;
  /** Popisek z textů formuláře má přednost před poskytovatelem. */
  paymentMethodLabel?: string;
}

/** Firemní účet FV/ZFV přes plnou šířku. */
export function CompanyAccountControl(props: CompanyAccountControlProps): ReactNode {
  const t = useDsTexts().documentForm;
  return (
    <>
      {props.paymentMethodOptions ? (
        <Field label={props.paymentMethodLabel ?? t.paymentMethod} htmlFor="document-paymentMethodId" span={6}>
          <OptionSelect
            id="document-paymentMethodId"
            value={props.paymentMethodId}
            onChange={(id) => props.onPaymentMethodChange?.(id)}
            options={props.paymentMethodOptions}
            searchable
            disabled={props.paymentMethodDisabled}
          />
        </Field>
      ) : null}
      <Field
        label={props.label}
        htmlFor="document-companyBankAccountId"
        span={props.paymentMethodOptions ? 14 : 20}
      >
        {props.disabledReason ? (
          <FieldValue
            id="document-companyBankAccountId"
            aria-label={props.label}
            lockedReason={props.disabledReason}
          />
        ) : (
          <OptionSelect
            id="document-companyBankAccountId"
            value={props.value}
            onChange={props.onChange}
            options={props.options.map((option) => ({
              value: option.id,
              label: [option.label, option.account, option.currency].join(" · "),
            }))}
            disabled={props.disabled}
          />
        )}
      </Field>
    </>
  );
}

/** Sestaví horní řádek FV/ZFV ze společných údajů formuláře. */
export function companyAccountControlForForm(
  props: Pick<
    import("./document-form-types").DocumentFormProps,
    | "value"
    | "paymentMethodOptions"
    | "companyBankAccountOptions"
    | "companyBankAccountDisabledReason"
  >,
  patch: (value: Partial<import("./document-form-types").DocumentHeaderValue>) => void,
  can: (key: import("./document-form-types").DocumentHeaderField) => boolean,
  label: string,
  paymentOptions?: Array<{ value: string; label: string }>,
  paymentMethodLabel?: string,
): ReactNode {
  if (!props.companyBankAccountOptions) return null;
  return (
    <CompanyAccountControl
      value={props.value.companyBankAccountId}
      onChange={(companyBankAccountId) => patch({ companyBankAccountId })}
      options={props.companyBankAccountOptions}
      disabled={!can("companyBankAccountId")}
      disabledReason={props.companyBankAccountDisabledReason}
      label={label}
      paymentMethodOptions={paymentOptions ?? props.paymentMethodOptions}
      paymentMethodId={props.value.paymentMethodId}
      onPaymentMethodChange={(paymentMethodId) => patch({ paymentMethodId })}
      paymentMethodDisabled={!can("paymentMethodId")}
      paymentMethodLabel={paymentMethodLabel}
    />
  );
}
