/**
 * Varianta dialogu záznamu nad obsahem panelu · vlastní překryv panelu, Esc, klik mimo,
 * přesun a návrat fokusu · nesmí rozhodovat o ochraně neuložených změn (žádost o zavření
 * předá rodiči).
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "../../../lib/utils";

/** Vlastnosti dialogu v panelu. */
export interface RecordDialogPaneProps {
  /** Prvek panelu, do kterého se dialog vykreslí. */
  container: HTMLElement;
  /** Třída šířky podle velikosti dialogu. */
  sizeClassName: string;
  /** Doplňková třída obsahu. */
  contentClassName?: string | undefined;
  /** Hlavička (titulek, štítky). */
  header: ReactNode;
  /** Obsah dialogu. */
  children: ReactNode;
  /** Uživatel žádá zavření (Esc, klik mimo). */
  onRequestClose: () => void;
}

const FOCUSABLE =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Dialog vykreslený jen nad obsahem svého panelu. */
export function RecordDialogPane(props: RecordDialogPaneProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    // Synchronizace fokusu s DOM: po otevření do dialogu, po zavření zpět na spouštěč.
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <div
      className="absolute inset-0 z-40 flex items-start justify-center overflow-auto bg-black/40 p-4"
      data-slot="record-dialog-pane-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) props.onRequestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "@container relative w-full rounded-lg border bg-background p-6 shadow-lg outline-none",
          props.sizeClassName,
          props.contentClassName,
        )}
        onKeyDown={(event) => {
          // Esc z portálu vnořeného výběru sem probublá stromem Reactu, ale ne stromem DOM;
          // takový výběr zavírá jen sám sebe.
          if (event.key !== "Escape" || event.defaultPrevented) return;
          if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
          event.preventDefault();
          props.onRequestClose();
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div id={titleId} className="mb-4 space-y-1">
          {props.header}
        </div>
        {props.children}
      </div>
    </div>,
    props.container,
  );
}
