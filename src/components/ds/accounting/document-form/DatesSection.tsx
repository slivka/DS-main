/** Skupiny dat formuláře dokladu. */
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useDateTimePreferences } from "../../../../lib/date-time-preferences";
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
  dateWarnings?: Partial<Record<DocumentDateField, string>>;
  date: (
    key: DocumentDateField,
    label: string,
    className?: string,
    options?: { link?: ComponentProps<typeof DateField>["link"]; hint?: string; warning?: string },
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { dateFormat, formatDate } = useDateTimePreferences();
  const sample = formatDate("2000-11-22").replace(/\d/g, "0");
  const geometry: CSSProperties & Record<string, string> = {
    "--document-date-format-sample": `"${sample}"`,
  };
  // Rozměry DOM jsou vnější stav: přepočet jen při změně prostoru, písma či formátu.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      container.style.setProperty("--document-date-scale", "1");
      const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="field"]'));
      const minimum = Math.min(...fields.map((field) => field.getBoundingClientRect().width));
      const input = container.querySelector("input");
      if (!input) return;
      const style = getComputedStyle(input);
      const available = container.clientWidth - 2 * parseFloat(style.borderLeftWidth);
      if (!available || minimum <= available) return;
      // Pouze rem odsazení a rámečky nerostou s lokálním písmem; ikony ano.
      const fixed = parseFloat(style.paddingLeft) + 2 * parseFloat(style.borderLeftWidth);
      const scale = Math.max(0, (available - fixed) / (minimum - fixed));
      container.style.setProperty("--document-date-scale", String(Math.min(1, scale)));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(document.documentElement);
    measure();
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [dateFormat, t]);
  return (
    <>
      <SectionHeading>{t.datesSection}</SectionHeading>
      <div ref={containerRef} style={geometry} className="document-dates-container">
        <div
          data-slot="document-dates"
          className="document-dates-compact flex flex-wrap items-start gap-3"
        >
          {date("issueDate", t.issueDate, "flex-none w-max")}
          {date("accountingDate", t.accountingDate, "flex-none w-max")}
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
      </div>
    </>
  );
}
