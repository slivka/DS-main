/** Validace hlavičky · vlastní společné pruhy · nesmí měnit pole ani hodnoty. */
import type { ReactNode } from "react";
import { NoticeBar } from "../../feedback/notice-bar";
import type {
  DocumentFormError,
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
  DocumentVatRateField,
} from "./document-form-types";

/** Vstupy sdílených pruhů. */
export interface DocumentValidationArgs {
  /** Hlavička. */
  value: DocumentHeaderValue;
  /** Cizí měna. */
  foreign: boolean;
  /** Kurz DPH. */
  vatRateField?: DocumentVatRateField;
  /** Texty formuláře. */
  t: DocumentFormTexts;
  /** Dosavadní upozornění. */
  notices?: ReactNode;
  /** Dosavadní chyba. */
  error?: DocumentFormError;
  /** Chyby polí. */
  fieldErrors?: Partial<Record<DocumentHeaderField, string>>;
  /** Výstrahy polí. */
  fieldWarnings?: Partial<Record<DocumentHeaderField, string>>;
  /** Duplicitní daňové číslo. */
  taxDocumentNumberWarning?: string;
  /** Neplatné IČO. */
  icoWarning?: boolean;
  /** Doklad jen pro čtení – chybějící kurz DPH se nehlásí. */
  readOnly?: boolean;
  /** Popisky polí s neplatným zápisem data. */
  invalidDateLabels?: string[];
  /** Varování čísla dodavatele pro VS. */
  externalNumberWarning?: string;
}

/** Celé zprávy patří také do pruhu nad formulářem. */
export function documentValidationFeedback(a: DocumentValidationArgs) {
  const errors = Object.values(a.fieldErrors ?? {}).filter(Boolean);
  for (const label of a.invalidDateLabels ?? []) errors.push(`${label}: ${a.t.invalidDate}`);
  if (
    !a.readOnly &&
    a.foreign &&
    a.vatRateField &&
    !a.vatRateField.sameAsDocument &&
    !a.vatRateField.manual &&
    a.vatRateField.suggestedRate == null
  )
    errors.push(a.t.vatRateMissing);
  if (a.foreign && a.value.rateManual && !a.value.rateNote?.trim())
    errors.push(a.t.rateNoteRequired);
  if (a.foreign && a.vatRateField?.manual && !a.vatRateField.note?.trim())
    errors.push(a.t.rateNoteRequired);
  return {
    error: errors.length
      ? {
          ...a.error,
          message: (
            <>
              {a.error?.message}
              {errors.map((message, index) => (
                <div key={index}>{message}</div>
              ))}
            </>
          ),
        }
      : a.error,
    notices: (
      <>
        {a.notices}
        {Object.entries(a.fieldWarnings ?? {}).map(([key, message]) => (
          <NoticeBar key={key} tone="warning">
            {message}
          </NoticeBar>
        ))}
        {a.taxDocumentNumberWarning ? (
          <NoticeBar tone="warning">{a.taxDocumentNumberWarning}</NoticeBar>
        ) : null}
        {a.icoWarning ? <NoticeBar tone="warning">{a.t.invalidIco}</NoticeBar> : null}
        {a.externalNumberWarning ? (
          <NoticeBar tone="warning">{a.externalNumberWarning}</NoticeBar>
        ) : null}
      </>
    ),
  };
}
