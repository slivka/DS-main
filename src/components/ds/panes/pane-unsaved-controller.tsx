/** Řízení výsledku dialogu neuložených změn oddělené od provideru panelů. */
import { useState } from "react";

import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import { clearTabState, setTabDirty } from "./pane-tab-store";

export type PendingUnsaved = {
  tabIds: string[];
  intent: string;
  proceed: () => void;
  onOpenInNewTab?: () => void;
};

interface PaneUnsavedControllerProps {
  pending: PendingUnsaved | null;
  setPending: (pending: PendingUnsaved | null) => void;
  titleOf: (tabId: string) => string;
  onSaveTab?: (tabId: string) => boolean | Promise<boolean>;
}

/** Vykreslí dialog a provede zvolenou akci vždy nad dotčenými záložkami. */
export function PaneUnsavedController({
  pending,
  setPending,
  titleOf,
  onSaveTab,
}: PaneUnsavedControllerProps) {
  const [saving, setSaving] = useState(false);
  const resolvePending = async (choice: "save" | "discard") => {
    if (!pending) return;
    const { tabIds, proceed } = pending;
    if (choice === "save") {
      if (!onSaveTab) return;
      setSaving(true);
      try {
        for (const tabId of tabIds) {
          if (!(await onSaveTab(tabId))) {
            setPending(null);
            return;
          }
          setTabDirty(tabId, false);
        }
      } catch {
        setPending(null);
        return;
      } finally {
        setSaving(false);
      }
    }
    tabIds.forEach(clearTabState);
    setPending(null);
    proceed();
  };
  return (
    <UnsavedChangesDialog
      open={!!pending}
      tabTitle={pending ? pending.tabIds.map(titleOf).join(", ") : ""}
      intent={pending?.intent ?? ""}
      saving={saving}
      onSave={onSaveTab ? () => void resolvePending("save") : undefined}
      onDiscard={() => void resolvePending("discard")}
      onBack={() => setPending(null)}
      onOpenInNewTab={
        pending?.onOpenInNewTab
          ? () => {
              const action = pending.onOpenInNewTab;
              setPending(null);
              action?.();
            }
          : undefined
      }
    />
  );
}