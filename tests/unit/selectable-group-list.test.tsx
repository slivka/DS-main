import { afterEach, expect, it } from "bun:test";
import * as React from "react";
const { render, cleanup, fireEvent } = await import("@testing-library/react");
const { SelectableGroupList } =
  await import("../../src/components/ds/data-display/selectable-group-list");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
afterEach(cleanup);
const groups = [
  {
    id: "g",
    title: "Kniha",
    items: [
      { id: "a", title: "První", severity: "ok" as const },
      { id: "b", title: "Druhý", severity: "error" as const, disabledReason: "Nesouhlasí" },
      { id: "c", title: "Třetí", severity: "warning" as const },
    ],
  },
];
function Example() {
  const [active, setActive] = React.useState("a");
  const [checked, setChecked] = React.useState<string[]>([]);
  return (
    <TooltipProvider>
      <SelectableGroupList
        groups={groups}
        activeId={active}
        onActiveChange={setActive}
        checkedIds={checked}
        onCheckedChange={setChecked}
      />
      <output>{checked.join(",")}</output>
    </TooltipProvider>
  );
}
it("aktivní detail nemění zaškrtnutí; chyba nejde zaškrtnout", () => {
  const view = render(<Example />);
  fireEvent.click(view.getByRole("button", { name: "Druhý" }));
  expect(view.getByRole("button", { name: "Druhý" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(view.getByRole("checkbox", { name: "Druhý" }));
  expect(view.container.querySelector("output")?.textContent).toBe("");
  fireEvent.click(view.getByRole("button", { name: "Vybrat vše bez chyb" }));
  expect(view.container.querySelector("output")?.textContent).toBe("a,c");
});
it("seznam odděluje aktivní detail a přístupné zaškrtnutí s důvodem", () => {
  const view = render(<Example />);
  const first = view.getByRole("button", { name: "První" });
  expect(first.getAttribute("aria-pressed")).toBe("true");
  expect(view.getByRole("checkbox", { name: "První" }).getAttribute("aria-checked")).toBe("false");
  fireEvent.keyDown(first, { key: " " });
  expect(view.getByRole("checkbox", { name: "První" }).getAttribute("aria-checked")).toBe("true");
  expect(view.getByRole("list", { name: "Kniha" })).toBeTruthy();
  const blocked = view.getByRole("checkbox", { name: "Druhý" });
  expect(blocked.getAttribute("aria-disabled")).toBe("true");
  const reasonId = blocked.getAttribute("aria-describedby");
  expect(reasonId ? document.getElementById(reasonId)?.textContent : null).toBe("Nesouhlasí");
  expect(view.getByRole("checkbox", { name: "První" }).tabIndex).toBe(0);
  expect(view.queryByRole("listbox")).toBeNull();
});
it("šipky a Home/End posouvají detail, mezerník zaškrtává bez záměny", () => {
  const view = render(<Example />);
  const first = view.getByRole("button", { name: "První" });
  first.focus();
  fireEvent.keyDown(first, { key: "ArrowDown" });
  const second = view.getByRole("button", { name: "Druhý" });
  expect(document.activeElement).toBe(second);
  fireEvent.keyDown(second, { key: " " });
  expect(view.container.querySelector("output")?.textContent).toBe("");
  fireEvent.keyDown(second, { key: "End" });
  const third = view.getByRole("button", { name: "Třetí" });
  expect(document.activeElement).toBe(third);
  fireEvent.keyDown(third, { key: " " });
  expect(view.container.querySelector("output")?.textContent).toBe("c");
  fireEvent.keyDown(third, { key: "Home" });
  expect(document.activeElement).toBe(first);
});
