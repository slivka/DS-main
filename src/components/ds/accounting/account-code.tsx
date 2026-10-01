import { cn } from "../../../lib/utils";
import { CODE_SEPARATOR, formatCodeName } from "../../../lib/code-format";

/**
 * Zobrazení čísla účtu: první tři znaky jsou syntetika, zbytek je analytika
 * oddějená tečkou. Uložené „221001“ se zobrazí jako „221.001“.
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

export interface AccountCodeProps {
  /** Uložené číslo účtu. */
  code: string | null | undefined;
  /** Volitelný název účtu zobrazený za číslem. */
  name?: string | null;
  /** Další třídy obalu. */
  className?: string;
}

/** Číslo účtu v jednotném tvaru, volitelně s názvem za typografickou pomlčkou. */
export function AccountCode({ code, name, className }: AccountCodeProps) {
  const formattedCode = formatAccountCode(code);
  return (
    <span className={cn("inline-flex min-w-0 items-baseline", className)}>
      <span className="truncate font-mono tabular-nums" title={formatCodeName(formattedCode, name)}>
        {formattedCode}
        {name ? (
          <span className="font-sans text-muted-foreground">{`${CODE_SEPARATOR}${name}`}</span>
        ) : null}
      </span>
    </span>
  );
}
