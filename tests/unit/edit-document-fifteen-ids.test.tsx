/** Edit dokladu 15 – fieldId, popisky a rámečky polí (rozděleno z fixes2 kvůli délce souboru). */
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
  // Stejně jako DocumentForm (popisky mimo DocumentFormTexts).
  taxDocumentNumber: EDIT.taxNumber,
  counterpartyCountry: DS_TEXTS_CS.documentForm.country,
};

const header = {
  bookId: "b",
  number: "X1",
  accountingDate: "2026-10-10",
  issueDate: "2026-10-10",
  currency: "CZK",
};
function Doc(props: Record<string, unknown>) {
  const [value, setValue] = React.useState((props.initial as typeof header | undefined) ?? header);
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
    const warnings: unknown[][] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(args);
    try {
      for (const key of FIELD_KEYS) {
        const label = headerFieldLabel(T, key, FIELD_LABELS, "in");
        expect(label, `popisek ${key}`).toBeTruthy();
        expect(label, `popisek ${key} není technický klíč`).not.toBe(key);
        expect(label, `popisek ${key} chybí`).not.toBe(T.unknownField);
      }
    } finally {
      console.warn = original;
    }
    expect(warnings).toHaveLength(0);
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
        companyBankAccountOptions={[
          { id: "c1", label: "Účet", account: "1/0100", currency: "CZK" },
        ]}
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
    const view = render(<Doc documentType="ID" fieldErrors={idErrors} vat={{ visible: true }} />);
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: idErrors,
      fieldLabels: FIELD_LABELS,
    });
    expectIdsInDom(view, issues);
  });
  it("PO: přijatá objednávka včetně handedOverBy", () => {
    const poErrors = {
      partnerId: "x",
      handedOverBy: "x",
      externalNumber: "x",
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
  it("FP v ručním režimu protistrany: účet má id document-bankAccount", () => {
    const fpManual = { manualBankAccount: "x", partnerBankAccountId: "x" };
    const view = render(
      <Doc
        documentType="FP"
        fieldErrors={fpManual}
        counterpartyInput="manual"
        onCounterpartyInputChange={() => {}}
      />,
    );
    const issues = documentClientIssues({
      value: { ...header, amountTotal: 0 },
      foreign: false,
      t: T,
      fieldErrors: fpManual,
      fieldLabels: FIELD_LABELS,
    });
    expect(issues.map((issue) => issue.fieldId)).toEqual([
      "document-bankAccount",
      "document-bankAccount",
    ]);
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

describe("BA: chyba čísla účtu, IBAN, kódu banky a SWIFT je v poli", () => {
  const CASES = [
    { kind: "domestic", fieldId: "document-movement-account" },
    { kind: "domestic", fieldId: "document-bank-code" },
    { kind: "iban", fieldId: "document-movement-account" },
    { kind: "iban", fieldId: "document-bank-code" },
  ] as const;
  for (const source of ["server", "client"] as const)
    for (const item of CASES)
      it(`${source}: ${item.kind} ${item.fieldId} má rámeček`, () => {
        const issues: FormIssue[] = [
          { fieldId: item.fieldId, label: "Pole", message: "Chyba", severity: "error", source },
        ];
        const view = render(
          <Doc
            documentType="BA"
            initial={{ ...header, bankAccountKind: item.kind }}
            issues={issues}
          />,
        );
        const control = view.container.querySelector(`[id="${item.fieldId}"]`);
        expect(control).not.toBeNull();
        // Vstup nese aria-invalid; výběr (kód banky) dostane rámeček přes data-invalid pole.
        const framed =
          control?.getAttribute("aria-invalid") === "true" ||
          Boolean(control?.closest('[data-invalid="true"]'));
        expect(framed).toBe(true);
      });
});
