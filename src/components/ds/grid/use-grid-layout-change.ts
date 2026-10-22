import { useEffect, useRef } from "react";
import { GRID_LAYOUT_CHANGE } from "../../../lib/grid-prefs";

/**
 * Zavolá `onChange` při změně rozložení gridu se stejným klíčem – i z jiné
 * instance gridu nebo po hydrataci ze store. Nahrazuje dřívější události
 * `grid-column-widths`, `grid-column-order-change` a `grid-columns-change`.
 */
export function useGridLayoutChange(storageKey: string, onChange: () => void) {
  const ref = useRef(onChange);
  ref.current = onChange;
  useEffect(() => {
    const handler = (event: Event) => {
      if ((event as CustomEvent<{ key: string }>).detail?.key === storageKey) ref.current();
    };
    window.addEventListener(GRID_LAYOUT_CHANGE, handler);
    return () => window.removeEventListener(GRID_LAYOUT_CHANGE, handler);
  }, [storageKey]);
}
