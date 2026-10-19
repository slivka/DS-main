/** Edit dokladu 15 – opravné kolo 2 (2.108.0) · mazání chyb řádků, fieldId všech klíčů, zámek data, červený pruh. */
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import {
  documentClientIssues,
  headerFieldLabel,
} from "../../src/components/ds/accounting/document-form/document-validation-feedback";
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
  it("do buněk se promítají serverové i klientské položky aplikace; vlastní chyby editoru ne", () => {
    const editorCell: FormIssue = { ...clientCell, origin: "editor" };
    const view = render(<ProjectionProbe issues={[serverCell, clientCell, editorCell]} />);
    const cells = JSON.parse(view.container.querySelector("output")!.dataset.cells!);
    // Serverová i klientská položka od aplikace projdou; vlastní validace editoru ne.
    expect(cells).toHaveLength(2);
    expect(cells.map((cell: { message: string }) => cell.message)).toContain("Doplňte účet");
  });
  it("chyba buňky → oprava → položka pruhu i rámeček zmizí", () => {
    const view = render(<Doc issues={[serverCell]} />);
    expect(view.container.textContent).toContain("Účet neexistuje");
    view.rerender(<Doc issues={[]} />);
    expect(view.container.textContent).not.toContain("Účet neexistuje");
    expect(view.container.querySelector('[data-slot="form-issues-bar"]')).toBeNull();
  });
  it("validationActive=false: serverová chyba zůstane v poli (rámeček), klientská zmizí", () => {
    const serverField: FormIssue = {
      fieldId: "document-taxDate",
      label: "DUZP",
      message: "Chyba z DB na DUZP",
      severity: "error",
      source: "server",
    };
    const view = render(
      <Doc
        validationActive={false}
        issues={[serverField]}
        fieldErrors={{ dueDate: "Klient" }}
        vat={{ visible: true }}
      />,
    );
    // Rámeček / ikona v samotném poli: DUZP (server) označené, Splatnost (klient) ne.
    const taxDate = view.container.querySelector("#document-taxDate")!;
    expect(taxDate.closest("[data-invalid]")?.getAttribute("data-invalid")).toBe("true");
    const dueDate = view.container.querySelector("#document-dueDate")!;
    expect(dueDate.closest("[data-invalid]")).toBeNull();
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
    issueDate: "x",
    accountingDate: "x",
    taxDate: "x",
    dueDate: "x",
  };
  it("FP: každý fieldId existuje v DOM a popisek není technický klíč", () => {
    const view = render(
      <Doc
        fieldErrors={fpErrors}
        vat={{ visible: true }}
        paymentMethodOptions={[{ value: "1", label: "Převodem" }]}
      />,
    );
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: fpErrors,
      fieldLabels: FIELD_LABELS,
    });
    expect(issues.length).toBeGreaterThan(10);
    // Účet hlavičky se vykreslí až v režimu změny účtu (tužka) – ověříme aspoň mapování id.
    const mainAccount = documentClientIssues({
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: { mainAccountId: "x" },
      fieldLabels: FIELD_LABELS,
    })[0];
    expect(mainAccount.fieldId).toBe("document-mainAccountId");
    expect(mainAccount.label).toBe(T.mainAccountSelect);
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
  it("chybějící popisek nespadne: obecný text „Pole formuláře“ + console.warn", () => {
    const warnings: unknown[][] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(args);
    try {
      const issues = documentClientIssues({
        value: { ...header, amountTotal: 0 } as DocumentHeaderValue,
        foreign: false,
        t: T,
        fieldErrors: JSON.parse('{"neexistujiciKlic":"x"}') as Partial<Record<string, string>>,
      });
      expect(issues[0].label).toBe("Pole formuláře");
      expect(issues[0].label).not.toBe("neexistujiciKlic");
      expect(warnings.flat().join(" ")).toContain("neexistujiciKlic");
    } finally {
      console.warn = original;
    }
  });
  it("všechny klíče polí mají popisek; nepolní klíče se do pruhu neposílají", () => {
    const NON_FIELD = [
      "id",
      "rateInfo",
      "suggestedRate",
      "suggestedRateInfo",
      "print",
      "rateSourceAttention",
      "vatRateSourceAttention",
    ];
    const FIELD_KEYS = [
      "bookId",
      "number",
      "direction",
      "accountingDate",
      "issueDate",
      "taxDate",
      "vatDate",
      "vatRelevant",
      "dueDate",
      "externalNumber",
      "taxDocumentNumber",
      "taxDocumentNumberLinked",
      "variableSymbolLinked",
      "bankAccountKind",
      "bankCode",
      "bankIban",
      "bankSwift",
      "partnerId",
      "counterpartyName",
      "counterpartyIco",
      "counterpartyDic",
      "counterpartyCountry",
      "handedOverBy",
      "variableSymbol",
      "constantSymbol",
      "specificSymbol",
      "bankAccount",
      "partnerBankAccountId",
      "companyBankAccountId",
      "paymentMethodId",
      "description",
      "currency",
      "rate",
      "rateManual",
      "rateNote",
      "amountTotal",
      "totalMode",
      "roundingAmount",
      "mainAccountId",
      "manualBankAccount",
    ];
    for (const key of FIELD_KEYS) {
      const label = headerFieldLabel(T, key, FIELD_LABELS, "in");
      expect(label, `popisek ${key}`).toBeTruthy();
      expect(label, `popisek ${key} není technický klíč`).not.toBe(key);
    }
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0 } as DocumentHeaderValue,
      foreign: false,
      t: T,
      fieldErrors: Object.fromEntries(NON_FIELD.map((key) => [key, "x"])) as Partial<
        Record<string, string>
      >,
      fieldLabels: FIELD_LABELS,
    });
    expect(issues).toHaveLength(0);
  });
  it("popisek handedOverBy se řídí směrem dokladu", () => {
    expect(headerFieldLabel(T, "handedOverBy", FIELD_LABELS, "in")).toBe(T.handedOverByIn);
    expect(headerFieldLabel(T, "handedOverBy", FIELD_LABELS, "out")).toBe(T.handedOverByOut);
  });
});

describe("R3) fieldId = skutečné id v markupu (FV, ID, PO)", () => {
  const ACCOUNTS = [{ code: "221001", name: "Banka" }];
  const IDENTITY = {
    variant: "issued" as const,
    book: "FV",
    period: "2026",
    account: { side: "D" as const, label: "221.001 Banka", editable: true },
  };
  function expectIdsInDom(
    view: ReturnType<typeof render>,
    issues: { fieldId?: string; label: string }[],
  ) {
    for (const issue of issues) {
      expect(issue.label, `popisek ${issue.fieldId}`).toBeTruthy();
      expect(
        view.container.querySelector(`[id="${CSS.escape(issue.fieldId ?? "")}"]`),
        `fieldId ${issue.fieldId}`,
      ).not.toBeNull();
    }
  }
  it("FV: všechny klíče včetně čísla, směru, účtu v klidu a přepínače DPH", () => {
    const fvErrors = {
      partnerId: "x",
      variableSymbol: "x",
      constantSymbol: "x",
      companyBankAccountId: "x",
      paymentMethodId: "x",
      amountTotal: "x",
      issueDate: "x",
      accountingDate: "x",
      dueDate: "x",
      number: "x",
      direction: "x",
      mainAccountId: "x",
      description: "x",
      vatRelevant: "x",
    };
    const view = render(
      <Doc
        documentType="FV"
        directionBadge="out"
        identity={IDENTITY}
        accounts={ACCOUNTS}
        fieldErrors={fvErrors}
        vat={{ visible: true }}
        companyBankAccountOptions={[{ id: "c1", label: "Účet", account: "1/0100", currency: "CZK" }]}
        paymentMethodOptions={[{ value: "1", label: "Převodem" }]}
      />,
    );
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0, direction: "out" },
      foreign: false,
      t: T,
      fieldErrors: fvErrors,
      fieldLabels: FIELD_LABELS,
    });
    expect(issues.length).toBeGreaterThan(10);
    expectIdsInDom(view, issues);
  });
  it("ID: interní doklad bez účtu identity", () => {
    const idErrors = {
      number: "x",
      accountingDate: "x",
      issueDate: "x",
      taxDate: "x",
      description: "x",
      amountTotal: "x",
      partnerId: "x",
    };
    const view = render(
      <Doc documentType="ID" fieldErrors={idErrors} vat={{ visible: true }} />,
    );
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: idErrors,
      fieldLabels: FIELD_LABELS,
    });
    expectIdsInDom(view, issues);
  });
  it("PO: přijatá objednávka včetně handedOverBy a ručního účtu", () => {
    const poErrors = {
      partnerId: "x",
      handedOverBy: "x",
      externalNumber: "x",
      manualBankAccount: "x",
      amountTotal: "x",
      issueDate: "x",
    };
    const view = render(
      <Doc
        documentType="PO"
        fieldErrors={poErrors}
        counterpartyInput="manual"
        onCounterpartyInputChange={() => {}}
      />,
    );
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0, direction: "in" },
      foreign: false,
      t: T,
      fieldErrors: poErrors,
      fieldLabels: FIELD_LABELS,
    });
    expectIdsInDom(view, issues);
  });
  it("cizí měna: rateNote → document-rate-note, rateManual → document-rate", () => {
    const fxErrors = { rateNote: "x", rateManual: "x" };
    const view = render(
      <Doc
        documentType="FP"
        fieldErrors={fxErrors}
        initial={{ ...header, currency: "EUR", rateManual: true }}
        currencies={[
          { code: "CZK", symbol: "Kč" },
          { code: "EUR", symbol: "€" },
        ]}
      />,
    );
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0, currency: "EUR", rateManual: true },
      foreign: true,
      t: T,
      fieldErrors: fxErrors,
      fieldLabels: FIELD_LABELS,
    });
    expectIdsInDom(view, issues);
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
