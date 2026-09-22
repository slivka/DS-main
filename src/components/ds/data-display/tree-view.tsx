import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type TreeItem = {
  id: string;
  parentId: string | null;
  label: string;
  /** Doplnkový text vpravo od názvu (napr. kód alebo hodnota). */
  meta?: ReactNode;
  /** Neaktívne položky sa zobrazia zosvetlené. */
  muted?: boolean;
};

export type TreeNode = TreeItem & { children: TreeNode[] };

/** Zostaví stromovú štruktúru z plochého zoznamu (osirené položky idú na koreň). */
export function buildTree(items: TreeItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const it of items) map.set(it.id, { ...it, children: [] });
  const roots: TreeNode[] = [];
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : null;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

/** Vráti id položky a všetkých jej potomkov (napr. na zákaz cyklov pri výbere rodiča). */
export function descendantIds(items: TreeItem[], id: string): string[] {
  const out = [id];
  let added = true;
  while (added) {
    added = false;
    for (const it of items) {
      if (it.parentId && out.includes(it.parentId) && !out.includes(it.id)) {
        out.push(it.id);
        added = true;
      }
    }
  }
  return out;
}

/** Cesta od koreňa po zvolenú položku (na drobečkovú navigáciu nad stromom). */
export function nodePath(items: TreeItem[], id: string | null | undefined): TreeItem[] {
  if (!id) return [];
  const byId = new Map(items.map((i) => [i.id, i]));
  const path: TreeItem[] = [];
  let cur = byId.get(id);
  let guard = 0;
  while (cur && guard++ < 50) {
    path.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return path;
}

/**
 * Zdieľaný strom pre hierarchické číselníky.
 * Kliknutím sa položka vyberie, dvojklikom sa otvorí úprava.
 */
export function TreeView({
  items,
  selectedId,
  onSelect,
  onOpen,
  actions,
  collapsed: collapsedProp,
  onCollapsedChange,
  isExpandable,
  expandedContent,
  selectOnToggle = false,
  variant = "default",
  emptyLabel = "Zatím zde nejsou žádné položky",
}: {
  items: TreeItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
  /** Akcie zobrazené vpravo pri prejdení myšou. */
  actions?: (item: TreeItem) => ReactNode;
  /** Riadený stav zbalenia (na tlačidlá Rozbalit/Sbalit všetko). */
  collapsed?: Record<string, boolean>;
  onCollapsedChange?: (next: Record<string, boolean>) => void;
  /** Položka môže byť rozbaliteľná aj bez podriadených uzlov (napr. kvôli vnorenému gridu). */
  isExpandable?: (item: TreeItem) => boolean;
  /** Obsah vložený priamo pod rozbalený uzol. */
  expandedContent?: (item: TreeItem, level: number) => ReactNode;
  /** Kliknutie na šípku zároveň označí rozbaľovanú vetvu. */
  selectOnToggle?: boolean;
  /** Tabuľkový variant pre strom vložený do gridu. */
  variant?: "default" | "grid";
  emptyLabel?: string;
}) {
  const tree = useMemo(() => buildTree(items), [items]);
  const [ownCollapsed, setOwnCollapsed] = useState<Record<string, boolean>>({});
  const collapsed = collapsedProp ?? ownCollapsed;
  const setCollapsed = (next: Record<string, boolean>) => {
    if (onCollapsedChange) onCollapsedChange(next);
    else setOwnCollapsed(next);
  };

  if (!items.length) {
    return <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const renderNode = (node: TreeNode, level: number): ReactNode => {
    const isCollapsed = collapsed[node.id] === true;
    const hasChildren = node.children.length > 0;
    const canExpand = hasChildren || Boolean(isExpandable?.(node));
    const isSelected = selectedId === node.id;
    return (
      <li key={node.id}>
        <div
          className={cn(
            "hover-surface group flex items-center gap-1 py-1 pr-2",
            variant === "default" ? "rounded-md" : "min-h-[2.4em] border-b bg-grid-heading py-[0.35em]",
            isSelected && "bg-muted shadow-[inset_3px_0_0_var(--color-primary)]",
          )}
          style={{ paddingLeft: `${level * 20 + 4}px` }}
          onClick={() => onSelect?.(node.id)}
          onDoubleClick={() => onOpen?.(node.id)}
        >
          {canExpand ? (
            <button
              type="button"
              aria-label={isCollapsed ? "Rozbalit" : "Sbalit"}
              className="flex size-5 shrink-0 items-center justify-center rounded"
              onClick={(e) => {
                e.stopPropagation();
                 if (selectOnToggle) onSelect?.(node.id);
                setCollapsed({ ...collapsed, [node.id]: !isCollapsed });
              }}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}
          <span
            className={cn(
              "max-w-full truncate",
              variant === "default" ? "text-sm" : "text-[1em]",
               canExpand && "font-medium",
              node.muted && "text-muted-foreground",
            )}
          >
            {node.label}
          </span>
          {node.meta ? (
            <span className={cn("shrink-0 text-muted-foreground", variant === "default" ? "text-xs" : "text-[0.9em]")}>{node.meta}</span>
          ) : null}
          <span className="min-w-0 flex-1" />
          {actions ? (
            <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              {actions(node)}
            </span>
          ) : null}
        </div>
        {canExpand && !isCollapsed ? (
          <>
            {expandedContent?.(node, level)}
            {hasChildren ? <ul>{node.children.map((c) => renderNode(c, level + 1))}</ul> : null}
          </>
        ) : null}
      </li>
    );
  };

  return <ul className={variant === "default" ? "py-1" : undefined}>{tree.map((n) => renderNode(n, 0))}</ul>;
}
