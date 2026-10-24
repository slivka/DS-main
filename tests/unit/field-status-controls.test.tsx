/** Vlastní stavy prvků bez místa pro ikonu uvnitř a přidání zakázky v buňce. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SegmentedField } from "../../src/components/ds/form/segmented-field";
import { ToggleGroup, ToggleGroupItem } from "../../src/components/ui/toggle-group";
import { Textarea } from "../../src/components/ui/textarea";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { JournalCellEditor } from "../../src/components/ds/accounting/JournalCellEditor";
import { JournalEditorContext } from "../../src/components/ds/accounting/journal-editor-context";
import { useJournalEditorState } from "../../src/components/ds/accounting/useJournalEditorState";
import { useJournalKeyboard } from "../../src/components/ds/accounting/useJournalKeyboard";

afterEach(cleanup);
for (const kind of ["segmented", "toggle", "textarea"] as const) {
  test(`${kind}: chyba před varováním, popisek a přístupná bublina`, async () => {
    const status = { error: "Povinná hodnota", warning: "Upozornění", label: "Volba" };
    const view = render(
      <TooltipProvider>
        {kind === "segmented" ? (
          <SegmentedField
            {...status}
            value="a"
            onChange={() => {}}
            options={[{ value: "a", label: "A" }]}
          />
        ) : kind === "toggle" ? (
          <ToggleGroup {...status} type="single" value="a">
            <ToggleGroupItem value="a">A</ToggleGroupItem>
          </ToggleGroup>
        ) : (
          <Textarea {...status} id="note" />
        )}
      </TooltipProvider>,
    );
    const control = view.container.querySelector<HTMLElement>('[aria-invalid="true"]');
    expect(control).toBeTruthy();
    const id = control?.getAttribute("aria-describedby");
    expect(document.getElementById(id ?? "")?.textContent).toBe("Povinná hodnota");
    const icon = view.getByRole("img", { name: "Povinná hodnota" });
    expect(icon.getAttribute("data-placement")).toBe("label");
    fireEvent.focus(icon);
    await waitFor(() => expect(view.getAllByText("Povinná hodnota").length).toBeGreaterThan(1));
    fireEvent.click(icon);
    expect(view.queryByText("Upozornění")).toBeNull();
  });
}

test("JournalCellEditor: ＋ zakázky předá aktuální hledaný text", async () => {
  const created: string[] = [];
  function Cell() {
    const line = { id: "cell", debitAccount: "518001", text: "A", amount: 1 };
    const editor = useJournalEditorState(
      {
        accounts: [{ code: "518001", name: "Služby", category: "ekonomicka_kategorie" }],
        categoryBySide: false,
        lines: [line],
        onChange: () => {},
        documentCurrency: "CZK",
        homeCurrency: "CZK",
        dimensions: [],
        onCreateDimension: (text) => {
          created.push(text);
        },
      },
      null,
    );
    const keyboard = useJournalKeyboard(editor);
    return (
      <JournalEditorContext.Provider value={{ editor, keyboard }}>
        <JournalCellEditor line={line} column="dimensionId" />
      </JournalEditorContext.Provider>
    );
  }
  const view = render(
    <TooltipProvider>
      <Cell />
    </TooltipProvider>,
  );
  const search = await waitFor(() => {
    const node = document.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!node) throw new Error("Hledání zatím není otevřené");
    return node;
  });
  fireEvent.change(search, { target: { value: "Zakázka Z99" } });
  fireEvent.click(await view.findByRole("button", { name: "Nová kategorie" }));
  expect(created).toEqual(["Zakázka Z99"]);
});
