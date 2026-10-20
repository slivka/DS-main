/** Hledání v poli · ověřuje nové hledání a výslovné potvrzení hodnoty. */
import { afterEach, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { OptionSelect } from "../../src/components/ds/form/option-select";
import { PartnerSelect } from "../../src/components/ds/accounting/partner-select";
import { AccountSelect } from "../../src/components/ds/accounting/account-select";
afterEach(cleanup);
for (const value of ["", "0008"]) {
  test(`KS ${value || "prázdný"}: první znak otevře pole, Escape zachová hodnotu`, async () => {
    const change = mock();
    const view = render(
      <OptionSelect
        value={value}
        onChange={change}
        searchable
        options={[
          { value: "0008", label: "0008 – Zboží" },
          { value: "0308", label: "0308 – Služby" },
        ]}
      />,
    );
    const trigger = view.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "0" });
    const input = await waitFor(() =>
      view.container.querySelector<HTMLInputElement>("[cmdk-input]"),
    );
    expect(input?.value).toBe("0");
    if (!input) throw new Error("Chybí hledání v poli");
    fireEvent.change(input, { target: { value: "0308" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(change).not.toHaveBeenCalled();
    expect(view.container.querySelector("[cmdk-input]")).toBeNull();
    fireEvent.keyDown(trigger, { key: "Backspace" });
    fireEvent.keyDown(trigger, { key: "Delete" });
    expect(change).not.toHaveBeenCalled();
  });
}
test("partner: psaní a přidání předají nové IČO, Tab nevybere", async () => {
  const change = mock();
  const create = mock();
  const view = render(
    <PartnerSelect
      partners={[{ id: "p", name: "Původní" }]}
      value="p"
      onChange={change}
      onCreate={create}
    />,
  );
  const trigger = view.getByRole("combobox");
  fireEvent.keyDown(trigger, { key: "1" });
  const input = await waitFor(() => view.container.querySelector<HTMLInputElement>("[cmdk-input]"));
  if (!input) throw new Error("Chybí hledání");
  fireEvent.change(input, { target: { value: "12345678" } });
  fireEvent.click(view.getByRole("button", { name: "Nový partner" }));
  expect(create).toHaveBeenCalledWith("12345678");
  fireEvent.keyDown(trigger, { key: "P" });
  const nextInput = await waitFor(() =>
    view.container.querySelector<HTMLInputElement>("[cmdk-input]"),
  );
  if (!nextInput) throw new Error("Chybí opakované hledání");
  fireEvent.keyDown(nextInput, { key: "Tab" });
  expect(change).not.toHaveBeenCalled();
});
test("účet: diakritika přes compositionend se píše přímo do pole", async () => {
  const change = mock();
  const view = render(
    <AccountSelect
      accounts={[{ code: "221001", name: "Český účet" }]}
      value="221001"
      onChange={change}
    />,
  );
  const composition = new Event("compositionend", { bubbles: true });
  Object.defineProperty(composition, "data", { value: "č" });
  fireEvent(view.getByRole("combobox"), composition);
  const input = await waitFor(() => view.container.querySelector<HTMLInputElement>("[cmdk-input]"));
  expect(input?.value).toBe("č");
  expect(change).not.toHaveBeenCalled();
});
test("mezerník otevře nabídku s prázdným dotazem", async () => {
  const view = render(
    <OptionSelect
      value=""
      onChange={mock()}
      searchable
      options={[{ value: "0008", label: "0008 – Zboží" }]}
    />,
  );
  const trigger = view.getByRole("combobox");
  fireEvent.keyDown(trigger, { key: " " });
  fireEvent.click(trigger);
  const input = await waitFor(() => {
    const node = view.container.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!node) throw new Error("Nabídka neotevřena");
    return node;
  });
  expect(input.value).toBe("");
});
