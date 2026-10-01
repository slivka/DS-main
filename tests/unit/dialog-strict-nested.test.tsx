import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { act, cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { useDialogBackClose } = await import("../../src/hooks/use-dialog-back-close");
const { RecordDialog } = await import("../../src/components/ds/layout/RecordDialog");
const { JournalLinesEditor } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;

/** Napodobenina historie prohlížeče: back() vyvolá popstate asynchronně jako prohlížeč. */
function fakeHistory() {
  const stack: unknown[] = [null];
  const original = {
    push: window.history.pushState,
    back: window.history.back,
    state: Object.getOwnPropertyDescriptor(History.prototype, "state"),
  };
  const counts = { push: 0, back: 0 };
  window.history.pushState = (state: unknown) => {
    counts.push += 1;
    stack.push(state);
  };
  window.history.back = () => {
    counts.back += 1;
    stack.pop();
    const state = stack[stack.length - 1];
    setTimeout(() => window.dispatchEvent(new PopStateEvent("popstate", { state })), 0);
  };
  Object.defineProperty(window.history, "state", {
    configurable: true,
    get: () => stack[stack.length - 1],
  });
  return {
    counts,
    entries: () => stack.length - 1,
    restore: () => {
      window.history.pushState = original.push;
      window.history.back = original.back;
      Reflect.deleteProperty(window.history, "state");
    },
  };
}

let history: ReturnType<typeof fakeHistory>;
beforeEach(() => {
  history = fakeHistory();
});
afterEach(() => {
  cleanup();
  history.restore();
});
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 20)));

function Probe({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  useDialogBackClose(open, onOpenChange);
  return null;
}

describe("useDialogBackClose ve StrictMode", () => {
  it("dvojí připojení efektů nevloží druhý záznam a dialog nezavře", async () => {
    const onOpenChange = mock(() => {});
    render(
      <React.StrictMode>
        <Probe open onOpenChange={onOpenChange} />
      </React.StrictMode>,
    );
    await flush();
    expect(history.entries()).toBe(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("Zpět prohlížeče dialog zavře", async () => {
    const onOpenChange = mock(() => {});
    render(
      <React.StrictMode>
        <Probe open onOpenChange={onOpenChange} />
      </React.StrictMode>,
    );
    await flush();
    act(() => window.history.back());
    await flush();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("zavření tlačítkem i odpojení odebere záznam historie", async () => {
    const view = render(
      <React.StrictMode>
        <Probe open onOpenChange={() => {}} />
      </React.StrictMode>,
    );
    await flush();
    view.rerender(
      <React.StrictMode>
        <Probe open={false} onOpenChange={() => {}} />
      </React.StrictMode>,
    );
    await flush();
    expect(history.entries()).toBe(0);
    view.rerender(
      <React.StrictMode>
        <Probe open onOpenChange={() => {}} />
      </React.StrictMode>,
    );
    await flush();
    expect(history.entries()).toBe(1);
    view.unmount();
    await flush();
    expect(history.entries()).toBe(0);
  });

  it("zavření vnořeného dialogu ponechá rodiče otevřený", async () => {
    const outer = mock(() => {});
    const view = render(
      <React.StrictMode>
        <Probe open onOpenChange={outer} />
        <Probe open onOpenChange={() => {}} />
      </React.StrictMode>,
    );
    await flush();
    expect(history.entries()).toBe(2);
    view.rerender(
      <React.StrictMode>
        <Probe open onOpenChange={outer} />
        <Probe open={false} onOpenChange={() => {}} />
      </React.StrictMode>,
    );
    await flush();
    expect(history.entries()).toBe(1);
    expect(outer).not.toHaveBeenCalled();
  });
});

describe("RecordDialog – vnořený formulář", () => {
  it("potvrzení vnitřního dialogu nevyvolá onSubmit vnějšího", async () => {
    const outerSubmit = mock(() => {});
    const innerSubmit = mock(() => {});
    const view = render(
      <RecordDialog open onOpenChange={() => {}} title="Partner" onSubmit={outerSubmit}>
        <RecordDialog
          open
          onOpenChange={() => {}}
          title="Bankovní účet"
          onSubmit={innerSubmit}
          submitLabel="Přidat účet"
        >
          <span>Účet</span>
        </RecordDialog>
      </RecordDialog>,
    );
    fireEvent.click(await view.findByRole("button", { name: "Přidat účet" }));
    expect(innerSubmit).toHaveBeenCalledTimes(1);
    expect(outerSubmit).not.toHaveBeenCalled();
    const outerButton = view.getAllByRole("button", { name: "Uložit" })[0]!;
    fireEvent.click(outerButton);
    expect(outerSubmit).toHaveBeenCalledTimes(1);
    expect(innerSubmit).toHaveBeenCalledTimes(1);
  });

  it("Enter v buňce editoru řádků neodešle formulář dialogu", async () => {
    const submit = mock(() => {});
    function Lines() {
      const [lines, setLines] = React.useState<JournalLine[]>([
        { id: "l1", debitAccount: "518001", creditAccount: "321100", amount: 10, text: "A" },
      ]);
      return (
        <TooltipProvider>
          <JournalLinesEditor
            lines={lines}
            onChange={setLines}
            accounts={[]}
            documentCurrency="CZK"
            homeCurrency="CZK"
            storageKey="nested-enter"
          />
        </TooltipProvider>
      );
    }
    const view = render(
      <RecordDialog open onOpenChange={() => {}} title="Doklad" onSubmit={submit}>
        <Lines />
      </RecordDialog>,
    );
    const cell = await waitFor(() => {
      const found = view.baseElement.querySelector<HTMLElement>('[data-cell-key="l1:text"]');
      if (!found) throw new Error("buňka ještě není");
      return found;
    });
    expect(fireEvent.keyDown(cell, { key: "Enter" })).toBe(false);
    const input = cell.querySelector("input")!;
    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });

  it("DocumentForm uvnitř RecordDialog: Enter v buňce řádků neodešle formulář", async () => {
    const submit = mock(() => {});
    const value = {
      bookId: "fp",
      number: "FP1",
      accountingDate: "2026-09-29",
      currency: "CZK",
      amountTotal: 10,
      totalMode: "entered" as const,
      mainAccountId: "321001",
    };
    const view = render(
      <RecordDialog open onOpenChange={() => {}} title="Doklad" onSubmit={submit}>
        <TooltipProvider>
          <DocumentForm
            title="FP"
            status="draft"
            documentType="FP"
            value={value}
            onChange={() => {}}
            lines={[{ id: "d1", debitAccount: "518001", creditAccount: "321001", amount: 10 }]}
            onLinesChange={() => {}}
            books={[]}
            accounts={[]}
            currencies={[{ code: "CZK", label: "Koruna", symbol: "Kč" }]}
            homeCurrency="CZK"
            homeCurrencySymbol="Kč"
            mainSide="D"
          />
        </TooltipProvider>
      </RecordDialog>,
    );
    const cell = await waitFor(() => {
      const found = view.baseElement.querySelector<HTMLElement>('[data-cell-key="d1:amount"]');
      if (!found) throw new Error("buňka ještě není");
      return found;
    });
    expect(fireEvent.keyDown(cell, { key: "Enter" })).toBe(false);
    expect(fireEvent.keyDown(cell.querySelector("input")!, { key: "Enter" })).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });
});
