/** Ukázka záhlaví panelu se štítkem a tečkou neuložených změn · jen náhled, ne knihovna. */
import { PageHeader, StatusBadge } from "../ds";
import { PaneChromeContext, type PaneChrome } from "../ds/panes/pane-context";

const chrome = (title: string): PaneChrome => ({
  tabId: title,
  paneIndex: 0,
  title,
  canBack: false,
  canForward: false,
  back: () => {},
  forward: () => {},
  history: [],
  goToHistory: () => {},
  openFromHistory: () => {},
  dirty: true,
  recordNav: null,
  canMaximize: false,
  maximized: false,
  toggleMaximize: () => {},
  closePane: () => {},
  closeTab: () => {},
  menuActions: [],
  dragHandleProps: {},
});

/** Tečka sdílí svislý střed se štítkem (účaří + ½ x-výšky) i bez štítku. */
export function PageHeaderDirtyDemo() {
  return (
    <div data-testid="page-header-dirty-demo" className="grid gap-4">
      <PaneChromeContext.Provider value={chrome("FP 2026/0142")}>
        <PageHeader
          title="Přijatá faktura FP 2026/0142"
          titleBadge={
            <StatusBadge status="draft" config={{ draft: { label: "Koncept", tone: "draft" } }} />
          }
        />
      </PaneChromeContext.Provider>
      <PaneChromeContext.Provider value={chrome("Bez štítku")}>
        <PageHeader title="Pokladní doklad bez štítku" />
      </PaneChromeContext.Provider>
    </div>
  );
}
