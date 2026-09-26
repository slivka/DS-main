import { DecimalInput } from "../form/decimal-input";
import { amountClass, formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

/** Zobrazení částky v gridu nebo detailu – vpravo, tisíce mezerou, 2 desetinná místa. */
export function AmountCell({
  value,
  decimals = 2,
  /** Text zobrazený místo prázdné hodnoty. */
  emptyText = "",
  className,
}: {
  value: number | null | undefined;
  decimals?: number;
  emptyText?: string;
  className?: string;
}) {
  const empty = value == null || !Number.isFinite(value);
  return (
    <span className={cn("amount-cell block text-right tabular-nums", amountClass(value), className)}>
      {empty ? emptyText : formatAmount(value, decimals)}
    </span>
  );
}

/** Vstup pro částku – nad sdíjeným DecimalInputem, zarovnaný vpravo. */
export function AmountInput({
  value,
  onChange,
  decimals = 2,
  className,
  ...props
}: {
  value: number | string | null | undefined;
  onChange: (value: string) => void;
  decimals?: number;
} & Omit<React.ComponentProps<typeof DecimalInput>, "value" | "onChange" | "decimals">) {
  return (
    <DecimalInput
      value={value}
      onChange={onChange}
      decimals={decimals}
      className={cn("font-sans text-right tabular-nums", className)}
      {...props}
    />
  );
}
