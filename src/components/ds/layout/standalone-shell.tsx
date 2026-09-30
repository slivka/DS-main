import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "../../ui/button";
import { TooltipProvider } from "../../ui/tooltip";
import { TruncatedText } from "../data-display/truncated-text";
import { cn } from "../../../lib/utils";
import { useAppZoomShortcuts, useEffectiveIsMobile } from "../../../lib/app-zoom";
import { resolveMenuWidth } from "./AppShell";
import { useDsTexts } from "../../../ds-texts";

export interface StandaloneShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Logo aplikace vlevo v horní liště. */
  brand: ReactNode;
  /** Nadpis obrazovky (např. „Nastavení prostoru“). */
  title: string;
  /** Uživatelské menu vpravo v liště. */
  userMenu?: ReactNode;
  /** Zavření obrazovky; bez něj se tlačítko Zavřít ani Esc nepoužijí. Neuložené změny hlídá aplikace. */
  onClose?: () => void;
  closeLabel?: string;
  /** Levý sloupec (ContextSwitcher + StandaloneNav); bez něj obsah přes celou šířku. */
  sidebar?: ReactNode;
  children: ReactNode;
}

const OVERLAY_SELECTOR = [
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
  '[role="menu"][data-state="open"]',
  '[role="listbox"][data-state="open"]',
  "[data-radix-popper-content-wrapper]",
].join(",");

/** Je otevřený překryv (dialog, popover, rozbalovací nabídka, výběr)? */
function hasOpenOverlay(root: ParentNode = document) {
  return root.querySelector(OVERLAY_SELECTOR) != null;
}

function readMenuWidth() {
  try { return resolveMenuWidth(Number(localStorage.getItem("app:menu-width")) || 15, 26.25); } catch { return 15; }
}

/**
 * Rám obrazovky mimo AppShell – nastavení nad úrovní firmy (prostory).
 * Bez menu aplikace, výběru firmy a období, panelů a záložek.
 */
export const StandaloneShell = forwardRef<HTMLDivElement, StandaloneShellProps>(function StandaloneShell(
  { brand, title, userMenu, onClose, closeLabel, sidebar, children, className, ...props },
  ref,
) {
  const texts = useDsTexts();
  useAppZoomShortcuts();
  const [menuWidth, setMenuWidth] = useState(15);
  useLayoutEffect(() => setMenuWidth(readMenuWidth()), []);
  const isMobile = useEffectiveIsMobile();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing || event.defaultPrevented || !closeRef.current) return;
      if (hasOpenOverlay()) return;
      event.preventDefault();
      closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = [html.style.overflow, body.style.overflow];
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => { html.style.overflow = previous[0]; body.style.overflow = previous[1]; };
  }, []);

  const label = closeLabel ?? texts.standalone.close;

  return (
    <TooltipProvider>
      <div ref={ref} data-slot="standalone-shell" className={cn("flex h-dvh flex-col overflow-hidden bg-surface-page text-foreground", className)} {...props}>
        <header className={cn("relative z-30 flex h-14 shrink-0 items-center gap-3 overflow-hidden border-b bg-card", isMobile ? "px-3" : "px-4")}>
          <div className="flex shrink-0 items-center">{brand}</div>
          <div data-slot="standalone-title" className="min-w-0 flex-1 whitespace-nowrap text-base font-semibold"><TruncatedText text={title} /></div>
          <div className="flex shrink-0 items-center gap-2">
            {userMenu}
            {onClose ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="whitespace-nowrap">
                <X aria-hidden="true" />
                {label}
              </Button>
            ) : null}
          </div>
        </header>
        <div data-mobile={isMobile || undefined} className={cn("flex min-h-0 flex-1", isMobile ? "flex-col overflow-y-auto" : "flex-row overflow-hidden")}>
          {sidebar ? (
            <aside
              data-sidebar-tone="panel"
              data-slot="standalone-sidebar"
              className={cn("shell-sidebar flex shrink-0 flex-col gap-2 border-sidebar-border bg-sidebar p-2 text-sidebar-foreground", isMobile ? "border-b" : "w-[var(--standalone-menu-width)] overflow-y-auto border-r")}
              style={{ ["--standalone-menu-width" as string]: `${menuWidth}rem` }}
            >
              {sidebar}
            </aside>
          ) : null}
          <main className={cn("min-w-0 flex-1 overflow-x-hidden", !isMobile && "overflow-y-auto")}>
            <div className={isMobile ? "p-4" : "p-6"}>{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
});
