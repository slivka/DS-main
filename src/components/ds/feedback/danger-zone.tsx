import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";

export interface DangerZoneItem {
  title: string;
  description: ReactNode;
  /** Akce (obvykle tlačítko variant="destructive" otevírající ConfirmByTypingDialog). */
  action: ReactNode;
}

export interface DangerZoneProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Nadpis sekce; výchozí „Nebezpečná zóna“. */
  title?: string;
  items: DangerZoneItem[];
}

/** Sekce nevratných akcí s červeným okrajem. */
export const DangerZone = forwardRef<HTMLElement, DangerZoneProps>(function DangerZone({ title, items, className, ...props }, ref) {
  const texts = useDsTexts();
  const heading = title ?? texts.dangerZone.title;
  return (
    <section ref={ref} data-slot="danger-zone" aria-label={heading} className={cn("@container rounded-lg border border-destructive bg-card", className)} {...props}>
      <h2 className="truncate whitespace-nowrap border-b border-destructive/40 px-4 py-2 text-[0.8125rem] font-semibold uppercase tracking-wide text-destructive" title={heading}>{heading}</h2>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.title} className="flex flex-col gap-2 px-4 py-3 @min-[32rem]:flex-row @min-[32rem]:items-center @min-[32rem]:gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate whitespace-nowrap text-sm font-semibold text-foreground" title={item.title}>{item.title}</p>
              <div className="text-sm text-muted-foreground">{item.description}</div>
            </div>
            <div className="shrink-0">{item.action}</div>
          </li>
        ))}
      </ul>
    </section>
  );
});
