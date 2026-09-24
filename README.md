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

## Changelog 2.17.2 – společný zoom tabulky a stromu

- `DataGrid` a `TreeGrid` při přepínání zobrazení automaticky zachovají zoom i hustotu; nový prop `viewZoomKey` explicitně propojí i odlišně pojmenované pohledy.
- Přepnutí do tabulkového zobrazení používá jednoznačnou ikonu tabulky.

## Changelog 2.17.1 – veřejné pomocné nástroje

- Veřejný vstup nově zpřístupňuje nastavení gridů, výpočty období, validaci formulářů a bezpečné opakování síťových požadavků.
- Interní zachytávání chyb a nouzová serverová stránka zůstávají záměrně neveřejné, protože nejsou součástí uživatelského rozhraní a zachytávání mění globální chování chyb.

## Changelog 2.17.0 – jednotný řádek akcí gridu a rovnocenné záložky

Nové:
- Veřejné `GridToolbar`, `GridToolbarSeparator`, `AsOfDateToggle`, `GridToggleButton`, `GridExpandControls` a typy akcí/exportů.
- `DataGrid`: `viewMode`, `onViewModeChange`, `asOf`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`.
- `TreeGrid`: `viewMode`, `onViewModeChange`, `asOf`, `toolbarLeft`, `filters`, `filterChips`, `onClearFilters`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`, `loading`.
- Ctrl/Cmd+kolečko používá stejný plynulý výpočet nad celým blokem DataGridu, TreeGridu i ZoomPane.
- `PageHeader.menuActions`, `AppShell.navSearchMenu` a `LayoutMenu trigger="icon"` přesouvají akce stránky do ⋯ a uložená rozložení vedle hledání v menu.
- Lišta záložek je vždy viditelná. Všechny záložky jsou rovnocenné a `openerTabId` dál váže detail k seznamu.

Změny chování a přechod:
- **Breaking:** TreeGrid už nemá textová tlačítka ani segment úrovní; rozbalení/sbalení je ikonové a více úrovní je v nabídce.
- **Breaking:** TreeGrid používá společný ikonový `GridExport` místo `ExcelExportButton`; Excel zachovává osnovu a SUBTOTAL, stejné menu nabízí PDF, HTML a vlastní exporty.
- **Breaking:** `PageHeader` už nemá spodní linku ani spodní vnitřní odsazení.
- **Breaking:** aktivní `GroupControl`, včetně skrytého seskupení, je oranžový místo modrého nebo červeného.
- Stávající `actions` zůstává funkční, ale nové primární akce přesuňte do `addAction` a vedlejší do `moreActions`.
- `AsOfDateField` je zastaralý; v řádku akcí použijte `AsOfDateToggle`.
- **Breaking:** odstraňte `PaneTab.pinned`, target `preview`, `keepTab`, `releaseTab` a `PaneLayout.tabBarMode`. Běžný klik používá `target: 'replace'`; staré uložené `pinned` se bezpečně ignoruje.
- **Breaking:** `PaneLayout` už nepřijímá panelové `isPinned` / `onTogglePin`; samostatný `PinnedBar` zůstává beze změny.
- **Breaking:** `PageHeader.actions` se uvnitř panelu nevykreslí; akce celé stránky přesuňte do `menuActions`, „Nový“ do gridového `addAction`.
- `PageHeader` má v panelu vpravo pouze ↑/↓, ←/→, maximalizaci a ⋯. Alt+↑/↓ listuje záznamy, Alt+←/→ historií a Alt+M maximalizuje.
- `LayoutMenu` přesuňte z horní lišty do `AppShell.navSearchMenu` a použijte `trigger="icon"`.

## Changelog 2.16.0 – nahrazeno ve 2.17.0

Koncepty, historie, maximalizace, listování záznamy a uložená rozložení zůstávají. Dočasné/ponechané záložky, `pinned`, `preview`, `keepTab`, `releaseTab` a `tabBarMode` byly ve 2.17.0 odstraněny; postup přechodu je v changelogu 2.17.0 výše.

## Changelog 2.15.0 – skupiny a hledání v menu

- AppShell odděluje skupiny menu, pamatuje jejich sbalení a ve sbaleném záhlaví zachová součet odznaků i označení aktivní stránky.
- Nové hledání v menu ignoruje diakritiku, podporuje více slov, šipky, Enter, Esc a zkratku `/`; ve sbaleném menu se otevře dočasný překryv.
- Nové volitelné props: `navStateKey`, `navSearch`, `navSearchPlaceholder`, `navSearchEmptyText`. Stav skupiny používá klíč `ds:nav-groups:<navStateKey>:<group.id>`.
- Firma je jednořádková a výraznější; období používá stavový štítek s rozsahem na široké obrazovce. Stávající props zůstávají kompatibilní.

## Changelog 2.13.0 – bílý vzhled a IBM Plex

- Všechny plochy světlého režimu jsou bílé; hover, záhlaví a součty gridu v neutrální šedé, linky #DFE3E8, okraj gridu a karet #C9D0D8.
- Levé menu tmavě modré (tokeny `--sidebar`, nové `--sidebar-muted` a `--sidebar-indicator`), aktivní položka se světle modrým levým pruhem.
- Písmo IBM Plex Sans (text, nadpisy, částky s tabulkovými číslicemi) a IBM Plex Mono (kódy, 0.95em); Work Sans a JetBrains Mono odstraněny. Aktualizujte odkaz na písma v hlavičce aplikace.
- Chování komponent se nemění; PDF a Excel beze změny.

## Changelog 2.12.0 – záložky v panelech

Každý panel obsahuje seznam záložek. **Breaking changes** a přechod:

- `usePaneDirty(isDirty)` → `useTabDirty(isDirty, key?)`. Příznak se drží podle záložky i po jejím odpojení.
- `usePaneManager().openInPane(route, params, { target: 'active' | 'new' | paneId, uniqueKey })` → `usePaneTabs().openTab(route, params, { target: 'replace' | 'newTab' | 'adjacentPane', kind: 'list' | 'record', recordKey, title, shortTitle, icon })`. `uniqueKey: true` = `kind: 'record'`. `confirmAllPanesClean` a `registerDirty` odstraněny.
- Stav: `PaneState` / `PaneLayoutState` (v1) → `PaneTabsState` (`version: 2`). Uložené hodnoty převede `parsePaneTabs` automaticky, objekty v1 `migratePaneStateV1`. `serializePanes` / `parsePanes` → `serializePaneTabs` / `parsePaneTabs` (DB) a `serializeActiveTabUrl` / `parseActiveTabUrl` (URL, jen aktivní záložka).
- `PaneLayout` je řízený přes `PaneTabsProvider` (props `state`, `onChange`, `onSaveTab`, `onNewTabRequest`); props `panes`, `activePaneId`, `layout`, `widths`, `onChange`, `renderPane`, `defaultRoute` nahrazuje `renderTab(tab, pane)` a `getTabIcon`. Samostatný křížek panelu nahradilo menu ⋯.
- `usePane()` navíc vrací `tabId`; `close()` zavírá záložku.
- Zkratky: Ctrl+1/2/3 a Ctrl+Shift+W zrušeny → Alt(Option)+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T.
- Nové: `PaneTabBar`, `PaneLink`, `getOpenTarget`, `handlePaneLinkEvent`, `useTabDraft`, `useTabScrollRestore`, `clearTabState`, `MAX_TABS_PER_PANE`. Navigace AppShellu uvnitř `PaneTabsProvider` otevírá záložky.

## Changelog 2.11.0

- Jemně modré pozadí pracovní plochy, bílé oddělené navigační plochy a výraznější okraje karet a mřížek.
- Aktivní hledání, filtry, jejich počet a štítky používají oranžový stav; vybraný řádek má modrý levý pruh.
- Nadpisy, popisky, záhlaví, součty a částky používají Work Sans bez verzálek; JetBrains Mono zůstává pro kódy a identifikátory.
- Záporné částky používají typografický znak minus pro přesné zarovnání.

## Changelog 2.10.1

- **DataGrid, TreeGrid**: nadpis je nově ve výchozím stavu skrytý. Nový prop `showTitle` ho zobrazí pouze na vyžádání; `title` zůstává dostupný pro export a uložená nastavení.

## Changelog 2.10.0

- **PaneLayout**: `setLayout(2 | 3)` doplní chybějící prázdné panely a aktivuje první nový. Prop `renderEmpty` upraví prázdný obsah; lišta záložek zůstává vždy viditelná.
- **PinnedBar**: nová lišta trvalých záložek s props `items`, `onOpen(id, { newPane })`, `onUnpin`, `onReorder`, `texts` a `className`.
- **AppShell**: nový slot `subHeader`, který se vykreslí pod horní lištou a skryje při aktivním panelu Nastavení/Administrace.
- **DataGrid**: nové props `onRefresh` a `refreshing`; výběr více používá `GridSelectionToggle` s počtem vybraných řádků.
- **TreeGrid**: nové props `onRefresh`, `refreshing`, `selectable`, `selectionActions`, `onSelectedRowsChange` a `gridTexts`; lišta používá stejné ovladače obnovení a výběru jako DataGrid.
- **LayoutSwitcher**: výchozí nápovědy voleb jsou „1 panel“, „2 panely“ a „3 panely“; nedostupné volby dál zobrazují potřebnou šířku.

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
- `toJournalRow` a `fromJournalRow` převádějí předkontaci na jeden databázový řádek a zpět.
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

## Changelog 2.8.0
Doplnění pro výkazy účetnictví.
- **TreeGrid**: `expandLevels` + řízené `expandDepth` / `onExpandDepthChange` (segmentovaný přepínač v liště), `highlightedRowId` (výchozí naposledy rozbalený / vybraný uzel), `onRowClick`, `storageKey`, výběr sloupců (`hiddenByDefault` u sloupce, uložení přes `useGridColumns`), zoom a hustota (`useGridZoom`), akce `actions` vpravo od zoomu. Export do Excelu: souhrnný řádek pod dětmi (outline `summaryBelow`) a součty uzlů jako `SUBTOTAL(9, …)`.
- **AccountSelect**: `allowLevels` (`class` | `group` | `synthetic` | `analytic`) a `catalog` (názvy tříd a skupin); při třídě / skupině vrací prefix („5“, „51“). Nové `accountLevelOf`, `AccountLevel`, `AccountCatalogItem`.
- **Nové**: `BarBreakdownChart` (vodorovné pruhy, hodnota + podíl %, výběr klikem, záporné červeně, bez externí knihovny), `FilterChips` (štítky filtrů + „Zrušit vše“).
- **Excel**: `GridExportData.outlineSummaryBelow` a `subtotalRows`.

## Changelog 2.8.1

- Volby firmy a účetního období jsou na široké obrazovce vystředěné; při nedostatku místa se automaticky přesunou vlevo před ovládací prvky.
- Volba firmy už v horní liště nezobrazuje ikonu budovy.
- Hlavní vstup knihovny nově zpřístupňuje sdílené nástroje pro velikost písma, mřížky, účetní převody, jména osob, PSČ, kraje a právní formy.

**Přechod z 2.7.x (TreeGrid)**
- Export stromu má nově rodiče **pod** dětmi – pokud jste soubor dál zpracovávali podle pořadí řádků, upravte to.
- První sloupec nelze skrýt; `width` se přepočítává podle zoomu.
- Tlačítko u uzlu má popisek z `texts.expandNode` / `texts.collapseNode` (dříve `expandAll` / `collapseAll`).
- Vlastní akce předávejte v `actions` – zobrazí se vpravo od zoomu.

## Changelog 2.7.1

Úklid API řádků zápisu (bez zpětné kompatibility):
- Odstraněno: `toDbLines`, `fromDbLines`, typ `JournalDbLine`, pole `JournalLine.pairNo`, typ `JournalMainAccount`. Náhrada: `toJournalRow` / `fromJournalRow`.
- JournalLinesEditor má nové veřejné props `mode` ('internal' | 'mainAccount', výchozí 'internal'), `mainSide` ('MD' | 'D'), `sideFieldRules` (výchozí `sideFieldRules`). Prop `mainAccount` je nově číslo účtu (string), ne objekt `{ accountId, side }`.
- Přechod: `mainAccount={{ accountId: "321001", side: "D" }}` → `mode="mainAccount" mainSide="D" mainAccount="321001"`.
- DocumentForm předává `mode`, `mainSide` a `mainAccount` editoru přímo; v `linesEditorProps` je už nelze přepsat.
- Nové typy: `JournalLinesMode`, `JournalMainSide`, `SideFieldRules`, `SideFieldRulesFn`.

## Changelog 2.7.0

- **DocumentForm přepracován pro skutečné doklady.** Nová hlavička `DocumentHeaderValue` (bookId, number, direction, accountingDate, issueDate, taxDate, dueDate, externalNumber, partnerId, variableSymbol, constantSymbol, specificSymbol, bankAccount, description, currency, rate, rateInfo, amountTotal, totalMode, roundingAmount, mainAccountId, excludeFromPaymentOrders).
- Kniha (po založení), číslo („přidělí se při zařazení“), kurz (s `rateInfo`) a směr jsou vždy jen ke čtení. Formulář nic neukládá ani nečísluje.
- Nové props `fields` + `documentFieldsForType(code)` (ID, FV, FP, PO, BA, ZFV, ZFP, UZ), `editableFields`, `isNew`, `mainSide`, `mainAccountLocked`, `linesEditorProps`, `tabs` (Řádky vždy první).
- **Nový PaymentScheduleEditor** (splátky a pozastávky, Doplnit zbytek, Rozložit…, Uvolnit / Zrušit uvolnění) a čistá funkce `generatePaymentSchedule(total, params)`.

### Přechod z 2.6 (bez zpětné kompatibility)

| Dříve | Nyní |
|---|---|
| `value.vs` | `value.variableSymbol` |
| `value.amount` | `value.amountTotal` + `value.totalMode` (`'entered'` / `'sum'`) |
| `value.number` editovatelné | jen zobrazení, přiděluje databáze |
| `value.rate` editovatelný (`onRateChange`) | jen zobrazení + `rateInfo` |
| prop `sideFields` | `linesEditorProps={{ sideFields }}` |
| hlavní účet v řádcích ručně | `value.mainAccountId` + prop `mainSide` → `mainAccount` editoru |
| — | povinné nové pole `totalMode`, doporučené `accountingDate` |

## Changelog 2.6.1

- Nedostupné položky menu používají decentní stavovou tečku; celý text „Připravujeme“ zůstává v nápovědě a nepřekrývá název položky.
- Hlavní akce gridu, například „Nový doklad“, je vždy bezprostředně vpravo od ovládání zoomu.

## Changelog 2.6.0

- **JournalLinesEditor má dva režimy v jedné komponentě** – bez `mainAccount` jde o interní doklad (na řádku MD i DAL účet, `sideFields="split"` je nově výchozí); s `mainAccount` je hlavní strana jen ke čtení (šedě) a zadává se pouze protiúčet.
- `mainAccount.side` používá hodnoty `'MD' | 'D'` shodné s `documents.main_account_side`; `AccountSelect` protiúčtu nenabídne účty se stejnou `category` jako hlavní účet.
- Povinná stranová pole podle osnovy: `sideFieldRules(account, { dimensionRequired })` – VS u kategorií `pohledavky`, `zavazky`, `poskytnute_zalohy`, `prijate_zalohy`, `saldokonto`; zakázka u `bilance` při `dimensionRequired`; partner se nabízí u saldokontních účtů. Validace je jen nápověda s uvedením strany („Chybí zakázka na straně DAL"), rozhoduje databáze.
- Rozbalitelný detail řádku (Alt+↓) se stranovými poli a zaškrtávátkem Nedaňový; chybějící povinná pole se v řádku ukazují jako kompaktní štítky.
- Nedaňový už nemá vlastní sloupec – je to malá přepínací značka u částky (jen u nákladových / výnosových účtů), zkratka Ctrl+N.
- Řádek haléřového vyrovnání (`isRounding`) je šedý, bez akcí a vždy poslední, s nápovědou „Zaokrouhlení měňte v hlavičce dokladu"; u dokladu s hlavním účtem přibyl ukazatel „Zbývá rozepsat" (`totalAmount`, `totalMode="entered"`) a tlačítko „Dorovnat zaokrouhlením" (`onRoundingFill`, `roundingLimit`).
- `editableFields` nahrazuje `editableColumns` i `readOnly`; `AccountOption` má nová pole `category` a `accountType`; `DocumentForm` přijímá `sideFields`.

## Changelog 2.5.0

- **Režim více oken (panely 1 / 2 / 3)** – `PaneLayout` uvnitř `AppShell` místo `children`, `LayoutSwitcher` do horní lišty vedle `SearchButton`.
- Panely mají vlastní historii (`usePane()` → `navigate`, `back`, `forward`, `setTitle`, `close`), `usePaneManager().openInPane(route, params, { target })` a hlídání neuložených změn (`usePaneDirty`, `confirmAllPanesClean`).
- Stejný záznam se neotevře dvakrát (`uniqueKey`), minimální šířka panelu 560 px při 100 %, při zmenšení okna se panely dočasně skryjí s upozorněním a vrátí se po zvětšení.
- Dělicí čáry lze táhnout, dvojklik rozdělí šířky rovnoměrně; zkratky Ctrl+1/2/3 (přepnout panel) a Ctrl+Shift+W (zavřít panel), Ctrl+K a Ctrl+B zůstávají globální.
- Zkratky mřížek a editorů reagují jen v aktivním panelu; `RecordDialog` uvnitř panelu překrývá jen svůj panel; tisk vytiskne jen panel, ze kterého byl spuštěn.
- `DataGrid`, `PageHeader`, `RecordDialog`, `DocumentForm` a `JournalLinesEditor` jsou kontejnery (`@container`) – v úzkém panelu se chovají jako na úzké obrazovce. Mimo `PaneLayout` je vzhled beze změny.
- Serializace stavu panelů: `serializePanes` / `parsePanes` (URL `?panes=…&active=…` nebo JSON v databázi).

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
