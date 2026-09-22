# Slivka Design System – pravidla pro AI agenty

## Filozofie

Slivka Design System je sdílený základ firemních aplikací Slivka. Vizuální identita
„Navy Trust": tmavě modrá jako hlavní barva, klidné neutrální pozadí, profesionální
a důvěryhodný dojem. Systém běží výhradně na ukázkových datech v paměti – žádné
napojení na databázi ani produkční data. Czech UI texty, české formáty dat a částek.

## Pevná pravidla

1. **Skladuj výhradně z design systému.** Nové obrazovky skládej jen z komponent
   exportovaných z `@/components/ds` (jediný veřejný vstup). Shadcn primitiva
   (`@/components/ui/*`) používej jen uvnitř ds komponent, ne přímo na stránkách.
   Pokud komponenta chybí, doplň ji do design systému, ne do stránky.
2. **Tokeny, ne surové hodnoty.** Barvy, rozestupy, poloměry, stíny a typografii
   vždy ber ze `src/styles.css` (CSS proměnné a Tailwind utility na nich). Nikdy
   nezapisuj surové hex hodnoty ani ad-hoc pixel rozestupy do komponent.
3. **Tisíce vždy odděluj** – v komponentách, v gridech, v tiskových sestavách
   a ve všech exportech (Excel, PDF a další). Používej formátovací funkce z
   `@/lib/format` a `@/lib/date-time-preferences`, nikdy vlastní formátování.
4. **Akční tlačítka v editačních dialozích jsou jen textová, bez ikon.**
   Akční tlačítka v řádku gridu jsou naopak ikonová.
5. **Sdílené komponenty důsledně** – nová funkcionalita se skládá ze stávajících
   ds komponent, aby se vše chovalo kompaktně. Nevytvorej paralelní varianty.
6. **Exporty do Excelu** ve formě tabulky včetně součtu v tabulce; všechny sloupce
   roztažené tak, aby byl vidět obsah (výjimka: extra dlouhé texty se zalamují).
   Používej `GridExport` / `grid-export` komponentu.
7. **Tiskové a PDF sestavy**: nadpis vždy tmavě modrý; u vícestránkových sestav
   opakuj v záhlaví jen důležité údaje.
8. **Nic nepřepisuj ani nezjednodušuj.** Vzhled a chování importovaných komponent
   zůstávají beze změny; rozšiřuj, nepřepisuj.
9. **Žádné pevné uživatelské texty v komponentách.** Všechny popisky, nápovědy,
   zástupné texty, prázdné stavy a přístupnostní názvy předávej přes props;
   výchozí hodnoty jsou vždy české. Grid používá `DEFAULT_GRID_TEXTS` a prop
   `texts`, aby aplikace mohla dodat slovenské nebo jiné překlady.

## Čísla a data

- Tisíce odděluj mezerou – v editech, gridech, tiscích i exportech.
- Částky na 2 desetinná místa, zarovnané vpravo, záporné červeně
  (`AmountCell`, `AmountInput`, `formatAmount`).
- Datum vždy ve formátu `dd.MM.rrrr`.
- Číselné vstupy vždy `DecimalInput` / `AmountInput`, nikdy holý `input`.
- Formátování ber z `@/lib/format` a `@/lib/date-time-preferences`.

## Tlačítka a dialogy

- Editační dialog: akční tlačítka jen text, bez ikon. Řádek gridu: ikonová tlačítka.
- „Odstranit“ je červené a stojí vlevo v patičce dialogu, ostatní tlačítka vpravo.
- Edit vyvolaný z gridu se po Zrušit / Odstranit / Uložit vrací zpět na grid,
  odkud byl vyvolán.
- Potvrzení vždy přes `ConfirmDialog`, nikdy `window.confirm`.
- Výběry vždy `OptionSelect` / `EntitySelect` / `AccountSelect`, nikdy nativní
  `select`.
- Texty komponent se předávají přes props; výchozí hodnoty jsou české
  (aplikace běží česky i slovensky).

## Gridy, exporty, tisk

- Název gridu, lišta, hlavička a součtový řádek tvoří jeden spojený blok.
- Export do Excelu vždy jako tabulka Excelu se součty a roztaženými sloupci
  (výjimka: extra dlouhé texty se zalamují).
- Tiskové sestavy a PDF: nadpis tmavě modrý; u vícestránkových sestav opakuj
  v hlavičce jen důležité údaje.

## Účetní konvence

- Číslo účtu se ukládá jako `221001`, zobrazuje se jako `221.001` (`AccountCode`);
  analytika má proměnnou délku.
- Stav dokladu vždy přes `DocumentStatusBadge`. Stavy: `draft` = Koncept
  (přerušovaný rámeček, doklad se nikde nepočítá), `filed` = Zařazen (má číslo,
  počítá se, není zaúčtován, informační tón), `posted` = Zaúčtován (success),
  `locked` = Uzamčen (tmavší neutrální tón s ikonou zámku), `cancelled` =
  Stornován (danger).
- Příznak `approved` na `DocumentStatusBadge` zobrazí vedle stavu malý odznak
  „Schválen“ (success, fajfka). Je nezávislý na stavu dokladu.
- Hlavičku stránky skládej z `PageHeader` (nadpis, popis, akce vpravo,
  spodní linka), ne vlastním nadpisem na stránce.
- MD / Dal přes `debitCreditColumns` s kontrolou rozdílu v součtu.
- Účetní období přes `FiscalPeriodSelect` (Otevřené / V uzávěrce / Uzavřené).
- Workspace a firma přes `WorkspaceCompanySwitcher` v `AppShell`.


## Struktura

- `src/components/ds/` – design systém, jediný veřejný vstup `ds/index.ts`
  (layout, grid, form, feedback, data-display, accounting)
- `src/components/ui/` – shadcn primitiva
- `src/hooks/`, `src/lib/` – hooky a pomocné funkce (format, period, font-scale,
  theme, grid-prefs, date-time-preferences, legal-forms, regions, postal-code,
  person-name, form-errors, utils)
- `src/routes/` – ukázkové stránky (showcase), jen náhled, není součástí knihovny
- `src/styles.css` – barvy, typografie, rozestupy, tisk, tmavý režim

## Přístupnost a konvence

- Semantické elementy (`button`, `a`, `label` připojený k inputu), viditelný focus.
- Variace komponent přes pojmenované props (`variant`, `size`), ne booleovské
  styling props ani duplicitní komponenty.
- Přijímej a slučuj `className`, přeposílej ref a zbývající props elementu.
