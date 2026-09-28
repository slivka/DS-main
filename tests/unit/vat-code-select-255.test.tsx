import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { filterVatCodes, VatCodeSelect } from "../../src/components/ds/accounting/vat-code-select";
import type { VatCodeOption } from "../../src/components/ds/accounting/journal-lines";

const codes: VatCodeOption[] = [
  { id: "v21", code: "21V", name: "Základní sazba", direction: "out", hasTax: true, rate: 21, selfAssessment: false, requiresPdpSubject: false, taxOutAccount: "343100" },
  { id: "v12", code: "12V", name: "Snížená sazba", direction: "out", hasTax: true, rate: 12, selfAssessment: false, requiresPdpSubject: false, taxOutAccount: "343100" },
  { id: "vx", code: "21VX", name: "bez nároku", direction: "out", hasTax: true, rate: 21, selfAssessment: false, requiresPdpSubject: false, taxOutAccount: null, inactive: true },
  { id: "p21", code: "21P", name: "Základní sazba", direction: "in", hasTax: true, rate: 21, selfAssessment: false, requiresPdpSubject: false, taxInAccount: "343200" },
];

describe("VatCodeSelect – otevírání a filtrování (2.55.0)", () => {
  it("filtruje podle kódu i názvu", () => {
    expect(filterVatCodes(codes, "").map((c) => c.id)).toEqual(["v21", "v12", "p21"]);
    expect(filterVatCodes(codes, "21").map((c) => c.id)).toEqual(["v21", "vx", "p21"]);
    expect(filterVatCodes(codes, "snížen").map((c) => c.id)).toEqual(["v12"]);
    expect(filterVatCodes(codes, "ZÁKLAD").map((c) => c.id)).toEqual(["v21", "p21"]);
    expect(filterVatCodes(codes, "xx")).toEqual([]);
  });
  it("neaktivní kód se nenabízí, pokud není vybraný", () => {
    expect(filterVatCodes(codes, "", "vx").map((c) => c.id)).toContain("vx");
    expect(filterVatCodes(codes, "", "v21").map((c) => c.id)).not.toContain("vx");
  });
  it("v buňce gridu se otevírá hned (defaultOpen)", () => {
    const open = renderToStaticMarkup(<VatCodeSelect defaultOpen codes={codes} value="v21" onChange={() => {}} />);
    expect(open).toContain('data-state="open"');
    const closed = renderToStaticMarkup(<VatCodeSelect codes={codes} value="v21" onChange={() => {}} />);
    expect(closed).toContain('data-state="closed"');
  });
  it("zobrazuje kód i název vybrané hodnoty", () => {
    const html = renderToStaticMarkup(<VatCodeSelect codes={codes} value="v21" onChange={() => {}} />);
    expect(html).toContain("21V");
    expect(html).toContain("Základní sazba");
  });
});
