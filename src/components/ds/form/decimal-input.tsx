import { useState } from "react";
import { Input } from "../../ui/input";
import { fmtAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

/** Prevod užívateľského vstupu s čiarkou/tečkou a medzerami na číslo. */
export function parseDecimalInput(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "." || cleaned === "-" || cleaned === ",") return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

/**
 * Jednotné číselné pole pre editačné formuláre.
 * Počas písania drží surový text, pri opustení poľa naformátuje hodnotu:
 * tisíce oddeľuje medzerami a desatinné miesta doplní na `decimals` (predvolene 2).
 * onChange vracia číselný text ("1234.56") alebo "" – rovnako ako klasický input,
 * takže sa dá použiť namiesto `<Input type="number">`.
 */
export function DecimalInput({
  value,
  onChange,
  decimals = 2,
  className,
  ...props
}: {
  value: number | string | null | undefined;
  onChange: (value: string) => void;
  decimals?: number;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type">) {
  const [text, setText] = useState<string | null>(null);

  const num = typeof value === "string" ? parseDecimalInput(value) : (value ?? null);
  const shown =
    text ?? (num != null ? fmtAmount(num, decimals) : value != null ? String(value) : "");

  return (
    <Input
      type="text"
      inputMode="decimal"
      className={cn("font-sans text-right tabular-nums", className)}
      value={shown}
      onFocus={() =>
        setText(num != null ? String(num).replace(".", ",") : value != null ? String(value) : "")
      }
      onChange={(e) => {
        let raw = e.target.value;
        // povoliť najviac `decimals` desatinných miest
        const m = raw.match(/^(.*?[.,])(\d*)$/);
        if (m && m[2].length > decimals) {
          raw = decimals === 0 ? m[1].slice(0, -1) : m[1] + m[2].slice(0, decimals);
        }
        setText(raw);
        const n = parseDecimalInput(raw);
        onChange(n == null ? "" : String(n));
      }}
      onBlur={() => setText(null)}
      {...props}
    />
  );
}
