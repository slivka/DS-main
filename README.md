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
- **AppShell 2.0** – horní lišta přes celou šířku, sbalitelné boční menu a přepínatelné panely.
- **ContextPill / CompanySwitcher / PeriodSwitcher** – dvouřádkové kontextové volby firmy a období.
- **SearchButton / UserMenu** – globální hledání a uživatelská nabídka s pracovními prostory.
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
- Staré vlastnosti AppShellu zůstávají funkční a jsou označené jako zastaralé.

### Přechod z 1.x

1. `topBarLeft` nahraďte `contextLeft`, `topBarRight` rozdělte mezi `actions` a `userMenu`.
2. `adminNav` a `adminMode` postupně nahraďte `panels`, `activePanel` a `onActivePanelChange`.
3. Nastavení velikosti písma a motivu přesuňte na stránku Předvolby; dočasně je lze ponechat přes `showLegacyToolbar`.
4. Plochý seznam `items` dál funguje, pro nové aplikace používejte `navGroups`.

## Ukázkové stránky

- `/` – přehled barev, typografie, rozestupů, tlačítek, vstupů a stavů
- `/components/grid` – účetní deník v plně funkční mřížce
- `/components/forms` – editační dialog dokladu se všemi vstupy
- `/components/feedback` – dialogy, potvrzení, hlášky, prázdné a chybové stavy
- `/guidelines` – pravidla použití
