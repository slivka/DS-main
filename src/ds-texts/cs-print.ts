/** Texty tisku a exportu · vlastní překlady · bez React a výpočtů. */
import type { DsTexts } from "./types";
/** Společné popisky tiskových sestav a exportu. */
export const PRINT_TEXTS_CS: Pick<DsTexts, "print" | "export"> = {
  export: {
    parametersSheet: "Parametry exportu",
    parameter: "Parametr",
    value: "Hodnota",
    reportName: "Název sestavy",
    company: "Firma",
    period: "Období",
    exportedAt: "Exportováno",
    user: "Uživatel",
    activeFilters: "Aktivní filtry",
    pageFooter: "Strana &P z &N",
    fallbackColumn: (i) => `Sloupec ${i}`,
    printPdf: "Tisk (PDF)…",
  },
  print: {
    book: "Kniha",
    allBooks: "Všechny knihy",
    period: "Období",
    search: "Hledání",
    filter: "Filtr",
    asOf: "Stav k datu",
    total: "Celkem",
    portrait: "Na výšku",
    landscape: "Na šířku",
    orientation: "Orientace stránky",
    largeTitle: "Tisk velkého objemu dat",
    largeDescription: (r, p) =>
      `Sestava má ${r} řádků, odhadem ${p} stran. Příprava PDF může chvíli trvat. Pokračovat?`,
    print: "Vytisknout",
    printTitle: "Tisk",
    downloadPdf: "Stáhnout PDF",
    preview: "Náhled",
    preparing: "Připravuji náhled…",
    printedBy: "Vytiskl:",
    page: (p, n) => `Strana ${p} z ${n}`,
  },
};
