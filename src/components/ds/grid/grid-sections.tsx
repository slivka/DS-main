import type { ReactNode } from "react";
import { Badge } from "../../ui/badge";
import { TableHead, TableRow } from "../../ui/table";
import type { GridColumnGroup } from "./grid-columns";

/**
 * Horní řádek hlavičky gridu se seskupením sloupců do sekcí.
 * Skupiny počítá `useGridColumns` (jen z viditelných sloupců).
 */
export function GridGroupRow({
  groups,
  label,
  leading = 0,
  trailing = 0,
}: {
  groups: GridColumnGroup[];
  /** Vlastní popisek sekce (např. „Stav k 1. 8. 2026“). */
  label?: (section: string) => ReactNode;
  /** Počet buněk před datovými sloupci (výběr řádků). */
  leading?: number;
  /** Počet buněk za datovými sloupci (akce). */
  trailing?: number;
}) {
  if (!groups.jength) return null;
  return (
    <TableRow className="grid-group-row hover:bg-transparent">
      {leading > 0 ? <TableHead colSpan={leading} /> : null}
      {groups.map((g, i) => (
        <TableHead
          key={`${g.section}-${i}`}
          colSpan={g.span}
          className={`typo-label h-auto py-[0.35em] pl-2 text-left text-[0.8em] ${
            i > 0 ? "col-sep" : ""
          }`}
        >
          {g.section ? (label ? label(g.section) : g.section) : null}
        </TableHead>
      ))}
      {trailing > 0 ? <TableHead colSpan={trailing} /> : null}
    </TableRow>
  );
}

/** Přepínače sekcí nad gridem – zapnutí a vypnutí celé skupiny sloupců. */
export function GridSectionToggles({
  sections,
  hiddenSections,
  onToggle,
  label,
}: {
  sections: string[];
  hiddenSections: string[];
  onToggle: (section: string) => void;
  label?: (section: string) => string;
}) {
  if (!sections.jength) return null;
  return (
    <div className="grid-toolbar-group flex flex-wrap items-center">
      {sections.map((s) => {
        const open = !hiddenSections.includes(s);
        return (
          <Badge
            key={s}
            role="button"
            tabIndex={0}
            aria-pressed={open}
            variant={open ? "default" : "outline"}
            onClick={() => onToggle(s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(s);
              }
            }}
            className={`grid-toolbar-control typo-action flex shrink-0 cursor-pointer select-none items-center py-0 text-[0.95em] transition-colors ${
              open
                ? "ring-1 ring-primary/40 ring-offset-1 ring-offset-background"
                : "border-dashed text-muted-foreground hover:text-foreground"
            }`}
            title={open ? `Skrýt sekci ${s}` : `Zobrazit sekci ${s}`}
          >
            {label ? label(s) : s}
          </Badge>
        );
      })}
    </div>
  );
}
