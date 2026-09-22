import { cn } from "../../../lib/utils";

/**
 * Zobrazení čísla účtu: první tři znaky jsou syntetika, zbytek je analytika
 * oddělená tečkou. Uložené „221001“ se zobrazí jako „221.001“.
 * Analytika může mít libovolnou délku.
 */
export function formatAccountCode(code: string | null | undefined): string {
  const raw = String(code ?? "").replace(/\D/g, "");
  if (!raw) return "";
  if (raw.length <= 3) return raw;
  return `${raw.slice(0, 3)}.${raw.slice(3)}`;
}

/** Očistí zadané číslo účtu na uloženou podobu (bez teček a mezer). */
export function normalizeAccountCode(code: string | null | undefined): string {
  return String(code ?? "").replace(/\D/g, "");
}

/** Je účet syntetický (bez analytiky)? */
export function isSyntheticAccount(code: string | null | undefined): boolean {
  return normalizeAccountCode(code).length === 3;
}

/** Číslo účtu v jednotném tvaru. */
export function AccountCode({
  code,
  name,
  className,
}: {
  code: string | null | undefined;
  /** Volitelný název účtu zobrazený za číslem. */
  name?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-mono tabular-nums">{formatAccountCode(code)}</span>
      {name ? <span className="truncate text-muted-foreground">{name}</span> : null}
    </span>
  );
}
