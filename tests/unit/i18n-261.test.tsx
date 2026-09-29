import { beforeAll, describe, expect, it } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

beforeAll(() => GlobalRegistrator.register());

describe("centrální texty 2.61.0", () => {
  it("slovenský provider překládá hlavní sdílené komponenty", async () => {
    const React = await import("react");
    const { render, screen, cleanup } = await import("@testing-library/react");
    const { DsTextsProvider, DS_TEXTS_SK } = await import("../../src/ds-texts");
    const { Dialog, DialogContent, DialogTitle } = await import("../../src/components/ui/dialog");
    const { FontSizeSetting } = await import("../../src/components/ds/layout/FontSizeSetting");
    const { MultiSelect } = await import("../../src/components/ds/form/multi-select");

    render(
      <DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
        <Dialog open><DialogContent><DialogTitle>Detail</DialogTitle></DialogContent></Dialog>
        <FontSizeSetting />
        <MultiSelect options={[]} value={[]} onChange={() => {}} />
      </DsTextsProvider>,
    );
    expect(screen.getByText("Zavrieť")).toBeTruthy();
    expect(screen.getByLabelText("Veľkosť písma")).toBeTruthy();
    expect(screen.getByText("Žiadne hodnoty.")).toBeTruthy();
    const visible = document.body.textContent ?? "";
    for (const forbidden of ["Seřadit", "Zavřít", "Uložit", "Zrušit", "Hledat", "Vše", "Close"]) expect(visible).not.toContain(forbidden);
    expect(visible).not.toMatch(/[řůě]/);
    cleanup();
  });

  it("bez provideru zachovává české výchozí texty", async () => {
    const { DS_TEXTS_CS } = await import("../../src/ds-texts");
    expect({ close: DS_TEXTS_CS.common.close, save: DS_TEXTS_CS.common.save, sort: DS_TEXTS_CS.grid.sortBy("Název"), all: DS_TEXTS_CS.grid.all }).toEqual({ close: "Zavřít", save: "Uložit", sort: "Seřadit podle Název", all: "Vše" });
  });
});
