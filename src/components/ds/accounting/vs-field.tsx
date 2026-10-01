import { forwardRef } from "react";

import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";

/** Variabilní symbol – pouze číslice, výchozí maximálně 10 znaků. */
export const VsField = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    className?: string;
    "aria-label"?: string;
  }
>(function VsField(
  {
    value,
    onChange,
    maxLength = 10,
    placeholder,
    required,
    disabled,
    readOnly,
    id,
    className,
    ...rest
  },
  ref,
) {
  return (
    <Input
      {...rest}
      ref={ref}
      id={id}
      inputMode="numeric"
      autoComplete="off"
      value={value}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, maxLength))}
      className={cn("h-[var(--control-h)] text-right font-mono tabular-nums", className)}
    />
  );
});
