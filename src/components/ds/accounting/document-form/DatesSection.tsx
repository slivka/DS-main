/** Skupiny dat formuláře dokladu. */
import type { ReactNode } from "react";
import { SectionHeading } from "../../layout/section-heading";
import type { DocumentFields } from "../document-fields";
import type {
  DocumentDateField,
  DocumentFormTexts,
  DocumentVatConfig,
} from "./document-form-types";
export interface DocumentDatesSectionProps {
  t: DocumentFormTexts;
  f: DocumentFields;
  showVatFields?: boolean;
  vat?: DocumentVatConfig;
  filedVatDateWarning?: string;
  dateWarnings?: Partial<Record<DocumentDateField, string>>;
  date: (
    key: DocumentDateField,
    label: string,
    className?: string,
    options?: { link?: any; hint?: string; warning?: string },
  ) => ReactNode;
}
/** Vykreslí data se společně ukotvenou skupinou DUZP a data DPH. */
export function DocumentDatesSection({
  t,
  f,
  showVatFields,
  vat,
  filedVatDateWarning,
  dateWarnings,
  date,
}: DocumentDatesSectionProps) {
  return (
    <>
      <SectionHeading>{t.datesSection}</SectionHeading>
      <div data-slot="document-dates" className="flex flex-wrap items-start gap-3">
        <div className="flex flex-wrap items-start gap-3">
          {date("issueDate", t.issueDate, "flex-none w-max")}
          {date("accountingDate", t.accountingDate, "flex-none w-max")}
          {f.dueDate ? date("dueDate", t.dueDate, "flex-none w-max") : null}
        </div>
        <div
          data-slot="document-vat-dates"
          className="ml-auto flex flex-wrap items-start justify-end gap-3"
        >
          {showVatFields && f.taxDate ? date("taxDate", t.taxDate, "flex-none w-max") : null}
          {showVatFields
            ? date(
                "vatDate",
                t.vatDate,
                "relative flex-none w-max [&_.field-overflow-hint]:absolute [&_.field-overflow-hint]:right-0 [&_.field-overflow-hint]:w-max [&_.field-overflow-hint]:max-w-none [&_.field-overflow-hint]:whitespace-nowrap [&_.field-overflow-hint]:text-right",
                {
                  link: vat?.dateLink
                    ? {
                        ...vat.dateLink,
                        toggleDisabled: vat.dateLockReadOnly,
                        lockedHint: vat.dateLockReadOnly
                          ? t.vatDateLockedHint
                          : vat.dateLink.lockedHint,
                      }
                    : undefined,
                  hint: vat?.periodLabel,
                  warning:
                    [filedVatDateWarning, dateWarnings?.vatDate].filter(Boolean).join(" · ") ||
                    undefined,
                },
              )
            : null}
        </div>
      </div>
    </>
  );
}
