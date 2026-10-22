import { afterEach, describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { LinkedRecordsPanel } from "../../src/components/ds/data-display/linked-records-panel";
import { SettlementBar } from "../../src/components/ds/data-display/settlement-bar";
import { LinkRecordDialog } from "../../src/components/ds/data-display/link-record-dialog";
import { DS_TEXTS_CS, DS_TEXTS_SK } from "../../src/ds-texts";
import type {
  LinkedRecordItem,
  LinkedRecordsMode,
} from "../../src/components/ds/data-display/linked-record-types";
afterEach(cleanup);
const item: LinkedRecordItem = {
  id: "one",
  number: "BA 1",
  at: "2026-10-20",
  amount: "8 000,00",
  currency: "Kč",
  removable: true,
};
const open = mock();
const remove = mock();
function Panel({
  blocked = false,
  reason = false,
  confirmUnlink = true,
}: {
  blocked?: boolean;
  reason?: boolean;
  confirmUnlink?: boolean;
}) {
  const [mode, setMode] = useState<LinkedRecordsMode>("list");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  return (
    <TooltipProvider>
      <LinkedRecordsPanel
        groups={[
          { id: "empty", label: "Prázdná skupina", items: [] },
          {
            id: "payments",
            label: "Úhrady",
            items: [
              { ...item, removable: !blocked, removeDisabledReason: "Úhrada je zaúčtovaná." },
            ],
          },
        ]}
        mode={mode}
        onModeChange={setMode}
        collapsedGroups={collapsed}
        onCollapsedGroupsChange={setCollapsed}
        onOpen={open}
        onRemove={remove}
        unlinkReason={reason ? { required: true } : undefined}
        confirmUnlink={confirmUnlink}
      />
    </TooltipProvider>
  );
}
describe("Propojené záznamy", () => {
  it("vypořádání oddělí měny a respektuje progres a zúčtovací label", () => {
    render(
      <SettlementBar
        rows={[
          {
            id: "cz",
            label: "Uhrazeno",
            settled: "8 000,00",
            total: "12 100,00",
            remaining: "4 100,00",
            currency: "Kč",
            progress: 66,
          },
          {
            id: "eur",
            label: "Zúčtováno",
            settled: "300,00",
            total: "500,00",
            remaining: "200,00",
            currency: "€",
            progress: 60,
          },
        ]}
      />,
    );
    expect(
      screen.getAllByRole("progressbar").map((bar) => bar.getAttribute("aria-valuenow")),
    ).toEqual(["66", "60"]);
    expect(screen.getByText("Uhrazeno 8 000,00 z 12 100,00 Kč – zbývá 4 100,00")).toBeTruthy();
    expect(screen.getByText("Zúčtováno 300,00 z 500,00 € – zbývá 200,00")).toBeTruthy();
  });
  it("sbalení skupiny je řízené, prázdná skupina se nezobrazuje", () => {
    render(<Panel />);
    expect(screen.queryByText("Prázdná skupina")).toBeNull();
    const group = screen.getByRole("button", { name: "Úhrady 1 vazba" });
    fireEvent.click(group);
    expect(group.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: /BA 1/ })).toBeNull();
    fireEvent.click(group);
    expect(screen.getByRole("button", { name: /BA 1/ })).toBeTruthy();
  });
  it("zakázané odebrání vysvětlí důvod a nespustí callback", async () => {
    remove.mockClear();
    render(<Panel blocked />);
    fireEvent.click(screen.getByRole("button", { name: "Odebrat" }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(screen.getAllByText("Úhrada je zaúčtovaná.").length).toBeGreaterThan(0);
    expect(remove).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
  it("povolené odebrání vyžaduje potvrzení", () => {
    remove.mockClear();
    render(<Panel />);
    fireEvent.click(screen.getByRole("button", { name: "Odebrat" }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Odebrat" }),
    );
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it("jediný dialog vyžaduje důvod a Esc jej zruší bez dalšího potvrzení", async () => {
    remove.mockClear();
    render(<Panel reason />);
    fireEvent.click(screen.getByRole("button", { name: "Odebrat" }));
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByRole("button", { name: "Odebrat" }).hasAttribute("disabled")).toBe(
      true,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Důvod odebrání" }), {
      target: { value: "  " },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Odebrat" }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "Důvod odebrání" }), {
      target: { value: "Chybné přiřazení" },
    });
    fireEvent.keyDown(dialog, { key: "Escape" });
    await act(async () => {});
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(remove).not.toHaveBeenCalled();
  });
  it("vlastní potvrzení aplikace neotevře žádný DS dialog", () => {
    remove.mockClear();
    render(<Panel confirmUnlink={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Odebrat" }));
    expect(remove).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
  it("onUnlink dostane oříznutý důvod právě jednou", () => {
    const unlink = mock();
    render(
      <TooltipProvider>
        <LinkedRecordsPanel
          groups={[{ id: "g", label: "Vazby", items: [item] }]}
          mode="list"
          onModeChange={() => {}}
          collapsedGroups={[]}
          onCollapsedGroupsChange={() => {}}
          onOpen={open}
          onUnlink={unlink}
          unlinkReason={{}}
        />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Odebrat" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Důvod odebrání" }), {
      target: { value: " Oprava " },
    });
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Odebrat" }),
    );
    expect(unlink).toHaveBeenCalledTimes(1);
    expect(unlink).toHaveBeenCalledWith(item, "Oprava");
  });
  it("klik otevře sousední panel, Ctrl i Cmd nahrazuje", () => {
    open.mockClear();
    render(<Panel />);
    const record = screen.getByRole("button", { name: /BA 1/ });
    fireEvent.click(record);
    fireEvent.click(record, { ctrlKey: true });
    fireEvent.click(record, { metaKey: true });
    expect(open.mock.calls.map((call) => call[1].target)).toEqual([
      "adjacentPane",
      "replace",
      "replace",
    ]);
  });
  it("tok je přepínatelný, seřazený podle data a označuje aktuální záznam", () => {
    const ui = render(
      <TooltipProvider>
        <LinkedRecordsPanel
          groups={[
            {
              id: "g",
              label: "Doklady",
              items: [item, { id: "older", number: "Záloha", at: "2026-10-10", current: true }],
            },
          ]}
          mode="flow"
          onModeChange={open}
          collapsedGroups={[]}
          onCollapsedGroupsChange={open}
          onOpen={open}
        />
      </TooltipProvider>,
    );
    const records = within(screen.getByRole("list", { name: "Tok dokladů" })).getAllByRole(
      "button",
    );
    expect(records[0].textContent).toContain("Záloha");
    expect(records[0].getAttribute("aria-current")).toBe("true");
    ui.unmount();
    render(<Panel />);
    fireEvent.click(screen.getByRole("button", { name: "Tok dokladů" }));
    expect(screen.getByRole("list", { name: "Tok dokladů" })).toBeTruthy();
  });
  it("CS a SK skloňují 1, 3 a 5 vazeb", () => {
    expect([1, 3, 5].map(DS_TEXTS_CS.linkedRecords.count)).toEqual([
      "1 vazba",
      "3 vazby",
      "5 vazeb",
    ]);
    expect([1, 3, 5].map(DS_TEXTS_SK.linkedRecords.count)).toEqual([
      "1 väzba",
      "3 väzby",
      "5 väzieb",
    ]);
  });
});
function Dialog({
  save = mock(),
  search = async () => [item],
}: {
  save?: (value: unknown) => void | Promise<void>;
  search?: (query: string) => Promise<LinkedRecordItem[]>;
}) {
  return (
    <TooltipProvider>
      <LinkRecordDialog
        open
        onOpenChange={open}
        candidates={[item]}
        relationTypes={[{ value: "manual", label: "Ruční vazba" }]}
        onSearch={search}
        onSave={save}
      />
    </TooltipProvider>
  );
}
async function selectCandidate() {
  fireEvent.click(screen.getByRole("button", { name: /BA 1/ }));
  fireEvent.click(screen.getByRole("combobox", { name: "Typ vazby" }));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  fireEvent.click(screen.getByRole("option", { name: "Ruční vazba" }));
}
describe("LinkRecordDialog", () => {
  it("uloží kandidáta, typ vazby a poznámku", async () => {
    const save = mock();
    open.mockClear();
    render(<Dialog save={save} />);
    await selectCandidate();
    fireEvent.change(screen.getByRole("textbox", { name: "Poznámka" }), {
      target: { value: "Dohoda" },
    });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Uložit" })));
    expect(save).toHaveBeenCalledWith({ record: item, relationType: "manual", note: "Dohoda" });
    expect(open).toHaveBeenCalledWith(false);
  });
  it("při chybě uložení nezavře a zachová výběr", async () => {
    open.mockClear();
    render(
      <Dialog
        save={async () => {
          throw new Error("save");
        }}
      />,
    );
    await selectCandidate();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Uložit" })));
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText("Vazbu se nepodařilo uložit.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /BA 1/ }).getAttribute("aria-pressed")).toBe("true");
  });
  it("zrušení rozpracované vazby vyžaduje ochranu změn", () => {
    open.mockClear();
    render(<Dialog />);
    fireEvent.click(screen.getByRole("button", { name: /BA 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Zrušit" }));
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });
  it("opožděná odpověď nepřepíše novější hledání", async () => {
    let resolveOld: ((items: LinkedRecordItem[]) => void) | undefined;
    render(
      <Dialog
        search={(query) =>
          query === "old"
            ? new Promise((resolve) => {
                resolveOld = resolve;
              })
            : Promise.resolve([{ ...item, id: "new", number: "NOVÝ" }])
        }
      />,
    );
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "old" } });
    await act(async () => fireEvent.change(input, { target: { value: "new" } }));
    await act(async () => resolveOld?.([{ ...item, number: "STARÝ" }]));
    expect(screen.getByRole("button", { name: /NOVÝ/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /STARÝ/ })).toBeNull();
  });
});
