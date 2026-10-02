/**
 * Nabídka akcí formuláře dokladu.
 * Vlastní: vložení nastavení před další akce a oddělení první další akce.
 * Nesmí: spouštět akce ani řídit jejich viditelnost.
 */
import { Settings } from "lucide-react";
import type { RecordActionItem } from "../../layout/record-action-bar";

/** Sestaví nabídku akcí formuláře dokladu. */
export function buildDocumentActionMenu(
  actions: RecordActionItem[],
  settings: { onOpen: () => void } | undefined,
  settingsLabel: string,
): RecordActionItem[] {
  if (!settings) return actions;
  return [
    { id: "document-settings", label: settingsLabel, onClick: settings.onOpen, icon: Settings },
    ...actions.map((action, index) =>
      index === 0 ? { ...action, separatorBefore: true } : action,
    ),
  ];
}
