import { createFileRoute } from "@tanstack/react-router";

import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Pravidla – Slivka Design System" },
      {
        name: "description",
        content: "Závazná pravidla pro tvorbu obrazovek, mřížek, formulářů, exportů a tisků.",
      },
      { property: "og:title", content: "Pravidla – Slivka Design System" },
      {
        property: "og:description",
        content: "Závazná pravidla pro tvorbu obrazovek, mřížek, formulářů, exportů a tisků.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidelinesPage,
});

const RULES: { title: string; items: string[] }[] = [
  {
    title: "Čísla a data",
    items: [
      "Tisíce se oddělují mezerou – v editacích, mřížkách, tiscích i exportech.",
      "Částky mají vždy dvě desetinná místa a zarovnávají se doprava.",
      "Záporné částky se zobrazují červeně.",
      "Datum se píše ve tvaru dd.MM.rrrr.",
      "Měna se řídí nastavením aplikace.",
    ],
  },
  {
    title: "Tlačítka",
    items: [
      "V editačních dialozích jsou tlačítka pouze textová, bez ikon.",
      "V řádku mřížky jsou akce ikonové.",
      "Odstranit je červené tlačítko v levém rohu patičky, ostatní tlačítka vpravo.",
      "Editace otevřená z mřížky se po Zrušit, Odstranit i Uložit vrací zpět na mřížku.",
    ],
  },
  {
    title: "Mřížka",
    items: [
      "Název mřížky, lišta, hlavička a součtový řádek tvoří jeden spojený blok.",
      "Součtový řádek formátuje čísla stejně jako sloupce.",
      "Filtry, řazení, seskupení i výběr sloupců patří do lišty mřížky.",
    ],
  },
  {
    title: "Export a tisk",
    items: [
      "Export do Excelu se vytváří jako skutečná tabulka se součtovým řádkem.",
      "Sloupce se roztáhnou podle obsahu, dlouhé texty se zalamují.",
      "Nadpis tiskové sestavy a PDF je tmavě modrý.",
      "U vícestránkových sestav se v hlavičce opakují jen důležité údaje.",
    ],
  },
  {
    title: "Skládání obrazovek",
    items: [
      "Nové obrazovky se skládají výhradně z komponent design systému.",
      "Chybějící komponenta se doplní do design systému, ne lokálně do stránky.",
      "Texty se předávají přes vlastnosti komponent s českými výchozími hodnotami.",
    ],
  },
];

function GuidelinesPage() {
  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Design systém", to: "/" }, { label: "Pravidla" }]}>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Pravidla použití</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tato pravidla platí pro všechny aplikace postavené na design systému Slivka.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {RULES.map((group) => (
          <section key={group.title} className="rounded-lg border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ShowcaseLayout>
  );
}
