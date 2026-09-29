import { forwardRef, useId, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { Checkbox } from "../../ui/checkbox";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";

type CheckboxRootProps = ComponentPropsWithoutRef<typeof Checkbox>;

export interface CheckboxFieldProps extends Omit<CheckboxRootProps, "checked" | "onCheckedChange" | "children"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Popisek vpravo od čtverečku (svázaný přes id). */
  label: ReactNode;
  /** Volitelná nápověda pod popiskem. */
  hint?: ReactNode;
  /** `input` = ve `FieldGrid` vedle polí zarovnat na výšku pole (místo popisku nad); `natural` = přirozená výška. */
  align?: "natural" | "input";
}

/** Zaškrtávátko s popiskem – hodnota formuláře ukládaná tlačítkem Uložit / Potvrdit. */
export const CheckboxField = forwardRef<ElementRef<typeof Checkbox>, CheckboxFieldProps>(function CheckboxField(
  { checked, onCheckedChange, label, hint, align = "natural", id, className, disabled, ...props },
  ref,
) {
  const autoId = useId();
  const controlId = id ?? `checkbox-${autoId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  return (
    <div data-slot="checkbox-field" data-align={align} className={cn(align === "input" && "@min-[40rem]:pt-6", className)}>
      <div className={cn("grid grid-cols-[auto_minmax(0,1fr)] gap-x-2", align === "input" && "@min-[40rem]:min-h-9")}>
        <Checkbox
          ref={ref}
          id={controlId}
          checked={checked}
          disabled={disabled}
          aria-describedby={hintId}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-[0.0625rem]"
          {...props}
        />
        <div className="min-w-0">
          <Label htmlFor={controlId} title={typeof label === "string" ? label : undefined} className={cn("whitespace-normal font-normal", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
            {label}
          </Label>
          {hint ? <p id={hintId} className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
});

export interface CheckboxGroupProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  /** `vertical` = pod sebou (gap-2), `horizontal` = vedle sebe se zalamováním (gap-6). */
  direction?: "vertical" | "horizontal";
  /** Volitelný nadpis skupiny. */
  title?: ReactNode;
  children: ReactNode;
}

/** Skupina `CheckboxField` s jednotnými rozestupy. */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  { direction = "vertical", title, className, children, ...props },
  ref,
) {
  const titleId = useId();
  return (
    <div ref={ref} role="group" aria-labelledby={title ? titleId : undefined} data-slot="checkbox-group" className={cn("space-y-2", className)} {...props}>
      {title ? <p id={titleId} title={typeof title === "string" ? title : undefined} className="truncate whitespace-nowrap text-sm font-medium">{title}</p> : null}
      <div className={cn("flex", direction === "vertical" ? "flex-col gap-2" : "flex-row flex-wrap gap-x-6 gap-y-2")}>{children}</div>
    </div>
  );
});

type SwitchRootProps = ComponentPropsWithoutRef<typeof Switch>;

export interface SwitchFieldProps extends Omit<SwitchRootProps, "checked" | "onCheckedChange" | "children"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  /** Probíhá ukládání – přepínač je dočasně neaktivní. */
  busy?: boolean;
}

/** Řádek nastavení: popisek a nápověda vlevo, přepínač vpravo. Změna se ukládá hned. */
export const SwitchField = forwardRef<ElementRef<typeof Switch>, SwitchFieldProps>(function SwitchField(
  { checked, onCheckedChange, label, hint, busy = false, disabled, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const controlId = id ?? `switch-${autoId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const inactive = disabled || busy;
  return (
    <div data-slot="switch-field" aria-busy={busy || undefined} className={cn("flex items-center justify-between gap-4 py-1", className)}>
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={controlId} title={typeof label === "string" ? label : undefined} className={cn("font-medium", inactive ? "cursor-not-allowed" : "cursor-pointer", disabled && "opacity-60")}>
          {label}
        </Label>
        {hint ? <p id={hintId} className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch
        ref={ref}
        id={controlId}
        checked={checked}
        disabled={inactive}
        aria-describedby={hintId}
        onCheckedChange={onCheckedChange}
        className={cn(busy && "animate-pulse")}
        {...props}
      />
    </div>
  );
});
