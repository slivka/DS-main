/** Zápisy v knize v Propojených; APP dodává vazby a navigaci. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { LinkedRecordsPanel } from "../data-display/linked-records-panel";
import { formatAmount } from "../../../lib/format";
import { useDsTexts } from "../../../ds-texts";
import type { TaxBookEntry } from "./tax-record-types";
export interface TaxBookEntriesPanelProps extends ComponentPropsWithoutRef<"div"> {
  entries: TaxBookEntry[];
  currency: string;
  onEntryOpen: (entry: TaxBookEntry) => void;
}
export const TaxBookEntriesPanel = forwardRef<HTMLDivElement, TaxBookEntriesPanelProps>(
  function TaxBookEntriesPanel({ entries, currency, onEntryOpen, ...props }, ref) {
    const t = useDsTexts().taxRecords;
    const [mode, setMode] = useState<"list" | "flow">("list");
    const [collapsed, setCollapsed] = useState<string[]>([]);
    return (
      <LinkedRecordsPanel
        ref={ref}
        {...props}
        mode={mode}
        onModeChange={setMode}
        collapsedGroups={collapsed}
        onCollapsedGroupsChange={setCollapsed}
        groups={[
          {
            id: "tax-book",
            label: t.entries,
            items: entries.map((e) => ({
              id: e.id,
              name: e.item,
              number: e.paymentDocument,
              at: e.date,
              amount: formatAmount(e.amount, 2),
              currency,
            })),
          },
        ]}
        onOpen={(item) => {
          const entry = entries.find((e) => e.id === item.id);
          if (entry) onEntryOpen(entry);
        }}
      />
    );
  },
);
