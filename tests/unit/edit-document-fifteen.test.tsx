/** Edit dokladu 15 (2.108.0) · živý pruh, zámek VS, protiúčet BA a partner ID · chování. */
import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { reportingLinesChange } from "../../src/components/ds/accounting/document-form/use-document-form-issues";
import { VsField } from "../../src/components/ds/accounting/vs-field";
import { deriveVariableSymbol } from "../../src/components/ds/accounting/variable-symbol-link";
import { FormIssuesBar } from "../../src/components/ds/feedback/form-issues-bar";
import {
  formIssuesTitle,
  mergeFormIssues,
  visibleFormIssues,
  type FormIssue,
} from "../../src/lib/form-issues";

afterEach(cleanup);

const TITLES = {
  saveFailedTitle: "Doklad nelze uložit ({count})",
  fixBeforeTitle: "Před zařazením doplňte ({count})",
  warningsTitle: "Upozornění ({count})",
};
const duzp: FormIssue = {
  fieldId: "document-taxDate",
  label: "DUZP",
  message: "Chybí DUZP",
  severity: "error",
  source: "server",
  code: "vat_date_required",
};
const rowDuzp: FormIssue = {
  ...duzp,
  fieldId: "journal-l1-vatDate",
  rowId: "l1",
  label: "Řádek 1",
  message: "Řádek 1: Chybí DUZP",
};
const rowError: FormIssue = {
  fieldId: "journal-l2-amount",
  rowId: "l2",
  columnId: "amount",
  label: "Řádek 2",
  message: "Chybí částka",
  severity: "error",
  source: "client",
};
const warning: FormIssue = {
  fieldId: "document-variableSymbol",
  label: "VS",
  message: "Zadejte VS",
  severity: "warning",
  source: "client",
};

describe("FormIssue – sloučení a titulek", () => {
  it("chyba hlavičky se neopakuje jako Řádek N a stejná hláška je jen jednou", () => {
    expect(mergeFormIssues([duzp, rowDuzp, duzp, rowError])).toEqual([duzp, rowError]);
  });
  it("text bez kódu se porovná bez prefixu řádku", () => {
    const header = { ...duzp, code: undefined };
    const row = { ...rowDuzp, code: undefined };
    expect(mergeFormIssues([header, row])).toEqual([header]);
  });
  it("chyby jsou před varováními", () => {
    expect(mergeFormIssues([warning, rowError]).map((i) => i.severity)).toEqual([
      "error",
      "warning",
    ]);
  });
  it("validationActive skryje jen klientské položky, serverové zůstávají", () => {
    expect(visibleFormIssues([duzp, rowError, warning], false)).toEqual([duzp]);
    expect(visibleFormIssues([duzp, rowError, warning], true)).toHaveLength(3);
  });
  it("titulek: chyby × uložení selhalo × jen varování × prázdno", () => {
    expect(formIssuesTitle([duzp, warning], false, TITLES)).toBe("Před zařazením doplňte (1)");
    expect(formIssuesTitle([duzp, rowError], true, TITLES)).toBe("Doklad nelze uložit (2)");
    expect(formIssuesTitle([warning], true, TITLES)).toBe("Upozornění (1)");
    expect(formIssuesTitle([], false, TITLES)).toBeNull();
  });
});

describe("FormIssuesBar", () => {
  it("ukáže titulek podle chyb, varování pod nimi a klik vrátí položku", () => {
    let selected: string | undefined;
    const view = render(
      <FormIssuesBar issues={[duzp, warning]} onSelect={(issue) => (selected = issue.fieldId)} />,
    );
    expect(view.container.textContent).toContain("Před zařazením doplňte (1)");
    expect(view.container.textContent).toContain("Zadejte VS");
    fireEvent.click(view.getByText(/Chybí DUZP/));
    expect(selected).toBe("document-taxDate");
  });
  it("bez položek se nevykreslí", () => {
    const view = render(<FormIssuesBar issues={[]} />);
    expect(view.container.textContent).toBe("");
  });
});

describe("onFieldChange u buněk", () => {
  it("změněná buňka nahlásí rowId a columnId", () => {
    const calls: Array<[string, string | undefined, string | undefined]> = [];
    const change = reportingLinesChange(
      [{ id: "l1", amount: 1 }],
      () => {},
      (fieldId, rowId, columnId) => calls.push([fieldId, rowId, columnId]),
    );
    change([{ id: "l1", amount: 2 }]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]).toBe("l1");
    expect(calls[0]?.[2]).toBe("amount");
  });
});

describe("VsField – zámek", () => {
  it("zamčeno ukazuje náhled jen ke čtení, odemčení hlásí stav vazby", () => {
    let linked: boolean | undefined;
    let typed = "";
    const view = render(
      <VsField
        id="vs"
        value="777"
        onChange={(v) => (typed = v)}
        linked
        derivedValue="20260456"
        onLinkedChange={(next) => (linked = next)}
      />,
    );
    const input = view.container.querySelector("#vs") as HTMLInputElement;
    expect(input.value).toBe("20260456");
    expect(input.readOnly).toBe(true);
    fireEvent.click(view.getByRole("button", { name: "Svázat VS s číslem daňového dokladu" }));
    expect(linked).toBe(false);
    expect(typed).toBe("");
  });
  it("bez čísla ukáže pendingText a nic nezapíše", () => {
    const view = render(
      <VsField id="vs" value="" onChange={() => {}} linked pendingText="přidělí se při zařazení" />,
    );
    const input = view.container.querySelector("#vs") as HTMLInputElement;
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("přidělí se při zařazení");
  });
  it("odemčeno: vlastní VS s varováním", () => {
    const view = render(
      <VsField
        id="vs"
        value="1234567890"
        onChange={() => {}}
        linked={false}
        warning="Zadejte VS"
      />,
    );
    const input = view.container.querySelector("#vs") as HTMLInputElement;
    expect(input.value).toBe("1234567890");
    expect(input.readOnly).toBe(false);
    expect(input.className).toContain("border-warning");
  });
  it("odvození: 1–10 číslic, > 10, 0 číslic, prázdné", () => {
    expect(deriveVariableSymbol("FA-2026/0456")).toEqual({ value: "20260456", reason: "ok" });
    expect(deriveVariableSymbol("12345678901").reason).toBe("tooLong");
    expect(deriveVariableSymbol("ABC").reason).toBe("noDigits");
    expect(deriveVariableSymbol("").reason).toBe("pending");
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

describe("DocumentForm – pruh a hlášení změn", () => {
  it("serverová chyba je vidět i bez validationActive, oprava pole ji nahlásí", async () => {
    const changed: string[] = [];
    function App() {
      const [issues, setIssues] = React.useState<FormIssue[]>([duzp]);
      return (
        <Doc
          documentType="FV"
          issues={issues}
          validationActive={false}
          vat={{ visible: true }}
          onFieldChange={(id: string) => {
            changed.push(id);
            if (id === "document-taxDate") setIssues([]);
          }}
        />
      );
    }
    const view = render(<App />);
    expect(view.container.textContent).toContain("Chybí DUZP");
    fireEvent.change(view.container.querySelector("#document-taxDate") as HTMLInputElement, {
      target: { value: "10.10.2026" },
    });
    expect(changed).toContain("document-taxDate");
    await waitFor(() => expect(view.container.textContent).not.toContain("Chybí DUZP"));
  });
  it("přepnutí zámku VS volá onFieldChange", () => {
    const changed: string[] = [];
    const view = render(
      <Doc
        initial={{ ...header, externalNumber: "FA-1", variableSymbol: "1" }}
        onFieldChange={(id: string) => changed.push(id)}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Svázat VS s číslem daňového dokladu" }));
    expect(changed).toContain("document-variableSymbolLinked");
  });
});

describe("Bankovní pohyb – protiúčet", () => {
  it("dva řádky 4 / 8 / 8 na mřížce 20 a kód banky s názvem", () => {
    const view = render(
      <Doc
        documentType="BA"
        initial={{ ...header, bankCode: "0100" }}
        bankCodeOptions={[{ code: "0100", name: "Komerční banka" }]}
      />,
    );
    const spans = (id: string) =>
      view.container.querySelector(`#${id}`)?.closest('[data-slot="field"]')?.className ?? "";
    expect(spans("document-bankAccountKind")).toContain("col-span-4");
    expect(spans("document-movement-account")).toContain("col-span-8");
    expect(spans("document-bank-code")).toContain("col-span-8");
    expect(view.container.textContent).toContain("0100 – Komerční banka");
    expect(view.getByText("Datum pohybu")).toBeTruthy();
  });
});

describe("Interní doklad – partner", () => {
  it("ruční partner ukáže varování a IČO / DIČ", () => {
    const view = render(<Doc documentType="ID" counterpartyInput="manual" />);
    expect(
      view.getAllByText("Ruční partner se nepřenese do řádků dokladu.").length,
    ).toBeGreaterThan(0);
    expect(view.getByText("IČO")).toBeTruthy();
    expect(view.getByText("DIČ")).toBeTruthy();
  });
  it("partner z adresáře varování nemá", () => {
    const view = render(<Doc documentType="ID" />);
    expect(view.queryByText("Ruční partner se nepřenese do řádků dokladu.")).toBeNull();
  });
});
