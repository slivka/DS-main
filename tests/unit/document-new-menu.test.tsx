import { afterEach, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { DocumentNewMenu } from "../../src/components/ds/templates/document-new-menu";
afterEach(cleanup);

test("dvě pokladní tlačítka mají nezávislý hlavní klik a nabídku", () => {
  const income = mock();
  const expense = mock();
  const blank = mock();
  const manage = mock();
  render(
    <>
      <DocumentNewMenu
        label="Příjem"
        icon={<span aria-hidden="true">+</span>}
        templates={[]}
        onBlank={blank}
        onPrimary={income}
        onTemplate={() => {}}
        onManage={manage}
      />
      <DocumentNewMenu
        label="Výdaj"
        icon={<span aria-hidden="true">−</span>}
        templates={[]}
        onBlank={blank}
        onPrimary={expense}
        onTemplate={() => {}}
        onManage={manage}
      />
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Příjem" }));
  expect(income).toHaveBeenCalledTimes(1);
  expect(expense).not.toHaveBeenCalled();
  expect(screen.queryByRole("menu")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Výdaj" }));
  expect(expense).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(screen.getByRole("button", { name: "Další možnosti – Příjem" }), { key: "Enter" });
  fireEvent.click(
    within(screen.getByRole("menu")).getByRole("menuitem", { name: "Spravovat vzory" }),
  );
  expect(manage).toHaveBeenCalledTimes(1);
  expect(income).toHaveBeenCalledTimes(1);
});

test("původní Nový otevře nabídku a prázdný doklad až po výběru", () => {
  const blank = mock();
  render(
    <DocumentNewMenu templates={[]} onBlank={blank} onTemplate={() => {}} onManage={() => {}} />,
  );
  fireEvent.keyDown(screen.getByRole("button", { name: "Nový" }), { key: "Enter" });
  expect(blank).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("menuitem", { name: "Prázdný doklad" }));
  expect(blank).toHaveBeenCalledTimes(1);
});
