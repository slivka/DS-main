/** Číselný krokovač · vlastní rozsah a klávesy · nesmí ukládat stav formuláře. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

/** Vlastnosti číselného krokovače. */
export interface StepperInputProps extends Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "value" | "onChange" | "min" | "max" | "step" | "size"
> {
  /** Řízená číselná hodnota. */
  value: number;
  /** Změna pouze na platnou hodnotu v rozsahu. */
  onChange: (value: number) => void;
  /** Nejmenší povolená hodnota. */
  min?: number;
  /** Největší povolená hodnota. */
  max?: number;
  /** Velikost klávesového a tlačítkového kroku. */
  step?: number;
  /** Pojmenovaná velikost ovládání. */
  size?: "default" | "compact";
}

/** Číselné pole s kroky −/+ a nepřekročitelným rozsahem. */
export const StepperInput = forwardRef<HTMLInputElement, StepperInputProps>(function StepperInput(
  {
    value,
    onChange,
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    size = "default",
    className,
    disabled,
    readOnly,
    onKeyDown,
    ...props
  },
  ref,
) {
  const ds = useDsTexts();
  const t = ds.stepper;
  const current = Math.min(max, Math.max(min, value));
  const blocked = disabled || readOnly;
  const fmt = new Intl.NumberFormat(ds.intlLocale, { maximumFractionDigits: 10 });
  // Rozepsaný text (víceciferné číslo); rozsah se ověří až při opuštění pole nebo Enter.
  const [draft, setDraft] = useState<string | null>(null);
  const change = (next: number) => {
    if (blocked || !Number.isFinite(next)) return;
    onChange(Math.min(max, Math.max(min, next)));
  };
  const commit = () => {
    if (draft === null) return;
    const next = Number(draft.replace(/\s/g, "").replace(",", "."));
    setDraft(null);
    if (draft.trim() && Number.isFinite(next) && next !== current) change(next);
  };
  return (
    <div
      data-slot="stepper-input"
      className={cn("relative min-w-0", size === "compact" ? "w-28" : "w-36", className)}
    >
      <Input
        {...props}
        ref={ref}
        role="spinbutton"
        inputMode="decimal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        value={draft ?? fmt.format(current)}
        disabled={disabled}
        readOnly={readOnly}
        className="px-9 text-center tabular-nums"
        onChange={(event) => {
          if (/^[\d\s.,-]*$/.test(event.target.value)) setDraft(event.target.value);
        }}
        onBlur={(event) => {
          commit();
          props.onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter") commit();
          if (event.defaultPrevented || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          const typed = draft === null ? NaN : Number(draft.replace(/\s/g, "").replace(",", "."));
          const from = Number.isFinite(typed) ? Math.min(max, Math.max(min, typed)) : current;
          setDraft(null);
          change(from + (event.key === "ArrowUp" ? step : -step));
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t.decrease}
        title={t.decrease}
        disabled={blocked || current <= min}
        className="absolute left-0 top-0 h-[var(--control-h)] w-8 p-0"
        onClick={() => change(current - step)}
      >
        <Minus className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t.increase}
        title={t.increase}
        disabled={blocked || current >= max}
        className="absolute right-0 top-0 h-[var(--control-h)] w-8 p-0"
        onClick={() => change(current + step)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
});
