/**
 * Bankovní účty v hlavičce dokladu.
 * Vlastní: výběr firemního účtu a režimy účtu přijatého dokladu.
 * Nesmí: rozhodovat o druhu dokladu ani ukládat hodnotu.
 */
import type { ReactNode } from "react";

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
          accountInvalid: props.texts.bankAccountInvalid,
          bankCodeInvalid: props.texts.bankCodeInvalid,
          ibanInvalid: props.texts.invalidIban,
          swiftInvalid: props.texts.invalidSwift,
          swiftRequired: props.texts.swiftRequired,
        }}
      />
    );
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
}

/** Firemní účet FV/ZFV přes plnou šířku. */
export function CompanyAccountControl(props: CompanyAccountControlProps): ReactNode {
  return (
    <Field label={props.label} htmlFor="document-companyBankAccountId" span={20}>
      {props.disabledReason ? (
        <FieldValue lockedReason={props.disabledReason} />
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
  );
}