# Slivka Design System

Sdílený základ pro firemní aplikace Slivka. Obsahuje vzhled (Navy Trust),
datové mřížky, formulářové vstupy, dialogy a účetní komponenty.
Projekt běží výhradně na ukázkových datech v paměti – nemá žádné napojení
na databázi ani na produkční data. První navazující aplikace je „Accounting“.

## Zapojení do aplikace

`SlivkaProvider` zajistí React Query, tooltipy a toast notifikace. `SlivkaHead` v hlavičce načte IBM Plex Sans/Mono a nastaví motiv před prvním vykreslením.

```tsx
<html lang="cs">
  <head><SlivkaHead /></head>
  <body><SlivkaProvider queryClient={queryClient}>{children}</SlivkaProvider></body>
</html>
```

Roboto TTF zůstává interní součástí pouze kvůli českým znakům v PDF exportu; webové rozhraní jej nepoužívá.

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
- **Velikost zobrazení** – ovládání 70–200 % v uživatelské nabídce; nastavení se ukládá pro zařízení.

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
- **toJournalRow / fromJournalRow** – převod předkontace na jeden databázový řádek a zpět (1:1).

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

## Ukázkové stránky

- `/` – přehled barev, typografie, rozestupů, tlačítek, vstupů a stavů
- `/components/grid` – účetní deník v plně funkční mřížce
- `/components/forms` – editační dialog dokladu se všemi vstupy
- `/components/feedback` – dialogy, potvrzení, hlášky, prázdné a chybové stavy
- `/guidelines` – pravidla použití

## Skripty

| Skript | Účel |
|---|---|
| `bun run dev` | náhled knihovny |
| `bun run build` | sestavení |
| `bun run test` | jednotkové testy |
| `bun run typecheck` | kontrola typů |
| `bun run lint` | ESLint |
| `bun run format` / `format:check` | Prettier |
| `bun run test:excel` | test stažení Excelu (Playwright) |

## Další dokumentace

- [CHANGELOG.md](CHANGELOG.md) – přehled změn a migrace.
- [.lovable/system.md](.lovable/system.md) – pravidla design systému.
- [AGENTS.md](AGENTS.md) – technická pravidla projektu.
