/** Skupiny dat formuláře dokladu. */
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
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
// SSR neměří DOM; v prohlížeči měření předchází vykreslení.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
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
  const labelsKey = [t.issueDate, t.accountingDate, t.dueDate, t.taxDate, t.vatDate].join("\u0000");
  const geometry: CSSProperties & Record<string, string> = {
    "--document-date-format-sample": `"${sample}"`,
  };
  // Rozměry DOM jsou vnější stav: přepočet jen při změně prostoru, písma či formátu.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="field"]'));
      for (const field of fields) field.style.setProperty("--document-date-scale", "1");
      for (const field of fields) {
        const input = field.querySelector("input");
        if (!input) continue;
        const style = getComputedStyle(input);
        const border = 2 * parseFloat(style.borderLeftWidth);
        const available = container.clientWidth - border;
        const width = field.getBoundingClientRect().width;
        if (!available || width <= available) continue;
        // Každé pole se zmenší jen pokud samo přesahuje prostor; delší popisek nezmenší sousedy.
        const label = field.querySelector("label");
        const labelWidth = label?.getBoundingClientRect().width ?? 0;
        const fixed = labelWidth >= width - border ? 0 : parseFloat(style.paddingLeft) + border;
        const scale = Math.max(0, (available - fixed) / Math.max(1, width - fixed));
        field.style.setProperty("--document-date-scale", String(Math.min(1, scale)));
        // Popisek obsahuje i pevné odsazení; korekce vychází ze skutečného výsledku.
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const measuredWidth = field.getBoundingClientRect().width;
          if (measuredWidth <= available) break;
          const currentScale = Number(field.style.getPropertyValue("--document-date-scale"));
          const correctedScale = Math.max(
            0,
            Math.min(
              1,
              (currentScale * Math.max(0, available - fixed)) / Math.max(1, measuredWidth - fixed),
            ),
          );
          field.style.setProperty("--document-date-scale", String(correctedScale));
        }
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(document.documentElement);
    measure();
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [dateFormat, labelsKey, f.dueDate, f.taxDate, showVatFields]);
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
                          label: vat.dateLink.label ?? t.vatDateLinkLabel,
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
