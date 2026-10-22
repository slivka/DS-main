/** Typy rozložení panelů · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
import type { ComponentType, ReactNode } from "react";
import type { PaneApi } from "./pane-context";
import type { PaneTab, TabPane } from "./pane-state";
import type { PaneLayoutTexts } from "./pane-layout-utils";
export interface PaneLayoutProps {
  /** Volitelný registr celého panelu. Bez něj se i druh panel vykreslí přes renderTab. */
  renderLinkedPanel?: (
    recordKey: string,
    section: string,
    setSection: (section: string) => void,
  ) => ReactNode;
  /** Obsah aktivní záložky. Záložky na pozadí se nevykreslují – stav držte přes useTabDraft. */
  renderTab: (tab: PaneTab, pane: PaneApi) => ReactNode;
  /** Ikona záložky podle jejího `icon` nebo route. */
  getTabIcon?: (tab: PaneTab) => ComponentType<{ className?: string }> | undefined;
  /** Vlastní obsah prázdného panelu. */
  renderEmpty?: (pane: TabPane) => ReactNode;
  minPaneWidth?: number;
  texts?: Partial<PaneLayoutTexts>;
  className?: string;
  /**
   * Vložený PaneLayout (ukázka, náhled uvnitř stránky) – neovládá rolování AppShellu.
   * Dejte mu kontejner s pevnou výškou; panely pak rolují samostatně a stránka kolem normálně.
   */
  embedded?: boolean;
}
