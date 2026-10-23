/** PanelToggleButton · stejný obrys v každém stavu, ikona a bublina podle stavu, pořadí záložek panelu. */
import { afterEach, describe, expect, it, mock } from "bun:test";

const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
const { PanelToggleButton } = await import("../../src/components/ds/layout/panel-toggle-button");
const { RecordDialogPanelToggle } =
  await import("../../src/components/ds/layout/record-dialog-panel-toggle");
const { orderRecordPanelTabs } =
  await import("../../src/components/ds/layout/record-side-panel/panel-tabs");
const { FileText } = await import("lucide-react");

afterEach(cleanup);

const renderToggle = (open: boolean, indicator = false) =>
  render(
    <TooltipProvider delayDuration={0}>
      <PanelToggleButton
        open={open}
        indicator={indicator}
        tooltip="Přílohy 2"
        onToggle={() => undefined}
      />
    </TooltipProvider>,
  );

describe("PanelToggleButton podle stavu", () => {
  for (const [open, indicator] of [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)
    it(`má obrys ${open ? "otevřený" : "zavřený"}${indicator ? " s tečkou" : ""}`, () => {
      const ui = renderToggle(open, indicator);
      expect(ui.getByRole("button", { name: open ? "Zavřít panel" : "Otevřít panel" }).getAttribute("data-variant")).toBe(
        "outline",
      );
    });

  it("zavřený panel ukazuje šipku k obsahu a bublinu Otevřít panel", async () => {
    const ui = renderToggle(false);
    const button = ui.getByRole("button", { name: "Otevřít panel" });
    expect(button.getAttribute("data-direction")).toBe("open");
    expect(button.querySelector("svg")?.getAttribute("class")).toContain("panel-right-open");
    fireEvent.focus(button);
    const tip = await ui.findAllByText("Otevřít panel");
    expect(tip.length).toBeGreaterThan(0);
  });

  it("otevřený panel ukazuje šipku ven a bublinu Zavřít panel", async () => {
    const ui = renderToggle(true);
    const button = ui.getByRole("button", { name: "Zavřít panel" });
    expect(button.getAttribute("data-direction")).toBe("close");
    expect(button.querySelector("svg")?.getAttribute("class")).toContain("panel-right-close");
    fireEvent.focus(button);
    expect((await ui.findAllByText("Zavřít panel")).length).toBeGreaterThan(0);
  });
});

it("panel jinde otevírá sousední okno, ikona i název odpovídají akci", async () => {
  const focus = mock(() => undefined);
  const toggle = mock(() => undefined);
  const ui = render(
    <TooltipProvider delayDuration={0}>
      <PanelToggleButton open={false} state="elsewhere" onToggle={toggle} onFocusElsewhere={focus} />
    </TooltipProvider>,
  );
  const button = ui.getByRole("button", { name: "Otevřít panel" });
  expect(button.getAttribute("data-direction")).toBe("open");
  expect(button.querySelector("svg")?.getAttribute("class")).toContain("panel-right-open");
  fireEvent.focus(button);
  expect((await ui.findAllByText("Otevřít panel")).length).toBeGreaterThan(0);
  fireEvent.click(button);
  expect(focus).toHaveBeenCalledTimes(1);
  expect(toggle).not.toHaveBeenCalled();
});

for (const visible of [false, true])
  it(`dialog sdílí orámovaný ovladač ${visible ? "zavření" : "otevření"} panelu`, () => {
    const toggle = mock(() => undefined);
    const ui = render(
      <TooltipProvider>
        <RecordDialogPanelToggle visible={visible} label="Přílohy" onToggle={toggle} />
      </TooltipProvider>,
    );
    const button = ui.getByRole("button", { name: visible ? "Zavřít panel" : "Otevřít panel" });
    expect(button.getAttribute("data-variant")).toBe("outline");
    expect(button.getAttribute("data-direction")).toBe(visible ? "close" : "open");
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });

describe("pořadí záložek panelu", () => {
  it("Zdroj → Poznámky → Přílohy → Historie → Propojené", () => {
    const tab = (id: string) => ({ id, label: id, icon: FileText, content: null });
    const ordered = orderRecordPanelTabs(
      ["attachments", "linked", "custom", "history", "notes", "source"].map(tab),
    );
    expect(ordered.map((item) => item.id)).toEqual([
      "source",
      "notes",
      "attachments",
      "custom",
      "history",
      "linked",
    ]);
  });
});
