import { CalendarRange, Check } from "lucide-react";

import { Command, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import { cn } from "../../../lib/utils";
import { formatDate } from "../../../lib/format";
import {
  FISCAL_PERIOD_STATE_LABELS,
  type FiscalPeriod,
  type FiscalPeriodState,
} from "../accounting/fiscal-period-select";
import { ContextPill } from "./context-pill";

export interface PeriodSwitcherProps {
  periods: FiscalPeriod[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  label?: string;
  stateLabels?: Record<FiscalPeriodState, string>;
  disableClosed?: boolean;
  className?: string;
  periodsLabel?: string;
}

const stateClass: Record<FiscalPeriodState, string> = {
  open: "bg-success",
  closing: "bg-warning",
  closed: "bg-muted-foreground",
};

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
}: PeriodSwitcherProps) {
  const selected = periods.find((period) => period.id === value);
  return (
    <ContextPill
      label={label}
      value={selected?.name ?? label}
      icon={CalendarRange}
      className={className}
      contentClassName="w-[380px]"
    >
      <Command>
        <CommandList>
          <CommandGroup heading={periodsLabel}>
            {periods.map((period) => (
              <CommandItem
                key={period.id}
                disabled={disableClosed && period.state === "closed"}
                onSelect={() => onChange(period.id)}
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
    </ContextPill>
  );
}