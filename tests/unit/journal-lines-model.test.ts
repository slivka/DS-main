import { describe, expect, it } from "bun:test";

import { journalColumnWidthsRem } from "../../src/components/ds/accounting/journal-column-layout";
import type { JournalLine } from "../../src/components/ds/accounting/journal-lines";
import {
  appendJournalLine,
  createJournalLine,
  duplicateJournalLine,
  filterJournalLines,
  moveJournalLine,
  nextLineVatCode,
  numberJournalErrors,
  removeJournalLine,
  toHomeAmount,
} from "../../src/components/ds/accounting/journal-lines-model";
import { validateJournalLines } from "../../src/components/ds/accounting/journal-lines-validation";
import { sideFieldRules } from "../../src/components/ds/accounting/journal-lines";
import { DS_TEXTS_CS } from "../../src/ds-texts";

const a: JournalLine = { id: "a", debitAccount: "518001", creditAccount: "321100", amount: 10 };
const b: JournalLine = { id: "b", debitAccount: "518001", creditAccount: "321100", amount: 20 };
const rounding: JournalLine = { id: "r", amount: 0.4, isRounding: true };
const tax: JournalLine = { id: "t", amount: 2, isVatLine: true };

describe("journal-lines-model – úpravy seznamu", () => {
  it("přidá řádek před připnuté řádky a řádky daně", () => {
    const next = appendJournalLine([a, rounding, tax], b);
    expect(next.map((line) => line.id)).toEqual(["a", "b", "r", "t"]);
  });

  it("duplikát vloží pod originál bez ruční daně", () => {
    const next = duplicateJournalLine([{ ...a, vatManual: true, vatAmount: 3 }, b], a, "c");
    expect(next.map((line) => line.id)).toEqual(["a", "c", "b"]);
    expect(next[1]).toMatchObject({ vatManual: false, vatAmount: undefined });
  });

  it("odebrání vrátí zbytek a obnovu na původní místo", () => {
    const { remaining, restore } = removeJournalLine([a, b, rounding], b);
    expect(remaining.map((line) => line.id)).toEqual(["a", "r"]);
    expect(restore().map((line) => line.id)).toEqual(["a", "b", "r"]);
  });

  it("posun o jeden řádek; za krajem nic", () => {
    const lines = [a, b, rounding];
    expect(moveJournalLine(lines, lines, "a", 1)?.map((line) => line.id)).toEqual(["b", "a", "r"]);
    expect(moveJournalLine(lines, lines, "b", 1)).toBeNull();
  });

  it("nový řádek nese hlavní účet a výchozí hodnoty", () => {
    const line = createJournalLine({
      id: "n",
      mainAccount: { accountId: "211000", side: "D" },
      defaults: { text: "Nákup" },
      vatCodeId: null,
    });
    expect(line).toMatchObject({
      id: "n",
      debitAccount: null,
      creditAccount: "211000",
      text: "Nákup",
      vatCodeId: null,
      isBlank: true,
    });
    expect("vatCodeId" in createJournalLine({ id: "x" })).toBe(false);
  });

  it("kód DPH nového řádku: předchozí řádek, jinak výchozí kód", () => {
    expect(nextLineVatCode([{ ...a, vatCodeId: "v12" }], "v21")).toBe("v12");
    expect(nextLineVatCode([], "v21")).toBe("v21");
    expect(nextLineVatCode([], undefined)).toBeNull();
  });

  it("hledá v textu i částce bez ohledu na velikost písmen", () => {
    const lines = [{ ...a, text: "Servis" }, b];
    expect(filterJournalLines(lines, "SERV").map((line) => line.id)).toEqual(["a"]);
    expect(filterJournalLines(lines, "20").map((line) => line.id)).toEqual(["b"]);
    expect(filterJournalLines(lines, "  ")).toBe(lines);
  });

  it("přepočte částku do domácí měny podle kurzu", () => {
    expect(toHomeAmount(100, 25.12, 1)).toBe(2512);
    expect(toHomeAmount(100, null, 1)).toBe(0);
  });
});

describe("journal-lines-model – platnost a přečíslování", () => {
  const ctx = {
    texts: DS_TEXTS_CS.journalEditor,
    accountByCode: new Map(),
    sideFields: "split" as const,
    sharedSide: "both" as const,
    sideFieldRules,
    dimensionRequired: false,
    vatActive: false,
    vatCodeMap: new Map(),
    calcMode: "net" as const,
    foreign: false,
    documentMark: "Kč",
    missingVatAccounts: new Map<string, string>(),
  };
  const scope = { showAllErrors: false, touched: new Set<string>() };

  it("chyby čísluje podle pořadí řádku", () => {
    const lines = [a, { ...b, creditAccount: null, amount: 0 }];
    const errors = validateJournalLines(lines, ctx, scope);
    expect(numberJournalErrors(lines, errors)).toEqual([
      { line: 2, field: "creditAccount", message: "Vyberte účet DAL" },
      { line: 2, field: "amount", message: "Částka musí být nenulová" },
    ]);
  });

  it("nedotčený prázdný řádek a zaokrouhlení se nevalidují", () => {
    const blank: JournalLine = { id: "n", isBlank: true };
    const errors = validateJournalLines([blank, rounding], ctx, scope);
    expect(errors.get("n")).toEqual({});
    expect(errors.get("r")).toEqual({});
    const touched = validateJournalLines([blank], ctx, { ...scope, touched: new Set(["n"]) });
    expect(Object.keys(touched.get("n") ?? {})).toEqual([
      "debitAccount",
      "creditAccount",
      "amount",
    ]);
  });
});

describe("journal-column-layout – šířky sloupců", () => {
  it("zoom násobí šířku jen jednou a Text dostane zbytek", () => {
    const widths = journalColumnWidthsRem({
      columnIds: ["row", "text", "amount"],
      savedWidths: { amount: 160 },
      compactAccountIds: new Set(),
      layout: { customWidthsApplied: true, textMinRem: 12 },
      zoom: 2,
      effectiveWidthRem: 100,
    });
    expect(widths.row).toBe(8.5);
    expect(widths.amount).toBe(20);
    expect(widths.text).toBe(100 - 28.5 - 0.25);
  });
});
