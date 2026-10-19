/**
 * Záložky detailu dialogu záznamu · vlastní lištu a stálou výšku (všechny panely vykreslené,
 * neaktivní inert) · nesmí spravovat obsah sekcí.
 */
import type { RecordDialogTab } from "./RecordDialog";
import { PageTabs } from "./page-tabs";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

/** Vlastnosti záložek dialogu. */
export interface RecordDialogTabsProps {
  /** Sekce detailu (dvě a více). */
  tabs: RecordDialogTab[];
  /** Aktivní sekce. */
  value: string;
  /** Změna aktivní sekce. */
  onValueChange: (value: string) => void;
}

/** Lišta záložek s panely ve stejné buňce mřížky, aby dialog neměnil výšku. */
export function RecordDialogTabs({ tabs, value, onValueChange }: RecordDialogTabsProps) {
  const listLabel = useDsTexts().recordDialog.detailSections;
  return (
    <PageTabs
      value={value}
      onValueChange={onValueChange}
      items={tabs.map((tab) => ({
        value: tab.value,
        label: tab.label,
        ...(tab.disabled !== undefined ? { disabled: tab.disabled } : {}),
      }))}
      listLabel={listLabel}
    >
      <div className="mt-3 grid">
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <div
              key={tab.value}
              role="tabpanel"
              aria-hidden={!active}
              inert={!active}
              className={cn(
                "col-start-1 row-start-1 min-w-0",
                !active && "invisible pointer-events-none",
              )}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </PageTabs>
  );
}
