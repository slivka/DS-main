import { cn } from "../../../lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "draft";

export type StatusConfig<S extends string = string> = Record<
  S,
  { label: string; tone?: StatusTone; icon?: React.ReactNode }
>;

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/30",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-800 border-amber-500/40 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  draft: "border-dashed border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300",
};

/** Obecný stavový štítek – stavy a jejich vzhled se předávají konfigurací. */
export function StatusBadge<S extends string>({
  status,
  config,
  fallbackLabel,
  className,
}: {
  status: S | null | undefined;
  config: StatusConfig<S>;
  fallbackLabel?: string;
  className?: string;
}) {
  const item = status ? config[status] : undefined;
  const tone = item?.tone ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[0.35em] border px-2 py-0.5 text-xs font-medium leading-tight",
        TONE_CLASS[tone],
        className,
      )}
    >
      {item?.icon}
      {item?.label ?? fallbackLabel ?? String(status ?? "")}
    </span>
  );
}
