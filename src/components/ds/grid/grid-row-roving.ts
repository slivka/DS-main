/** Roving fokus řádků gridu · vlastní jeden tabIndex 0 a šipky · nesmí otevírat záznam. */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { GridVirtual } from "./grid-virtual";

const ROW_NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

/**
 * Roving fokus řádků: v tabulátorovém pořadí je jen jeden řádek (0), ostatní −1;
 * šipky ↑/↓ a Home/End fokus posouvají a ve virtualizaci k cíli doscrollují.
 */
export function useRowRoving(
  enabled: boolean,
  rowKeys: string[],
  activeRowKey: string | null | undefined,
  virtual: GridVirtual,
  count: number,
) {
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const pending = useRef<{ key: string; index: number } | null>(null);
  const current =
    focusKey && rowKeys.includes(focusKey)
      ? focusKey
      : activeRowKey && rowKeys.includes(activeRowKey)
        ? activeRowKey
        : (rowKeys[0] ?? null);
  useEffect(() => {
    const target = pending.current;
    const root = virtual.scrollRef.current;
    if (!target || !root) return;
    const row = root.querySelector<HTMLElement>(`[data-row-key="${CSS.escape(target.key)}"]`);
    if (row) {
      pending.current = null;
      row.focus();
      row.scrollIntoView?.({ block: "nearest" });
    } else if (virtual.enabled && count > 0) {
      root.scrollTop = (target.index / count) * root.scrollHeight;
    }
  });
  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, key: string) => {
    if (!enabled || !ROW_NAV_KEYS.has(event.key) || event.target !== event.currentTarget) return;
    const at = rowKeys.indexOf(key);
    const last = rowKeys.length - 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowDown"
            ? Math.min(last, at + 1)
            : Math.max(0, at - 1);
    const nextKey = rowKeys[next];
    if (nextKey === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    pending.current = { key: nextKey, index: next };
    setFocusKey(nextKey);
  };
  return { current, onKeyDown, setFocusKey };
}
