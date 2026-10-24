/** Řízený druh nepeněžního pohybu; DS nevytváří protistranu ani zápisy. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { OptionSelect } from "../form/option-select";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { TaxMovementKind } from "./tax-record-types";
export interface TaxMovementSelectProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  value: TaxMovementKind;
  onChange: (value: TaxMovementKind) => void;
  disabled?: boolean;
}
export const TaxMovementSelect = forwardRef<HTMLDivElement, TaxMovementSelectProps>(
  function TaxMovementSelect({ value, onChange, disabled, className, ...props }, ref) {
    const t = useDsTexts().taxRecords;
    return (
      <div ref={ref} {...props} className={cn("min-w-0", className)}>
        <OptionSelect
          ariaLabel={t.movement}
          value={value}
          allowEmpty={false}
          disabled={disabled}
          options={[
            { value: "non_cash_income", label: t.nonCashIncome },
            { value: "non_cash_expense", label: t.nonCashExpense },
            { value: "transfer", label: t.transfer },
          ]}
          onChange={(next) => {
            if (next === "non_cash_income" || next === "non_cash_expense" || next === "transfer")
              onChange(next);
          }}
        />
      </div>
    );
  },
);
