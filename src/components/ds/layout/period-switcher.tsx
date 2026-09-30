import { Check, Lock } from "lucide-react";

import { Command, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { formatDate } from "../../../lib/format";
import {
  FISCAL_PERIOD_STATE_LABELS,
  type FiscalPeriod,
  type FiscalPeriodState,
} from "../accounting/fiscal-period-select";
import { ContextPill, useContextPillClose } from "./context-pill";

export interface PeriodSwitcherProps {
  periods: FiscalPeriod[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  label?: string;
  stateLabels?: Record<FiscalPeriodState, string>;
  disableClosed?: boolean;
  className?: string;
  periodsLabel?: string;
  placeholder?: string;
  emptyText?: string;
  createLabel?: string;
  onCreate?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const stateClass: Record<FiscalPeriodState, string> = {
  open: "bg-success",
  closing: "bg-warning",
  closed: "bg-muted-foreground",
};

const triggerStateClass: Record<FiscalPeriodState, string> = {
  open: "border-success/35 bg-success/12 text-success hover:border-success/50 hover:bg-success/16",
  closing:
    "border-warning/40 bg-warning/18 text-warning-strong hover:border-warning/55 hover:bg-warning/24",
  closed: "border-border bg-muted text-muted-foreground hover:border-input hover:bg-muted/80",
};

function formatPeriodTooltipDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day}. ${month}. ${year}`;
}

function formatPeriodRange(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  if (!fromYear || !fromMonth || !fromDay || !toYear || !toMonth || !toDay)
    return `${from} – ${to}`;
  return `${fromDay}. ${fromMonth}. – ${toDay}. ${toMonth}. ${toYear}`;
}

/** Obsah popoveru – je uvnitř ContextPill, takže může popover zavřít. */
function PeriodSwitcherContent({
  periods,
  value,
  onChange,
  stateLabels,
  disableClosed,
  periodsLabel,
  emptyText,
  createLabel,
  onCreate,
}: {
  periods: FiscalPeriod[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  stateLabels: Record<FiscalPeriodState, string>;
  disableClosed: boolean;
  periodsLabel: string;
  emptyText: string;
  createLabel: string;
  onCreate?: () => void;
}) {
  const close = useContextPillClose();

  if (periods.length === 0) {
    return (
      <div className="p-3">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
        {onCreate ? (
          <Button
            type="button"
            className="mt-3 w-full"
            onClick={() => {
              close();
              onCreate();
            }}
          >
            {createLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Command>
      <CommandList>
        <CommandGroup heading={periodsLabel}>
          {periods.map((period) => (
            <CommandItem
              key={period.id}
              disabled={disableClosed && period.state === "closed"}
              onSelect={() => {
                onChange(period.id);
                close();
              }}
              value={`${period.name} ${stateLabels[period.state]}`}
            >
              <span className={cn("size-2 shrink-0 rounded-full", stateClass[period.state])} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{period.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatDate(period.from)} – {formatDate(period.to)} · {stateLabels[period.state]}
                </span>
              </span>
              {period.id === value ? <Check className="size-4 text-primary" /> : null}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/** Kompaktní výběr účetního období do kontextové části horní lišty. */
export function PeriodSwitcher({
  periods,
  value,
  onChange,
  label = "Účetní období",
  stateLabels = FISCAL_PERIOD_STATE_LABELS,
  disableClosed = false,
  className,
  periodsLabel = "Období",
  placeholder = "Vyberte období",
  emptyText = "Firma nemá účetní období",
  createLabel = "Založit období",
  onCreate,
  open,
  onOpenChange,
}: PeriodSwitcherProps) {
  const selected = periods.find((period) => period.id === value);
  const isEmpty = periods.length === 0;
  const displayValue = isEmpty ? emptyText : (selected?.name ?? placeholder);
  const indicator =
    selected?.state === "closed" ? (
      <Lock className="size-3.5 shrink-0" aria-hidden="true" />
    ) : selected || !isEmpty ? (
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          selected ? stateClass[selected.state] : "bg-warning",
        )}
        aria-hidden="true"
      />
    ) : null;
  const tooltip = selected
    ? `${label} ${selected.name.replace(/^Rok\s+/i, "")} · ${formatPeriodTooltipDate(selected.from)} – ${formatPeriodTooltipDate(selected.to)} · ${stateLabels[selected.state]}`
    : `${label}: ${displayValue}`;
  return (
    <ContextPill
      data-context-switcher="period"
      label={label}
      value={displayValue === label ? placeholder : displayValue}
      compactValue={selected?.name ?? (isEmpty ? emptyText : placeholder)}
      valueMuted={!selected}
      statusIndicator={indicator}
      tooltip={tooltip}
      detail={selected ? formatPeriodRange(selected.from, selected.to) : undefined}
      valueClassName="text-base xl:text-base"
      valueContainerClassName="gap-2"
      className={cn(
        "max-w-[112px] border shadow-sm data-[state=open]:border-primary focus-visible:border-primary md:max-w-[220px] xl:max-w-[460px]",
        selected
          ? triggerStateClass[selected.state]
          : isEmpty
            ? "border-border bg-muted text-muted-foreground hover:border-input hover:bg-muted/80"
            : "border-warning/40 bg-warning/18 text-warning-strong hover:border-warning/55 hover:bg-warning/24",
        className,
      )}
      contentClassName="w-[380px]"
      open={open}
      onOpenChange={onOpenChange}
    >
      <PeriodSwitcherContent
        periods={periods}
        value={value}
        onChange={onChange}
        stateLabels={stateLabels}
        disableClosed={disableClosed}
        periodsLabel={periodsLabel}
        emptyText={emptyText}
        createLabel={createLabel}
        onCreate={onCreate}
      />
    </ContextPill>
  );
}
