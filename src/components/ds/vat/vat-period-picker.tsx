/** Období DPH · vlastní výběr dodaných rozsahů · nesmí určovat registraci ani periodicitu. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { OptionSelect } from "../form/option-select";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { vatPeriodKey } from "./vat-report-model";
import type { VatPeriod } from "./vat-report-types";
/** Parametry výběru období. */
export interface VatPeriodPickerProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Dostupná období APP. */ periods: VatPeriod[];
  /** Vybrané hranice období. */ value?: { from: string; to: string } | null;
  /** Změna výběru. */ onChange: (period: VatPeriod) => void;
  /** Zakázání. */ disabled?: boolean;
  /** Jen čtení. */ readOnly?: boolean;
  /** Popisek pro smíšenou periodicitu. */ label?: string;
}
/** Hledatelný výběr měsíce nebo čtvrtletí. */
export const VatPeriodPicker = forwardRef<HTMLDivElement, VatPeriodPickerProps>(function VatPeriodPicker(
  { periods, value, onChange, disabled, readOnly, label, className, ...props }, ref,
) {
  const t = useDsTexts().vatReports;
  return <div ref={ref} {...props} className={cn("min-w-0 space-y-1", className)}>
    {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    <OptionSelect ariaLabel={label ?? t.period} value={value ? vatPeriodKey(value) : ""} allowEmpty={false}
      disabled={disabled || readOnly} searchable options={periods.map(period => ({ value: vatPeriodKey(period), label: period.label }))}
      onChange={key => { const period = periods.find(p => vatPeriodKey(p) === key); if (period) onChange(period); }} />
  </div>;
});
