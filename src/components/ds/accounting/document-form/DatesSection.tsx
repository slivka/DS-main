/** Skupiny dat formuláře dokladu. */
import type { ReactNode } from "react";
import { useCompactDateGeometry } from "../../form/use-compact-date-geometry";
import type { ComponentProps } from "react";
import type { DateField } from "../../form/date-field";
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
  /** Bankovní pohyb má pouze účetní datum. */
  bankMovement?: boolean;
  dateWarnings?: Partial<Record<DocumentDateField, string>>;
  date: (
    key: DocumentDateField,
    label: string,
    className?: string,
    options?: { link?: ComponentProps<typeof DateField>["link"]; hint?: string; warning?: string },
  ) => ReactNode;
}
/** Vykreslí data se společně ukotvenou skupinou DUZP a data DPH. */
export function DocumentDatesSection({ t, f, showVatFields, vat, filedVatDateWarning, dateWarnings, date }: DocumentDatesSectionProps) {
  const labelsKey = [
    t.issueDate,
    t.accountingDate,
    t.dueDate,
    t.taxDate,
    t.vatDate,
    f.dueDate,
    f.taxDate,
    f.accountingDate,
    showVatFields,
  ].join("\u0000");
  const { containerRef, geometry } = useCompactDateGeometry(labelsKey);
  return (
    <>
      <SectionHeading>{t.datesSection}</SectionHeading>
      <div ref={containerRef} style={geometry} className="document-dates-container">
        <div
          data-slot="document-dates"
          className="document-dates-compact flex flex-wrap items-start gap-3"
        >
          {date("issueDate", t.issueDate, "flex-none w-max")}
          {f.accountingDate !== false
            ? date("accountingDate", t.accountingDate, "flex-none w-max")
            : null}
          {f.dueDate ? date("dueDate", t.dueDate, "flex-none w-max") : null}
          {/* Rozpěrka nulové šířky: na společném řádku odsune skupinu DPH vpravo,
            po zalomení zůstane na prvním řádku a skupina začne vlevo – bez prahu. */}
          <div
            data-slot="document-dates-spacer"
            aria-hidden
            className="h-0 min-w-0 flex-1 basis-0"
          />
          <div
            data-slot="document-vat-dates"
            className="flex max-w-full flex-wrap items-start justify-start gap-3"
          >
            {showVatFields && f.taxDate ? date("taxDate", t.taxDate, "flex-none w-max") : null}
            {showVatFields
              ? date("vatDate", t.vatDate, "relative flex-none w-max", {
                  link: vat?.dateLink
                    ? {
                        ...vat.dateLink,
                        label: vat.dateLink.label ?? t.vatDateLinkLabel,
                        toggleDisabled: vat.dateLockReadOnly,
                        lockedHint: vat.dateLockReadOnly
                          ? t.vatDateLockedHint
                          : vat.dateLink.lockedHint,
                      }
                    : undefined,
                  hint: filedVatDateWarning ? undefined : vat?.periodLabel,
                  warning:
                    [filedVatDateWarning, dateWarnings?.vatDate].filter(Boolean).join(" · ") ||
                    undefined,
                })
              : null}
          </div>
        </div>
      </div>
    </>
  );
}
