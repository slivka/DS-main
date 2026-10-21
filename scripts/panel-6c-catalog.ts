/** Autorské doplnění registru panelu; katalog/reference obnovuje existující pipeline. */
import type { PanelCatalogComponent } from "./record-panel-catalog";

export function enrichPanel6cCatalog(components: PanelCatalogComponent[]): PanelCatalogComponent[] {
  const touched: PanelCatalogComponent[] = [];
  const layout = components.find((item) => item.name === "PaneLayout");
  if (layout) {
    layout.props ??= [];
    if (!layout.props.some((item) => item.name === "renderLinkedPanel"))
      layout.props.push({
        name: "renderLinkedPanel",
        type: "(recordKey: string, section: string, setSection: (section: string) => void) => ReactNode",
      });
    const guidance =
      " renderLinkedPanel je volitelný registr APP pro celé okno druhu panel: dostává recordKey, aktivní sekci a setSection. Bez registru zůstává renderTab, jiné druhy vždy přes renderTab. APP dodá celý obsah, data a práva.";
    if (!layout.usage?.includes("renderLinkedPanel"))
      layout.usage = (layout.usage ?? "") + guidance;
    layout.examples ??= [];
    if (!layout.examples.some((item) => item.label === "Panel 6C"))
      layout.examples.push({
        label: "Panel 6C",
        code: "<PaneLayout renderTab={renderRecord} renderLinkedPanel={(key, section, setSection) => <AppRecordPanel recordKey={key} activeTab={section} onTabChange={setSection} />} />",
      });
    layout.antipatterns ??= [];
    const rule =
      "Nevytvářejte druhý stav podoken ani nepřesouvejte panel bez blockedReason/ochrany kontextu.";
    if (!layout.antipatterns.includes(rule)) layout.antipatterns.push(rule);
    touched.push(layout);
  }
  const provider = components.find((item) => item.name === "PaneTabsProvider");
  if (provider) {
    const guidance =
      ' usePaneTabs nabízí openLinkedPanel({ sourceTabId, recordKey, recordTitle, section, blockedReason? }), focusLinkedPanel(sourceTabId), setLinkedPanelSection(tabId, section), updateLinkedPanelRecord(sourceTabId, recordKey, recordTitle) a closeLinkedPanel(sourceTabId). useLinkedPanel(sourceTabId) vrací { state: "closed" | "elsewhere", open, focus }; open bez sourceTabId. APP hlásí výběr přes linkedSelection/useLinkedSelection nebo updateLinkedPanelRecord; připnutí zamkne obsah, zavření zdroje připne poslední záznam. blockedReason zabrání přesunu, closeLinkedPanel používá ochranu neuložených změn.';
    if (!provider.usage?.includes("useLinkedPanel"))
      provider.usage = (provider.usage ?? "") + guidance;
    provider.examples ??= [];
    if (!provider.examples.some((item) => item.label === "Panel 6C"))
      provider.examples.push({
        label: "Panel 6C",
        code: 'const panel = useLinkedPanel(pane.tabId);\npanel.open({ recordKey: record.id, recordTitle: record.title, section: "history" });\n// PanelToggleButton state elsewhere volá panel.focus\ntabs.updateLinkedPanelRecord(pane.tabId, selected.id, selected.title);\ntabs.closeLinkedPanel(pane.tabId);',
      });
    provider.antipatterns ??= [];
    const rule =
      "Nově otevírejte celý panel přes openLinkedPanel; openLinkedTab ponechte pro kompatibilní sekční okna.";
    if (!provider.antipatterns.includes(rule)) provider.antipatterns.push(rule);
    touched.push(provider);
  }
  return touched;
}
