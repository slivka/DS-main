/** Číselný krokovač · vlastní rozsah a klávesy · nesmí ukládat stav formuláře. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
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
  const change = (next: number) => {
    if (blocked || !Number.isFinite(next)) return;
    onChange(Math.min(max, Math.max(min, next)));
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
        value={new Intl.NumberFormat(ds.intlLocale, { maximumFractionDigits: 10 }).format(current)}
        disabled={disabled}
        readOnly={readOnly}
        className="px-9 text-center tabular-nums"
        onChange={(event) => {
          const raw = event.target.value.replace(/\s/g, "").replace(",", ".");
          const next = Number(raw);
          if (raw && Number.isFinite(next) && next >= min && next <= max) change(next);
          else event.target.value = String(current);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          change(current + (event.key === "ArrowUp" ? step : -step));
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
