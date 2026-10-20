/** PageHeader v panelu · ✕ zavře záložku (Alt+W), ne panel. */
import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { PageHeader } from "../../src/components/ds/layout/page-header";
import { PaneChromeContext, type PaneChrome } from "../../src/components/ds/panes/pane-context";

afterEach(cleanup);

test("křížek v záhlaví volá closeTab s ochranou neuložených změn", () => {
  const closeTab = mock();
  const closePane = mock();
  const chrome: PaneChrome = {
    tabId: "t",
    paneIndex: 0,
    title: "Doklad",
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
    closePane,
    closeTab,
    menuActions: [],
    dragHandleProps: {},
  };
  const view = render(
    <PaneChromeContext.Provider value={chrome}>
      <PageHeader title="Doklad" />
    </PaneChromeContext.Provider>,
  );
  fireEvent.click(view.getByRole("button", { name: "Zavřít" }));
  expect(closeTab).toHaveBeenCalledTimes(1);
  expect(closePane).not.toHaveBeenCalled();
  expect(view.getByRole("img", { name: "Neuložené změny" })).toBeTruthy();
});
