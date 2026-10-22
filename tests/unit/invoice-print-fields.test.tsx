import { describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  DocumentDeliveryFields,
  type DocumentDeliveryValue,
} from "../../src/components/ds/accounting/document-delivery-fields";
import { DocumentPrintTab } from "../../src/components/ds/accounting/document-print-tab";
import { documentFieldsForType } from "../../src/components/ds/accounting/document-fields";
import type { DocumentPrintValue } from "../../src/components/ds/accounting/document-print-fields";
const value: DocumentPrintValue = {
  options: {
    showPaymentSchedule: true,
    showAdvanceDetail: true,
    showQr: true,
    showSignature: false,
    showIssuedBy: true,
  },
  headerText: "",
  footerText: "",
  note: "",
  issuedByName: "",
  issuedByPhone: "",
  issuedByEmail: "",
};
describe("DocumentPrintTab", () => {
  it("předlohu načte až po potvrzení", () => {
    const load = mock(() => {});
    const v = render(
      <DocumentPrintTab value={value} onChange={() => {}} onReloadFromBook={load} />,
    );
    fireEvent.click(v.getByRole("button", { name: "Načíst z knihy" }));
    expect(load).not.toHaveBeenCalled();
    fireEvent.click(v.getByRole("button", { name: "Potvrdit", exact: true }));
    expect(load).toHaveBeenCalledTimes(1);
  });
  it("zrušení ponechá tiskové údaje", () => {
    const load = mock(() => {});
    const v = render(
      <DocumentPrintTab value={value} onChange={() => {}} onReloadFromBook={load} />,
    );
    fireEvent.click(v.getByRole("button", { name: "Načíst z knihy" }));
    fireEvent.click(v.getByRole("button", { name: "Zrušit", exact: true }));
    expect(load).not.toHaveBeenCalled();
  });
  it("pouze čtení nepovolí načtení předlohy", () => {
    const v = render(
      <DocumentPrintTab value={value} onChange={() => {}} readOnly onReloadFromBook={() => {}} />,
    );
    expect(v.queryByRole("button", { name: "Načíst z knihy" })).toBeNull();
  });
});
describe("DocumentDeliveryFields", () => {
  it("vypnutí vymaže adresu a nové zapnutí je prázdné", () => {
    const changes = mock(() => {});
    function Form() {
      const [value, setValue] = useState<DocumentDeliveryValue | null>({
        name: "Stavba",
        contact: "Petr",
        street: "Ulice",
        city: "Praha",
      });
      return (
        <DocumentDeliveryFields
          value={value}
          onChange={(v) => {
            changes(v);
            setValue(v);
          }}
        />
      );
    }
    const v = render(<Form />);
    fireEvent.click(v.getByRole("checkbox", { name: "Jiná dodací adresa" }));
    expect(changes).toHaveBeenLastCalledWith(null);
    fireEvent.click(v.getByRole("checkbox", { name: "Jiná dodací adresa" }));
    expect(changes.mock.calls.at(-1)?.[0]?.name).toBe("");
  });
  it("readOnly nedovolí vypnutí", () => {
    const changed = mock(() => {});
    const v = render(
      <DocumentDeliveryFields
        value={{ name: "Stavba", contact: "" }}
        onChange={changed}
        readOnly
      />,
    );
    fireEvent.click(v.getByRole("checkbox", { name: "Jiná dodací adresa" }));
    expect(changed).not.toHaveBeenCalled();
  });
  it("objednávka patří FV i ZFV, nikoli FP", () => {
    expect(documentFieldsForType("FV").customerOrderRef).toBe(true);
    expect(documentFieldsForType("ZFV").customerOrderRef).toBe(true);
    expect(documentFieldsForType("FP").customerOrderRef).not.toBe(true);
  });
});
