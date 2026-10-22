/** Texty tisku a exportu · vlastní překlady · bez React a výpočtů. */
import type { DsTexts } from "./types";
/** Společné popisky tiskových sestav a exportu. */
export const PRINT_TEXTS_SK: Pick<DsTexts, "print" | "export"> = {
  export: {
    parametersSheet: "Parametre exportu",
    parameter: "Parameter",
    value: "Hodnota",
    reportName: "Názov zostavy",
    company: "Firma",
    period: "Obdobie",
    exportedAt: "Exportované",
    user: "Používateľ",
    activeFilters: "Aktívne filtre",
    pageFooter: "Strana &P z &N",
    fallbackColumn: (i) => `Stĺpec ${i}`,
    printPdf: "Tlač (PDF)…",
  },
  print: {
    book: "Kniha",
    allBooks: "Všetky knihy",
    period: "Obdobie",
    search: "Hľadanie",
    filter: "Filter",
    asOf: "Stav k dátumu",
    total: "Celkom",
    portrait: "Na výšku",
    landscape: "Na šírku",
    orientation: "Orientácia strany",
    largeTitle: "Tlač veľkého objemu údajov",
    largeDescription: (r, p) =>
      `Zostava má ${r} riadkov, odhadom ${p} strán. Príprava PDF môže chvíľu trvať. Pokračovať?`,
    print: "Vytlačiť",
    printTitle: "Tlač",
    downloadPdf: "Stiahnuť PDF",
    preview: "Náhľad",
    preparing: "Pripravujem náhľad…",
    printedBy: "Vytlačil:",
    page: (p, n) => `Strana ${p} z ${n}`,
  },
};
