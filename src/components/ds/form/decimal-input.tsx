import { useEffect, useState } from "react";
import { Input } from "../../ui/input";
import { fmtAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

/** Převod uživatelského vstupu s čárkou/tečkou a mezerami na číslo. */
export function parseDecimalInput(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "." || cleaned === "-" || cleaned === ",") return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

/**
 * Jednotné číselné pole pro editační formuláře.
 * Během psaní drží nezpracovaný text, při opuštění pole naformátuje hodnotu:
 * tisíce odděluje mezerami a desetinná místa doplní na `decimals` (ve výchozím stavu 2).
 * onChange vrací číselný text ("1234.56") nebo "" – stejně jako klasický input,
 * takže se dá použít namísto `<Input type="number">`.
 */
export function DecimalInput({
  value,
  onChange,
  decimals = 2,
  displayDecimals,
  seed,
  className,
  onBlur,
  ...props
}: {
  value: number | string | null | undefined;
  onChange: (value: string) => void;
  decimals?: number;
  /** Počet míst při zobrazení; při psaní lze zadat až `decimals`. */
  displayDecimals?: number;
  /** Nezpracovaný první znak při zahájení editace z gridu. */
  seed?: string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type">) {
  const [text, setText] = useState<string | null>(seed ?? null);
  useEffect(() => {
    if (seed !== undefined) setText(seed);
  }, [seed]);

  const num = typeof value === "string" ? parseDecimalInput(value) : (value ?? null);
  const shown =
    text ??
    (num != null
      ? fmtAmount(num, displayDecimals ?? decimals)
      : value != null
        ? String(value)
        : "");

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
        // Povolit nejvýše `decimals` desetinných míst.
        const m = raw.match(/^(.*?[.,])(\d*)$/);
        if (m && m[2].length > decimals) {
          raw = decimals === 0 ? m[1].slice(0, -1) : m[1] + m[2].slice(0, decimals);
        }
        setText(raw);
        const n = parseDecimalInput(raw);
        onChange(n == null ? "" : String(n));
      }}
      {...props}
      onBlur={(event) => {
        setText(null);
        onBlur?.(event);
      }}
    />
  );
}
