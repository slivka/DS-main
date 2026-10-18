/** Zablokované akce s důvodem · klik a text důvodu · nesmí testovat zdrojový text. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { RecordActionBar } from "../../src/components/ds/layout/record-action-bar";
import { GridAddActions } from "../../src/components/ds/grid/grid-add-actions";
import { GridToolbarOverflowContext } from "../../src/components/ds/grid/grid-toolbar-context";

afterEach(cleanup);
const REASON = "Období je uzavřené";

test("RecordActionBar: zablokované Uložit s důvodem je fokusovatelné, klik ukáže důvod", async () => {
  const log: string[] = [];
  const view = render(
    <RecordActionBar
      saveAction={{ onSave: () => log.push("save"), disabled: true, disabledReason: REASON }}
      primaryAction={{ label: "Zařadit", onClick: () => log.push("p"), disabled: true }}
    />,
  );
  const save = view.getByRole("button", { name: "Uložit" });
  expect(save.hasAttribute("disabled")).toBe(false);
  expect(save.getAttribute("aria-disabled")).toBe("true");
  expect(save.getAttribute("aria-describedby")).toBeTruthy();
  fireEvent.click(save);
  expect(log).toEqual([]);
  await waitFor(() => expect(view.getAllByText(REASON).length).toBeGreaterThan(1));
  // Bez důvodu zůstává nativně disabled.
  expect(view.getByRole("button", { name: "Zařadit" }).hasAttribute("disabled")).toBe(true);
});

test("RecordActionBar: zablokovaná položka dalších akcí ukazuje důvod v textu", async () => {
  const log: string[] = [];
  const view = render(
    <RecordActionBar
      moreActions={[
        {
          id: "x",
          label: "Stornovat",
          onClick: () => log.push("x"),
          disabled: true,
          disabledReason: REASON,
        },
      ]}
    />,
  );
  fireEvent.keyDown(view.getByRole("button", { name: "Další akce" }), { key: "Enter" });
  const item = await view.findByRole("menuitem", { name: "Stornovat", exact: true });
  expect(item.getAttribute("aria-disabled")).toBe("true");
  expect(item.textContent).toContain(REASON);
  fireEvent.click(item);
  expect(log).toEqual([]);
});

test("GridAddActions: zablokovaná primární akce s důvodem se nespustí a ukáže důvod", async () => {
  const log: string[] = [];
  const view = render(
    <GridAddActions
      actions={{
        label: "Nový",
        onClick: () => log.push("n"),
        disabled: true,
        disabledReason: REASON,
      }}
    />,
  );
  const button = view.getByRole("button", { name: "Nový (N)" });
  expect(button.hasAttribute("disabled")).toBe(false);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(button);
  expect(log).toEqual([]);
  await waitFor(() => expect(view.getAllByText(REASON).length).toBeGreaterThan(1));
});

test("GridAddActions „+ ▾“: zablokovaná položka má důvod jako druhý řádek bez tooltipu", async () => {
  const log: string[] = [];
  const view = render(
    <GridToolbarOverflowContext.Provider value={3}>
      <GridAddActions
        actions={[
          {
            label: "Nový příjem",
            shortLabel: "Příjem",
            onClick: () => log.push("in"),
            disabled: true,
            disabledReason: REASON,
          },
          { label: "Nový výdaj", shortLabel: "Výdaj", onClick: () => log.push("out") },
        ]}
      />
    </GridToolbarOverflowContext.Provider>,
  );
  fireEvent.keyDown(view.getByRole("button", { name: "Nový – vyberte druh" }), { key: "Enter" });
  const item = await view.findByRole("menuitem", { name: "Příjem", exact: true });
  const reason = item.querySelector('[data-slot="disabled-reason-text"]');
  expect(reason?.textContent).toBe(REASON);
  expect(item.getAttribute("aria-describedby")).toBe(reason?.id ?? "");
  fireEvent.click(item);
  expect(log).toEqual([]);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
