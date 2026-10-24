/**
 * Platební pole formuláře dokladu · vlastní číslo dodavatele, bankovní účty a důvody
 * zakázaných symbolů · nesmí ukládat data ani rozhodovat o vazbě VS.
 */
import type { DsTexts } from "../../../../ds-texts";
import type { ReactNode } from "react";
import type { DocumentFields } from "../document-fields";
import { companyAccountControlForForm } from "./BankAccountControls";
import { useBankAccountField } from "./use-bank-account-field";
import { useExternalNumberField } from "./use-external-number-field";
import type {
  DocumentFormProps,
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";

/** Odvozené vstupy z DocumentForm. */
export interface DocumentPaymentFieldsContext {
  /** Viditelná pole. */
  f: DocumentFields;
  /** Texty formuláře včetně DsTexts. */
  t: DocumentFormTexts & DsTexts["documentForm"];
  /** Hlavička. */
  value: DocumentHeaderValue;
  /** Změna hlavičky. */
  patch: (next: Partial<DocumentHeaderValue>) => void;
  /** Pole lze měnit. */
  can: (key: DocumentHeaderField) => boolean;
  /** Obecný zámek pole. */
  lockReason?: (key: DocumentHeaderField) => string | undefined;
  /** Vykreslovač pole. */
  field: (
    id: string,
    label: ReactNode,
    control: ReactNode,
    span?: number,
    mobileHalf?: boolean,
    className?: string,
  ) => ReactNode;
  /** Přijatý doklad. */
  receivedDocument: boolean;
  /** Vydaný doklad. */
  issuedDocument: boolean;
  /** Zobrazená pole DPH. */
  showVatFields: boolean;
  /** Uvolnění vazby VS při změně zdrojového čísla. */
  sourcePatch?: (next: Partial<DocumentHeaderValue>) => Partial<DocumentHeaderValue>;
}

/** Vrátí platební pole a důvody zakázání symbolů. */
export function useDocumentPaymentFields(
  props: DocumentFormProps,
  c: DocumentPaymentFieldsContext,
) {
  const { f, t, value, patch, can, field, receivedDocument, issuedDocument } = c;
  const documentType = (props.documentType ?? "ID").toUpperCase();
  const receivedAccountReason = ["FP", "ZFP"].includes(documentType)
    ? props.receivedAccountDisabledReason
    : undefined;
  const paymentOrderOn =
    !receivedAccountReason && (!f.paymentOrders || (props.paymentOrderEnabled ?? true));
  const externalNumberField = useExternalNumberField({
    sourcePatch: c.sourcePatch,
    value,
    patch,
    can,
    receivedDocument,
    cashDocument: documentType === "PO",
    showVatFields: c.showVatFields,
    f,
    t,
    field,
  });
  const bankAccountField = useBankAccountField({
    value,
    patch,
    can,
    t,
    field,
    receivedDocument,
    counterpartyInput: props.counterpartyInput ?? "partner",
    bankAccountOptions: props.bankAccountOptions ?? [],
    bankCodes: props.bankCodes,
    isHomeCurrency: props.isHomeCurrency ?? value.currency === props.homeCurrency,
    paymentOrdersApplicable: Boolean(f.paymentOrders),
    paymentOrderEnabled: paymentOrderOn,
    onPaymentOrderEnabledChange: props.onPaymentOrderEnabledChange,
    onManualBankAccountValidationChange: props.onManualBankAccountValidationChange,
    onAddBankAccount: props.onAddBankAccount,
    receivedAccountDisabledReason: receivedAccountReason,
  });
  const issuedBankAccountAbove = issuedDocument && ["FV", "ZFV"].includes(documentType);
  const symbolsDisabledReason = receivedDocument
    ? (receivedAccountReason ?? (!paymentOrderOn ? t.paymentOrderDisabled : undefined))
    : issuedBankAccountAbove
      ? props.companyBankAccountDisabledReason
      : undefined;
  const companyAccountField =
    issuedBankAccountAbove && f.bankAccount
      ? companyAccountControlForForm(
          {
            value,
            companyBankAccountOptions: props.companyBankAccountOptions,
            companyBankAccountDisabledReason: props.companyBankAccountDisabledReason,
          },
          patch,
          can,
          t.payToBankAccount,
          props.paymentMethodOptions,
          t.paymentMethod,
          c.lockReason,
        )
      : null;
  return {
    externalNumberField,
    bankAccountField,
    issuedBankAccountAbove,
    symbolsDisabledReason,
    companyAccountField,
  };
}
