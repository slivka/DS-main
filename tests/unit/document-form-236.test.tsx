import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { DocumentForm, type DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

const value: DocumentHeaderValue = { accountingDate: "2026-09-26", issueDate: "2026-09-26", currency: "CZK", amountTotal: 1000, totalMode: "entered" };
const form = (extra: Record<string, unknown>) => renderToStaticMarkup(<DocumentForm title="Pokladní doklad" documentType="PO" value={value} onChange={() => {}} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} status="draft" {...extra} />);

describe("DocumentForm 2.36.0 – limit a popisek haléřového vyrovnání", () => {
  it("výchozí limit je 1 Kč a popisek je výchozí", () => {
    const html = form({});
    expect(html).toContain('data-limit="1"');
    expect(html).toContain("± Haléřové vyrovnání");
  });
  it("předá aplikací zadaný limit i vlastní popisek", () => {
    const html = form({ roundingLimit: 0.5, roundingLabel: "Zaokrouhlení firmy" });
    expect(html).toContain('data-limit="0.5"');
    expect(html).toContain("± Zaokrouhlení firmy");
    expect(html).not.toContain("± Haléřové vyrovnání");
  });
});
