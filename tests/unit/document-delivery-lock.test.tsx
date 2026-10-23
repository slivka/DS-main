/** Zámek dodání · ověřuje oddělení od odběratele · bez ukládání APP. */
import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render } from "@testing-library/react";
import { DocumentCounterpartyTab } from "../../src/components/ds/accounting/document-detail-tabs";
import type { DocumentCounterpartyValue } from "../../src/components/ds/accounting/document-detail-tabs";

const value: DocumentCounterpartyValue = {
  name: "Odběratel",
  ico: "12345678",
  dic: "CZ12345678",
  email: "",
  street: "Hlavní",
  house_number: "1",
  zip: "11000",
  city: "Praha",
  country: "CZ",
  delivery: {
    name: "Sklad",
    contact: "Vedoucí",
    street: "Vedlejší",
    house_number: "2",
    zip: "11000",
    city: "Praha",
    country: "CZ",
  },
};

describe("DocumentCounterpartyTab – zámek dodání", () => {
  it("bez nové volby dodání přebírá zámek odběratele", () => {
    const view = render(
      <DocumentCounterpartyTab value={value} onChange={() => {}} counterpartyLocked />,
    );
    const input = view.getByDisplayValue("Sklad") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect((view.getByRole("checkbox") as HTMLButtonElement).disabled).toBe(true);
    expect(view.queryByDisplayValue("Odběratel")).toBeNull();
  });

  it("false povolí změnu dodání bez odemčení odběratele", () => {
    const change = mock();
    const view = render(
      <DocumentCounterpartyTab
        value={value}
        onChange={change}
        counterpartyLocked
        deliveryReadOnly={false}
      />,
    );
    const input = view.getByDisplayValue("Sklad") as HTMLInputElement;
    expect(input.readOnly).toBe(false);
    expect(view.queryByDisplayValue("Odběratel")).toBeNull();
    fireEvent.change(input, { target: { value: "Nový sklad" } });
    expect(change).toHaveBeenCalledWith({
      ...value,
      delivery: { ...value.delivery, name: "Nový sklad" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    expect(change).toHaveBeenLastCalledWith({ ...value, delivery: null });
  });

  it("true zamkne pouze dodání i při odemčeném odběrateli", () => {
    const view = render(
      <DocumentCounterpartyTab value={value} onChange={() => {}} deliveryReadOnly />,
    );
    expect((view.getByDisplayValue("Odběratel") as HTMLInputElement).readOnly).toBe(false);
    expect((view.getByDisplayValue("Sklad") as HTMLInputElement).readOnly).toBe(true);
  });

  it("celkové readOnly má přednost před false", () => {
    const change = mock();
    const view = render(
      <DocumentCounterpartyTab
        value={value}
        onChange={change}
        readOnly
        deliveryReadOnly={false}
      />,
    );
    expect((view.getByDisplayValue("Sklad") as HTMLInputElement).readOnly).toBe(true);
    fireEvent.click(view.getByRole("checkbox"));
    expect(change).not.toHaveBeenCalled();
  });
});