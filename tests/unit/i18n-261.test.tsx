import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

beforeAll(() => GlobalRegistrator.register());
afterAll(() => GlobalRegistrator.unregister());
afterEach(() => { document.body.innerHTML = ""; });

import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { DsTextsProvider, DS_TEXTS_SK } from "../../src/ds-texts";
import { Dialog, DialogContent, DialogTitle } from "../../src/components/ui/dialog";
import { FontSizeSetting } from "../../src/components/ds/layout/FontSizeSetting";
import { MultiSelect } from "../../src/components/ds/form/multi-select";

describe("centrální texty 2.61.0", () => {
  it("slovenský provider překládá hlavní sdílené komponenty", async () => {

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
