/**
 * Líná bublina stavu buňky mřížky · vlastní zobrazení chyby/varování až při hover nebo focus
 * buňky · nesmí vytvářet tooltip pro buňky bez zprávy ani přestavět strom buňky.
 */
import { useId, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";

/** Vstupy líné bubliny. */
export interface CellStatusTooltipArgs {
  /** Chyba buňky. */
  error?: string;
  /** Varování buňky. */
  warning?: string;
  /** Původní informace buňky (např. název účtu) pod zprávou v téže bublině. */
  extraInfo?: ReactNode;
}

/** Handlery a bublina pro buňku; bez zprávy vrací prázdné handlery a nic nevytváří. */
export function useCellStatusTooltip({ error, warning, extraInfo }: CellStatusTooltipArgs) {
  const id = useId();
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const message = error || warning;
  if (!message) return { triggerProps: {}, tooltip: null as ReactNode, active: false } as const;
  const show = (event: PointerEvent<HTMLElement> | FocusEvent<HTMLElement>) =>
    setAnchor(event.currentTarget.getBoundingClientRect());
  const hide = () => setAnchor(null);
  const tooltip =
    anchor && typeof document !== "undefined"
      ? createPortal(
          <div
            id={id}
            role="tooltip"
            data-slot="cell-status-tooltip"
            style={{ left: anchor.left, top: anchor.bottom + 4 }}
            className={cn(
              "fixed z-50 max-w-[24rem] rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md",
            )}
          >
            <span className={error ? "text-destructive" : "text-warning-strong"}>{message}</span>
            {extraInfo ? <span className="mt-1 block opacity-80">{extraInfo}</span> : null}
          </div>,
          document.body,
        )
      : null;
  return {
    triggerProps: {
      onPointerEnter: show,
      onPointerLeave: hide,
      onFocus: show,
      onBlur: hide,
      "aria-describedby": anchor ? id : undefined,
      "aria-invalid": error ? true : undefined,
    },
    tooltip,
    active: true,
  } as const;
}
