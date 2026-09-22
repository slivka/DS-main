import { OptionSelect, type SelectOption } from "./option-select";
import { cn } from "../../../lib/utils";

const MONTH_LABELS_CS = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];

const MONTH_OPTIONS: SelectOption[] = MONTH_LABELS_CS.map((label, index) => ({
  value: String(index + 1),
  label,
}));

/**
 * Výběr měsíce a roku – např. pro účetní období. Hodnota je „YYYY-MM“
 * (nebo null, když není nic vybráno). Rok i měsíc se volají zvlášť.
 */
export function MonthYearSelect({
  value,
  onChange,
  minYear = new Date().getFullYear() - 10,
  maxYear = new Date().getFullYear() + 5,
  emptyLabel = "— nevybraný —",
  monthLabel = "Měsíc",
  yearLabel = "Rok",
  disabled,
  className,
  yearClassName,
  monthClassName,
}: {
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
}) {
  const year = value ? Number(value.slice(0, 4)) : null;
  const month = value ? Number(value.slice(5, 7)) : null;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const yearOptions: SelectOption[] = [];
  for (let y = minYear; y <= maxYear; y++) yearOptions.push({ value: String(y), label: String(y) });

  /** Doplň chybějící část dneškem, dokud není vybráno obojí. */
  const compose = (nextMonth: number | null, nextYear: number | null) => {
    const m = nextMonth ?? currentMonth;
    const y = nextYear ?? currentYear;
    return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <OptionSelect
        value={month ? String(month) : null}
        onChange={(m) => onChange(m === "" ? null : compose(Number(m), year))}
        options={MONTH_OPTIONS}
        placeholder={monthLabel}
        emptyLabel={emptyLabel}
        disabled={disabled}
        className={cn("min-w-0 flex-1", monthClassName)}
      />
      <OptionSelect
        value={year ? String(year) : null}
        onChange={(y) => onChange(y === "" ? null : compose(month, Number(y)))}
        options={yearOptions}
        placeholder={yearLabel}
        emptyLabel={emptyLabel}
        disabled={disabled}
        className={cn("shrink-0", yearClassName)}
      />
    </div>
  );
}
