import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

import { usePaneTabs, type OpenTabOptions } from "./pane-context";
import type { OpenTabTarget } from "./pane-state";

/**
 * Způsob otevření podle události myši:
 * Cmd/Ctrl + Shift + klik → sousední panel, Cmd/Ctrl + klik nebo prostřední tlačítko → nová záložka,
 * jinak 'replace' – nahradí aktivní záložku novým krokem historie.
 */
export function getOpenTarget(event: Pick<MouseEvent, "ctrlKey" | "metaKey" | "shiftKey" | "button">): OpenTabTarget {
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && event.shiftKey) return "adjacentPane";
  if (modifier || event.button === 1) return "newTab";
  return "replace";
}

/**
 * Zpracuje klik / auxclick odkazu v režimu záložek. Vrací true, pokud událost převzal
 * (a zabránil tím otevření záložky prohlížeče).
 */
export function handlePaneLinkEvent(
  event: MouseEvent,
  open: ((target: OpenTabTarget) => void) | null | undefined,
): boolean {
  if (!open || event.defaultPrevented) return false;
  if (event.type === "auxclick" && event.button !== 1) return false;
  if (event.type === "click" && event.button !== 0) return false;
  event.preventDefault();
  open(getOpenTarget(event));
  return true;
}

export interface PaneLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  route: string;
  params?: Record<string, unknown>;
  /** Volby otevření (kind, recordKey, title…); target se určí z události. */
  options?: Omit<OpenTabOptions, "target">;
  /** Adresa pro odkaz mimo panely; výchozí je route. */
  href?: string;
}

/**
 * Odkaz, který v režimu záložek otevře stránku v aktivní záložce, nové záložce nebo sousedním panelu.
 * Mimo PaneTabsProvider se chová jako běžný odkaz.
 */
export const PaneLink = forwardRef<HTMLAnchorElement, PaneLinkProps>(function PaneLink(
  { route, params, options, href, onClick, onAuxClick, onMouseDown, children, ...rest },
  ref,
) {
  const tabs = usePaneTabs();
  const open = tabs ? (target: OpenTabTarget) => tabs.openTab(route, params, { ...options, target }) : null;
  return (
    <a
      ref={ref}
      href={href ?? route}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        handlePaneLinkEvent(event, open);
      }}
      onAuxClick={(event) => {
        onAuxClick?.(event);
        handlePaneLinkEvent(event, open);
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // Prostřední tlačítko by jinak zapnulo automatický posun.
        if (open && event.button === 1) event.preventDefault();
      }}
    >
      {children}
    </a>
  );
});
