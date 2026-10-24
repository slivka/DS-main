/** Výkaz (rozvaha / výsledovka) · strom řádků, jednotky, úpravy a kontroly · nesmí počítat součty ani dorovnání. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { Scale } from "lucide-react";
import { TreeGrid } from "../grid/TreeGrid";
import type { TreeGridColumn } from "../grid/tree-grid-types";
import { GridSegmentedToggle } from "../grid/grid-segmented-toggle";
import { AmountCell, AmountInput } from "../accounting/amount";
import { parseDecimalInput } from "../form/decimal-input";
import type { PrintContext } from "../print/report-pdf";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { isStatementRowEditable, statementUnitLabel } from "./statement-model";
import { StatementChecksBar } from "./statement-checks-bar";
import type {
  StatementCheck,
  StatementKind,
  StatementRow,
  StatementUnit,
  StatementValueColumn,
  StatementValuePatch,
} from "./statement-types";

/** Parametry výkazu. */
export interface FinancialStatementViewProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title"
> {
  /** Druh výkazu (titul a export). */
  kind: StatementKind;
  /** Řádky výkazu od APP včetně součtů. */
  rows: StatementRow[];
  /** Sloupce hodnot (období, brutto / korekce / netto). */
  columns: StatementValueColumn[];
  /** Měna z dat APP. */
  currency: string;
  /** Řízené jednotky; bez nich místní stav. */
  unit?: StatementUnit;
  /** Výchozí jednotky místního stavu. */
  defaultUnit?: StatementUnit;
  /** Změna jednotek. */
  onUnitChange?: (unit: StatementUnit) => void;
  /** Stav kontrol od APP. */
  checks?: StatementCheck[];
  /** Proklik na rozpis účtů řádku. */
  onRowOpen?: (row: StatementRow) => void;
  /** Režim úprav uloženého výkazu – jen hodnoty nesoučtových řádků. */
  editable?: boolean;
  /** Změna hodnoty; součty vrátí APP přes `rows`. */
  onValuesChange?: (patch: StatementValuePatch) => void;
  /** Vlastní titul (výchozí druh výkazu). */
  title?: string;
  /** Kontext tiskové sestavy PDF. */
  printContext?: PrintContext;
  /** Název souboru exportu. */
  exportName?: string;
  /** Klíč uložení nastavení. */
  storageKey?: string;
}

/** Stromový výkaz s přepínačem jednotek, kontrolami a exportem. */
export const FinancialStatementView = forwardRef<HTMLDivElement, FinancialStatementViewProps>(
  function FinancialStatementView(
    {
      kind,
      rows,
      columns,
      currency,
      unit,
      defaultUnit = "full",
      onUnitChange,
      checks = [],
      onRowOpen,
      editable,
      onValuesChange,
      title,
      printContext,
      exportName,
      storageKey,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().statements;
    const [localUnit, setLocalUnit] = useState<StatementUnit>(defaultUnit);
    const current = unit ?? localUnit;
    const decimals = current === "thousands" ? 0 : 2;
    const unitText = statementUnitLabel(t.units[current], currency);
    const heading = title ?? t.kinds[kind];
    const changeUnit = (next: StatementUnit) => {
      if (unit === undefined) setLocalUnit(next);
      onUnitChange?.(next);
    };
    const gridColumns: TreeGridColumn<StatementRow>[] = [
      { id: "mark", label: t.mark, value: (row) => row.mark, fitContent: true, locked: true },
      {
        id: "label",
        label: t.name,
        value: (row) => row.label,
        render: (row) => (
          <span
            className={cn(
              "flex min-w-0 items-center gap-1",
              row.kind === "sum" && "font-semibold",
              row.rounded && "rounded-sm bg-warning/10",
            )}
          >
            <span className="truncate">{row.label}</span>
            {row.rounded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    role="img"
                    aria-label={row.roundedNote ?? t.rounded}
                    data-slot="statement-rounded"
                    className="inline-flex text-warning outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Scale className="size-[1em]" aria-hidden />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{row.roundedNote ?? t.rounded}</TooltipContent>
              </Tooltip>
            ) : null}
          </span>
        ),
      },
      ...columns.map(
        (column): TreeGridColumn<StatementRow> => ({
          id: `value:${column.id}`,
          label: `${column.label} · ${unitText}`,
          numeric: true,
          decimals,
          total: "none",
          value: (row) => row.values[current]?.[column.id] ?? null,
          render: (row) => {
            const value = row.values[current]?.[column.id] ?? null;
            if (!isStatementRowEditable(row, editable))
              return (
                <AmountCell
                  value={value}
                  decimals={decimals}
                  className={cn(row.kind === "sum" && "font-semibold")}
                />
              );
            return (
              <div
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
              >
                <AmountInput
                  aria-label={`${t.editValue} ${row.mark} ${column.label}`}
                  value={value}
                  decimals={decimals}
                  onChange={(text) =>
                    onValuesChange?.({
                      rowId: row.id,
                      columnId: column.id,
                      unit: current,
                      value: parseDecimalInput(text),
                    })
                  }
                />
              </div>
            );
          },
        }),
      ),
    ];
    return (
      <div
        ref={ref}
        data-slot="financial-statement"
        data-unit={current}
        {...props}
        className={cn("min-w-0 space-y-3", className)}
      >
        <StatementChecksBar checks={checks} decimals={decimals} />
        <TooltipProvider>
          <TreeGrid
            title={heading}
            rows={rows}
            columns={gridColumns}
            storageKey={storageKey ?? `statement:${kind}`}
            exportName={exportName ?? heading}
            printContext={printContext}
            printTitle={heading}
            printParams={[{ label: t.unitsLabel, value: unitText }]}
            toolbarLeft={
              <GridSegmentedToggle
                ariaLabel={t.unitsLabel}
                value={current}
                defaultValue={defaultUnit}
                onChange={(next) => changeUnit(next as StatementUnit)}
                options={[
                  { value: "full", label: statementUnitLabel(t.units.full, currency) },
                  { value: "thousands", label: statementUnitLabel(t.units.thousands, currency) },
                ]}
              />
            }
            onRowOpen={onRowOpen}
          />
        </TooltipProvider>
      </div>
    );
  },
);
