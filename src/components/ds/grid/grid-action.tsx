import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Jednotné akční tlačítko v řádku gridu.
 * Klidový stav: tlumená ikona bez rámečku.
 * Hover: hranatá „dlaždice" s jemným podbarvením a tenkým rámečkem – stejný
 * jazyk jako štítky a lišta gridu (žádné kulaté zvýraznění).
 */
export function GridAction({
  className,
  tone = "default",
  ...props
}: ComponentProps<"button"> & { tone?: "default" | "destructive" }) {
  return (
    <button
      type="button"
      data-slot="grid-action"
      className={cn(
        "grid-action inline-flex size-5 items-center justify-center rounded-[3px] border border-transparent",
        "text-muted-foreground opacity-60 transition-[color,background-color,border-color,opacity] duration-100 outline-none",
        "group-hover/row:opacity-100 hover:opacity-100 focus-visible:opacity-100",
        "focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "destructive"
          ? "hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 data-[state=open]:border-destructive/30 data-[state=open]:bg-destructive/10 data-[state=open]:text-destructive"
          : "hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:bg-primary/20 data-[state=open]:border-primary/30 data-[state=open]:bg-primary/10 data-[state=open]:text-primary",
        className,
      )}

      {...props}
    />
  );
}

/** Obal pro skupinu akcí v buňce – drží je vpravo a s jednotnou mezerou. */
export function GridActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="grid-actions"
      className={cn("inline-flex items-center justify-end gap-1", className)}
      {...props}
    />
  );
}

/**
 * Jednotné chování řádku gridu: pokud je edit povolen, jde ho vyvolat dvojklikem.
 * Vrácené props se rozprostřou na element řádku (`<TableRow>` nebo řádkový `<div>`).
 * Dvojklik ignorujeme, pokud uživatel právě označuje text.
 */
export function rowEditProps(canEdit: boolean | undefined, onEdit: () => void) {
  if (!canEdit) return {} as { onDoubleClick?: () => void };
  return {
    onDoubleClick: () => {
      if (typeof window !== "undefined" && window.getSelection()?.toString()) return;
      onEdit();
    },
  };
}
