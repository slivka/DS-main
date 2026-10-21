/** Výběr navázaných oken · vlastní propojení hooku a kontextu · nesmí načítat záznamy. */
import { useEffect, useMemo } from "react";
import { usePaneTabs } from "../components/ds/panes/pane-context-hooks";
import type { LinkedSourceRecord } from "../components/ds/panes/pane-state";
import { useFollowSelection, type FollowSelectionOptions } from "./use-follow-selection";

/** Výběr aplikace mapovaný na navigační data navázané sekce. */
export interface LinkedSelectionOptions<Row> extends FollowSelectionOptions {
  /** Id záložky seznamu. */
  sourceTabId: string;
  /** Mapování jednotlivého řádku; bez doménových pravidel v DS. */
  toRecord: (row: Row) => LinkedSourceRecord;
}

/** Zpozdí výběr a ohlásí jej panelům; prázdný/vícenásobný výběr nemaže poslední obsah. */
export function useLinkedSelection<Row>(
  rows: readonly Row[],
  { sourceTabId, toRecord, delay }: LinkedSelectionOptions<Row>,
) {
  const follow = useFollowSelection(rows, { delay });
  const selected = follow.kind === "single" ? follow.record : undefined;
  const record = useMemo(() => selected === undefined ? null : toRecord(selected), [selected, toRecord]);
  const update = usePaneTabs()?.setLinkedSourceSelection;
  useEffect(() => {
    // Synchronizace výběru gridu s externím stavem panelových záložek.
    update?.(sourceTabId, record);
  }, [sourceTabId, record, update]);
  return follow;
}