/** Opravné kolo 2.111.0: vstupy jen pro čtení, past fokusu v panelu, busy a nová zakázka. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

import { RecordDialog, RecordReadOnlyProvider } from "../../src/components/ds";
import {
  DimensionSelect,
  type DimensionOption,
} from "../../src/components/ds/accounting/dimension-select";
import { JournalCellEditor } from "../../src/components/ds/accounting/JournalCellEditor";
import { JournalRowDetail } from "../../src/components/ds/accounting/JournalRowDetail";
import { JournalEditorContext } from "../../src/components/ds/accounting/journal-editor-context";
import type { JournalLine } from "../../src/components/ds/accounting/journal-editor-types";
import { useJournalEditorState } from "../../src/components/ds/accounting/useJournalEditorState";
import { useJournalKeyboard } from "../../src/components/ds/accounting/useJournalKeyboard";
import { PaneApiContext } from "../../src/components/ds/panes/pane-context-hooks";
import type { PaneApi } from "../../src/components/ds/panes/pane-context-types";
import { MaskInput } from "../../src/components/ds/form/mask-input";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { TooltipProvider } from "../../src/components/ui/tooltip";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));
const { act, cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
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

const values = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-read-only-control]")).map((n) => n.textContent);

describe("Input v režimu jen pro čtení", () => {
  it("jako hodnota jen textové typy, heslo maskované", () => {
    const view = render(
      <RecordReadOnlyProvider value>
        <Input defaultValue="A" />
        <Input type="email" defaultValue="a@b.cz" />
        <Input type="number" defaultValue="12" />
        <Input type="password" defaultValue="tajne" />
        <Input type="hidden" defaultValue="skryte" data-testid="hidden" />
        <Input type="search" defaultValue="filtr" data-testid="search" />
        <Input type="checkbox" data-testid="check" />
        <Input type="file" data-testid="file" />
      </RecordReadOnlyProvider>,
    );
    expect(values(view.container)).toEqual(["A", "a@b.cz", "12", "••••"]);
    expect(view.container.textContent).not.toContain("tajne");
    expect(view.container.textContent).not.toContain("skryte");
    for (const id of ["hidden", "search", "check", "file"])
      expect(view.getByTestId(id).tagName).toBe("INPUT");
  });

  it("vnořený RecordReadOnlyProvider value={false} nechá filtr ovladatelný", () => {
    const view = render(
      <RecordReadOnlyProvider value>
        <Input defaultValue="Hodnota" />
        <RecordReadOnlyProvider value={false}>
          <Input defaultValue="Filtr" data-testid="filter" />
        </RecordReadOnlyProvider>
      </RecordReadOnlyProvider>,
    );
    expect(values(view.container)).toEqual(["Hodnota"]);
    const filter = view.getByTestId("filter") as HTMLInputElement;
    fireEvent.change(filter, { target: { value: "x" } });
    expect(filter.tagName).toBe("INPUT");
  });

  it("MaskInput je hodnota, Textarea víceřádková hodnota", () => {
    const view = render(
      <RecordReadOnlyProvider value>
        <MaskInput value="FP{RRRR}" onChange={noop} />
        <Textarea defaultValue={"řádek 1\nřádek 2"} />
      </RecordReadOnlyProvider>,
    );
    expect(values(view.container)).toEqual(["FP{RRRR}", "řádek 1\nřádek 2"]);
    expect(view.container.querySelector("textarea")).toBeNull();
  });
});

function paneDialog(extra: Partial<React.ComponentProps<typeof RecordDialog>> = {}) {
  return render(
    <PaneApiContext.Provider value={PANE}>
      <div data-pane="p1">
        <button type="button">Za překryvem</button>
        <RecordDialog open size="md" title="Kniha" onOpenChange={noop} onSubmit={noop} {...extra}>
          <Input id="a" defaultValue="A" />
        </RecordDialog>
      </div>
    </PaneApiContext.Provider>,
  );
}

describe("RecordDialog v panelu – past fokusu", () => {
  it("Tab z posledního jde na první, Shift+Tab z prvního na poslední", () => {
    const view = paneDialog();
    const dialog = view.getByRole("dialog");
    const items = Array.from(
      dialog.querySelectorAll<HTMLElement>("input:not([disabled]), button:not([disabled])"),
    ).filter((n) => n.tabIndex >= 0);
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("s otevřeným potvrzením past dialogu Tab nepřebírá", async () => {
    const view = paneDialog({ dirty: true });
    await act(async () => {
      fireEvent.keyDown(view.getByRole("dialog", { name: /Kniha/ }), { key: "Escape" });
    });
    const back = view.getByRole("button", { name: "Zpět k záznamu" });
    back.focus();
    const event = fireEvent.keyDown(back, { key: "Tab" });
    // Událost z potvrzení se nezruší pastí dialogu v panelu (řídí ji past potvrzení).
    expect(event).toBe(true);
  });
});

describe("RecordDialog – busy", () => {
  it("zakáže i akci životního cyklu", () => {
    const view = render(
      <RecordDialog
        open
        size="md"
        title="Kniha"
        busy
        onOpenChange={noop}
        onSubmit={noop}
        lifecycleAction={{ label: "Deaktivovat", onClick: noop }}
      >
        <span />
      </RecordDialog>,
    );
    const button = view.getByRole("button", { name: "Deaktivovat" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

const NEW: DimensionOption = { id: "z99", code: "Z99", name: "Nová kategorie Z99" };

async function clickCreate(view: ReturnType<typeof render>, text: string) {
  const search = await waitFor(() => {
    const node = document.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!node) throw new Error("Hledání zatím není otevřené");
    return node;
  });
  fireEvent.change(search, { target: { value: text } });
  await act(async () => {
    fireEvent.click(await view.findByRole("button", { name: "Nová kategorie" }));
  });
}

describe("DimensionSelect – výběr nově založené zakázky", () => {
  for (const result of [null, undefined, "reject"] as const) {
    it(`výsledek ${String(result)} nic nezmění`, async () => {
      const onChange = mock((_id: string) => {});
      const view = render(
        <TooltipProvider>
          <DimensionSelect
            options={[]}
            value={null}
            defaultOpen
            onChange={onChange}
            onCreate={() =>
              result === "reject" ? Promise.reject(new Error("x")) : Promise.resolve(result)
            }
          />
        </TooltipProvider>,
      );
      await clickCreate(view, "Z99");
      await act(async () => {});
      expect(onChange).not.toHaveBeenCalled();
    });
  }
});

function Editor({ cell, onLines }: { cell: boolean; onLines: (lines: JournalLine[]) => void }) {
  const [lines, setLines] = React.useState<JournalLine[]>([{ id: "r1", debitAccount: "518001", text: "A", amount: 1 }]);
  const editor = useJournalEditorState(
    {
      accounts: [{ code: "518001", name: "Služby", category: "ekonomicka_kategorie" }],
      categoryBySide: false,
      lines,
      onChange: (next) => {
        setLines(next);
        onLines(next);
      },
      documentCurrency: "CZK",
      homeCurrency: "CZK",
      dimensions: [],
      onCreateDimension: async () => NEW,
    },
    null,
  );
  const keyboard = useJournalKeyboard(editor);
  const line = lines[0] as JournalLine;
  return (
    <JournalEditorContext.Provider value={{ editor, keyboard }}>
      {cell ? (
        <JournalCellEditor line={line} column="dimensionId" />
      ) : (
        <JournalRowDetail line={line} />
      )}
    </JournalEditorContext.Provider>
  );
}

describe("Řádek dokladu – nová zakázka se vybere", () => {
  it("v buňce", async () => {
    let latest: JournalLine[] = [];
    const view = render(
      <TooltipProvider>
        <Editor cell onLines={(next) => (latest = next)} />
      </TooltipProvider>,
    );
    await clickCreate(view, "Z99");
    await waitFor(() => expect(latest[0]?.categoryId).toBe("z99"));
  });

  it("v detailu řádku", async () => {
    let latest: JournalLine[] = [];
    const view = render(
      <TooltipProvider>
        <Editor cell={false} onLines={(next) => (latest = next)} />
      </TooltipProvider>,
    );
    const trigger = view
      .getAllByRole("combobox")
      .find((node) => node.textContent?.includes("Vyberte kategorii")) as HTMLElement;
    await act(async () => {
      fireEvent.click(trigger);
    });
    await clickCreate(view, "Z99");
    await waitFor(() => {
      const row = latest[0];
      expect([row?.categoryId, row?.debitCategoryId, row?.creditCategoryId]).toContain("z99");
    });
    expect(view.getByText("Z99 – Nová kategorie Z99", { exact: false })).toBeTruthy();
  });
});
