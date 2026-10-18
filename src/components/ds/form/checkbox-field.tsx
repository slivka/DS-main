import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Checkbox } from "../../ui/checkbox";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";
import { FieldFeedbackIndicator, FieldHintIcon, useFieldStatus } from "./field-feedback";

type CheckboxRootProps = ComponentPropsWithoutRef<typeof Checkbox>;

export interface CheckboxFieldProps extends Omit<
  CheckboxRootProps,
  "checked" | "onCheckedChange" | "children"
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Popisek vpravo od čtverečku (svázaný přes id). */
  label: ReactNode;
  /** Nápověda jako ikona Info za popiskem. */
  hint?: ReactNode;
  /** Chyba: rámeček kolem čtverečku a ikona za popiskem. */
  error?: string;
  /** Varování: rámeček kolem čtverečku a ikona za popiskem. */
  warning?: string;
  /** `input` = ve `FieldGrid` vedle polí zarovnat na výšku pole (místo popisku nad); `natural` = přirozená výška. */
  align?: "natural" | "input";
}

/** Zaškrtávátko s popiskem – hodnota formuláře ukládaná tlačítkem Uložit / Potvrdit. */
export const CheckboxField = forwardRef<ElementRef<typeof Checkbox>, CheckboxFieldProps>(
  function CheckboxField(
    {
      checked,
      onCheckedChange,
      label,
      hint,
      error,
      warning,
      align = "natural",
      id,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const controlId = id ?? `checkbox-${autoId}`;
    const hintId = hint ? `${controlId}-hint` : undefined;
    const status = useFieldStatus({ error, warning });
    const describedBy = [hintId, status.describedById].filter(Boolean).join(" ") || undefined;
    return (
      <div
        data-slot="checkbox-field"
        data-align={align}
        className={cn(
          align === "input" &&
            "@min-[40rem]:pt-[calc(1.25rem+0.25rem)] @min-[40rem]:[[data-field-has-label=true]_&]:pt-0",
          className,
        )}
      >
        <div
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)] gap-x-2",
            align === "input" && "h-[var(--control-h)] items-center",
          )}
        >
          <span className="flex h-5 items-center">
            <Checkbox
              ref={ref}
              id={controlId}
              checked={checked}
              disabled={disabled}
              aria-describedby={describedBy}
              aria-invalid={status.controlProps["aria-invalid"]}
              onCheckedChange={(value) => onCheckedChange(value === true)}
              className={cn("size-4", status.className)}
              {...props}
            />
          </span>
          <div className="flex min-w-0 items-center gap-1">
            <Label
              htmlFor={controlId}
              title={typeof label === "string" ? label : undefined}
              className={cn(
                "my-0 min-w-0 truncate whitespace-nowrap text-sm font-normal leading-5",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                error && "text-destructive",
              )}
            >
              {label}
            </Label>
            {hint ? <FieldHintIcon hint={hint} id={hintId} /> : null}
            <FieldFeedbackIndicator
              error={error}
              warning={warning}
              placement="label"
              id={status.describedById}
            />
          </div>
        </div>
      </div>
    );
  },
);

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
    <div
      ref={ref}
      role="group"
      aria-labelledby={title ? titleId : undefined}
      data-slot="checkbox-group"
      className={cn("space-y-2", className)}
      {...props}
    >
      {title ? (
        <p
          id={titleId}
          title={typeof title === "string" ? title : undefined}
          className="truncate whitespace-nowrap text-sm font-medium"
        >
          {title}
        </p>
      ) : null}
      <div
        className={cn(
          "flex",
          direction === "vertical" ? "flex-col gap-2" : "flex-row flex-wrap gap-x-6 gap-y-2",
        )}
      >
        {children}
      </div>
    </div>
  );
});

type SwitchRootProps = ComponentPropsWithoutRef<typeof Switch>;

export interface SwitchFieldProps extends Omit<
  SwitchRootProps,
  "checked" | "onCheckedChange" | "children"
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  /** Nápověda jako ikona Info za popiskem. */
  hint?: ReactNode;
  /** Chyba: rámeček kolem přepínače a ikona za popiskem. */
  error?: string;
  /** Varování: rámeček kolem přepínače a ikona za popiskem. */
  warning?: string;
  /** Probíhá ukládání – přepínač je dočasně neaktivní. */
  busy?: boolean;
}

/** Řádek nastavení: popisek a nápověda vlevo, přepínač vpravo. Změna se ukládá hned. */
export const SwitchField = forwardRef<ElementRef<typeof Switch>, SwitchFieldProps>(
  function SwitchField(
    {
      checked,
      onCheckedChange,
      label,
      hint,
      error,
      warning,
      busy = false,
      disabled,
      id,
      className,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const controlId = id ?? `switch-${autoId}`;
    const hintId = hint ? `${controlId}-hint` : undefined;
    const status = useFieldStatus({ error, warning });
    const describedBy = [hintId, status.describedById].filter(Boolean).join(" ") || undefined;
    const inactive = disabled || busy;
    return (
      <div
        data-slot="switch-field"
        aria-busy={busy || undefined}
        className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-1", className)}
      >
        <div className="flex min-w-0 items-center gap-1">
          <Label
            htmlFor={controlId}
            title={typeof label === "string" ? label : undefined}
            className={cn(
              "my-0 min-w-0 truncate whitespace-nowrap font-medium leading-5",
              inactive ? "cursor-not-allowed" : "cursor-pointer",
              disabled && "opacity-60",
              error && "text-destructive",
            )}
          >
            {label}
          </Label>
          {hint ? <FieldHintIcon hint={hint} id={hintId} /> : null}
          <FieldFeedbackIndicator
            error={error}
            warning={warning}
            placement="label"
            id={status.describedById}
          />
        </div>
        <span className="flex h-5 items-center">
          <Switch
            ref={ref}
            id={controlId}
            checked={checked}
            disabled={inactive}
            aria-describedby={describedBy}
            aria-invalid={status.controlProps["aria-invalid"]}
            onCheckedChange={onCheckedChange}
            className={cn(busy && "animate-pulse", status.className)}
            {...props}
          />
        </span>
      </div>
    );
  },
);
