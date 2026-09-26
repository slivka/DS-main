# Komponenty design systému

## Edit dokladu 5 (2.34.0)

- `DocumentForm` používá nadpis sekce místo jediné záložky Řádky. Celkem ovládá Σ; u cizí měny odděluje částku dokladu, kurz a domácí přepočet.
- `JournalLinesEditor` přijímá `documentCurrency`, `homeCurrency`, `rate`, `rateAmount`, `units`, `onCreateUnit`, `reorderable` a řízený objekt `recap`. Staré `showCurrency`, `onRoundingFill` a ukládání rekapitulace přes `storageKey` se nepoužívají.
- `JournalLinesRounding` obsahuje `value`, `onChange`, `readOnly`, `label` a `limit`. Akce ± navrhne vyrovnání, zatímco samotné vyrovnání je připnutý poslední řádek.
- `JournalLine` přidává `quantity`, `unitId`, `unitPrice` a `isFxRounding`. Množství × cena automaticky určí částku.
- `JournalLinesRecap` má řízené `open`, `onOpenChange`, `tab`, `onTabChange` a explicitní `documentCurrency` / `homeCurrency`.
- `UnitSelect` používá `UnitOption { id, code, name, isActive }`; `onCreateUnit(code)` může asynchronně založit chybějící jednotku.

## Edit dokladu a jednotné lišty (2.32.0)

- `SuggestInput` načítá po 200 ms nejvýše 10 návrhů i pro prázdný dotaz. Ikona Historie zapíná a vypíná našeptávání; seznam ovládají šipky, Enter a Esc.
- `CounterpartyField.favoriteIds` řadí oblíbené aktivní partnery první; prázdný dotaz zobrazí celý abecední seznam.
- `DocumentForm` přijímá `handedOverBySuggest`, `descriptionSuggest` a položky identity `{ side: "MD" | "DAL", text }`. Ruční Celkem je editovatelné; Σ přepíná `totalMode` a u ID/UZ zůstává zamčené.
- `JournalLinesEditor.recapTabs` přidává vlastní záložky pod vestavěné Účtování a Zakázky. Horní lišta obsahuje Přidat, haléřové vyrovnání, Hledat, Sloupce, Obnovit rozložení a Hustotu se zoomem; Ctrl/Cmd+Enter přidá řádek.
- Pata vždy uvádí Rozpis, Haléřové vyrovnání a Celkem; při ručně zadaném součtu také Zadáno a barevný Rozdíl. Hledání nemění výpočty ani kontroly.

## Kontextový řádek gridu (2.23.0)

`GridContextBar` tvoří samostatný řádek nad `GridToolbar`; `DataGrid` a `TreeGrid` jej zobrazí přes props `period` a `book`.

- `GridPeriodFilter` pracuje vždy uvnitř `fiscalFrom`–`fiscalTo`, včetně nekalendářního období. Zúžené období je oranžové, Celé období neutrální.
- Veřejné nástroje: `useGridPeriod`, `gridPeriodRange`, `gridPeriodLabel`, `moveGridPeriod` a `filterByGridPeriod`. Stav lze uchovat přes `useTabDraft`.
- `GridBookSelect` zobrazí jedinou knihu jako tučný název; více knih nabízí hledání a volbu Všechny knihy.
- Při `book.value === "all"` a zadaném `getRowBookId` je Kniha automaticky první, neskrývatelný a nepřesunutelný sloupec. Nezapisuje se do uživatelských nastavení sloupců.
- Období ani knihu nevkládejte do `toolbarLeft`, pokud grid používá `GridContextBar`.
- `PageHeader.description` se od této verze nezobrazuje; kontext patří sem nebo do horní lišty.
- Kniha, období a pravý kontext používají stejné popisky, písmo a výšku ovládání jako řádek akcí. Běžná období drží krátkou šířku, YTD a vlastní rozsah se rozšíří podle textu.
- `GridSegmentedToggle` je lehký obrysový přepínač; výchozí volba je světle modrá, aktivní filtr oranžový.

## Řádek akcí gridu (2.23.0)

`GridToolbar` je jediný řádek akcí pro `DataGrid`, `TreeGrid` i vlastní obsah v `ZoomPane`.

- Vlevo: `ViewModeToggle` · Rozbalit / Sbalit · `AsOfDateToggle` · `toolbarLeft`.
- Vpravo nad 640 px: Hledat · Filtr │ Seskupit (jen DataGrid s `groupable`) · Sloupce · Hustota + zoom │ Vybrat více · `actions` · Stáhnout (`GridExport`) · `GridMoreMenu` │ Obnovit.
- Prázdné skupiny ani jejich oddělovače se nezobrazují; oddělovač nikdy není na kraji ani dvakrát vedle sebe.
- Stáhnout obsahuje jen Excel, PDF a `extraExports`; importy a vedlejší akce patří do `GridMoreMenu`.
- Řádek zůstává vždy jednořádkový. Podle skutečně změřené šířky přesouvá skupinu Zobrazení a následně Data do jediné nabídky ⋯; pod 640 px zůstávají Hledat, Filtr a tato nabídka.
- Panel `filters` se otevírá přímo pod řádkem akcí, sdílí zoom a hustotu a používá přirozené šířky prvků. `defaultFiltersOpen` jej může otevřít při prvním zobrazení.
- Oranžová označuje hledání, aktivní filtry, seskupení a `GridToggleButton tone="grouping"`.
- Modrá plná označuje zapnutý režim (`AsOfDateToggle`, `GridToggleButton tone="mode"`) a primární akci Přidat.
- Hlavní parametry obrazovky patří do `toolbarLeft`, pomocné filtry do `filters`, vedlejší akce do `moreActions`. „Nový“ se předává přes `addAction`, ne do `PageHeader`.
- Nad grid nepřidávejte samostatné filtry ani exportní tlačítka. `ExcelExportButton` je jen pro obsah mimo grid.

## PageTabs (2.23.0)

`PageTabs` je přepínač sekcí přímo pod nadpisem stránky. Používá 16px střední řez; aktivní záložka je tučná, v primární barvě a podtržená. Stejný styl používají záložky v `DocumentForm`.

## DataGrid

- `onRefresh?: () => void | Promise<unknown>` zobrazí ikonové tlačítko Obnovit data. Komponenta po dobu vrácené Promise sama zobrazí stav načítání.
- `refreshing?: boolean` umožní řídit stav načítání z aplikace.
- Nadpis je standardně skrytý. Zobrazí se pouze s `showTitle`; `title` lze dál použít pro název exportu.
- Hromadný výběr používá `GridSelectionToggle`; aktivní stav ukazuje počet vybraných záznamů.
- Zkratka F5 není komponentou přepsána.
- Nové props: `viewMode`, `onViewModeChange`, `viewZoomKey`, `asOf`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`. Při přepnutí mezi tabulkou a stromem se zoom zachová automaticky; `viewZoomKey` lze použít pro explicitní propojení odlišně pojmenovaných pohledů.

## TreeGrid

`TreeGrid` používá stejné ovládání obnovení a výběru jako `DataGrid`.

- `onRefresh?: () => void | Promise<unknown>` a `refreshing?: boolean` řídí obnovení.
- `selectable?: boolean`, `selectedRows?`, `onSelectedRowsChange?` a `selectionActions?` řídí hromadný výběr.
- `gridTexts?: Partial<GridTexts>` přepisuje společné texty gridové lišty včetně `refresh`.
- Nadpis je standardně skrytý a zobrazí se pouze s `showTitle`.
- Rozbalení používá ikonová tlačítka; více úrovní otevře nabídku, jedna úroveň se rozbalí přímo. Bez `expandLevels` se názvy odvodí ze skutečné hloubky.
- Nové props: `viewMode`, `onViewModeChange`, `viewZoomKey`, `asOf`, `toolbarLeft`, `filters`, `filterChips`, `onClearFilters`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`, `loading`.

## Záložky v panelech (2.12.0)

- `PaneTabsProvider` drží stav `PaneTabsState` (`version: 2`) přes `state` / `onChange`; `onSaveTab(tabId)` zobrazí v dialogu tlačítko Uložit, `onNewTabRequest` obsluhuje Alt+T. Obalte jím AppShell i PaneLayout – navigace pak otevírá záložky.
- `usePaneTabs()` – `openTab(route, params, { target: 'replace' | 'newTab' | 'adjacentPane', kind: 'list' | 'record', recordKey, title, shortTitle, icon })`, `closeTab`, `closeOtherTabs`, `moveTab`, `activateTab`, `activatePane`, `duplicateTab`, `setLayout`, `closePane`, `back`, `forward`, `setTabTitle`.
- Pravidla: prázdný panel → nová záložka, jinak nahrazení aktivní (rozepsaná → dialog Uložit / Zahodit / Otevřít v nové záložce / Zrušit); `record` jen jednou; limit 10 záložek na panel (zavře nejdéle nepoužitou čistou, jinak odmítne); zavření/ubrání panelu přesune záložky doleva (u prvního doprava) bez dotazu; automatické zúžení podle šířky se po zvětšení obnoví.
- `PaneLayout` – `renderTab(tab, pane)`, `getTabIcon(tab)`, `renderEmpty`, `minPaneWidth`, `texts`. Vykresluje jen aktivní záložku každého panelu.
- `PaneTabBar` – vždy viditelná lišta; záložky 120–200 px s tooltipem, ● při neuložených změnách, nabídka „»“, kontextové menu a přetahování mezi panely.
- `useTabDraft(tabId, initial, key?)` – stav, který přežije odpojení i přesun; `useTabScrollRestore`; `clearTabState` po zavření.
- `useTabDirty(isDirty, key?)` nahrazuje `usePaneDirty`.
- `PaneLink`, `getOpenTarget(event)`, `handlePaneLinkEvent(event, open)` – Cmd/Ctrl + klik a prostřední tlačítko = nová záložka, Cmd/Ctrl + Shift + klik = sousední panel.
- Stav: `serializePaneTabs` / `parsePaneTabs` (DB, v1 převede automaticky), `serializeActiveTabUrl` / `parseActiveTabUrl` (URL), `migratePaneStateV1`.
- Zkratky: Alt(Option)+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T.

## Rovnocenné záložky (2.17.0)

- `PaneTab` používá `openerTabId` pro vazbu seznam → detail. Staré uložené pole `pinned` se při načtení ignoruje a při dalším uložení vynechá. Maximalizace se neukládá.
- `openTab(route, params, { target: 'replace' | 'newTab' | 'adjacentPane', openerTabId })`: běžný klik používá `replace` a přidá krok historie; Cmd/Ctrl používá `newTab`, s Shift `adjacentPane`.
- `openRecord(route, params, { fromTabId, isNew, modifiers })`: otevřený záznam aktivuje; čistý detail stejného seznamu nahradí; dirty detail ponechá a otevře další; nový záznam vždy otevře další záložku.
- `reopenClosedTab` drží 10 posledních; `maximizePane` / `restoreLayout` / `toggleMaximize`; `registerRecordNav(tabId, getOrderedItems)` zapíná ↑/↓ a Alt+↑/↓.
- `usePaneChrome()` – kontext pro `PageHeader` (historie, dirty, recordNav, maximalizace, `menuActions`, `dragHandleProps`).
- `PageHeader` uvnitř panelu: vlevo nadpis a dirty tečka; vpravo ↑/↓, ←/→, maximalizace a ⋯. Akce stránky předávejte přes `menuActions`, nikoli `actions`.
- Koncepty: `useTabDraft(..., { route, params, recordVersion })` → `[value, set, meta]`, `persistDrafts`, `listOrphanDrafts`, `clearDrafts`, `DraftRestoredBanner`.
- Rozložení: `serializeLayout`, `applyLayout(snapshot, { keepDirty: true })`, `LayoutMenu trigger="icon"` přes `AppShell.navSearchMenu` (Alt+L).
- Zkratky: Alt+M, Esc, Alt+Shift+T, Alt+1/2/3 (při maximalizaci přepne maximalizovaný panel).

## PinnedBar

`PinnedBar` je jednořádková lišta trvalých záložek stránky. Přijímá `items`, `onOpen(id, { newPane })`, `onUnpin(id)`, volitelné `onReorder(ids)` a `texts`. Při prázdném `items` se nevykreslí.

## AppShell

Slot `subHeader?: ReactNode` se vykresluje přímo pod horní lištou. Při otevřeném Nastavení firmy nebo Administraci se automaticky skryje.

- Skupiny mají oddělená záhlaví a ukládají sbalení do `ds:nav-groups:<navStateKey>:<group.id>`; `navStateKey` je výchozí `appName`, panely přidávají své `id`.
- `navSearch?: boolean` je výchozí `true`; texty mění `navSearchPlaceholder` a `navSearchEmptyText`.
- `navSearchMenu?: ReactNode` vloží ikonovou nabídku rozložení vpravo vedle hledání; ve sbaleném menu pod lupu.
- Hledání ignoruje diakritiku a velikost písmen. `/` ho aktivuje, šipky mění výsledek, Enter otevře položku a Esc smaže hledání nebo pole opustí.
- Cmd/Ctrl+Enter otevře novou záložku, Cmd/Ctrl+Shift+Enter sousední panel. Zakázané položky jsou vidět, ale klávesové zvýraznění je přeskočí.

## CompanySwitcher a PeriodSwitcher

- `label` se nezobrazuje nad hodnotou; zůstává přístupnostním názvem a součástí nápovědy.
- Firma používá neutrální obrysový štítek s ikonou budovy, názvem a šipkou. V nápovědě zobrazuje celý název a IČO; v kompaktní šířce název zkrátí.
- Nabídka firmy obsahuje `searchPlaceholder` a jediný nepojmenovaný seznam všech `items`. Props `recentIds`, `recentLabel` a `allLabel` byly ve 2.22.0 odstraněny.
- Období používá stejnou výšku, poloměr, odsazení a typografii; otevřené je zelené, období v uzávěrce a stav bez výběru jantarové, uzavřené se zámkem a firma bez období tlumeně šedá bez tečky.
- `CompanySwitcher`, `PeriodSwitcher` i základní `ContextPill` podporují řízené `open` / `onOpenChange`. Výběr položky a `onCreate` otevřenou nabídku vždy zavřou.

### DocumentForm 2.31.0
- Formulář nemá pravý panel; používá jednotnou mřížku 70 / 15 / 15 v sekcích Partner, Data, Účtování a částka nebo Částka a volitelně Platební údaje.
- `title` se vždy zobrazí v `PageHeader`. `identity` je první řádek uvnitř karty s položkami a velkým číslem dokladu; na úzké ploše se položky zalomí a žádná se neskrývá.
- `directionBadge` stojí před identitou; bez `identity` vytvoří samostatný první řádek těla. Pruh akcí drží vlevo stav a Schváleno a vpravo akce.
- Identifikační údaje používají výrazný 15px řez. `DocumentStatusBadge size="md"` v pruhu akcí má stejnou výšku jako badge směru; výchozí `sm` zůstává pro gridy.
- `DocumentHeaderValue` podporuje `counterpartyIco`, `counterpartyDic` a `handedOverBy`. Propojený partner zamkne IČ a DIČ, ruční protistrana je ponechá editovatelná; chybné české IČ pouze zobrazí upozornění.
- Pokladní doklad zobrazuje Přijato od / Vyplaceno komu. Data začínají datem vystavení; externí čísla patří do partnerské sekce.
- `RateField` podporuje doporučený kurz, ruční kurz s povinným důvodem a režim jen pro čtení. Hodnota dokladu má `rateManual`, `rateNote`, `suggestedRate` a `suggestedRateInfo`.
- `IcoLink` odkazuje platné české IČO do obchodního rejstříku nebo ARES; `PartnerOption` podporuje `country` a `kind`.
- `onCreatePartner` dostává `{ name, ico, dic }`; osm číslic předvyplní IČO, jiný text název a samostatná pole se zachovají.
- Haléřové vyrovnání předává formulář do `JournalLinesEditor` přes `rounding`; pole je v dolní liště řádků vlevo od údaje Zbývá rozepsat a respektuje právo k úpravě.

## SectionHeading (2.28.0)

Jednotný nadpis sekcí formulářů, dialogů, karet a panelů: verzálky, jemná prokladová sazba a linka přes celou šířku. Nepoužívá se pro PageHeader ani záhlaví gridu.


## CounterpartyField (2.31.0)
Protistrana jako volný text s volitelným propojením na partnera. „Nový partner…“ je při zadaném callbacku vždy poslední volba a je dosažitelný klávesnicí. Hodnota a callback nesou `{ name, partnerId, ico, dic }`; zrušení propojení ponechá IČ a DIČ.

## DocumentActionBar a tisk (2.26.0)

`DocumentForm` používá `saveAction`, `primaryAction` a `moreActions`; stav a schválení zůstávají v přilepeném pruhu přímo pod `PageHeader`. Akce Uložit reaguje na Ctrl/Cmd+S, `dirty` a `busy`.

`buildReportPdf` vytváří obecné firemní sestavy ze sekcí `table`, `text` a `custom`. `PrintPreviewDialog` zobrazuje PDF přes celou šířku a nabízí Tisk a Stáhnout PDF. `buildCashReceiptPdf` a `CashReceiptPrintDialog` vytvářejí pokladní doklady včetně dvou kopií na A4. `amountInWordsCs` převádí částky na český dokladový zápis a `companyMonogramSvg` dodává náhradní firemní monogram.

### Opravy 2.26.1

- Částky slovy používají dokladový zápis bez mezer, správné české tvary podle celé částky, mužský rod haléřů, zaokrouhlení na setiny a rozsah do miliard.
- Pokladní doklad zachovává všechny řádky; osm řádků se vejde do poloviny A4, delší doklad přejde na celou stránku a dialog na to upozorní.
- Každá kopie pokladního dokladu má vlastní zápatí a dlouhá částka slovy se zalamuje po znacích.
- Sestava čísluje stránky až po dokončení tisku a logo v první hlavičce není závislé na nastavení loga v zápatí.
