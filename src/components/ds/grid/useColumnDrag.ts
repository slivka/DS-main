/**
 * Přesun sloupců myší v záhlaví gridu.
 * Vlastní: tažený sloupec, místo vložení (před / za), zvýraznění cíle a předání přetažení
 * do seskupení (pruh skupin).
 * Nesmí: ukládat pořadí – změnu předá přes `reorder`.
 */
import { useRef, useState, type DragEvent } from "react";

import { groupDragProps } from "./grid-grouping";

/** Typ dat při přetahování záhlaví sloupce (změna pořadí). */
const COLUMN_MIME = "application/x-grid-column";

/** Vlastnosti a třída záhlaví pro přetahování sloupců. */
export function useColumnDrag(
  reorder: (id: string, targetId: string, position: "before" | "after") => void,
  groupingEnabled: boolean,
) {
  const dragId = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const sideOf = (e: DragEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientX > rect.left + rect.width / 2;
  };
  const dragProps = (id: string) => {
    const group = groupDragProps(id, groupingEnabled) as {
      onDragStart?: (e: DragEvent<HTMLElement>) => void;
    };
    return {
      draggable: true,
      onDragStart: (e: DragEvent<HTMLElement>) => {
        group.onDragStart?.(e);
        dragId.current = id;
        e.dataTransfer.setData(COLUMN_MIME, id);
        e.dataTransfer.effectAllowed = "copyMove";
      },
      onDragEnd: () => {
        dragId.current = null;
        setDropTarget(null);
      },
      onDragOver: (e: DragEvent<HTMLElement>) => {
        if (!dragId.current || dragId.current === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const after = sideOf(e);
        setDropTarget((cur) => (cur && cur.id === id && cur.after === after ? cur : { id, after }));
      },
      onDragLeave: () => setDropTarget((cur) => (cur?.id === id ? null : cur)),
      onDrop: (e: DragEvent<HTMLElement>) => {
        const dragged = dragId.current;
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
        reorder(dragged, id, sideOf(e) ? "after" : "before");
        dragId.current = null;
        setDropTarget(null);
      },
    };
  };
  const dropClass = (id: string) =>
    dropTarget?.id === id
      ? dropTarget.after
        ? "border-r-2 border-r-primary"
        : "border-l-2 border-l-primary"
      : "";
  return { dragProps, dropClass };
}
