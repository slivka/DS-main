/** Odečtené zálohy · vlastní grid pod rekapitulací · nesmí párovat ani počítat daň. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Link, Unlink, Wallet } from "lucide-react";
import { useDsTexts } from "../../../../ds-texts";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import { DataGrid, type DataGridColumn } from "../../grid/DataGrid";
import { GridAction, GridActions } from "../../grid/grid-action";
import { StatusBadge } from "../../data-display/status-badge";
import { DisabledReasonTooltip } from "../../feedback/disabled-reason-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../ui/tooltip";
import { useConfirmDialog } from "../../feedback/confirm-dialog";
import type { AdvanceCommand, AdvanceDeductionAction, AdvanceDeductionRow } from "./advance-types";
/** Řízená sekce odečtů, do slotu afterVatRecap pouze tam, kde ji APP požaduje. */
export interface AdvanceDeductionsSectionProps extends ComponentPropsWithoutRef<"div"> {
  /** Hotové řádky odečtů. */ rows: AdvanceDeductionRow[];
  /** Klíč gridu. */ storageKey: string;
  /** Akce otevření kandidátského dialogu. */ addAction?: AdvanceCommand;
  /** Akce ručního odečtu. */ manualAction?: AdvanceCommand;
  /** Jednotlivé akce APP. */ onAction?: (
    action: AdvanceDeductionAction,
    row: AdvanceDeductionRow,
  ) => void;
  /** Otevření navázaného DD. */ onOpenTaxDocument?: (row: AdvanceDeductionRow) => void;
  /** Načítání. */ loading?: boolean;
  /** Chyba APP. */ error?: string;
}
/** Odečty sdílených faktur; patička dostává advanceDeduction samostatně z APP. */
export const AdvanceDeductionsSection = forwardRef<HTMLDivElement, AdvanceDeductionsSectionProps>(
  function AdvanceDeductionsSection(
    {
      rows,
      storageKey,
      addAction,
      manualAction,
      onAction,
      onOpenTaxDocument,
      loading,
      error,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().advances;
    const { confirm, confirmDialog } = useConfirmDialog();
    const columns: DataGridColumn<AdvanceDeductionRow>[] = [
      { id: "vs", label: t.vs, value: (row) => row.vs, format: "vs" },
      { id: "vatCode", label: t.vatCode, value: (row) => row.vatCode },
      ...(["base", "vat", "total"] as const).map((id) => ({
        id,
        label: t[id],
        numeric: true,
        value: (row: AdvanceDeductionRow) => row[id],
      })),
      { id: "payment", label: t.payment, value: (row) => row.payment },
      {
        id: "taxDocument",
        label: t.taxDocument,
        value: (row) => row.taxDocument,
        render: (row) =>
          row.taxDocument && onOpenTaxDocument ? (
            <Button variant="link" size="sm" onClick={() => onOpenTaxDocument(row)}>
              {row.taxDocument}
            </Button>
          ) : (
            row.taxDocument
          ),
      },
      {
        id: "status",
        label: t.status,
        value: (row) => t[row.status],
        render: (row) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={row.openReason ? 0 : undefined}>
                <StatusBadge
                  status={row.status}
                  config={{
                    open: { label: t.open, tone: "warning" },
                    closed: { label: t.closed, tone: "success" },
                  }}
                />
              </span>
            </TooltipTrigger>
            {row.openReason ? <TooltipContent>{row.openReason}</TooltipContent> : null}
          </Tooltip>
        ),
      },
    ];
    const toolbarCommand = (action: AdvanceCommand | undefined, label: string) =>
      action ? (
        <DisabledReasonTooltip
          blocked={!action.can}
          content={!action.can ? (action.reason ?? t.blocked) : undefined}
        >
          <Button
            variant="outline"
            aria-disabled={!action.can}
            onClick={() => {
              if (action.can) action.onClick();
            }}
          >
            {label}
          </Button>
        </DisabledReasonTooltip>
      ) : null;
    const act = (action: AdvanceDeductionAction, row: AdvanceDeductionRow) => {
      if (!row.permissions?.[action]?.can) return;
      if (action === "remove")
        confirm({
          title: t.remove,
          description: row.vs,
          confirmLabel: t.remove,
          destructive: true,
          onConfirm: () => onAction?.(action, row),
        });
      else onAction?.(action, row);
    };
    return (
      <TooltipProvider>
      <section ref={ref} className={cn("min-w-0 border-t p-3", className)} {...props}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          storageKey={storageKey}
          title={t.deductions}
          showTitle
          loading={loading}
          error={error}
          paginated={false}
          groupable={false}
          toolbarLeft={
            <>
              {toolbarCommand(addAction, t.addAdvance)}
              {toolbarCommand(manualAction, t.manualDeduction)}
            </>
          }
          rowActions={
            onAction
              ? (row) => (
                  <GridActions>
                    {(["linkTaxDocument", "matchPayment", "remove"] as const).map((action) => {
                      const permission = row.permissions?.[action];
                      return permission ? (
                        <GridAction
                          key={action}
                          aria-label={t[action]}
                          disabled={!permission.can}
                          disabledReason={permission.reason}
                          tone={action === "remove" ? "destructive" : "default"}
                          onClick={() => act(action, row)}
                        >
                          {action === "linkTaxDocument" ? (
                            <Link />
                          ) : action === "matchPayment" ? (
                            <Wallet />
                          ) : (
                            <Unlink />
                          )}
                        </GridAction>
                      ) : null;
                    })}
                  </GridActions>
                )
              : undefined
          }
        />
        {confirmDialog}
      </section>
      </TooltipProvider>
    );
  },
);
