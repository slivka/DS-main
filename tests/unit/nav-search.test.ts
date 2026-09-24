import { describe, expect, it } from "vitest";
import { highlightNavMatch, matchesNavSearch, normalizeNavSearch } from "../../src/components/ds/layout/nav-search";

describe("hledání v menu", () => {
  it("ignoruje diakritiku a velikost písmen", () => {
    expect(normalizeNavSearch("ÚČETNICTVÍ")).toBe("ucetnictvi");
    expect(matchesNavSearch("Účetní deník", "Účetnictví", "ucet")).toBe(true);
  });

  it("vyžaduje shodu všech slov v položce a skupině", () => {
    expect(matchesNavSearch("Účetní deník", "Výkazy účetnictví", "vykazy denik")).toBe(true);
    expect(matchesNavSearch("Účetní deník", "Výkazy účetnictví", "vykazy faktury")).toBe(false);
  });

  it("vrací zvýrazněný text pro nalezený výraz", () => {
    const result = highlightNavMatch("Účetnictví", "ucet");
    expect(Array.isArray(result)).toBe(true);
  });
});
