/** Testy chování DS 2.85.0: výběry KS, účtu firmy a přidání účtu partnera. */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { act, cleanup, fireEvent, render } = await import("@testing-library/react");
const { BankAccountField } = await import("../../src/components/ds/accounting/bank-account-field");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");

afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

/** Otevře výběr kliknutím na spouštěč a klikne na položku podle názvu. */
async function pick(view: ReturnType<typeof render>, trigger: Element, name: string | RegExp) {
  fireEvent.click(trigger);
  const option = await view.findByRole("option", { name });
  await act(async () => fireEvent.click(option));
}

function IssuedForm({ onValue }: { onValue: (v: Record<string, unknown>) => void }) {
  const [value, setValue] = React.useState<Record<string, unknown>>({
    currency: "CZK",
    amountTotal: 1000,
    totalMode: "entered",
  });
  return (
    <DocumentForm
      title="FV"
      status="draft"
      documentType="FV"
      value={value}
      onChange={(next) => {
        setValue(next as Record<string, unknown>);
        onValue(next as Record<string, unknown>);
      }}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      homeCurrency="CZK"
      constantSymbolOptions={[{ value: "0308", label: "0308 – Platby za služby" }]}
      companyBankAccountOptions={[
        { id: "company-1", label: "Hlavní", account: "123/0100", currency: "CZK" },
      ]}
    />
  );
}

describe("DS 2.85.0 – chování výběrů", () => {
  it("výběr účtu firmy zapíše companyBankAccountId", async () => {
    const onValue = mock();
    const view = render(<IssuedForm onValue={onValue} />);
    const trigger = view.container.querySelector("#document-companyBankAccountId");
    expect(trigger).toBeTruthy();
    await pick(view, trigger as Element, /Hlavní · 123\/0100 · CZK/);
    expect(onValue.mock.calls.at(-1)?.[0]).toMatchObject({ companyBankAccountId: "company-1" });
  });

  it("KS z číselníku zobrazí „0308 – Platby za služby“ a zapíše kód", async () => {
    const onValue = mock();
    const view = render(<IssuedForm onValue={onValue} />);
    const trigger = view.container.querySelector("#document-constantSymbol");
    expect(trigger?.getAttribute("role")).toBe("combobox");
    await pick(view, trigger as Element, "0308 – Platby za služby");
    expect(onValue.mock.calls.at(-1)?.[0]).toMatchObject({ constantSymbol: "0308" });
    expect(trigger?.textContent).toContain("0308 – Platby za služby");
  });

  it("klik na „Přidat účet…“ zavolá onAddAccount i bez položek", async () => {
    const onAddAccount = mock();
    const onChange = mock();
    const view = render(
      <BankAccountField
        value=""
        onChange={onChange}
        options={[]}
        selectionOnly
        onAddAccount={onAddAccount}
      />,
    );
    await pick(view, view.getByRole("combobox"), "Přidat účet…");
    expect(onAddAccount).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
