/** Boční panel a souhrn výběru DataGrid · jen obal obsahu · nesmí počítat data. */
import type { ReactNode } from "react";

/** Boční panel vedle tabulky (detail aktivního řádku); bez obsahu nic. */
export function DataGridSidePanel({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <aside
      data-grid-side-panel
      className="w-[24rem] shrink-0 overflow-y-auto border border-l-0 border-t-0 bg-card p-4"
      aria-label={label}
    >
      {children}
    </aside>
  );
}

/** Pruh pod tabulkou v režimu výběru (souhrn vybraných řádků). */
export function DataGridSummary({ children }: { children: ReactNode }) {
  return (
    <div
      data-slot="grid-selection-summary"
      className="flex flex-wrap items-center gap-2 border border-t-0 bg-secondary/50 px-2 py-1.5 text-sm"
    >
      {children}
    </div>
  );
}
