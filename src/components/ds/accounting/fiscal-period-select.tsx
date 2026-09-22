import { Lock, LockOpen, Hourglass } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FiscalPeriodState = "open" | "closing" | "closed";

export const FISCAL_PERIOD_STATE_LABELS: Record<FiscalPeriodState, string> = {
  open: "Otevřené",
  closing: "V uzávěrce",
  closed: "Uzavřené",
};

export type FiscalPeriod = {
  id: string;
  name: string;
  /** Začátek období (libovolná délka období). */
  from: string;
  /** Konec období. */
  to: string;
  state: FiscalPeriodState;
};

function StateIcon({ state }: { state: FiscalPeriodState }) {
  if (state === "closed") return <Lock className="size-3.5" />;
  if (state === "closing") return <Hourglass className="size-3.5" />;
  return <LockOpen className="size-3.5" />;
}

/** Výběr účetního období včetně stavu uzávěrky. */
export function FiscalPeriodSelect({
  periods,
  value,
  onChange,
  label = "Účetní období",
  stateLabels = FISCAL_PERIOD_STATE_LABELS,
  /** Zakázat výběr uzavřených období. */
  disableClosed = false,
  className,
}: {
  periods: FiscalPeriod[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  label?: string;
  stateLabels?: Record<FiscalPeriodState, string>;
  disableClosed?: boolean;
  className?: string;
}) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-[260px]", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {periods.map((p) => (
          <SelectItem key={p.id} value={p.id} disabled={disableClosed && p.state === "closed"}>
            <span className="flex w-full items-center gap-2">
              <StateIcon state={p.state} />
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(p.from)} – {formatDate(p.to)}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {stateLabels[p.state]}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
