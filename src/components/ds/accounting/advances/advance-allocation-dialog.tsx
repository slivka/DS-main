/** Přiřazení zálohy · vlastní výběr a meze částek · nesmí načítat ani ukládat cíle. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../../ds-texts";
import { formatAmount } from "../../../../lib/format";
import { cn } from "../../../../lib/utils";
import { RecordDialog } from "../../layout/RecordDialog";
import { DataGrid, type DataGridColumn } from "../../grid/DataGrid";
import { GridAmountEditor, exceedsMax } from "../../grid/grid-amount-editor";
import { allocationInvalid, allocationTotal } from "./advance-allocation-model";
import type { AdvanceAllocation, AdvanceAllocationCandidate } from "./advance-types";
/** Řízený výběr kandidátů ZL nebo DD v jedné měně. */
export interface AdvanceAllocationDialogProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /** Otevření. */ open: boolean;
  /** Ochranu zavření řeší RecordDialog. */ onOpenChange: (open: boolean) => void;
  /** Druh cíle, jen popisek. */ target: "list" | "taxDocument";
  /** Kandidáti po filtrování APP. */ candidates: AdvanceAllocationCandidate[];
  /** Řízený návrh přiřazení. */ value: AdvanceAllocation[];
  /** Změna návrhu. */ onChange: (value: AdvanceAllocation[]) => void;
  /** Zbývající část platby. */ remaining: number;
  /** Značka měny z dat. */ currency: string;
  /** Klíč gridu. */ storageKey: string;
  /** Neuložené změny. */ dirty?: boolean;
  /** Načítání kandidátů. */ loading?: boolean;
  /** Ukládání. */ busy?: boolean;
  /** Chyba APP. */ error?: string;
  /** Bez práva měnit. */ readOnly?: boolean;
  /** APP ověří a zapíše návrh, zavře až po úspěchu. */ onAllocate: (
    value: AdvanceAllocation[],
  ) => void;
}
/** Přiřazení z kandidátského DataGridu, bez vlastního párovacího mechanismu. */
export const AdvanceAllocationDialog = forwardRef<HTMLDivElement, AdvanceAllocationDialogProps>(
  function AdvanceAllocationDialog(
    {
      open,
      onOpenChange,
      target,
      candidates,
      value,
      onChange,
      remaining,
      currency,
      storageKey,
      dirty,
      loading,
      busy,
      error,
      readOnly,
      onAllocate,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().advances;
    const total = allocationTotal(value);
    const invalid = allocationInvalid(value, candidates, remaining);
    const blocked = Boolean(invalid || !value.length || loading || busy || error || readOnly);
    const columns: DataGridColumn<AdvanceAllocationCandidate>[] = [
      { id: "document", label: t.document, value: (row) => row.document },
      {
        id: "remaining",
        label: t.available,
        numeric: true,
        value: (row) => row.remaining,
        total: "none",
      },
      {
        id: "assigned",
        label: t.assigned,
        numeric: true,
        total: "none",
        value: (row) => value.find((item) => item.id === row.id)?.amount,
        editor: (row) => {
          const amount = value.find((item) => item.id === row.id)?.amount ?? null;
          return (
            <GridAmountEditor
              value={amount}
              disabled={busy || readOnly}
              ariaLabel={`${t.assigned} – ${row.document}`}
              currencySymbol={currency}
              max={row.remaining}
              invalid={
                amount === null ||
                amount <= 0 ||
                exceedsMax(amount, row.remaining) ||
                exceedsMax(total, remaining)
              }
              invalidMessage={t.allocationExceeded}
              onChange={(amount) =>
                onChange(value.map((item) => (item.id === row.id ? { ...item, amount } : item)))
              }
            />
          );
        },
      },
    ];
    return (
      <RecordDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title={`${t.allocation} – ${target === "list" ? t.lists : t.taxDocuments}`}
        dirty={dirty}
        busy={busy}
        readOnly={readOnly}
        error={error ?? (invalid ? t.allocationExceeded : undefined)}
        submitLabel={t.allocate}
        submitDisabled={blocked}
        onSubmit={() => {
          if (!blocked) onAllocate(value);
        }}
      >
        <div ref={ref} className={cn("min-w-0 space-y-3", className)} {...props}>
          <DataGrid
            storageKey={storageKey}
            rows={candidates}
            columns={columns}
            rowKey={(row) => row.id}
            selectMode={!readOnly}
            selectedKeys={value.map((item) => item.id)}
            onSelectedKeysChange={(keys) => {
              if (busy || readOnly) return;
              onChange(
                keys.flatMap((id) => {
                  const existing = value.find((item) => item.id === id);
                  const candidate = candidates.find((item) => item.id === id);
                  return existing
                    ? [existing]
                    : candidate
                      ? [{ id, amount: candidate.defaultAmount }]
                      : [];
                }),
              );
            }}
            loading={loading}
            paginated={false}
            groupable={false}
            showTotalRow={false}
            defaultSort={null}
            hideToolbar
          />
          <p role="status" className="text-sm font-semibold">
            {t.allocationSummary(
              `${formatAmount(total)} ${currency}`,
              `${formatAmount(remaining)} ${currency}`,
            )}
          </p>
        </div>
      </RecordDialog>
    );
  },
);
