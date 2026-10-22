import { describe, expect, it } from "vitest";
import {
  filterNavGroups,
  highlightNavMatch,
  matchesNavSearch,
  normalizeNavSearch,
  withNavSections,
} from "../../src/components/ds/layout/nav-search";

const groups = [
  { id: "overview", label: "Přehled", items: [{ label: "Domů" }] },
  { id: "issued", label: "Vydané", section: "Doklady", items: [{ label: "Vydané faktury" }] },
  { id: "received", label: "Přijaté", section: "Doklady", items: [{ label: "Přijaté faktury" }] },
  { id: "reports", label: "Výkazy", section: "Přehledy a evidence", items: [{ label: "Rozvaha" }] },
];

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

  it("vykreslí nadpis jen na začátku každého po sobě jdoucího bloku", () => {
    expect(withNavSections(groups).map((entry) => entry.sectionStart)).toEqual([
      null,
      "Doklady",
      null,
      "Přehledy a evidence",
    ]);
  });

  it("skryje prázdný blok při hledání a prohledává i název sekce", () => {
    expect(filterNavGroups(groups, "faktury").map((group) => group.id)).toEqual([
      "issued",
      "received",
    ]);
    expect(
      withNavSections(filterNavGroups(groups, "faktury")).map((entry) => entry.sectionStart),
    ).toEqual(["Doklady", null]);
    expect(filterNavGroups(groups, "evidence").map((group) => group.id)).toEqual(["reports"]);
  });

  it("ponechá skupiny bez section beze změny", () => {
    const plain = groups.slice(0, 1);
    expect(filterNavGroups(plain, "")).toEqual(plain);
    expect(withNavSections(plain)[0].sectionStart).toBeNull();
  });
});
