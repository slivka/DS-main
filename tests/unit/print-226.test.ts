import { describe, expect, it } from "bun:test";
import { amountInWordsCs, reportPageLabel } from "../../src/components/ds/print/report-pdf";

describe("české částky slovy", () => {
  it.each([
    [0, "nulakorunčeských"],
    [1, "jednakorunačeská"],
    [2, "dvěkorunyčeské"],
    [5, "pětkorunčeských"],
    [21, "dvacetjednakorunačeská"],
    [100, "stokorunčeských"],
    [1000, "jedentisíckorunčeských"],
    [1234567.89, "jedenmiliondvěstětřicetčtyřitisícpětsetšedesátsedmkorunčeských a osmdesátdevět haléřů"],
    [-5, "minuspětkorunčeských"],
  ])("převede %s", (amount, expected) => expect(amountInWordsCs(amount)).toBe(expected));

  it("u cizí měny připíše kód", () => expect(amountInWordsCs(180, "EUR")).toBe("stoosmdesát EUR"));
});

describe("číslování stran sestavy", () => {
  it("jednu stranu nečísluje", () => expect(reportPageLabel(1, 1)).toBe(""));
  it("více stran čísluje", () => expect(reportPageLabel(2, 3)).toBe("Strana 2 z 3"));
});