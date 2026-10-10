/**
 * Pole bankovního účtu v hlavičce dokladu.
 * Vlastní: volbu mezi účtem přijatého dokladu a volným zadáním (BA, vydané bez firemních účtů).
 * Nesmí: rozhodovat o umístění pole ve formuláři.
 */
import type { ComponentProps, ReactNode } from "react";

import { BankAccountField, type BankAccountOption } from "../bank-account-field";
import type { ManualBankAccountErrors } from "../received-bank-account-field";
import { ReceivedAccountControl } from "./BankAccountControls";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";

/** Vstupy pole bankovního účtu. */
interface Args {
  /** Hodnota hlavičky. */
  value: DocumentHeaderValue;
  /** Změna hlavičky. */
  patch: (v: Partial<DocumentHeaderValue>) => void;
  /** Smí se pole měnit. */
  can: (k: DocumentHeaderField) => boolean;
  /** Texty formuláře včetně textů účtu z DsTexts. */
  t: DocumentFormTexts & ComponentProps<typeof ReceivedAccountControl>["texts"];
  /** Obal pole s popiskem. */
  field: (
    id: string,
    label: string,
    control: ReactNode,
    span?: number,
    required?: boolean,
    className?: string,
  ) => ReactNode;
  /** Přijatý doklad. */
  receivedDocument: boolean;
  /** Režim protistrany. */
  counterpartyInput: "partner" | "manual";
  /** Nabídka účtů. */
  bankAccountOptions: BankAccountOption[];
  /** Povolené kódy bank. */
  bankCodes?: string[];
  /** Doklad v domácí měně. */
  isHomeCurrency: boolean;
  /** Druh dokladu zná platební příkazy. */
  paymentOrdersApplicable: boolean;
  /** Zahrnutí do platebních příkazů. */
  paymentOrderEnabled: boolean;
  /** Změna zahrnutí. */
  onPaymentOrderEnabledChange?: (enabled: boolean) => void;
  /** Chyby ručního účtu. */
  onManualBankAccountValidationChange?: (errors: ManualBankAccountErrors) => void;
  /** Přidání účtu partnera. */
  onAddBankAccount?: () => void;
}

/** Vrátí pole účtu: přijatý doklad s platebním příkazem, jinak volné zadání. */
export function useBankAccountField(a: Args): ReactNode {
  const disabled = !a.can("bankAccount");
  const control = a.receivedDocument ? (
    <ReceivedAccountControl
      counterpartyInput={a.counterpartyInput}
      partnerAccountId={a.value.partnerBankAccountId}
      manualValue={a.value.manualBankAccount}
      options={a.bankAccountOptions}
      bankCodes={a.bankCodes}
      hasPartner={Boolean(a.value.partnerId)}
      isHomeCurrency={a.isHomeCurrency}
      paymentOrdersApplicable={a.paymentOrdersApplicable}
      paymentOrderEnabled={a.paymentOrderEnabled}
      onPaymentOrderEnabledChange={a.onPaymentOrderEnabledChange}
      onPartnerAccountChange={(partnerBankAccountId) => a.patch({ partnerBankAccountId })}
      onManualChange={(manualBankAccount) => a.patch({ manualBankAccount })}
      onValidationChange={a.onManualBankAccountValidationChange}
      onAddAccount={a.onAddBankAccount}
      disabled={disabled}
      texts={a.t}
    />
  ) : (
    <BankAccountField
      id="document-bankAccount"
      aria-label={a.t.bankAccount}
      value={a.value.bankAccount ?? ""}
      onChange={(bankAccount) => a.patch({ bankAccount })}
      disabled={disabled}
      options={a.bankAccountOptions}
      bankCodes={a.bankCodes}
      invalidAccountText={a.t.bankAccountInvalid}
      invalidBankCodeText={a.t.bankCodeInvalid}
      otherAccountText={a.t.otherBankAccount}
    />
  );
  return a.field(
    "document-bankAccount",
    a.t.bankAccount,
    control,
    a.receivedDocument ? 14 : 6,
    false,
    a.receivedDocument ? "@min-[40rem]:col-span-14 @min-[40rem]:pr-3" : "min-w-[12rem] flex-[1_1_12rem]",
  );
}
