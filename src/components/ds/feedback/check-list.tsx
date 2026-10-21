/** Seznam kontrol · vlastní řazení a souhrn · nesmí provádět kontroly. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { FileSeverityIcon, type CheckSeverity } from "./file-severity";
import { NoticeBar } from "./notice-bar";
import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Kontrola dodaná aplikací. */
export interface CheckListItem {
  /** Stabilní klíč. */ id?: string;
  /** Závažnost. */ severity: CheckSeverity;
  /** Titulek. */ title: string;
  /** Podrobnosti. */ detail?: string;
  /** Akce aplikace. */ action?: { label: string; onClick: () => void };
}
/** Seznam výsledků bez doménové logiky. */
export interface CheckListProps extends ComponentPropsWithoutRef<"div"> {
  /** Výsledky APP. */ items: readonly CheckListItem[];
  /** Hustota. */ size?: "sm" | "md";
}
const ORDER: Record<CheckSeverity, number> = { error: 0, warning: 1, info: 2, ok: 3 };
/** Číselný souhrn výsledků. */
export function summarizeChecks(items: readonly CheckListItem[]) {
  return { errors: items.filter((item) => item.severity === "error").length,
    warnings: items.filter((item) => item.severity === "warning").length };
}
/** Chyby před upozorněními, informace před úspěšnými kontrolami. */
export const CheckList = forwardRef<HTMLDivElement, CheckListProps>(
  function CheckList({ items, size = "md", className, ...props }, ref) {
    const texts = useDsTexts();
    const t = texts.fileImport;
    const counts = summarizeChecks(items);
    const number = new Intl.NumberFormat(texts.intlLocale);
    const summary = t.summary.replace("{errors}", number.format(counts.errors))
      .replace("{warnings}", number.format(counts.warnings));
    const ordered = [...items].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
    return <div ref={ref} {...props} className={cn("min-w-0 space-y-2", className)} data-slot="check-list">
      <NoticeBar tone={counts.errors ? "danger" : counts.warnings ? "warning" : "success"}>
        {items.length ? summary : t.noChecks}
      </NoticeBar>
      <ul className="divide-y divide-border">
        {ordered.map((item, index) => <li key={item.id ?? index}
          className={cn("flex items-start gap-2", size === "sm" ? "py-2" : "py-3")}>
          <FileSeverityIcon severity={item.severity} />
          <div className="min-w-0 flex-1 text-sm">
            <p className="break-words font-medium">{item.title}</p>
            {item.detail ? <p className="mt-1 break-words text-xs text-muted-foreground">{item.detail}</p> : null}
            {item.action ? <Button type="button" variant="link" className="h-auto max-w-full whitespace-normal p-0 text-left"
              onClick={item.action.onClick}>{item.action.label}</Button> : null}
          </div>
        </li>)}
      </ul>
    </div>;
  },
);
