/** Stavový štítek · vlastní tón a optické centrování · nesmí znát stav aplikace. */
import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "../../../lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "draft" | "accent";

export type StatusConfig<S extends string = string> = Record<
  S,
  { label: string; tone?: StatusTone; icon?: React.ReactNode }
>;

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/30",
  success: "bg-success-soft text-success-strong border-success/30",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning-strong border-warning/40",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  draft:
    "border-dashed border-warning/60 bg-warning/10 text-warning-foreground dark:text-warning-strong",
  accent: "border-operator-accent bg-operator-accent text-operator-accent-foreground",
};

/** Obecný stavový štítek – stavy a jejich vzhled se předávají konfigurací. */
/** Vlastnosti stavového štítku. */
export interface StatusBadgeProps<S extends string> extends ComponentPropsWithoutRef<"span"> {
  /** Klíč stavu. */
  status: S | null | undefined;
  /** Popisky a významové tóny. */
  config: StatusConfig<S>;
  /** Náhradní popisek. */
  fallbackLabel?: string;
  /** Pevná velikost. */
  size?: "sm" | "md";
  /** Reference na štítek. */
  ref?: Ref<HTMLSpanElement>;
}
export function StatusBadge<S extends string>({
  status,
  config,
  fallbackLabel,
  className,
  size = "sm",
  ref,
  ...props
}: StatusBadgeProps<S>) {
  const item = status ? config[status] : undefined;
  const tone = item?.tone ?? "neutral";
  return (
    <span
      ref={ref}
      {...props}
      data-slot="badge"
      className={cn(
        "ds-badge inline-flex items-center gap-1 rounded-sm border px-2 text-xs font-medium leading-none",
        size === "md" && "ds-badge-md",
        TONE_CLASS[tone],
        className,
      )}
    >
      {item?.icon}
      <span className="ds-badge-text">{item?.label ?? fallbackLabel ?? String(status ?? "")}</span>
    </span>
  );
}
