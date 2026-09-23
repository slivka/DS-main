# Slivka Design System

Sdílený základ pro firemní aplikace Slivka. Obsahuje vzhled (Navy Trust),
datové mřížky, formulářové vstupy, dialogy a účetní komponenty.
Projekt běží výhradně na ukázkových datech v paměti – nemá žádné napojení
na databázi ani na produkční data. První navazující aplikace je „Accounting“.

## Instalace písem

Hostitelská aplikace musí v hlavičce načíst Work Sans 400–700 a JetBrains Mono 500–700:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" />
```

## Struktura

```text
src/
  components/
    ds/            design systém – jediný veřejný vstup je ds/index.ts
      layout/      aplikační rám, dialogy, navigace
      grid/        datová mřížka a její části
      form/        formulářové vstupy a výběry
      feedback/    potvrzení, načítání, chyby, poznámky, historie
      data-display/ štítky, stavy, stromy, zkrácené texty
      accounting/  komponenty pro účetní aplikace
    ui/            shadcn primitiva (tlačítka, dialog, popover, …)
    showcase/      rám ukázkových stránek
  lib/             formátování, období, nastavení, ukázková data (lib/mock)
  routes/          ukázkové stránky design systému
  styles.css       barvy, typografie, rozestupy, tisk, tmavý režim
```

## Komponenty

### Rám aplikace
- **AppShell 2.3** – adaptivní horní lišta bez zalamování, sbalitelné boční menu a přepínatelné panely.
- **ContextPill / CompanySwitcher / PeriodSwitcher** – kontextové volby firmy a období s kompaktním a prázdným stavem.
- **SearchButton / NotificationBell / ThemeToggleButton / UserMenu** – hledání, oznámení, rychlý motiv a uživatelská nabídka.
- **WorkspaceCompanySwitcher** – výběr workspace a firmy v horní liště.
- **EntitySwitcher** – obecný přepínač jedné entity v liště.
- **RecordDialog** – editační dialog záznamu s patičkou, bočním panelem a akcemi.
- **Breadcrumbs** – cesta k aktuální stránce.
- **CollapsibleSection** – sbalitelná sekce obsahu.
- **CommandPalette** – rychlé hledání stránek (Ctrl/Cmd + K).
- **ThemeToggle** – přepínač světlého a tmavého režimu.
- **ThemeSetting** – volba Světlý / Tmavý / Podle systému pro stránku Předvolby.
- **FontSizeSetting** – volba velikosti písma celé aplikace.

### Datová mřížka
- **DataGrid** – kompletní mřížka: hledání, řazení, filtry, výběr sloupců, seskupení,
  změna šířky, virtualizace, součty, stránkování, výběr řádků, akce a exporty.
- **GridTitle, GridSearch, GridSort, GridFilters, GridGrouping, GridSections** – části lišty mřížky.
- **ColumnPicker, ColumnFilter, GridColumnResize, GridColumns** – práce se sloupci.
- **GridExport** – export do Excelu (jako tabulka se součty) a do PDF.
- **GridZoom** – zvětšení a zmenšení mřížky.
- **GridPagination** – stránkování a počet řádků na stránku.
- **GridStates** – prázdný stav, chyba, načítání.
- **GridAction** – ikonové tlačítko akce v řádku.
- **BulkSelectionBar** – lišta hromadných akcí nad vybranými řádky.
- **ViewModeToggle** – přepínač tabulka / strom.

### Formuláře
- **DecimalInput** – číselný vstup, tisíce mezerou, 2 desetinná místa.
- **DateField / AsOfDateField** – datum s kalendářem, případně „ke dni“.
- **TimeInputRight** – zadání času.
- **OptionSelect** – sdílený výběr ze seznamu (nikdy nativní výběr).
- **CategorySelect, MultiSelect, ChipMultiSelect, ResizableCombobox** – výběry více hodnot.
- **EntitySelect** – vyhledávací výběr záznamu (klient, partner).
- **TagPicker** – štítky s možností vytvořit nový.
- **IcoField / IcoLink** – IČO s dohledáním v rejstříku a odkazem.
- **LegalFormField** – právní forma.
- **CountrySelect** – země s vyhledáváním bez diakritiky.
- **AddressFields** – adresa včetně PSČ a obce.
- **PeriodFilter** – filtr období pro mřížky a přehledy.

### Zpětná vazba
- **useConfirmDialog** – potvrzovací dialog místo systémového potvrzení.
- **LoadingOverlay** – překryv při načítání.
- **ErrorBoundary** – zachycení chyby obrazovky.
- **HistoryPanel** – historie změn záznamu.
- **RecordNotes / NotesPanel / NotesGridAction** – poznámky k záznamu.

### Zobrazení dat
- **StatusBadge** – štítek stavu s volitelnou konfigurací barev a názvů.
- **StatusDot** – kompaktní značka aktivní / neaktivní.
- **TruncatedText** – text v buňce zkrácený s nápovědou.
- **TreeView** – stromové zobrazení číselníků.

### Účetnictví
- **AmountCell / AmountInput** – částka vpravo, tisíce mezerou, 2 desetinná místa.
- **debitCreditColumns** – dvojice částkových sloupců „MD částka“ / „DAL částka“ s kontrolou rozdílu v součtu.
- **AccountCode** – číslo účtu se syntetikou a analytikou (221001 → 221.001).
- **AccountSelect** – výběr účtu s kódem, názvem a typem; neaktivní a syntetické lze zakázat.
- **DocumentStatusBadge** – stavy dokladu Koncept / Zaúčtováno / Stornováno.
- **FiscalPeriodSelect** – účetní období se stavy Otevřené / V uzávěrce / Uzavřené.
- **JournalLinesEditor** – in-place grid předkontací se zoomem, klávesovým ovládáním, validací a volitelnou měnou.
- **toDbLines / fromDbLines** – převod předkontace MD/DAL na dva databázové řádky se společným `pairNo` a zpět.

### Formátování (`src/lib/format.ts`)
`formatAmount`, `formatCurrency`, `amountClass`, `formatDate`, `setFormatSettings` –
tisíce mezerou, 2 desetinná místa, záporné hodnoty červeně, datum dd.MM.rrrr,
měna podle nastavení aplikace.

## Pravidla použití

- Tisíce se oddělují mezerou všude – v editacích, mřížkách, tiscích i exportech.
- Akční tlačítka v řádku mřížky jsou ikonová, v editačních dialozích pouze textová.
- „Odstranit“ je červené tlačítko v levém rohu patičky, ostatní tlačítka vpravo.
- Editace otevřená z mřížky se po Zrušit / Odstranit / Uložit vrací zpět na mřížku.
- Název mřížky, lišta, hlavička a součtový řádek tvoří jeden spojený blok.
- Export do Excelu je vždy skutečná tabulka se součty a roztaženými sloupci.
- Tiskové sestavy a PDF mají tmavě modrý nadpis; u více stran se opakují jen důležité údaje.
- Nové obrazovky se skládají výhradně z komponent design systému. Chybí-li komponenta,
  doplní se do `src/components/ds`, nikdy jen do jedné stránky.
- Texty komponent se předávají přes props; výchozí hodnoty jsou české.

## Jak založit novou aplikaci

1. Vytvořte remix tohoto projektu.
2. V `AppShell` nastavte název aplikace a položky navigace.
3. Nahraďte ukázková data v `src/lib/mock` skutečnými zdroji dat.
4. Ukázkové stránky v `src/routes` použijte jako vzor a postupně je nahraďte
   obrazovkami aplikace.
5. Importujte výhradně z `@/components/ds`.

## Changelog 2.0.0

- Horní lišta nyní vede přes celou šířku a značka aplikace je její první částí.
- Přibyly řízené panely, sbalitelné menu, nové přepínače firmy a období, hledání a uživatelská nabídka.
- Nastavení písma a motivu jsou samostatné komponenty pro stránku Předvolby.
- AppShell používá jediné rozhraní přes `navGroups`, `panels`, `activePanel`,
  `onActivePanelChange`, `contextLeft`, `actions` a `userMenu`.

## Changelog 2.1.0

- AppShell už neobsahuje staré administrativní aliasy, plochý seznam navigace
  ani dočasné ovladače vzhledu v horní liště.
- `JournalLinesEditor` je samostatný in-place grid se zoomem, hustotou, uloženými šířkami a sticky součtem.
- Přibylo řízení sloupců přes `editableColumns`, měnové sloupce, výchozí hodnoty a validace jednotlivých buněk.
- Klávesnice podporuje přímé přepsání znakem, F2, Enter/Tab, Esc, Ctrl+D a Ctrl+Delete s akcí Zpět.
- `toDbLines` a `fromDbLines` převádějí předkontace na párové databázové řádky a zachovávají starší nespárovatelná data.
- `readOnly` zůstává zpětně kompatibilní zkratkou pro prázdné `editableColumns`.

## Changelog 2.2.0

- Horní lišta standardně začíná přepínačem firmy; původní blok značky lze zapnout přes `showBrand`.
- Pravá část má pevné pořadí hledání, panely, oznámení, motiv a uživatel.
- Přibyly `NotificationBell` a `ThemeToggleButton`; motiv se okamžitě synchronizuje s `ThemeSetting`.
- Staré vlastnosti AppShellu zůstávají dočasně funkční a jsou označené jako zastaralé.

## Changelog 2.3.1

- Kompaktní a mobilní zobrazení přepínače období ukazuje kód období (např. 2026) místo technického identifikátoru.
- Kód období má na úzkých obrazovkách dostatek místa, aby zůstal čitelný.
- Přepínač firmy v kompaktním režimu zkrácený název firmy potvrzen; identifikátory se nikdy nezobrazují.

## Changelog 2.4.0

- Řádky zápisu odpovídají databázi 1:1 – nové mapování `toJournalRow` / `fromJournalRow`; `toDbLines`, `fromDbLines` a `pairNo` jsou deprecated.
- Nové props `sideFields` ("shared" | "split") a `sharedSide` pro oddělený VS, partnera a zakázku na straně MD a DAL.
- Nový prop `mainAccount` pro knihy s pevným hlavním účtem – zadává se jen protiúčet.
- Nový sloupec Nedaňový (`isNonTaxAllowed`) a jen pro čtení řádek zaokrouhlení (`isRounding`) vždy na konci.
- Ukázka Účetní formuláře obsahuje interní doklad s oddělenými stranami a pokladní doklad s hlavním účtem 211.

## Changelog 2.3.0

- Přepínač období rozlišuje stav bez výběru a firmu bez období; volitelně nabídne založení období.
- Kontext firmy a období se pod 1 280 px automaticky zkrátí, mobilní lišta zůstává jednořádková bez vodorovného posuvu.
- Boční menu se pod 1 280 px automaticky sbalí a lze je kdykoli přepnout tlačítkem dole nebo zkratkou Ctrl+B.
- Ukázka Navigace obsahuje náhled šířek 1 440, 1 100 a 390 px i oba prázdné stavy období.

## Ukázkové stránky

- `/` – přehled barev, typografie, rozestupů, tlačítek, vstupů a stavů
- `/components/grid` – účetní deník v plně funkční mřížce
- `/components/forms` – editační dialog dokladu se všemi vstupy
- `/components/feedback` – dialogy, potvrzení, hlášky, prázdné a chybové stavy
- `/guidelines` – pravidla použití
