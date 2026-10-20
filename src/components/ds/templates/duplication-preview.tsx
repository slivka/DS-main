/** Náhled duplikace · vlastní zobrazení problémů · APP dodává rozhodnutí o vytvoření. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useDsTexts } from "../../../ds-texts";
import { useDateTimePreferences } from "../../../lib/date-time-preferences";
import { DataGrid } from "../grid/DataGrid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import type { DuplicationPreviewRow } from "./template-types";
/** Vlastnosti náhledu. */
export interface DuplicationPreviewProps extends ComponentPropsWithoutRef<"div"> {
  /** Vypočtené řádky. */ rows: DuplicationPreviewRow[];
  /** Načítání nového náhledu. */ loading?: boolean;
  /** Samostatný klíč nastavení gridu. */ storageKey: string;
}
/** Grid náhledu se stálou výškou chybových řádků. */
export const DuplicationPreview = forwardRef<HTMLDivElement, DuplicationPreviewProps>(
  function DuplicationPreview({ rows, loading, storageKey, ...props }, ref) {
    const t = useDsTexts().templates;
    const { formatDate } = useDateTimePreferences();
    return (
      <div {...props} ref={ref} aria-busy={loading || undefined}>
        <DataGrid
          rows={rows}
          rowKey={(row) => row.id}
          storageKey={storageKey}
          loading={loading}
          hideToolbar
          paginated={false}
          showTotalRow={false}
          columnFilters={false}
          defaultSort={null}
          plain
          pinnedColumnIds={[]}
          rowClassName={(row) => (!row.canCreate ? "bg-destructive-soft" : undefined)}
          columns={[
            { id: "date", label: t.date, value: (row) => formatDate(row.date) },
            { id: "period", label: t.period, value: (row) => row.period },
            { id: "description", label: t.description, value: (row) => row.description },
            {
              id: "problem",
              label: t.problem,
              value: (row) => row.problem ?? "",
              render: (row) =>
                !row.canCreate ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          aria-invalid="true"
                          className="flex min-w-0 items-center gap-2 rounded px-2 text-destructive outline outline-1 outline-destructive"
                        >
                          <AlertTriangle aria-hidden className="size-4 shrink-0" />
                          <span className="truncate">{row.problem ?? t.problem}</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{row.problem ?? t.problem}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null,
            },
          ]}
        />
        <p role="status" className="py-2 text-sm font-semibold tabular-nums">
          {loading ? t.loading : t.summary(rows.filter((row) => row.canCreate).length, rows.length)}
        </p>
      </div>
    );
  },
);
