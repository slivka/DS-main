import { cn } from "@/lib/utils";

/**
 * Překrytí obsahu při načítání – zabrání probliknutí mezistavů
 * (prázdné stavy, nulové součty) než dorazí finální data.
 */
export function LoadingOverlay({
  show,
  label = "Načítám…",
  className,
}: {
  show: boolean;
  label?: string;
  className?: string;
}) {
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/75 backdrop-blur-[1px]",
        className,
      )}
    >
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="loading-bar h-full w-1/3 rounded-full bg-primary" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
