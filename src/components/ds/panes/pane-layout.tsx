/** Veřejné rozložení panelů · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePaneTabs } from "./pane-context";
import { useAppShellPaneRegistration } from "../layout/page-layout";
import { PaneLayoutInner } from "./pane-layout-inner";
import { isPaneLayoutVisible, shouldRegisterPaneLayout } from "./pane-layout-utils";
import type { PaneLayoutProps } from "./pane-layout-types";
export type { PaneLayoutProps } from "./pane-layout-types";
export * from "./pane-layout-utils";
export { PaneEmpty, type PaneEmptyProps } from "./pane-empty";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
/** Režim více oken – 1 až 3 panely se záložkami. Musí být uvnitř PaneTabsProvider. */
export function PaneLayout({
  renderTab,
  renderLinkedPanel,
  getTabIcon,
  renderEmpty,
  minPaneWidth = 560,
  texts,
  className,
  embedded = false,
}: PaneLayoutProps) {
  const api = usePaneTabs();
  const register = useAppShellPaneRegistration();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  // Sleduje skutečné zobrazení – skrytý PaneLayout (třída hidden) nesmí main zablokovat.
  useIsomorphicLayoutEffect(() => {
    if (embedded) return;
    const element = rootRef.current;
    const read = () => setVisible(isPaneLayoutVisible(element));
    read();
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [embedded]);
  const active = shouldRegisterPaneLayout(embedded, visible);
  // useLayoutEffect: main se přepne před vykreslením – bez jednosnímkového skoku paddingu.
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    register?.(true);
    return () => register?.(false);
  }, [register, active]);
  if (!api) throw new Error("PaneLayout musí být uvnitř PaneTabsProvider.");
  return (
    <PaneLayoutInner
      api={api}
      renderTab={renderTab}
      renderLinkedPanel={renderLinkedPanel}
      getTabIcon={getTabIcon}
      renderEmpty={renderEmpty}
      minPaneWidth={minPaneWidth}
      texts={texts}
      className={className}
      rootRef={rootRef}
    />
  );
}

