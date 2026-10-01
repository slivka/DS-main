import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

beforeAll(() => GlobalRegistrator.register());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});
afterEach(() => {
  document.body.innerHTML = "";
});

import React from "react";
import { render, cleanup } from "@testing-library/react";
import { DsTextsProvider, DS_TEXTS_SK } from "../../src/ds-texts";
import { Dialog, DialogContent, DialogTitle } from "../../src/components/ui/dialog";
import { MultiSelect } from "../../src/components/ds/form/multi-select";

describe("centrální texty 2.61.0", () => {
  it("slovenský provider překládá hlavní sdílené komponenty", async () => {
    const view = render(
      <DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
        <Dialog open>
          <DialogContent>
            <DialogTitle>Detail</DialogTitle>
          </DialogContent>
        </Dialog>
        <MultiSelect
          options={[]}
          selected={[]}
          onChange={() => {}}
          allLabel="Všetko"
          itemsLabel="položky"
        />
      </DsTextsProvider>,
    );
    expect(DS_TEXTS_SK.common.close).toBe("Zavrieť");
    expect(DS_TEXTS_SK.appZoom.label).toBe("Veľkosť zobrazenia");
    expect(DS_TEXTS_SK.multiSelect.noValues).toBe("Žiadne hodnoty.");
    const visible = document.body.textContent ?? "";
    for (const forbidden of ["Seřadit", "Zavřít", "Uložit", "Zrušit", "Hledat", "Close"])
      expect(visible).not.toContain(forbidden);
    expect(visible).not.toMatch(/[řůě]/);
    expect(visible).not.toMatch(/(^|\s)Vše($|\s)/);
    cleanup();
  });

  it("bez provideru zachovává české výchozí texty", async () => {
    const { DS_TEXTS_CS } = await import("../../src/ds-texts");
    expect({
      close: DS_TEXTS_CS.common.close,
      save: DS_TEXTS_CS.common.save,
      sort: DS_TEXTS_CS.grid.sortBy("Název"),
      all: DS_TEXTS_CS.grid.all,
    }).toEqual({ close: "Zavřít", save: "Uložit", sort: "Seřadit podle Název", all: "Vše" });
  });
});
