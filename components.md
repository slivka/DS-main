## Řádky dokladu s DPH (2.55.0)

`JournalLinesEditor vat={{ enabled, codes, calcMode, onCalcModeChange, defaultCodeId, pdpSubjects, vatRate, vatRateAmount, readOnly, isCodeRequired }}`. Kódy filtruje aplikace. Řádky daně vytváří jen databáze; editor je nezobrazuje a do uložení je nikdy neposílá (`toJournalRows`). Předběžná daň (`buildVatPreviewLines`) platí vždy, dokud je doklad editovatelný. Ukládejte přes `toJournalRows(lines, { mainSide, sharedSide, vat: { calcMode } })`. Kód DPH v buňce vybírá `VatCodeSelect` – otevře se hned při vstupu do editace a psaní filtruje podle kódu i názvu.

## Grid řádků a nezalamování (2.54.0)

- `Label`, `SectionHeading`, `PageHeader` a titulky dialogů jsou vždy jednořádkové; při nedostatku místa se zkrátí a plný text je v tooltipu.
- `DocumentForm` přesouvá celá datová pole a drží DUZP s Datem DPH vpravo. Popisky „Celkem za doklad“ a „Sčítá se z rozpisu“ se nezalamují.
- `JournalLinesEditor.onValidationChange?: (count, errors) => void` vrací jen aktuálně zobrazené chyby `{ line, field, message }`; `texts.errors` je zastaralé.
- `JournalLinesEditor.texts.amount` vždy pojmenovává částku v měně dokladu. `homeAmount` a `foreignAmount` jsou šablony „Částka v {symbol}“.
- Detail řádku je pružný pás, používá `VsField` a zalamuje jen celá pole.

## Rolování menu a panelů (2.53.0)

- `PageLayout variant="list" | "form"` nastavuje model výšky stránky. `list` dává gridu zbývající výšku panelu; `form` roluje celý obsah.
- `DataGrid`, `TreeGrid`, `ZoomGrid` a `ZoomPane` přijímají `height?: "fill" | "auto"`; bez prop se řídí nejbližším `PageLayout`.
- Zoom formulářových gridů se počítá automaticky a neukládá se; hustota nové tabulky zůstává normální.
- `usePaneScrollElement()` vrací rolovací prvek aktuální záložky; běžná aplikace jej nepotřebuje, protože obnovu zajišťuje `PaneLayout`.
- V režimu `auto` se virtualizace nepoužívá; celý obsah roluje panel. `fill` zachovává vlastní rolovací tělo gridu, sticky záhlaví, součty a připnuté sloupce.

#### Nové API 2.53.0

- `PageLayout` – `variant?: "list" | "form"` (výchozí `"form"`), děti PageHeader + obsah; `usePageLayoutVariant()`.
- `height?: "fill" | "auto"` na `ZoomGrid`, `DataGrid`, `TreeGrid`, `ZoomPane` – bez prop podle nejbližšího `PageLayout` (list → fill, jinak auto).
- `ZoomGrid.stickyHeader?: "grid" | "pane" | "none"` – `grid` = záhlaví přilepené v rolovacím gridu (výchozí pro `fill`); `pane` = opt-in přilepení pod pruh akcí v rolovací oblasti panelu (`--pane-sticky-top`), používá jen `JournalLinesEditor`; `none` = nepřilepené (výchozí pro `auto`).
- `ZoomGrid.overflowFallback?: boolean` – nouzové vodorovné rolování gridu, který jinak sloupce přesouvá do detailu (když se nevejde ani minimum).
- `useGridVirtual(count, { height? })` – bez `height` bere režim ze stejného zdroje jako `ZoomGrid` (PageLayout); v `auto` nevirtualizuje.
- `usePaneScrollElement()` – rolovací prvek aktuální záložky.
- Formulářové gridy automaticky volí zoom 75–100 %; seznamové gridy ponechávají ruční zoom jen pro aktuální zobrazení.

#### BREAKING pro aplikace – migrace na 2.53.0

- Grid v panelu **bez** `PageLayout variant="list"` má nově `height="auto"`: roste podle obsahu, nemá vlastní svislé rolování a jeho záhlaví se nepřilepuje (roluje celý panel). Virtualizace je v `auto` vypnutá.
- Seznamové stránky obalte `<PageLayout variant="list">` (PageHeader + lišta + grid) – grid pak vyplní panel (`fill`), roluje jen jeho tělo a záhlaví i součty jsou přilepené. Formuláře a karty obalte `<PageLayout variant="form">`.
- Odstraňte ruční `maxHeight`, `calc(100vh …)` a výšky odvozené z `window.innerHeight` ve stránkách i u gridů; výšku určuje rodič.
- Odstraňte `ListScrollRestore` a jiné vlastní obnovy pozice rolování – `PaneLayout` obnovuje pozici každé záložky (per krok historie) sám. Pro výjimečné potřeby je `usePaneScrollElement()`.
- Zoom gridu ani hustota se neukládají. Formulářový grid přepočítá zoom z dostupné šířky; při 75 % pokračuje kaskádou sloupců a nakonec rolováním.
- Událost `grid-zoom-change` byla zrušena – zoom a hustota platí jen pro instanci gridu v záložce.
- `PaneLayout` má být přímý obsah `AppShell`, ne vnořený v jiné rolovací stránce (ohlásí se sám, main pak nemá padding ani rolování). Ovládá main jen když je skutečně zobrazený – skrytý (`hidden`) PaneLayout main uvolní. Vložený PaneLayout (ukázky, náhledy ve stránce) = prop `embedded` + kontejner s pevnou výškou; neregistruje se a stránka kolem roluje normálně.
- Na stránce s `DocumentActionBar` (DocumentForm) se přilepuje jen pruh akcí; `PageHeader` odroluje, aby se oba přilepené pruhy nepřekryly. `--pane-sticky-top` = výška pruhu akcí.

## Doplnění editace dokladu 7 (2.49.0)

- `JournalLinesEditor.accountDisplay?: "number" | "numberName"` má výchozí `number`; při zkrácení je název účtu v tooltipu.
- Zakázka je volitelný sloupec a uživatelem zapnuté volitelné sloupce zůstávají viditelné. Detail řádku se skládá do jednoho, nejvýše dvou řádků.
- `DocumentSettingsValue.accountDisplay` ukládá volbu Zkráceně / Celý.
- `DocumentForm.error?: { title?: string; message: ReactNode; onClose?(): void }` zobrazuje jednotný chybový pruh pod akcemi formuláře.

## Editace dokladu 7 (2.48.0)

- `DocumentForm.settings?: { onOpen(): void }` přidává „Nastavení…“ a `DocumentSettingsDialog` poskytuje řízené `value`, `onSave`, `documentTypeLabel`, `allowCounterpartySuggestions`, `busy` a `texts`.
- `JournalLinesEditor` přidává `initialEmptyLine` a `showAllErrors`; nové prázdné řádky mají `JournalLine.isBlank`, dokud se uživatel nedotkne hodnoty.
- Enter a Tab ukládají buňku a pokračují, `Shift` obrací směr; na konci se založí nový prázdný řádek. Prázdné hodnoty se nezobrazují jako nula ani pomlčka.

# Komponenty design systému

## Karta záznamu a jednotná pole (2.62.0)

- `Field` je jediný obal pole na kartách i v `DocumentForm`: popisek má 12 px, polotučný řez a mezeru 4 px od ovládacího prvku. `hint`, `error` a `FieldValue` používají stejné rozvržení.
- `CheckboxField` drží čtvereček u prvního řádku zalomeného popisku; nápověda začíná pod textem. Platí pro `align="natural"` i `align="input"`.
- `RecordActionBar` má `leftContent`, `saveAction`, `primaryAction`, `moreActions`, `busy`, `error` a `notices`. Uložení s `dirty={false}` je zakázané. `DocumentForm` jej používá interně.

```tsx
<PageHeader title="Karta majetku" titleBadge={<StatusBadge status="active" config={statuses} />} />
<RecordActionBar saveAction={{ onSave, dirty }} primaryAction={{ label: "Zařadit", onClick: classify }} />
<SectionHeading>Základní údaje</SectionHeading>
<FieldGrid><Field label="Název"><Input /></Field></FieldGrid>
<CheckboxGroup><CheckboxField label="Daňově odpisovat" /></CheckboxGroup>
```

## Pruhy a stav dokladu (2.60.0)

- `DocumentForm.titleBadges?: ReactNode` přidá další stavové štítky hned za `DocumentStatusBadge` ve stejné výšce a bez zalamování.
- `DocumentForm.notices?: ReactNode` vkládá jeden nebo více `NoticeBar` pod chybu a nad banner jen pro čtení. Pořadí je vždy akce → `error` → `notices` → jen pro čtení.
- `DocumentForm.readOnlyTitle?: ReactNode` a `readOnlyActions?: ReactNode` nastaví titulek a akce `ReadOnlyBanner`.
- `NoticeBar` používá `tone: "info" | "warning" | "success" | "danger"`, volitelný `title`, obsah v `children`, `actions` a `onClose`. Na úzké ploše přesune akce pod text.
- `NoticeBar` používejte pro provozní informace a upozornění. Chybu bránící uložení předávejte přes `DocumentForm.error`; důvod zamčení přes `ReadOnlyBanner`. Pokud je k dispozici `DocumentForm.notices`, nevykreslujte upozornění k dokladu mimo formulář.
- Seskupení `DataGrid` vždy zobrazuje `label` sloupce v čipu i záhlaví skupiny, také když je seskupovací sloupec skrytý.

```tsx
<DocumentForm
  {...props}
  titleBadges={<StatusBadge status="partial" config={paymentStatus} />}
  notices={<NoticeBar tone="info" actions={<Button>Použít VS</Button>}>Partner má otevřený přeplatek.</NoticeBar>}
  readOnlyTitle="Vznikl párováním"
  readOnlyActions={<Button>Otevřít párování</Button>}
/>
```

## Doplnění editace dokladu 6 (2.44.0)

- `DocumentForm` ukládá DPH do `value.vatRelevant` a `value.vatDate`. Přepínač je vlevo v přilepeném pruhu; DUZP a Datum DPH jsou vpravo v sekci Datumy.
- `vat` přijímá `visible`, `relevantReadOnly`, `periodLabel`, `periodFiled`, `filedWarning`, `dateLink` a `dateLockReadOnly`.
- `vat.periodLabel` se zobrazuje pod Datem DPH; `periodFiled` s `filedWarning` má před popiskem přednost. `dateWarnings` předává výstrahy pod jednotlivá datová pole.
- `CashReceiptPdfInput.currencySymbol` a `homeCurrencySymbol` dodávají značky částek v pokladním PDF; bez značky se použije kód měny.
- `DateField` přijímá `hint`, `warning`; `link.toggleDisabled` zachová zámek jen pro čtení.
- `JournalLinesEditor` vyžaduje `documentCurrency` a `homeCurrency`, volitelně `documentCurrencySymbol` a `homeCurrencySymbol`; `AccountOption.nonTaxDefault` předvyplní ND.
- `CurrencyOption.symbol` dodává značku měny. `CurrencyAmount.baseCurrency` a `DocumentForm.homeCurrency` jsou povinné.
- `LegalFormField.options` je povinný seznam `{ code, name }[]`; hodnota pole je kód.
- `PageHeader.titleBadge` umístí stavový badge vedle nadpisu.

## Kontext panelů a detail jen pro čtení (2.40.0)

- `AppShellPanel.badge` přidává do hlavičky panelu tónovaný štítek (`neutral`, `info`, `warning`, `accent`); pohled provozovatele napříč prostory používá `accent`.
- `AppShellPanel.context` uvádí prostor, firmu nebo jiný upravovaný objekt na druhém řádku a dlouhý text zkrátí s tooltipem.
- `RecordDialog.readOnly` skryje Uložit a nahradí Zrušit tlačítkem Zavřít. `RecordDialog.tabs` přijímá rovnocenné sekce `{ value, label, content, disabled? }`.
- `StatusBadge` podporuje nový tón `accent`; stavy uživatelů mapujte: Zablokován = danger, Provozovatel = accent, Bez členství = neutral, Nepotvrzený e-mail = warning, Archivovaný = neutral.

## Data a období DPH na dokladu (2.38.0)

- `DateField.link` řídí svázání data přes `locked`, `onToggle`, `lockedHint` a `unlockedHint`; zámek je klávesnicově dostupné tlačítko.
- `DocumentForm.accountingDateLink` zapojuje zámek na Datum účetního případu. Od verze 2.43 `DocumentForm.vat` řídí viditelnost, popisek období, podané období a zámek Data DPH; `DocumentHeaderValue.vatDate` ukládá konkrétní datum.

## Edit dokladu 5 (2.36.0)

- `DocumentForm` přidává `roundingLimit` (výchozí 1,00 Kč) a `roundingLabel`; oba se přeposílají do `JournalLinesEditor` jako `rounding.limit` a `rounding.label`, takže aplikace nastaví firemní limit i vlastní pojmenování vyrovnání. Vlastní popisek se použije i pro text nově vytvořeného řádku vyrovnání.

## Edit dokladu 5 (2.35.0) – dříve 2.34.0

- `DocumentForm` používá nadpis sekce místo jediné záložky Řádky. Celkem ovládá Σ; u cizí měny odděluje částku dokladu, kurz a domácí přepočet.
- `JournalLinesEditor` přijímá `documentCurrency`, `homeCurrency`, `rate`, `rateAmount`, `units`, `onCreateUnit`, `reorderable` a řízený objekt `recap`. Staré `showCurrency`, `onRoundingFill` a ukládání rekapitulace přes `storageKey` se nepoužívají.
- `JournalLinesRounding` obsahuje `value`, `onChange`, `readOnly`, `label` a `limit`. Akce ± navrhne vyrovnání, zatímco samotné vyrovnání je připnutý poslední řádek.
- `JournalLine` přidává `quantity`, `unitId`, `unitPrice` a `isFxRounding`. Množství × cena automaticky určí částku.
- `JournalLinesRecap` má řízené `open`, `onOpenChange`, `tab`, `onTabChange` a explicitní `documentCurrency` / `homeCurrency`.
- `UnitSelect` používá `UnitOption { id, code, name, isActive }`; `onCreateUnit(code)` může asynchronně založit chybějící jednotku.

## Edit dokladu a jednotné lišty (2.32.0)

- `SuggestInput` načítá po 200 ms nejvýše 10 návrhů i pro prázdný dotaz. Ikona Historie zapíná a vypíná našeptávání; seznam ovládají šipky, Enter a Esc.
- `CounterpartyField.favoriteIds` řadí oblíbené aktivní partnery první; prázdný dotaz zobrazí celý abecední seznam.
- `DocumentForm` přijímá `handedOverBySuggest`, `descriptionSuggest` a typovanou identitu `cashBank` / `invoice` / `internal`. Ruční Celkem je editovatelné; Σ přepíná `totalMode` a u ID/UZ/KR/ZAP zůstává zamčené.
- `JournalLinesEditor.recapTabs` přidává vlastní záložky pod vestavěné Účtování a Zakázky. Horní lišta obsahuje Přidat, haléřové vyrovnání, Hledat, Sloupce, Obnovit rozložení a Hustotu se zoomem; Ctrl/Cmd+Enter přidá řádek.
- Pata vždy uvádí Rozpis, Zaokrouhlení a Celkem; při ručně zadaném součtu také Zadáno a barevný Rozdíl. Hledání nemění výpočty ani kontroly.

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
- `DocumentHeaderValue` podporuje `counterpartyIco`, `counterpartyDic` a `handedOverBy`. Propojený partner zamkne IČO a DIČ, ruční protistrana je ponechá editovatelná; chybné české IČO pouze zobrazí upozornění.
- Pokladní doklad zobrazuje Přijato od / Vyplaceno komu. Data začínají datem vystavení; externí čísla patří do partnerské sekce.
- `RateField` podporuje doporučený kurz, ruční kurz s povinným důvodem a režim jen pro čtení. Hodnota dokladu má `rateManual`, `rateNote`, `suggestedRate` a `suggestedRateInfo`.
- `IcoLink` odkazuje platné české IČO do obchodního rejstříku nebo ARES; `PartnerOption` podporuje `country` a `kind`.
- `onCreatePartner` dostává `{ name, ico, dic }`; osm číslic předvyplní IČO, jiný text název a samostatná pole se zachovají.
- Zaokrouhlení předává formulář do `JournalLinesEditor` přes `rounding`; pole je v dolní liště řádků vlevo od údaje Zbývá rozepsat a respektuje právo k úpravě.

## SectionHeading (2.28.0)

Jednotný nadpis sekcí formulářů, dialogů, karet a panelů: verzálky, jemná prokladová sazba a linka přes celou šířku. Nepoužívá se pro PageHeader ani záhlaví gridu.


## CounterpartyField (2.31.0)
Protistrana jako volný text s volitelným propojením na partnera. „Nový partner…“ je při zadaném callbacku vždy poslední volba a je dosažitelný klávesnicí. Hodnota a callback nesou `{ name, partnerId, ico, dic }`; zrušení propojení ponechá IČO a DIČ.

## DocumentActionBar a tisk (2.26.0)

`DocumentForm` používá `saveAction`, `primaryAction` a `moreActions`; stav a schválení zůstávají v přilepeném pruhu přímo pod `PageHeader`. Akce Uložit reaguje na Ctrl/Cmd+S, `dirty` a `busy`.

`buildReportPdf` vytváří obecné firemní sestavy ze sekcí `table`, `text` a `custom`. `PrintPreviewDialog` zobrazuje PDF přes celou šířku a nabízí Tisk a Stáhnout PDF. `buildCashReceiptPdf` a `CashReceiptPrintDialog` vytvářejí pokladní doklady včetně dvou kopií na A4. `amountInWordsCs` převádí částky na český dokladový zápis a `companyMonogramSvg` dodává náhradní firemní monogram.

### Opravy 2.26.1

- Částky slovy používají dokladový zápis bez mezer, správné české tvary podle celé částky, mužský rod haléřů, zaokrouhlení na setiny a rozsah do miliard.
- Pokladní doklad zachovává všechny řádky; osm řádků se vejde do poloviny A4, delší doklad přejde na celou stránku a dialog na to upozorní.
- Každá kopie pokladního dokladu má vlastní zápatí a dlouhá částka slovy se zalamuje po znacích.
- Sestava čísluje stránky až po dokončení tisku a logo v první hlavičce není závislé na nastavení loga v zápatí.

## DPH v editoru řádků (2.57.0)
- Samovyměření v režimu „S DPH“: zadaná částka je základ, daň navrch, Celkem s DPH = základ (`isSelfAssessed`).
- Nárok na odpočet u všech vstupních kódů s daní včetně samovyměření.
- `fillInitialVatCode` – výchozí kód do počátečního řádku i opožděně.
- `GridSegmentedToggle.disabled` – přepínač Bez/S DPH neaktivní při `vat.readOnly`.
- `DocumentForm.texts.vatRateMissing`, `JournalLinesEditor.texts.fxRoundingPreview` – předběžné Kurzové zaokrouhlení u cizí měny.


## DataGrid – párování (2.58.0)

- `groupTotals="row"` – řádek součtů skupiny pod sloupci; patří k `paginated={false}` (seskupuje všechny řádky). Se stránkováním by součty byly jen za aktuální stránku – ve vývojovém režimu grid vypíše varování.
- `selectedKeys` / `onSelectedKeysChange` – řízený výběr; výběr skrytý filtrem zůstává.
- `selectionSummary(rows)` – pruh pod tabulkou v režimu výběru.
- `total: "sumSelected"` – součet vybraných řádků.
- `editor(row)` – buňka editovatelná jen u vybraných řádků.

### GridAmountEditor

Číselný editor v buňce DataGrid. Props: `value`, `onChange`, `max?`, `currencySymbol?`, `decimals?` (2), `invalid?`, `invalidMessage?`, `ariaLabel`.
Tab / Shift+Tab mezi editory, Enter potvrdí, Esc vrátí. Převýšení maxima zjistíte `exceedsMax(value, max)` a předáte jako `invalid`.

```tsx
{ id: "pay", label: "Párovat částkou", numeric: true, total: "sumSelected", value: (r) => amount(r),
  editor: (r) => <GridAmountEditor value={amount(r)} max={remaining(r)} onChange={(v) => setAmount(r.id, v)}
    invalid={exceedsMax(amount(r), remaining(r))} invalidMessage="Částka převyšuje zbývající" ariaLabel={`Párovat ${r.document}`} /> }
```

Nepoužívejte pro řádky účetního zápisu – ty patří do `JournalLinesEditor`.

## Jazyk knihovny (2.61.0)

Aplikace nastaví jazyk jednou v kořeni:

```tsx
<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
  <App />
</DsTextsProvider>
```

Bez provideru zůstává knihovna česky. Priorita textu je prop komponenty → `DsTextsProvider` → `DS_TEXTS_CS`. Nový text komponenty musí mít nový klíč v `DsTexts`, český výchozí text v `DS_TEXTS_CS` a slovenský překlad v `DS_TEXTS_SK`; uživatelsky viditelný text se nesmí vložit natvrdo.


## DS 2.64.0

- Zoom aplikace používá `useAppZoom` a ovládání v `UserMenu`; staré ovládání velikosti písma bylo odstraněno.
- `AppShell` vlastní šířku i sbalení menu (`app:menu-width`, `app:menu-collapsed`); staré řízené props byly odstraněny.
- Šířky sloupců zůstávají v px při 100 %, ale vykreslují se relativně k zoomu aplikace a gridu.
- Formulářové gridy se automaticky přizpůsobují bez ukládání: zoom, kaskáda, rolování.


## DS 2.66.0

- BREAKING: `JournalLinesEditor.accountDisplay`, `JournalAccountDisplay` a volba účtu v `DocumentSettingsDialog` byly odstraněny.
- BREAKING: `formatJournalAccountDisplay(code, name, display, compact)` → `(code, name?, extended?)`; staré volání s `"number"` nyní vrací i název účtu.
- BREAKING: `resolveJournalColumnLayout` bez `accountDisplay`; nový výstup `compactAccountIds`.
- `JournalLinesEditor` má dvojice `MD` / `MD účet` a `DAL` / `DAL účet` (v režimu hlavního účtu `counterAccount` / `counterAccountName`); výchozí jsou krátké formy a alespoň jedna forma každé strany zůstává viditelná.
- Kaskáda šířek: Množství / MJ / Cena → Sazba DPH / Celkem s DPH → zkrácení účtů po stranách → stranová pole → Text.
- Nové: `accountColumnPair()`, `normalizeJournalAccountVisibility()`, `JournalLinesRecap.storageKey`, `GridColumn.disableToggleReason`, `DataGrid.defaultSort={null}`, `DataGrid.rowClassName`, `DsTexts.journalRecap`.
- Rekapitulace používá DataGrid se zachovaným pořadím řádků; pořadí sloupců `accountColumns()` je MD, MD účet, DAL, DAL účet.

## DS 2.68.0

- BREAKING: `DocumentForm.identity.items` nahradil typovaný `DocumentIdentity` s variantami `cashBank`, `invoice` a `internal`, povinnou knihou a obdobím a volitelným účtem a číslem.
- Hlavní účet se zobrazuje a případně mění jen v identifikačním řádku. `mainAccountOptions` omezuje nabízené účty; změna pouze upraví `mainAccountId` a nepřepočítává řádky.
- U faktur a interních dokladů je měna bezprostředně za Celkem. `currencyLocked` ji zobrazí jako text, `currencyDisabledReason` jako zakázaný výběr s vysvětlením; pokladna a banka mají měnu pouze v identitě.
- `DocumentTypeCode` nově zahrnuje `DDPZ`, `DDPOZ`, `KR` a `ZAP`; `documentIdentityVariantForType()` vrací výchozí variantu podle druhu dokladu.
- `mainAccountLocked` a `currencyLocked` už neskrývají údaje. První vždy skryje změnu účtu, druhý ponechá měnu jako text vedle Celkem.
