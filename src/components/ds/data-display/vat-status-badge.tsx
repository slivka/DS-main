import { StatusBadge, type StatusConfig } from "./status-badge";
import { formatDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";

export type VatStatus = "payer" | "identified_person" | "vat_group" | "non_payer" | "unverified";

export interface VatStatusTexts {
  payer: string;
  identified_person: string;
  vat_group: string;
  non_payer: string;
  unverified: string;
  /** `{date}` se nahradí datem. */
  unreliableSince: string;
  checkedAt: string;
}

export const DEFAULT_VAT_STATUS_TEXTS: VatStatusTexts = {
  payer: "Plátce",
  identified_person: "Identifikovaná osoba",
  vat_group: "Skupina DPH",
  non_payer: "Neplátce",
  unverified: "Neověřeno",
  unreliableSince: "Nespolehlivý plátce od {date}",
  checkedAt: "Ověřeno {date}",
};

export interface VatStatusBadgeProps {
  status: VatStatus;
  /** Datum, od kdy je plátce nespolehlivý – přidá plný červený štítek. */
  unreliableSince?: string | Date | null;
  /** Datum ověření – šedý text za štítky. */
  checkedAt?: string | Date | null;
  texts?: Partial<VatStatusTexts>;
  className?: string;
}

/** Stav DPH partnera: registrace, příznak nespolehlivého plátce a datum ověření. */
export function VatStatusBadge({
  status,
  unreliableSince,
  checkedAt,
  texts: overrides,
  className,
}: VatStatusBadgeProps) {
  const t = { ...DEFAULT_VAT_STATUS_TEXTS, ...overrides };
  const config: StatusConfig<VatStatus> = {
    payer: { label: t.payer, tone: "success" },
    identified_person: { label: t.identified_person, tone: "info" },
    vat_group: { label: t.vat_group, tone: "info" },
    non_payer: { label: t.non_payer, tone: "neutral" },
    unverified: { label: t.unverified, tone: "neutral" },
  };
  return (
    <span
      data-slot="vat-status"
      className={cn("inline-flex flex-wrap items-center gap-2", className)}
    >
      <StatusBadge
        status={status}
        config={config}
        className={
          status === "unverified" ? "border-border bg-transparent text-muted-foreground" : undefined
        }
      />
      {unreliableSince ? (
        <span
          data-slot="badge"
          data-vat-unreliable
          className="inline-flex items-center rounded-sm border border-destructive bg-destructive px-2 py-0.5 text-xs font-medium leading-tight text-destructive-foreground"
        >
          {t.unreliableSince.replace("{date}", formatDate(unreliableSince))}
        </span>
      ) : null}
      {checkedAt ? (
        <span className="text-xs text-muted-foreground">
          {t.checkedAt.replace("{date}", formatDate(checkedAt))}
        </span>
      ) : null}
    </span>
  );
}
