/** Hledání v poli · výběr položky myší (regrese 2.113.0, oprava 2.113.1). */
import { afterEach, expect, mock, test } from "bun:test";
import type { ReactElement } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { OptionSelect } from "../../src/components/ds/form/option-select";
import { MultiSelect } from "../../src/components/ds/form/multi-select";
import { PartnerSelect } from "../../src/components/ds/accounting/partner-select";
import { AccountSelect } from "../../src/components/ds/accounting/account-select";
import { BankAccountField } from "../../src/components/ds/accounting/bank-account-field";

afterEach(cleanup);

/** Otevře výběr kliknutím a klikne myší na položku s textem jako skutečný prohlížeč. */
async function clickItem(view: ReturnType<typeof render>, text: string) {
  fireEvent.click(view.getByRole("combobox"));
  const input = await waitFor(() => {
    const node = view.baseElement.querySelector<HTMLInputElement>("[cmdk-input]");
    if (!node) throw new Error("Nabídka neotevřena");
    return node;
  });
  const item = Array.from(view.baseElement.querySelectorAll<HTMLElement>("[cmdk-item]")).find(
    (node) => node.textContent?.includes(text),
  );
  if (!item) throw new Error(`Chybí položka ${text}`);
  // Nezrušený mousedown by v prohlížeči vzal vstupu fokus (relatedTarget null) a zavřel nabídku.
  const kept = !fireEvent.mouseDown(item);
  if (!kept) fireEvent.blur(input, { relatedTarget: null });
  expect(kept).toBe(true);
  fireEvent.click(item);
}

async function expectClosedOnTrigger(view: ReturnType<typeof render>) {
  await waitFor(() => expect(view.baseElement.querySelector("[cmdk-input]")).toBeNull());
  const trigger = view.baseElement.querySelector("button[role=combobox]");
  await waitFor(() => expect(document.activeElement).toBe(trigger));
}

const single: [string, (change: ReturnType<typeof mock>) => ReactElement, string, unknown][] = [
  [
    "OptionSelect searchable (KS)",
    (change) => (
      <OptionSelect
        value=""
        onChange={change}
        searchable
        options={[
          { value: "0008", label: "0008 – Zboží" },
          { value: "0308", label: "0308 – Služby" },
        ]}
      />
    ),
    "0308",
    "0308",
  ],
  [
    "PartnerSelect",
    (change) => (
      <PartnerSelect
        partners={[
          { id: "a", name: "Alfa" },
          { id: "b", name: "Beta" },
        ]}
        value="a"
        onChange={change}
      />
    ),
    "Beta",
    "b",
  ],
  [
    "AccountSelect",
    (change) => (
      <AccountSelect
        accounts={[
          { code: "221001", name: "Banka" },
          { code: "211001", name: "Pokladna" },
        ]}
        value="221001"
        onChange={change}
      />
    ),
    "Pokladna",
    "211001",
  ],
  [
    "výběr bankovního účtu",
    (change) => (
      <BankAccountField
        value=""
        onChange={change}
        selectionOnly
        options={[
          { id: "u1", number: "123456789", bankCode: "0100" },
          { id: "u2", number: "987654321", bankCode: "0800" },
        ]}
      />
    ),
    "987654321",
    "u2",
  ],
];

for (const [name, make, text, expected] of single) {
  test(`${name}: klik myší na položku vybere hodnotu a vrátí fokus na pole`, async () => {
    const change = mock();
    const view = render(make(change));
    await clickItem(view, text);
    expect(change).toHaveBeenCalled();
    expect(change.mock.calls.at(-1)?.[0]).toEqual(expected);
    await expectClosedOnTrigger(view);
  });
}

test("MultiSelect: klik myší přidá položku a nabídka zůstane otevřená", async () => {
  const change = mock();
  const view = render(
    <MultiSelect
      options={[
        { value: "a", label: "Alfa" },
        { value: "b", label: "Beta" },
      ]}
      selected={[]}
      onChange={change}
    />,
  );
  await clickItem(view, "Beta");
  expect(change).toHaveBeenCalledWith(["b"]);
  expect(view.baseElement.querySelector("[cmdk-input]")).not.toBeNull();
});
