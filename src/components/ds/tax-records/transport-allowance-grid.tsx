/** Paušál na dopravu DE: měsíce × vozidla z APP; částky i zákaz dodává APP, DS nepočítá. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Button } from "../../ui/button";
import { DecimalInput } from "../form/decimal-input";
import { AmountCell } from "../accounting/amount";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { TransportAllowanceCell } from "./tax-record-types";
export interface TransportAllowanceGridProps extends ComponentPropsWithoutRef<"div"> {
  months: { id: string; label: string }[];
  vehicles: { id: string; label: string }[];
  cells: TransportAllowanceCell[];
  unit?: "days" | "months";
  currency: string;
  onCountChange?: (monthId: string, vehicleId: string, count: number | null) => void;
  onCreateDocuments?: () => void;
  onDocumentOpen?: (id: string) => void;
  /** Důvod zákazu (např. výdaje procentem); vypne vstupy i akci. */
  disabledReason?: string;
  busy?: boolean;
}
export const TransportAllowanceGrid = forwardRef<HTMLDivElement, TransportAllowanceGridProps>(
  function TransportAllowanceGrid(
    {
      months,
      vehicles,
      cells,
      unit = "months",
      currency,
      onCountChange,
      onCreateDocuments,
      onDocumentOpen,
      disabledReason,
      busy,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().taxYear;
    const blocked = Boolean(disabledReason);
    const cell = (m: string, v: string) => cells.find((c) => c.monthId === m && c.vehicleId === v);
    const unitLabel = unit === "days" ? t.unitDays : t.unitMonths;
    return (
      <div ref={ref} {...props} className={cn("min-w-0 space-y-3", className)}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="typo-section text-base font-semibold">{t.transportAllowance}</h3>
          <DisabledReasonTooltip blocked={blocked} content={disabledReason}>
            <Button
              aria-disabled={blocked || busy || undefined}
              onClick={() => {
                if (!blocked && !busy) onCreateDocuments?.();
              }}
            >
              {t.createDocuments}
            </Button>
          </DisabledReasonTooltip>
        </div>
        {disabledReason ? <p className="text-sm text-muted-foreground">{disabledReason}</p> : null}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-2 py-1 text-left">
                  {t.month}
                </th>
                {vehicles.map((v) => (
                  <th key={v.id} scope="col" className="px-2 py-1 text-right">
                    {v.label}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {unitLabel} · {currency}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.id} className="border-t">
                  <th scope="row" className="px-2 py-1 text-left font-normal">
                    {m.label}
                  </th>
                  {vehicles.map((v) => {
                    const c = cell(m.id, v.id);
                    return (
                      <td key={v.id} className="px-2 py-1">
                        <div className="flex items-center justify-end gap-2">
                          <DecimalInput
                            aria-label={`${m.label} · ${v.label} · ${unitLabel}`}
                            className="w-16"
                            decimals={0}
                            value={c?.count ?? null}
                            disabled={blocked || Boolean(c?.documentId)}
                            onChange={(next) =>
                              onCountChange?.(m.id, v.id, next === "" ? null : Number(next))
                            }
                          />
                          {c?.documentId && onDocumentOpen ? (
                            <Button
                              variant="link"
                              className="h-auto p-0"
                              title={t.documentCreated}
                              onClick={() => c.documentId && onDocumentOpen(c.documentId)}
                            >
                              <AmountCell value={c.amount} />
                            </Button>
                          ) : (
                            <AmountCell value={c?.amount} className="w-24" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
