import { useState, forwardRef, type ComponentPropsWithoutRef } from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { Button } from "../../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

/**
 * Výběr měsíce a roku – např. pro účetní období. Hodnota je „YYYY-MM“
 * (nebo null, když není nic vybráno). Rok i měsíc se volají zvlášť.
 */
/** Vlastnosti výběru měsíce a roku. */
export interface MonthYearSelectProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Hodnota „YYYY-MM“ nebo null. */
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  /** Nejstarší nabízený rok. */
  minYear?: number;
  /** Nejnovější nabízený rok. */
  maxYear?: number;
  emptyLabel?: string;
  /** Zástupný text měsíce. */
  monthLabel?: string;
  /** Zástupný text roku. */
  yearLabel?: string;
  disabled?: boolean;
  className?: string;
  yearClassName?: string;
  monthClassName?: string;
}
/** Výběr měsíce společným kalendářem; rok se volí v jeho nadřazeném pohledu. */
export const MonthYearSelect = forwardRef<HTMLDivElement, MonthYearSelectProps>(
  function MonthYearSelect(
    {
      value,
      onChange,
      minYear = new Date().getFullYear() - 10,
      maxYear = new Date().getFullYear() + 5,
      emptyLabel,
      monthLabel,
      yearLabel,
      disabled,
      className,
      yearClassName,
      monthClassName,
      ...props
    },
    ref,
  ) {
    const ds = useDsTexts();
    const [open, setOpen] = useState(false);
    const selected = value
      ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1)
      : undefined;
    const label = selected
      ? new Intl.DateTimeFormat(ds.intlLocale, { month: "long", year: "numeric" }).format(selected)
      : (emptyLabel ?? `${monthLabel ?? ds.date.month} / ${yearLabel ?? ds.date.year}`);
    return (
      <div ref={ref} className={cn("min-w-0", className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="control"
              disabled={disabled}
              aria-label={`${monthLabel ?? ds.date.month} / ${yearLabel ?? ds.date.year}`}
              className={cn(
                "ds-field-button ds-disabled-control w-full justify-start font-normal",
                monthClassName,
                yearClassName,
              )}
            >
              <CalendarIcon />
              <span className={cn("truncate", !selected && "text-muted-foreground")}>{label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              initialView="months"
              minDate={new Date(minYear, 0, 1)}
              maxDate={new Date(maxYear, 11, 31)}
              onClose={() => setOpen(false)}
              onMonthSelect={(date) => {
                onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
