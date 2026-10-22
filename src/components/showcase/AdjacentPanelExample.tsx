/** Sousední ukázka panelu · vlastní výšku náhledu · nesmí se distribuovat. */
import type { ReactNode } from "react";
import { PageHeader } from "../ds";

/** Ukázka celé plochy obsahu v sousedním okně. */
export function AdjacentPanelExample({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-[40rem] min-h-0 flex-col border-l border-border p-3" data-testid="adjacent-panel-example">
      <PageHeader title="FP 2026/0142 – panel" />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}