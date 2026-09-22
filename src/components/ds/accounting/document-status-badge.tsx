import { StatusBadge, type StatusConfig } from "@/components/ds/data-display/status-badge";

export type DocumentStatus = "draft" | "posted" | "cancelled";

/** Výchozí české popisky stavů dokladu. */
export const DOCUMENT_STATUS_CONFIG: StatusConfig<DocumentStatus> = {
  draft: { label: "Koncept", tone: "draft" },
  posted: { label: "Zaúčtováno", tone: "success" },
  cancelled: { label: "Stornováno", tone: "danger" },
};

/** Stav účetního dokladu. Koncept je výrazně odlišen přerušovaným rámečkem. */
export function DocumentStatusBadge({
  status,
  config = DOCUMENT_STATUS_CONFIG,
  className,
}: {
  status: DocumentStatus | null | undefined;
  config?: StatusConfig<DocumentStatus>;
  className?: string;
}) {
  return <StatusBadge status={status} config={config} className={className} />;
}
