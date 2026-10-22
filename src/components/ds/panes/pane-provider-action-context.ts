/** Závislosti akcí podoken · vlastní propojení jediné instance stavu · nesmí stav kopírovat. */
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { UnsavedChangesAction, useDsTexts } from "../../../ds-texts";
import type { PaneTabsState, ClosedTabRecord, PaneLayoutCount } from "./pane-state";
import type { PaneTabsApi, PaneTabsTexts, RecordNavItem } from "./pane-context-types";
import type { PendingUnsaved } from "./pane-unsaved-controller";
import type { useConfirmDialog } from "../feedback/confirm-dialog";
/** Sdílené závislosti vnitřních akcí, bez nového veřejného API. */
export interface PaneProviderActionContext {
  stateRef: RefObject<PaneTabsState>;
  closedRef: RefObject<ClosedTabRecord[]>;
  recordNavs: RefObject<Map<string, () => RecordNavItem[]>>;
  lastMax: RefObject<PaneLayoutCount | null>;
  commit: (next: PaneTabsState) => void;
  t: PaneTabsTexts;
  p: ReturnType<typeof useDsTexts>["panes"];
  dsTexts: ReturnType<typeof useDsTexts>;
  setPending: Dispatch<SetStateAction<PendingUnsaved | null>>;
  setMaximized: Dispatch<SetStateAction<number | null>>;
  setClosedStack: Dispatch<SetStateAction<ClosedTabRecord[]>>;
  maximized: number | null;
  confirm: ReturnType<typeof useConfirmDialog>["confirm"];
  titleOf: (tabId: string) => string;
  flash: (paneId: string) => void;
  rememberClosed: (tabIds: string[], from: PaneTabsState) => void;
  onNotice?: (message: string) => void;
}
/** Jediná ochrana změny/zavření rozepsaných záložek. */
export type PaneDiscardGuard = (
  tabIds: string[],
  intent: string,
  action: () => void,
  actionType?: UnsavedChangesAction,
) => void;
