/**
 * Položka nabídky akcí se stále viditelným důvodem zablokování.
 * Vlastní: druhý řádek s důvodem (drobný tlumený text), aria-disabled a zablokovaný výběr.
 * Nesmí: zobrazovat důvod v tooltipu (na dotyku nefunguje) ani spouštět zablokovanou akci.
 */
import { useId, type ReactNode } from "react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import { cn } from "../../../lib/utils";

/** Vlastnosti položky nabídky s důvodem. */
export interface DisabledReasonMenuItemProps {
  /** Obsah prvního řádku (ikona + název). */
  children: ReactNode;
  /** Akce je zablokovaná. */
  disabled?: boolean;
  /** Důvod zablokování; zobrazí se jako druhý řádek jen u zablokované akce. */
  disabledReason?: string;
  /** Provede akci (jen když není zablokovaná). */
  onSelect: (event: Event) => void;
  /** Doplňkové třídy položky. */
  className?: string;
}

/** Položka DropdownMenu: zablokovaná zůstává fokusovatelná a důvod ukazuje přímo v sobě. */
export function DisabledReasonMenuItem({
  children,
  disabled,
  disabledReason,
  onSelect,
  className,
}: DisabledReasonMenuItemProps) {
  const reasonId = useId();
  const labelId = useId();
  const reason = disabled && disabledReason ? disabledReason : undefined;
  return (
    <DropdownMenuItem
      aria-disabled={disabled || undefined}
      aria-labelledby={labelId}
      aria-describedby={reason ? reasonId : undefined}
      data-slot="disabled-reason-menu-item"
      className={cn(
        "flex-col items-start gap-0.5",
        disabled && "ds-disabled-control cursor-not-allowed",
        className,
      )}
      onSelect={(event: Event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onSelect(event);
      }}
    >
      <span id={labelId} className="flex items-center gap-2">
        {children}
      </span>
      {reason ? (
        <span
          id={reasonId}
          data-slot="disabled-reason-text"
          className="text-xs font-normal text-muted-foreground"
        >
          {reason}
        </span>
      ) : null}
    </DropdownMenuItem>
  );
}
