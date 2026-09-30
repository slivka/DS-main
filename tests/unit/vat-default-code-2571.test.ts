import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

// 2.57.1 – pořadí výchozího kódu DPH v `makeLine`: předchozí řádek → výchozí kód knihy.
const source = readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8");

describe("Výchozí kód DPH nového řádku (2.57.1)", () => {
  it("předchozí řádek má přednost před výchozím kódem knihy", () => {
    expect(source).toContain(
      "regularLines[regularLines.length - 1]?.vatCodeId ?? vat?.defaultCodeId ?? null",
    );
    expect(source).not.toContain("vat?.defaultCodeId ?? regularLines[");
  });
});
