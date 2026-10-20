/** Ukázka historie záznamu · vlastní demo stav režimu a filtru · nesmí se distribuovat. */
import { useState } from "react";
import {
  PageHeader,
  RecordHistoryTimeline,
  type HistoryEvent,
  type HistoryKind,
  type HistoryMode,
} from "../ds";
import { DEMO_HISTORY } from "./record-history-data";

/** Historie se stavem řízeným ukázkou. */
export function HistoryDemo({
  events = DEMO_HISTORY,
  loading,
}: {
  events?: HistoryEvent[];
  loading?: boolean;
}) {
  const [mode, setMode] = useState<HistoryMode>("basic");
  const [filter, setFilter] = useState<HistoryKind[]>([]);
  return (
    <RecordHistoryTimeline
      events={events}
      mode={mode}
      onModeChange={setMode}
      filter={filter}
      onFilterChange={setFilter}
      loading={loading}
    />
  );
}

export function RecordHistoryShowcase() {
  return (
    <section className="space-y-6" data-testid="record-history-showcase">
      <PageHeader title="Historie záznamu" />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-md border p-3" data-testid="history-full">
          <HistoryDemo />
        </div>
        <div className="rounded-md border p-3" data-testid="history-narrow">
          <HistoryDemo />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border p-3" data-testid="history-empty">
          <HistoryDemo events={[]} />
        </div>
        <div className="rounded-md border p-3" data-testid="history-loading">
          <HistoryDemo events={[]} loading />
        </div>
      </div>
    </section>
  );
}
