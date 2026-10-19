/** Edit dokladu 15 – opravné kolo (2.108.0) · regrese pruhu, VS, výpis, BA zámek. */
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { documentClientIssues } from "../../src/components/ds/accounting/document-form/document-validation-feedback";
import { variableSymbolLinkState } from "../../src/components/ds/accounting/document-form/use-variable-symbol-link";
import { BankStatementForm } from "../../src/components/ds/accounting/bank-statement-form";
import { FormIssuesBar } from "../../src/components/ds/feedback/form-issues-bar";
import { DS_TEXTS_CS } from "../../src/ds-texts";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "../../src/components/ds/accounting/document-form";
import type { FormIssue } from "../../src/lib/form-issues";

afterEach(cleanup);

const EDIT = DS_TEXTS_CS.documentEdit;

describe("FormIssuesBar – opravy", () => {
  it("✕ je vždy; bez callbacku se pruh zavře sám a při změně seznamu se vrátí", () => {
    const issue: FormIssue = {
      fieldId: "document-taxDate",
      label: "DUZP",
      message: "Chybí DUZP",
      severity: "error",
      source: "server",
    };
    const view = render(<FormIssuesBar issues={[issue]} closeLabel="Zavřít" />);
    fireEvent.click(view.getByRole("button", { name: "Zavřít" }));
    expect(view.container.textContent).toBe("");
    view.rerender(
      <FormIssuesBar issues={[issue, { ...issue, message: "Jiná chyba" }]} closeLabel="Zavřít" />,
    );
    expect(view.container.textContent).toContain("Jiná chyba");
  });
  it("vlastní titulek nepřebije počet: text + (N)", () => {
    const view = render(
      <FormIssuesBar
        title="Uložení selhalo"
        issues={[
          {
            label: "DUZP",
            message: "Chybí DUZP",
            severity: "error",
            source: "server",
          },
        ]}
      />,
    );
    expect(view.container.textContent).toContain("Uložení selhalo (1)");
  });
});

describe("VS – pořadí hodnot po odemčení", () => {
  const value = {
    externalNumber: "FA-2026/0456",
    variableSymbol: null,
    variableSymbolLinked: true,
  } as never;
  it("odemčení předvyplní hodnotu z náhledu, ne uložený VS", () => {
    let patch: Record<string, unknown> = {};
    const state = variableSymbolLinkState("FP", value, (next) => (patch = next), EDIT);
    expect(state.linked).toBe(true);
    expect(state.derivedValue).toBe("20260456");
    state.onLinkedChange(false);
    expect(patch.variableSymbolLinked).toBe(false);
    expect(patch.variableSymbol).toBe("20260456");
  });
  it("automatické uvolnění při > 10 číslicích zachová uložený VS", () => {
    let patch: Record<string, unknown> = {};
    const state = variableSymbolLinkState(
      "FP",
      { externalNumber: "123", variableSymbol: "999", variableSymbolLinked: true } as never,
      (next) => (patch = next),
      EDIT,
    );
    const next = state.sourcePatch({ externalNumber: "12345678901" });
    expect(next.variableSymbolLinked).toBe(false);
    expect(next.variableSymbol).toBe("999");
    void patch;
  });
});

const header = {
  bookId: "b",
  number: "X1",
  accountingDate: "2026-10-10",
  issueDate: "2026-10-10",
  currency: "CZK",
};
function Doc(props: Record<string, unknown>) {
  const [value, setValue] = React.useState(
    (props.initial as typeof header | undefined) ?? header,
  );
  return (
    <DocumentForm
      title="Doklad"
      status="draft"
      documentType="FP"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      currencies={[{ code: "CZK", symbol: "Kč" }]}
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      mainSide="D"
      {...props}
    />
  );
}

describe("DocumentForm – opravy pruhu", () => {
  it("každý fieldId z klientských kontrol existuje v DOM jako id prvku", () => {
    const view = render(
      <Doc
        fieldErrors={{ partnerId: "Povinný údaj", externalNumber: "Povinný údaj" }}
        fieldWarnings={{ counterpartyIco: "Podezřelé IČO" }}
      />,
    );
    const issues = documentClientIssues({
      value: header as never,
      foreign: false,
      t: { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...DS_TEXTS_CS.documentForm } as never,
      fieldErrors: { partnerId: "Povinný údaj", externalNumber: "Povinný údaj" },
      fieldWarnings: { counterpartyIco: "Podezřelé IČO" },
    });
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(issue.label).not.toMatch(/^(partnerId|externalNumber|counterpartyIco)$/);
      expect(
        view.container.querySelector(`[id="${CSS.escape(issue.fieldId ?? "")}"]`),
        `fieldId ${issue.fieldId}`,
      ).not.toBeNull();
    }
  });
  it("zámek VS hlásí document-variableSymbol a zamčený VS se nezapisuje", () => {
    const changed: string[] = [];
    const view = render(
      <Doc
        initial={{ ...header, externalNumber: "FA-1", variableSymbolLinked: true }}
        onFieldChange={(id: string) => changed.push(id)}
      />,
    );
    const vs = view.container.querySelector("#document-variableSymbol") as HTMLInputElement;
    expect(vs.readOnly).toBe(true);
    fireEvent.click(view.getByRole("button", { name: EDIT.vsLink }));
    expect(changed).toContain("document-variableSymbol");
  });
  it("přijatý doklad bez čísla má zamčený VS prázdný, bez textu přidělení", () => {
    const view = render(
      <Doc initial={{ ...header, externalNumber: null, variableSymbolLinked: true }} />,
    );
    const vs = view.container.querySelector("#document-variableSymbol") as HTMLInputElement;
    expect(vs.value).toBe("");
    expect(vs.placeholder).not.toContain("přidělí se");
  });
  it("vydaný koncept bez čísla ukáže „přidělí se při zařazení“", () => {
    const view = render(
      <Doc
        documentType="FV"
        initial={{ ...header, number: null, variableSymbolLinked: true }}
      />,
    );
    const vs = view.container.querySelector("#document-variableSymbol") as HTMLInputElement;
    expect(vs.placeholder).toContain("přidělí se při zařazení");
  });
  it("validationActive=false neschová žluté varování ručního partnera u ID", () => {
    const view = render(
      <Doc
        documentType="ID"
        validationActive={false}
        counterpartyInput="manual"
        initial={{ ...header, counterpartyName: "Ruční" }}
      />,
    );
    expect(view.container.textContent).toContain(EDIT.internalManualPartner);
  });
});

describe("BankStatementForm – rozdíl v pruhu", () => {
  function Statement(props: Record<string, unknown>) {
    const [value, setValue] = React.useState({
      date: "2026-10-12",
      number: "2026/010",
      bankClosing: 12450,
    });
    return (
      <BankStatementForm
        value={value}
        onChange={setValue}
        status="open"
        book="Banka"
        currency="CZK"
        currencySymbol="Kč"
        period="2026"
        bankAccount="123456789/0800"
        balances={{ opening: 10000, income: 5000, expense: 2500 }}
        {...props}
      />
    );
  }
  it("rozdíl zůstatku je položka pruhu, ne samostatný NoticeBar", () => {
    const view = render(<Statement />);
    const bar = view.container.querySelector('[data-slot="form-issues-bar"]');
    expect(bar?.textContent).toContain("Rozdíl");
    expect(view.container.querySelector('[data-slot="bank-statement-difference-notice"]')).toBeNull();
  });
  it("bez rozdílu se pruh neukáže", () => {
    const view = render(<Statement />);
    fireEvent.click(view.getByRole("button", { name: "Zůstatek z pohybů" }));
    // Σ zapnuto → bankClosing null → bez rozdílu
    expect(view.container.querySelector('[data-slot="form-issues-bar"]')).toBeNull();
  });
});
