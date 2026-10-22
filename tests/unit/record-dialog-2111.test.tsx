import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

import { CheckboxField, Field, FieldGrid, OptionSelect, RecordDialog } from "../../src/components/ds";
import { PaneApiContext } from "../../src/components/ds/panes/pane-context-hooks";
import type { PaneApi } from "../../src/components/ds/panes/pane-context-types";
import { Input } from "../../src/components/ui/input";
import { DS_TEXTS_SK, DsTextsProvider } from "../../src/ds-texts";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));
const { act, cleanup, fireEvent, render } = await import("@testing-library/react");
afterEach(cleanup);

const noop = () => {};
const PANE: PaneApi = {
  paneId: "p1",
  tabId: "t1",
  isActive: true,
  navigate: noop,
  back: noop,
  forward: noop,
  canBack: false,
  canForward: false,
  setTitle: noop,
  close: noop,
};

type Extra = Partial<React.ComponentProps<typeof RecordDialog>>;

function renderDialog(extra: Extra = {}, inPane = false) {
  const onOpenChange = mock((_open: boolean) => {});
  const onSubmit = mock(() => {});
  const dialog = (
    <RecordDialog
      open
      size="md"
      title="Kniha FP"
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      {...extra}
    >
      <FieldGrid cols={12}>
        <Field label="Název" span={12} htmlFor="name">
          <Input id="name" defaultValue="Přijaté" />
        </Field>
      </FieldGrid>
    </RecordDialog>
  );
  const view = render(
    inPane ? (
      <PaneApiContext.Provider value={PANE}>
        <div data-pane="p1">{dialog}</div>
      </PaneApiContext.Provider>
    ) : (
      dialog
    ),
  );
  return { view, onOpenChange, onSubmit };
}

const pressEscape = (target: Element) => fireEvent.keyDown(target, { key: "Escape" });

describe("RecordDialog – ochrana neuložených změn", () => {
  it("bez dirty zavře hned tlačítkem Zrušit, křížkem i Esc", () => {
    const { view, onOpenChange } = renderDialog();
    fireEvent.click(view.getByRole("button", { name: "Zrušit" }));
    fireEvent.click(view.getByRole("button", { name: "Zavřít" }));
    pressEscape(view.getByRole("dialog"));
    expect(onOpenChange.mock.calls.map((call) => call[0])).toEqual([false, false, false]);
    expect(view.queryByText("Zavřít záznam s neuloženými změnami?")).toBeNull();
  });

  it("s dirty každá cesta zavření otevře potvrzení a nic nezavře", () => {
    const { view, onOpenChange } = renderDialog({ dirty: true });
    fireEvent.click(view.getByRole("button", { name: "Zrušit" }));
    expect(view.getByText("Zavřít záznam s neuloženými změnami?")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Zpět k záznamu" }));
    fireEvent.click(view.getByRole("button", { name: "Zavřít" }));
    expect(view.getByText("Zavřít záznam s neuloženými změnami?")).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole("button", { name: "Zavřít bez uložení" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Uložit a zavřít volá onSubmit a dialog nechá zavřít aplikaci", () => {
    const { view, onOpenChange, onSubmit } = renderDialog({ dirty: true });
    pressEscape(view.getByRole("dialog"));
    fireEvent.click(view.getByRole("button", { name: "Uložit a zavřít" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(view.getByRole("dialog", { name: /Kniha FP/ })).toBeTruthy();
  });

  it("v panelu zavírá Esc i klik mimo, s dirty se zeptá", async () => {
    const clean = renderDialog({}, true);
    const dialog = clean.view.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    pressEscape(dialog);
    const overlay = dialog.parentElement as HTMLElement;
    fireEvent.pointerDown(overlay);
    expect(clean.onOpenChange.mock.calls.map((call) => call[0])).toEqual([false, false]);
    cleanup();
    const dirty = renderDialog({ dirty: true }, true);
    await act(async () => {
      pressEscape(dirty.view.getByRole("dialog"));
    });
    expect(dirty.view.getByText("Zavřít záznam s neuloženými změnami?")).toBeTruthy();
    expect(dirty.onOpenChange).not.toHaveBeenCalled();
  });

  it("busy blokuje zavření a Uložit ukáže Ukládám…", () => {
    const { view, onOpenChange } = renderDialog({ busy: true, dirty: true });
    const cancel = view.getByRole("button", { name: "Zrušit" }) as HTMLButtonElement;
    expect(cancel.disabled).toBe(true);
    pressEscape(view.getByRole("dialog"));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(view.queryByText("Zavřít záznam s neuloženými změnami?")).toBeNull();
    const submit = view.getByRole("button", { name: "Ukládám…" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });
});

describe("RecordDialog – obsah a patička", () => {
  it("readOnly vykreslí vstupy jako hodnoty a zaškrtávátko jako Ano / Ne", () => {
    const view = render(
      <RecordDialog open size="sm" title="Detail" onOpenChange={noop} readOnly>
        <Input defaultValue="FP" />
        <Input defaultValue="" />
        <OptionSelect value="a" onChange={noop} options={[{ value: "a", label: "Alfa" }]} />
        <CheckboxField checked onCheckedChange={noop} label="Aktivní" />
      </RecordDialog>,
    );
    expect(view.queryByRole("textbox")).toBeNull();
    expect(view.queryByRole("combobox")).toBeNull();
    expect(view.getByText("FP")).toBeTruthy();
    expect(view.getByText("—")).toBeTruthy();
    expect(view.getByText("Alfa")).toBeTruthy();
    expect(view.getByText("Ano")).toBeTruthy();
    expect(view.queryByRole("button", { name: "Uložit" })).toBeNull();
  });

  it("readOnly slovensky ukáže Áno a vstup mimo dialog zůstane vstupem", () => {
    const view = render(
      <DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
        <Input defaultValue="mimo" />
        <RecordDialog open size="sm" title="Detail" onOpenChange={noop} readOnly>
          <CheckboxField checked onCheckedChange={noop} label="Aktívny" />
        </RecordDialog>
      </DsTextsProvider>,
    );
    expect(view.getByText("Áno")).toBeTruthy();
    expect(view.getAllByRole("textbox", { hidden: true })).toHaveLength(1);
  });

  it("Odstranit je úplně vlevo před doplňkovými akcemi a životním cyklem", () => {
    const { view } = renderDialog({
      deleteAction: { onClick: noop, confirm: { title: "Odstranit knihu?" } },
      extraActions: <button type="button">Kopie</button>,
      lifecycleAction: { label: "Deaktivovat", onClick: noop },
    });
    const footer = view.getByRole("dialog").querySelector('[data-slot="record-dialog-footer"]');
    const names = Array.from(footer?.querySelectorAll("button") ?? []).map((b) =>
      b.textContent?.trim(),
    );
    expect(names.slice(0, 3)).toEqual(["Odstranit", "Kopie", "Deaktivovat"]);
    fireEvent.click(view.getByRole("button", { name: "Odstranit" }));
    expect(view.getByText("Odstranit knihu?")).toBeTruthy();
  });

  it("Odstranit se v readOnly nevykreslí", () => {
    const { view } = renderDialog({
      readOnly: true,
      deleteAction: { onClick: noop, confirm: { title: "Odstranit?" } },
    });
    expect(view.queryByRole("button", { name: "Odstranit" })).toBeNull();
  });

  it("chyba uložení je v pruhu nad tlačítky nad seznamem polí", () => {
    const { view } = renderDialog({
      error: "Kód už existuje.",
      fieldErrors: [{ fieldId: "name", label: "Název", message: "Povinné" }],
    });
    const strip = view.getByRole("alert");
    expect(strip.getAttribute("data-slot")).toBe("record-dialog-field-errors");
    expect(strip.firstElementChild?.textContent).toBe("Kód už existuje.");
    expect(strip.textContent).toContain("Povinné");
  });

  it("velikost má stejnou šířku v panelu i mimo panel", () => {
    for (const [size, width] of [
      ["sm", "max-w-lg"],
      ["md", "max-w-3xl"],
      ["lg", "max-w-4xl"],
    ] as const) {
      const outside = renderDialog({ size });
      expect(outside.view.getByRole("dialog").className).toContain(`sm:${width}`);
      cleanup();
      const inside = renderDialog({ size }, true);
      expect(inside.view.getByRole("dialog").className.split(" ")).toContain(width);
      cleanup();
    }
  });
});
