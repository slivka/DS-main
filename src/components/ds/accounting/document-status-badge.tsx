import { Check, Lock } from "lucide-react";
import { cn } from "../../../lib/utils";
import { StatusBadge, type StatusConfig } from "../data-display/status-badge";

/**
 * Stav účetního dokladu.
 * Zachována zpětná kompatibilita hodnot `draft` / `posted` / `cancelled`.
 */
export type DocumentStatus = "draft" | "filed" | "posted" | "locked" | "cancelled";
export type DocumentStatusBadgeSize = "sm" | "md";

export interface DocumentStatusBadgeProps {
  status: DocumentStatus | null | undefined;
  config?: StatusConfig<DocumentStatus>;
  /** Nezávislý příznak schválení dokladu. */
  approved?: boolean;
  approvedLabel?: string;
  /** Velikost štítku; md sjednocuje výšku s odznakem směru ve formuláři. */
  size?: DocumentStatusBadgeSize;
  className?: string;
}

/** Výchozí české popisky stavů dokladu. */
export const DOCUMENT_STATUS_CONFIG: StatusConfig<DocumentStatus> = {
  draft: { label: "Koncept", tone: "draft" },
  filed: { label: "Zařazen", tone: "info" },
  posted: { label: "Zaúčtován", tone: "success" },
  locked: {
    label: "Uzamčen",
    tone: "neutral",
    icon: <Lock aria-hidden="true" className="size-3" />,
  },
  cancelled: { label: "Stornován", tone: "danger" },
};

/**
 * Stav účetního dokladu. Koncept je výrazně odlišen přerušovaným rámečkem.
 * Vedlejší příznak `approved` je na stavu nezávislý a zobrazí se vedle stavu.
 */
export function DocumentStatusBadge({
  status,
  config = DOCUMENT_STATUS_CONFIG,
  approved = false,
  approvedLabel = "Schválen",
  size = "sm",
  className,
}: DocumentStatusBadgeProps) {
  const sizeClass = size === "md" ? "h-[1.625rem] px-2.5 text-sm font-medium" : undefined;
  const badge = <StatusBadge status={status} config={config} className={cn(sizeClass, className)} />;
  if (!approved) return badge;
  return (
    <span className="inline-flex items-center gap-1.5">
      {badge}
      <StatusBadge
        status="approved"
        config={{
          approved: {
            label: approvedLabel,
            tone: "success",
            icon: <Check aria-hidden="true" className="size-3" />,
          },
        }}
        className={cn(sizeClass, "font-normal")}
      />
    </span>
  );
}
