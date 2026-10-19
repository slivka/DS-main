/** Edit dokladu 15 – opravné kolo 2 (2.108.0) · mazání chyb řádků, fieldId všech klíčů, zámek data, červený pruh. */
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { documentClientIssues } from "../../src/components/ds/accounting/document-form/document-validation-feedback";
import { useDocumentIssueProjection } from "../../src/components/ds/accounting/document-form/use-document-issue-projection";
import { useDocumentDateLinks } from "../../src/components/ds/accounting/document-form/use-document-date-links";
import { RecordActionBar } from "../../src/components/ds/layout/record-action-bar";
import { DS_TEXTS_CS } from "../../src/ds-texts";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "../../src/components/ds/accounting/document-form";
import type { FormIssue } from "../../src/lib/form-issues";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

afterEach(cleanup);

const EDIT = DS_TEXTS_CS.documentEdit;
const T = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...DS_TEXTS_CS.documentForm };
const FIELD_LABELS = {
  bankCode: EDIT.bankCode,
  bankIban: EDIT.iban,
  bankSwift: EDIT.swift,
  bankAccountKind: EDIT.accountKind,
};

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

/** Vypíše projekci hooku do atributů pro kontrolu. */
function ProjectionProbe({ issues }: { issues: FormIssue[] }) {
  const projection = useDocumentIssueProjection({ issues });
  return (
    <output
      data-cells={JSON.stringify(projection.cellIssues)}
      data-errors={JSON.stringify(projection.issueFieldErrors)}
    />
  );
}

describe("A) Chyby řádků se mažou", () => {
  const serverCell: FormIssue = {
    fieldId: "r1-account",
    rowId: "r1",
    columnId: "account",
    label: "Ř. 1 – Účet",
    message: "Účet neexistuje",
    severity: "error",
    source: "server",
  };
  const clientCell: FormIssue = { ...serverCell, source: "client", message: "Doplňte účet" };
  it("do buněk se promítají jen serverové položky; vlastní chyby editoru ne", () => {
    const view = render(<ProjectionProbe issues={[serverCell, clientCell]} />);
    const cells = JSON.parse(view.container.querySelector("output")!.dataset.cells!);
    expect(cells).toHaveLength(1);
    expect(cells[0].message).toBe("Účet neexistuje");
  });
  it("chyba buňky → oprava → položka pruhu i rámeček zmizí", () => {
    const view = render(<Doc issues={[serverCell]} />);
    expect(view.container.textContent).toContain("Účet neexistuje");
    view.rerender(<Doc issues={[]} />);
    expect(view.container.textContent).not.toContain("Účet neexistuje");
    expect(view.container.querySelector('[data-slot="form-issues-bar"]')).toBeNull();
  });
  it("validationActive=false skryje klientskou chybu pole, serverovou nechá", () => {
    const serverField: FormIssue = {
      fieldId: "document-taxDate",
      label: "DUZP",
      message: "Chyba z DB na DUZP",
      severity: "error",
      source: "server",
    };
    const view = render(
      <Doc validationActive={false} issues={[serverField]} fieldErrors={{ dueDate: "Klient" }} />,
    );
    expect(view.container.textContent).toContain("Chyba z DB na DUZP");
    expect(view.container.textContent).not.toContain("Klient");
  });
});

describe("B) fieldId a popisky pro všechny klíče", () => {
  const fpErrors: Partial<Record<string, string>> = {
    partnerId: "x",
    counterpartyIco: "x",
    counterpartyDic: "x",
    externalNumber: "x",
    variableSymbol: "x",
    constantSymbol: "x",
    specificSymbol: "x",
    bankAccount: "x",
    paymentMethodId: "x",
    description: "x",
    amountTotal: "x",
    mainAccountId: "x",
    issueDate: "x",
    accountingDate: "x",
    taxDate: "x",
    dueDate: "x",
  };
  it("FP: každý fieldId existuje v DOM a popisek není technický klíč", () => {
    const view = render(
      <Doc
        fieldErrors={fpErrors}
        paymentMethodOptions={[{ value: "1", label: "Převodem" }]}
      />,
    );
    // Účet hlavičky se vykreslí až v režimu změny účtu (tužka).
    const pencil = view.queryAllByRole("button", { name: T.changeAccount })[0];
    if (pencil) fireEvent.click(pencil);
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: fpErrors,
      fieldLabels: FIELD_LABELS,
    });
    expect(issues.length).toBeGreaterThan(10);
    for (const issue of issues) {
      expect(issue.label).not.toBe(Object.keys(fpErrors).find((k) => k === issue.label));
      expect(
        view.container.querySelector(`[id="${CSS.escape(issue.fieldId ?? "")}"]`),
        `fieldId ${issue.fieldId}`,
      ).not.toBeNull();
    }
  });
  it("BA: bankCode, bankAccount, bankIban, bankSwift, bankAccountKind mají skutečné id", () => {
    const baErrors = {
      bankCode: "x",
      bankAccount: "x",
      bankIban: "x",
      bankSwift: "x",
      bankAccountKind: "x",
    };
    const view = render(<Doc documentType="BA" fieldErrors={baErrors} />);
    const issues = documentClientIssues({
      code: "BA",
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: baErrors,
      fieldLabels: FIELD_LABELS,
    });
    const ids = issues.map((issue) => issue.fieldId);
    expect(ids).toContain("document-bank-code");
    expect(ids).toContain("document-movement-account");
    expect(ids).toContain("document-bankAccountKind");
    for (const issue of issues) {
      expect(
        view.container.querySelector(`[id="${CSS.escape(issue.fieldId ?? "")}"]`),
        `fieldId ${issue.fieldId}`,
      ).not.toBeNull();
    }
  });
  it("chybějící popisek je chyba, ne fallback na klíč", () => {
    expect(() =>
      documentClientIssues({
        value: { ...header, amountTotal: 0 } as DocumentHeaderValue,
        foreign: false,
        t: T,
        fieldErrors: { neexistujiciKlic: "x" } as never,
      }),
    ).toThrow(/neexistujiciKlic/);
  });
});

describe("D) Zámek data hlásí onFieldChange i u řízené vazby", () => {
  function LinkProbe(props: { external?: boolean; changed: string[] }) {
    const [value, setValue] = React.useState({
      ...header,
      id: "d1",
      amountTotal: 0,
    } as DocumentHeaderValue);
    const link = useDocumentDateLinks({
      code: "FV",
      value,
      onChange: setValue,
      accountingDateLink: props.external
        ? { locked: true, onToggle: () => {} }
        : undefined,
      accountingDateLinked: true,
      onFieldChange: (id) => props.changed.push(id),
    });
    return (
      <button type="button" onClick={() => link.link?.onToggle(false)}>
        toggle
      </button>
    );
  }
  it("interní vazba hlásí document-accountingDate", () => {
    const changed: string[] = [];
    const view = render(<LinkProbe changed={changed} />);
    fireEvent.click(view.getByRole("button", { name: "toggle" }));
    expect(changed).toContain("document-accountingDate");
  });
  it("řízená vazba (accountingDateLink) hlásí document-accountingDate", () => {
    const changed: string[] = [];
    const view = render(<LinkProbe external changed={changed} />);
    fireEvent.click(view.getByRole("button", { name: "toggle" }));
    expect(changed).toContain("document-accountingDate");
  });
});

describe("E) Chyba + jen varování → červený pruh", () => {
  it("error s issues jen varování: pruh je červený s chybou a varováním pod ní", () => {
    const view = render(
      <RecordActionBar
        saveAction={{ onSave: () => {} }}
        error={{ title: "Doklad nelze uložit", message: "Server odmítl uložení" }}
        issues={[
          {
            fieldId: "document-variableSymbol",
            label: "VS",
            message: "VS má víc než 10 číslic",
            severity: "warning",
            source: "client",
          },
        ]}
      />,
    );
    const bar = view.container.querySelector('[data-slot="record-action-error"]')!;
    const inner = bar.querySelector('[data-slot="form-issues-bar"]')!;
    expect(inner.getAttribute("data-severity")).toBe("error");
    expect(bar.textContent).toContain("Doklad nelze uložit");
    expect(bar.textContent).toContain("Server odmítl uložení");
    expect(bar.textContent).toContain("VS má víc než 10 číslic");
    expect(bar.textContent).not.toContain("Upozornění");
  });
  it("FieldErrorSummary je uvnitř pruhu a ✕ ho skryje", () => {
    const view = render(
      <RecordActionBar
        saveAction={{ onSave: () => {} }}
        issues={[
          {
            fieldId: "document-taxDate",
            label: "DUZP",
            message: "Chybí DUZP",
            severity: "error",
            source: "server",
          },
        ]}
        error={{
          message: "Uložení selhalo",
          fieldErrors: [{ fieldId: "document-taxDate", label: "DUZP", message: "Chybí DUZP" }],
        }}
      />,
    );
    const bar = view.container.querySelector('[data-slot="form-issues-bar"]')!;
    expect(bar.textContent).toContain("DUZP");
    fireEvent.click(view.getAllByRole("button", { name: /Zavřít/i })[0]);
    expect(view.container.querySelector('[data-slot="form-issues-bar"]')).toBeNull();
  });
});

describe("G) „Přidělí se při zařazení“ jen v konceptu", () => {
  it("vydaný zaúčtovaný doklad bez čísla text přidělení neukáže", () => {
    const view = render(
      <Doc
        documentType="FV"
        status="posted"
        initial={{ ...header, number: null, variableSymbolLinked: true }}
      />,
    );
    const vs = view.container.querySelector("#document-variableSymbol") as HTMLInputElement;
    expect(vs.placeholder).not.toContain("přidělí se při zařazení");
  });
});
