/** Režim nové firmy je řízený APP; změna ani ukládání nejsou úlohou DS. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { SegmentedField } from "../form/segmented-field";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { BookkeepingMode } from "./tax-record-types";
export interface BookkeepingModeSelectProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  value: BookkeepingMode;
  onChange: (value: BookkeepingMode) => void;
  disabled?: boolean;
}
export const BookkeepingModeSelect = forwardRef<HTMLDivElement, BookkeepingModeSelectProps>(
  function BookkeepingModeSelect({ value, onChange, disabled, className, ...props }, ref) {
    const t = useDsTexts().taxRecords;
    return (
      <div ref={ref} {...props} className={cn("space-y-2", className)}>
        <SegmentedField
          ariaLabel={t.mode}
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={[
            { value: "accrual", label: t.accrual },
            { value: "tax_records", label: t.taxRecords },
          ]}
        />
        <p className="text-sm text-muted-foreground">{t.modeNotice}</p>
      </div>
    );
  },
);
