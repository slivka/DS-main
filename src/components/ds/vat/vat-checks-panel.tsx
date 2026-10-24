/** Kontroly DPH · vlastní filtr a odkazy · nesmí vytvářet nálezy ani blokovat podání. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { CheckList } from "../feedback/check-list";
import { OptionSelect } from "../form/option-select";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Nález dodaný APP. */
export interface VatCheckItem {
  /** Klíč nálezu. */ id: string;
  /** Závažnost. */ severity: "error" | "warning" | "info";
  /** Text. */ text: string;
  /** Podrobnosti. */ detail?: string;
  /** ID souvisejícího dokladu. */ documentId?: string;
}
/** Parametry kontrol. */
export interface VatChecksPanelProps extends ComponentPropsWithoutRef<"div"> {
  /** Nálezy. */ items: VatCheckItem[];
  /** Otevření dokladu. */ onDocumentOpen?: (id: string) => void;
  /** Řízený filtr; bez něj místní. */ severity?: VatCheckItem["severity"] | "all";
  /** Změna filtru. */ onSeverityChange?: (severity: VatCheckItem["severity"] | "all") => void;
}
/** Nálezy s filtrem a celkovým počtem. */
export const VatChecksPanel = forwardRef<HTMLDivElement, VatChecksPanelProps>(
  function VatChecksPanel(
    { items, onDocumentOpen, severity, onSeverityChange, className, ...props },
    ref,
  ) {
    const texts = useDsTexts();
    const t = texts.vatReports;
    const [local, setLocal] = useState<VatCheckItem["severity"] | "all">("all");
    const current = severity ?? local;
    return (
      <div ref={ref} {...props} className={cn("min-w-0 space-y-3", className)}>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">
            {t.checks} ({new Intl.NumberFormat(texts.intlLocale).format(items.length)})
          </h3>
          <OptionSelect
            ariaLabel={t.checks}
            className="w-auto"
            value={current}
            allowEmpty={false}
            options={[
              { value: "all", label: t.all },
              ...Object.entries(t.severity).map(([value, label]) => ({ value, label })),
            ]}
            onChange={(value) => {
              if (value !== "all" && value !== "error" && value !== "warning" && value !== "info")
                return;
              setLocal(value);
              onSeverityChange?.(value);
            }}
          />
        </header>
        <CheckList
          items={items
            .filter((item) => current === "all" || item.severity === current)
            .map((item) => ({
              id: item.id,
              severity: item.severity,
              title: item.text,
              detail: item.detail,
              action:
                item.documentId && onDocumentOpen
                  ? {
                      label: t.openDocument,
                      onClick: () => {
                        if (item.documentId) onDocumentOpen(item.documentId);
                      },
                    }
                  : undefined,
            }))}
        />
      </div>
    );
  },
);
