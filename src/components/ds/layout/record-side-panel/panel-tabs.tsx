/** Řádek ikonových záložek panelu · vlastní skupiny a vzhled · nesmí řídit obsah. */
import { Fragment } from "react";
import { TabsList, TabsTrigger } from "../../../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { fmtAmount } from "../../../../lib/format";
import type { RecordSidePanelTab } from "../record-side-panel";
const RELATED_IDS = new Set(["linked", "history"]);
/** Skupina záložky; linked a history patří bez zadání mezi vazby. */
export function recordPanelTabGroup(tab: RecordSidePanelTab): "record" | "related" {
  return tab.group ?? (RELATED_IDS.has(tab.id) ? "related" : "record");
}
/** Ikonová navigace: záznam | vazby, odznak počtu, šipky mezi záložkami (Radix tablist). */
export function PanelTabs({ tabs }: { tabs: readonly RecordSidePanelTab[] }) {
  const record = tabs.filter((tab) => recordPanelTabGroup(tab) === "record");
  const related = tabs.filter((tab) => recordPanelTabGroup(tab) === "related");
  const ordered = [...record, ...related];
  return (
    <TabsList
      data-slot="record-panel-tabs"
      className="h-[var(--control-h)] min-w-0 flex-1 justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0"
    >
      {ordered.map(({ id, label, icon: Icon, count }, index) => {
        const name = count && count > 0 ? `${label}: ${fmtAmount(count, 0)}` : label;
        return (
          <Fragment key={id}>
            {index === record.length && record.length > 0 ? (
              <span
                aria-hidden="true"
                data-slot="record-panel-tab-separator"
                className="mx-1 h-1/2 w-px shrink-0 self-center bg-border"
              />
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={id}
                  aria-label={name}
                  className="relative h-full shrink-0 flex-none rounded-md border-0 px-2.5 text-muted-foreground shadow-none transition-colors after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-selected:bg-primary/10 aria-selected:text-primary aria-selected:shadow-none aria-selected:after:bg-primary"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {count && count > 0 ? (
                    <span
                      aria-hidden="true"
                      data-slot="record-panel-tab-count"
                      className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[0.625rem] font-medium leading-4 tabular-nums text-primary-foreground"
                    >
                      {fmtAmount(count, 0)}
                    </span>
                  ) : null}
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          </Fragment>
        );
      })}
    </TabsList>
  );
}
