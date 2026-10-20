/** Pokladní číslo · jediná hodnota externalNumber a nedestruktivní přepnutí DPH. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import {
  DocumentForm,
  type DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
afterEach(cleanup);
function Cash({
  direction,
  externalNumber = "",
}: {
  direction: "in" | "out";
  externalNumber?: string;
}) {
  const [value, setValue] = useState<DocumentHeaderValue>({
    direction,
    externalNumber,
    number: "PO2026001",
    currency: "EUR",
    amountTotal: 0,
    totalMode: "entered",
    vatRelevant: false,
  });
  return (
    <DocumentForm
      title="Pokladna"
      documentType="PO"
      value={value}
      onChange={setValue}
      accounts={[]}
      books={[]}
      lines={[]}
      onLinesChange={() => {}}
      vat={{ visible: true }}
    />
  );
}
test("výdaj: jediné číslo je volné, přepnutí DPH vlastní číslo zachová", () => {
  const view = render(<Cash direction="out" externalNumber="Dod2026001" />);
  const input = view.container.querySelector<HTMLInputElement>("#document-externalNumber");
  expect(view.container.querySelectorAll("#document-externalNumber")).toHaveLength(1);
  expect(view.container.querySelector("#document-taxDocumentNumber")).toBeNull();
  expect(input?.readOnly).toBe(false);
  fireEvent.click(view.getByRole("switch"));
  expect(view.getByLabelText("Číslo daňového dokladu")).toBeDefined();
  expect(input?.value).toBe("Dod2026001");
  expect(input?.readOnly).toBe(false);
});
test("příjem: prázdné číslo se při zapnutí DPH sváže, odemčení dovolí vlastní číslo", () => {
  const view = render(<Cash direction="in" />);
  fireEvent.click(view.getByRole("switch"));
  const input = view.container.querySelector<HTMLInputElement>("#document-externalNumber");
  expect(input?.readOnly).toBe(true);
  expect(input?.value).toBe("PO2026001");
  fireEvent.click(view.getByRole("button", { name: "Svázat s číslem dokladu" }));
  if (!input) throw new Error("Chybí číslo");
  fireEvent.change(input, { target: { value: "Vlastni2026" } });
  fireEvent.click(view.getByRole("switch"));
  expect(input.value).toBe("Vlastni2026");
  expect(input.readOnly).toBe(false);
  fireEvent.click(view.getByRole("switch"));
  expect(input.value).toBe("Vlastni2026");
  expect(input.readOnly).toBe(false);
});
test("pokladna: Partner | IČO | DIČ, pak Vyplaceno komu | číslo, pak Popis", () => {
  const view = render(<Cash direction="out" />);
  const ids = [
    "document-partner",
    "document-partner-ico",
    "document-partner-dic",
    "document-handedOverBy",
    "document-externalNumber",
    "document-description",
  ];
  const nodes = ids.map((id) => view.container.querySelector(`#${id}`));
  nodes.forEach((node, index) => {
    if (!node) throw new Error(`Chybí ${ids[index]}`);
  });
  for (let index = 1; index < nodes.length; index += 1) {
    const previous = nodes[index - 1] as Element;
    const current = nodes[index] as Element;
    expect(previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  }
});
