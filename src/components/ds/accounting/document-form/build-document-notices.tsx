/** Upozornění formuláře dokladu. */
import type { ReactNode } from "react";
import { NoticeBar } from "../../feedback/notice-bar";
import type { BankAccountOption } from "../bank-account-field";
import type {
  DocumentDateField,
  DocumentFormTexts,
  DocumentHeaderValue,
} from "./document-form-types";
export interface DocumentNoticesArgs {
  value: DocumentHeaderValue;
  dateWarnings?: Partial<Record<DocumentDateField, string>>;
  f: { dueDate?: boolean; taxDate?: boolean };
  showVatFields?: boolean;
  filedVatDateWarning?: string;
  notices?: ReactNode;
  bankAccountOptions: BankAccountOption[];
  t: DocumentFormTexts & { invalidBankAccountWarning: string };
}
/** Složí datová a bankovní varování do pruhu akcí. */
export function buildDocumentNotices({
  value,
  dateWarnings,
  f,
  showVatFields,
  filedVatDateWarning,
  notices,
  bankAccountOptions,
  t,
}: DocumentNoticesArgs): ReactNode {
  const dateWarningEntries: Array<[DocumentDateField, string, string | undefined]> = [
    ["issueDate", t.issueDate, dateWarnings?.issueDate],
    ["accountingDate", t.accountingDate, dateWarnings?.accountingDate],
    ["dueDate", t.dueDate, f.dueDate ? dateWarnings?.dueDate : undefined],
    ["taxDate", t.taxDate, showVatFields && f.taxDate ? dateWarnings?.taxDate : undefined],
    ["vatDate", t.vatDate, showVatFields ? filedVatDateWarning : undefined],
    ["vatDate", t.vatDate, showVatFields ? dateWarnings?.vatDate : undefined],
  ];
  const dateNoticeBars = dateWarningEntries
    .filter((entry): entry is [DocumentDateField, string, string] => Boolean(entry[2]))
    .map(([key, label, warning], index) => (
      <NoticeBar key={`${key}-${index}`} tone="warning" title={label}>
        {warning}
      </NoticeBar>
    ));
  const selectedPartnerBankAccount = bankAccountOptions.find(
    (option) => (option.id ?? `${option.number}/${option.bankCode}`) === value.partnerBankAccountId,
  );
  const invalidBankAccountNotice = selectedPartnerBankAccount?.invalid ? (
    <NoticeBar tone="warning">{t.invalidBankAccountWarning}</NoticeBar>
  ) : null;
  const combinedNotices =
    notices || dateNoticeBars.length || invalidBankAccountNotice ? (
      <>
        {notices}
        {dateNoticeBars}
        {invalidBankAccountNotice}
      </>
    ) : undefined;
  return combinedNotices;
}
