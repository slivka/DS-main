## Edit dokladu 11 (2.94.0)

- `RateField.sourceAttention?: boolean`; `DocumentHeaderValue.rateSourceAttention` / `vatRateSourceAttention` se předávají oběma kurzům. Jednotka a zdroj jsou v přístupném tooltipu celého pole, nikoli pod polem (BREAKING pravidla).
- `DocumentForm.receivedAccountDisabledReason?: string` má u FP/ZFP přednost před příkazem i dodavatelem; vypnutý příkaz nelze změnit, KS/SS jsou skryté. Hodnoty spravuje aplikace.
- `PaymentOrderAccountField` a zamčený firemní účet zobrazí důvod uvnitř šedého pole bez zámku, jednořádkově s tooltipem.
- FP/ZFP/DDPOZ: druhý řádek účet 14 + způsob platby 6 (DDPOZ bez způsobu), třetí Popis 14 + číslo 6. Pod 40rem pod sebou ve stejném pořadí.
- `RecordActionBar` sjednocuje ikony všech položek menu na size-4 shrink-0.

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

- `Field` je jediný obal pole na kartách i v `DocumentForm`: popisek má 12 px, polotučný řez a mezeru 4 px od ovládacího prvku. `hint` u Field, DateField, CheckboxField, SwitchField a FormDescription je od 2.107.0 ikona Info v řádku popisku s bublinou, nikdy text pod polem. Pod ovládacím prvkem se nikdy nic nevykresluje. Chyba ani varování nemění výšku ani zarovnání řádku. Všechny prvky v jednom řádku mají přesně výšku --control-h svého prostředí. Chyby a varování jsou uvnitř ovládání s tooltipem, nikdy pod polem, a patří také do pruhu formuláře. `FieldValue` používá stejné rozvržení.
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

**Edit dokladu 12 (2.96.0):** kompaktní datumová pole jen v DocumentForm, delší popisek rozšíří pole. DUZP + Datum DPH se při nedostatku místa zalomí jednotlivě, bez vodorovného rolování. KS/SS jsou vždy viditelné, při nepoužité platbě prázdné a zakázané s přístupným popisem důvodu. `receivedAccountDisabledReason` má u FP/ZFP přednost; `companyBankAccountDisabledReason` nově zamkne KS/SS u FV/ZFV (BREAKING). DS hodnoty nemaže.

**Edit dokladu 12b (2.97.0):** Datum i popisek mají standardní velikost podle zoomu; zmenšení se měří pouze pro pole, které samo přesahuje kontejner. Šířku určuje aktivní formát a společné ikony. Delší popisek rozšiřuje jen své pole. Zamčené KS/SS mají přístupné jméno z popisku a samostatný popis důvodu. bankAccountOptions podporuje účty pouze s IBAN. BankAccountOption vyžaduje úplné number + bankCode nebo iban; tuzemská dvojice má přednost, jinak se zobrazí IBAN po čtyřech znacích. Hledání zahrnuje IBAN i při současném tuzemském čísle. Popisek svázaný přes htmlFor má stabilní ID htmlFor + "-label" pro aria-labelledby zamčené skupiny.

**Edit dokladu 12c:** Měření je izomorfní, klíčované formátem a popisky; nesouvisející editace neobnovuje ResizeObserver. Každé přesahující pole se zmenší podle vlastní šířky včetně popisku, bez zmenšení sousedů. Výběr je vždy hledatelný; data bez úplné tuzemské dvojice nebo IBAN se vyřadí za běhu. Hledání podporuje také IBAN s mezerami. BankAccountOptionBase má number a bankCode volitelné; bankAccountOptionValue poskytuje stabilní identitu. Šipka hledatelného výběru a text mají samostatný prostor vlevo od tlačítka příkazu při všech zoomech.

**Edit dokladu 12d (2.97.0):** Zakázané textové a číselné vstupy dokladu včetně KS/SS a ručního účtu sdílejí podklad muted/40 se zakázaným datumem. Rámeček, text i průhlednost zůstávají stejné v obou režimech; hodnoty a důvody se nemění.

**Edit dokladu 12e (2.97.0):** Částka, oba kurzy a měna mají standardní výšku control-h. Celkem používá velikost běžného VS a tučný řez v ručním i odvozeném režimu; přepínač součtu se škáluje uvnitř pole.

**Edit dokladu 12f (2.97.0):** Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Dotčené komponenty: Input, SelectTrigger, OptionSelect (obě větve), Textarea, DecimalInput a interní LockedAccountValue. Bankovní účty filtrují neřetězcové části a hledají IBAN bez ohledu na mezery.

**Edit dokladu 12g (2.97.0):** zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Celkem, Kurz a VS používají stejné bezpatkové písmo a velikost; součet zůstává tučný.

**Edit dokladu 12h (2.97.0):** Lišty zachovávají aktivní a hover zvýraznění; zakázaná vybraná segmentová volba zůstává barevně odlišená. Celkem je readOnly a lze je označit a kopírovat; kurz zachová přístupný popis bez aria-disabled na obecném div.

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
Protistrana jako volný text s volitelným propojením na partnera. ＋ v řádku hledání předá aktuální dotaz při zadaném callbacku a je dosažitelné klávesnicí; `createDisabledReason?: string` jej zakáže s přístupným vysvětlením. Hodnota a callback nesou `{ name, partnerId, ico, dic }`; zrušení propojení ponechá IČO a DIČ.

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
- `DocumentTypeCode` nově zahrnuje `DDPZ`, `DDPOZ`, `KR` a `ZAP`; `documentIdentityVariantForType()` (v `document-fields.ts`, re-export z formuláře) vrací výchozí variantu podle druhu dokladu. Tužka změny účtu se ukáže jen u `invoice` s `account.editable`, bez `mainAccountLocked`, s oprávněním a neprázdným `mainAccountOptions`; nabídka obsahuje výhradně `mainAccountOptions`. Varianta `internal` účet nikdy nezobrazí. `SideBadge` byl odstraněn.
- `mainAccountLocked` a `currencyLocked` už neskrývají údaje. První vždy skryje změnu účtu, druhý ponechá měnu jako text vedle Celkem.

## Index veřejných komponent

`SlivkaProvider`, `SlivkaHead`, `Toaster`, `DsTextsProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `Button`, `Input`, `Label`, `Checkbox`, `Badge`, `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`, `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`, `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `Separator`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Alert`, `AlertTitle`, `AlertDescription`, `AspectRatio`, `Avatar`, `AvatarImage`, `AvatarFallback`, `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`, `Calendar`, `CalendarDayButton`, `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`, `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`, `Drawer`, `DrawerPortal`, `DrawerOverlay`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuRadioGroup`, `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField`, `HoverCard`, `HoverCardTrigger`, `HoverCardContent`, `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`, `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator`, `MenubarLabel`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarPortal`, `MenubarSubContent`, `MenubarSubTrigger`, `MenubarGroup`, `MenubarSub`, `MenubarShortcut`, `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `Pagination`, `PaginationContent`, `PaginationLink`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`, `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `Progress`, `RadioGroup`, `RadioGroupItem`, `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`, `ScrollArea`, `ScrollBar`, `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`, `Sheet`, `SheetPortal`, `SheetOverlay`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInput`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `Skeleton`, `Slider`, `Switch`, `Textarea`, `Toggle`, `ToggleGroup`, `ToggleGroupItem`, `AppShell`, `WorkspaceCompanySwitcher`, `EntitySwitcher`, `Field`, `FieldGrid`, `FormSection`, `RecordDialog`, `Breadcrumbs`, `CollapsibleSection`, `CommandPalette`, `ThemeToggle`, `ThemeToggleButton`, `NotificationBell`, `ThemeSetting`, `ContextPill`, `CompanySwitcher`, `PeriodSwitcher`, `UserMenu`, `SearchButton`, `PageHeader`, `AppShellContentProvider`, `PageLayout`, `SectionHeading`, `PageTabs`, `SettingsSection`, `RecordActionBar`, `StandaloneShell`, `StandaloneNav`, `ContextSwitcher`, `PaneApiContext`, `PaneTabsContext`, `PaneScrollContext`, `PaneTabsProvider`, `PaneChromeContext`, `PaneLayout`, `PaneEmpty`, `UnsavedChangesDialog`, `LayoutSwitcher`, `PinnedBar`, `PaneTabBar`, `PaneLink`, `DraftRestoredBanner`, `LayoutMenu`, `DataGrid`, `GridAction`, `GridActions`, `GridExport`, `ExcelExportButton`, `BulkSelectionBar`, `ViewModeToggle`, `GridTitleBar`, `GridSearch`, `SortHead`, `GridFilterToggle`, `GridFilterPanel`, `GridResultCount`, `GroupControl`, `GroupHeaderRow`, `GroupBar`, `GridGroupRow`, `GridSectionToggles`, `GridSkeletonRows`, `GridEmptyRow`, `GridBody`, `GridProgress`, `GridErrorRow`, `ListError`, `ListSkeleton`, `GridZoomContext`, `ZoomControl`, `ZoomGrid`, `ZoomPane`, `GridToolbarOverflowContext`, `GridToolbar`, `GridToolbarSeparator`, `GridToggleButton`, `AsOfDateToggle`, `GridExpandControls`, `GridAddActions`, `GridToolbarCollapsible`, `GridPagination`, `GridSelectionToggle`, `GridRefreshButton`, `GridMoreMenu`, `ColumnResizeHandle`, `VirtualPad`, `ColumnPicker`, `ColumnFilter`, `TreeGrid`, `FilterChips`, `GridPeriodFilter`, `GridBookSelect`, `GridContextBar`, `GridSegmentedToggle`, `GridAmountEditor`, `ActiveStatusBadge`, `ShowInactiveToggle`, `GridRowMenu`, `DecimalInput`, `RateField`, `DateField`, `AsOfDateField`, `TimeInputRight`, `OptionSelect`, `UnknownValue`, `FieldValue`, `FieldInlineActions`, `FieldTable`, `MaskInput`, `SegmentedField`, `CategorySelect`, `MultiSelect`, `ChipMultiSelect`, `ComboboxResizeHandle`, `ResizableCombobox`, `TagPicker`, `LookupField`, `IcoField`, `CheckboxField`, `CheckboxGroup`, `SwitchField`, `IcoLink`, `LegalFormField`, `CountrySelect`, `AddressFieldGrid`, `PeriodFilter`, `DateRangeField`, `CalendarPicker`, `MonthYearSelect`, `ContactSelect`, `SuggestInput`, `LoadingOverlay`, `ErrorBoundary`, `HistoryPanel`, `HistoryGridAction`, `RecordNotes`, `NotesPanel`, `NotesCountCell`, `NotesGridAction`, `PermissionGate`, `ReadOnlyBanner`, `NoticeBar`, `ConfirmByTypingDialog`, `DangerZone`, `ComingSoon`, `StatusBadge`, `StatusDot`, `InactiveTag`, `VatStatusBadge`, `TruncatedText`, `TruncatedLink`, `TreeView`, `BarBreakdownChart`, `AmountCell`, `AmountDifference`, `AmountInput`, `AccountCode`, `AccountSelect`, `DocumentStatusBadge`, `FiscalPeriodSelect`, `PartnerSelect`, `CounterpartyField`, `CounterpartyInputField`, `VatCodeSelect`, `DimensionSelect`, `UnitSelect`, `BookSelect`, `VsField`, `BankAccountField`, `ReceivedBankAccountField`, `PaymentOrderAccountField`, `CurrencyAmount`, `JournalLinesEditor`, `JournalLinesRecap`, `DocumentForm`, `DocumentActionBar`, `DocumentDirectionBadge`, `DocumentCounterpartyTab`, `DocumentPrintTab`, `DocumentSettingsDialog`, `PaymentScheduleEditor`, `PrintPreviewDialog`, `CashReceiptPrintDialog`, `JournalRecapHomeTotal`, `FieldToggleButton`, `BankStatementForm`, `IdentityLine`

### SegmentedField 2.99.0 – Edit dokladu 12i

Edit dokladu 12i (2.99.0): zakázaná vybraná volba používá plné muted pozadí, foreground a font-semibold bez primární barvy; nevybraná zůstává muted/40 a muted-foreground s normálním řezem. Povolená vybraná volba zachovává primary/10 a primary. Obě zakázané volby mají kontrast nejméně 4,5 : 1; segmenty gridu beze změny.
### GridAddActions / DocumentForm BA 2.102.0 – Edit dokladu 13g–13h

- `GridAddAction.shortLabel` a `GridAddAction.icon`: dvě a více primárních akcí lišty se zúží na zkrácené texty a v nejužší liště sloučí do jednoho tlačítka „+ ▾“ s nabídkou. Nepovinný text `grid.addMenu` (CS/SK) s českou náhradou; bez BREAKING.
- Plné a zkrácené texty i šířka „+ ▾“ se měří podle skutečné dostupné šířky. Zakázaná položka nabídky ukazuje `disabledReason`; výběr předává Event, nikoli MouseEvent.
- `documentFieldsForType("BA").taxDate = true`: BA při zapnutém DPH ukazuje DUZP a Datum DPH; vazbu a výchozí hodnoty řídí aplikace přes `vat.dateLink`.

### BankStatementForm 2.102.0 – Edit dokladu 13f

- `checkDisabledReason?: string` zakáže „Zkontrolovat“ s důvodem (aria-disabled, fokusovatelné, tooltip); „Zrušit kontrolu“ se tím neřídí.

### FieldToggleButton / BankStatementForm 2.101.0 – Edit dokladu 13

- `CounterpartyInputField`: ContactRound v obou režimech; partner je zapnutý, ruční vypnutý s přeškrtnutím. Stálý název z DsTexts, tooltip podle stavu, lockedReason zachová fokus bez změny. Tužka jen pro vybraného partnera; šipka a křížek vlevo od FieldToggleButton.
- `PaymentOrderAccountField`: Přepínač Landmark skládá FieldToggleButton, pravý prostor určuje --field-toggle-space. Zamčení nemění účet a zachová přístupný důvod.
- `SuggestInput`: Vsazený FieldToggleButton History místo celovýškového tlačítka. Stálý přístupný název z DsTexts, stavové tooltipy samostatné, přepnutí nemaže hodnotu.
- `DateField`: Výjimka: vazba data zachovává vlastní geometrii a --document-date-*; stálý název, aria-pressed, fokusovatelný zakázaný stav a důvod v tooltipu i přístupném popisu.
- `DocumentForm`: Součet Sigma používá FieldToggleButton; vynucený součet předává lockedReason. Pravý prostor určuje --field-toggle-space; ostatní datumová geometrie se nemění.
- `JournalLinesEditor`: Výjimka ND v buňce zachovává vlastní rozměry a tab pořadí; stálý název Nedaňový řádek, aria-pressed a přístupný důvod zamčení.
- FieldToggleButton: jediný přepínač v poli, ND a datumová vazba jsou výjimky.
- BankStatementForm: řízené zůstatky a položky, CS/SK, žádné ukládání v DS.

### BankStatementForm / AmountDifference 2.104.0 – Edit dokladu 13k

- Uložit má původní ikonu + text v každé šířce. Číslo sdílí typografii IdentityLine; kompaktní zámek vysvětlí důvod klepnutím.
- 13l: bankovní zůstatek v obou měnách span 3/12 vpravo; nulový rozdíl se nezobrazuje. Povolený klik kontroly nepřipíná tooltip, dotyk jej ukáže na 3 s.
- BREAKING: value.note a texts.note odstraněny. Datum a Zůstatek dle banky v základní sekci, pouze nenulový Rozdíl. Zůstatky dle pohybů mají čtyři součty. Migrace v CHANGELOG.

## 2.107.0 – stav pole a jednotná výška (nevydáno)

- Pravidlo: Pod ovládacím prvkem se nikdy nic nevykresluje. Chyba ani varování nemění výšku ani zarovnání řádku. Všechny prvky v jednom řádku mají přesně výšku --control-h svého prostředí.
- `useFieldStatus`, `FieldStatus`, `FieldStatusIndicator` (alias `FieldFeedbackIndicator`, nové `side`, `placement`, `extraInfo`, `id`), `FieldHintIcon`.
- `FieldErrorSummary`, `FieldErrorLink`, `focusFieldErrorLink`; `RecordActionError.fieldErrors` / `onFieldErrorSelect`, `DocumentFormError.fieldErrors`, `RecordDialog.fieldErrors`.
- `useCellStatusTooltip` – líná bublina buňky mřížky místo `title`.
- `Button size="control"`; `Toggle` bere výšku z `--control-h`.
- `CheckboxField` / `SwitchField`: `error`, `warning`.
- `BankAccountField`: `entryMode`, `onEntryModeChange`, `manualFormatPattern`.
- `JournalLinesEditor`: `onCreateDimension`; `onValidationChange` navíc `fieldId`, `rowId`, `columnId`.
- `DateField.warningDisplay` je deprecated (bez účinku).

## Dokončení 2.107.0 – veřejné API

### FieldStatus

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku.

```tsx
const status = useFieldStatus({ error: errors.name, warning: warnings.name });
```

### useFieldStatus

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku.

```tsx
const status = useFieldStatus({ error: errors.name, warning: warnings.name });
```

### FieldStatusIndicator

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. FieldStatusIndicator je alias původního FieldFeedbackIndicator.

```tsx
<FieldStatusIndicator error={errors.amount} side="start" id={status.describedById} />
```

### FieldFeedbackIndicator

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. FieldStatusIndicator je alias původního FieldFeedbackIndicator.

```tsx
<FieldStatusIndicator error={errors.amount} side="start" id={status.describedById} />
```

### FieldHintIcon

Ikona Info v řádku popisku, bublina dostupná myší, klávesnicí i dotykem.

```tsx
<FieldHintIcon hint={texts.accountHint} />
```

### FieldErrorSummary

Souhrn nejvýše pěti odkazů, zbytek jako „a další N“ přes DsTexts. Klik zaměří pole i v detailu řádku.

```tsx
<FieldErrorSummary errors={fieldErrors} onSelect={focusFieldErrorLink} />
```

### FieldErrorLink

Odkaz na chybné pole, případně skryté v detailu řádku dokladu.

```tsx
const error: FieldErrorLink = { fieldId: "journal-row1-quantity", label: texts.quantity, message: texts.required, rowId: "row1", columnId: "quantity" };
```

### focusFieldErrorLink

Posune a fokusuje pole; u skrytého pole rozbalí detail řádku.

```tsx
focusFieldErrorLink(error);
```

### useCellStatusTooltip

Líná bublina buňky vzniká až při hover nebo focus; bez zprávy nejsou handlery ani bublina.

```tsx
const status = useCellStatusTooltip({ error: cellError, extraInfo: accountName });
return <><div {...status.triggerProps}>{value}</div>{status.tooltip}</>;
```

### Button

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 12h: zakázané varianty default (primary), destructive, ghost i link mají šedý podklad muted/40 a tlumený text. Vnořené spany se plošně nepřebarvují, aby odznaky zachovaly vlastní stav. size="control" bere výšku z --control-h svého prostředí; ostatní velikosti zůstávají beze změny.

```tsx
<Button size="control" variant="outline">{texts.map}</Button>
```

### BankAccountField

né tuzemské dvojice nebo IBAN se vyřadí za běhu. Hledání podporuje také IBAN s mezerami. BankAccountOptionBase má number a bankCode volitelné; bankAccountOptionValue poskytuje stabilní identitu. Filtr za běhu ověřuje řetězcový typ number, bankCode a iban. Hledání ignoruje mezery v IBAN na obou stranách dotazu. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Sdílený účet. Přidání v řádku hledání předává dotaz, neplatný účet má výstrahu uvnitř pole a nikdy text pod polem. onAddAccount má tvar (searchText: string) => void; dosavadní bezparametrické callbacky zůstávají kompatibilní. Ruční vstup nahrazuje výběr ve stejném poli; aplikace řídí entryMode a onEntryModeChange, přepnutí nemaže hodnotu.

```tsx
<BankAccountField value={account} onChange={setAccount} options={accounts} entryMode={entryMode} onEntryModeChange={setEntryMode} manualFormatPattern={texts.accountFormat} />
```

### JournalLinesEditor

Rozpis a rekapitulace; cizí měna ukazuje přepočtený celek v hlavičce. DocumentForm předává odvozený celek automaticky. Edit dokladu 13: Výjimka ND v buňce zachovává vlastní rozměry a tab pořadí; stálý název Nedaňový řádek, aria-pressed a přístupný důvod zamčení. ND zachovává kaskádu vydaného zdroje 98810718; skutečná velikost závisí na aplikačním i gridovém zoomu. texts.nonTaxOn / nonTaxOff (journalEditor) jsou nepovinné @deprecated od 2.100.0 a ignorované; použijte fieldToggle.nonTaxPressed / nonTaxUnpressed. Odstranění v 3.0.0. 13c: ND používá původní vydanou gridovou kaskádu včetně jejího přepsání velikosti; důvod zamčení je aria-describedby. onCreateDimension dostane hledaný text v buňce i detailu. onValidationChange předává navíc fieldId, rowId a columnId pro fokus chyb.

```tsx
<JournalLinesEditor {...props} onCreateDimension={query => openDimension({ name: query })} onValidationChange={(count, errors) => setFieldErrors(errors)} />
```

### RecordActionBar

ní ikony → nakonec ikona Uložit. Kompaktní zablokovaná primární akce má tooltip Název: důvod. Důvod položky menu je jen přístupný popis, nikoli součást názvu. Sdílená lišta: standardně textové akce bez ikon, podle měřené šířky nejdříve sekundární ikony, nakonec Uložit ikona. Primární modré Uložit, dirty/disabled/busy, tooltip a přístupný název zachovány. Povolené primaryAction.tooltip vysvětlí akci i po dotyku. Chyba před upozorněními. primaryAction.tooltip vysvětluje povolený krok i krátce po dotyku; normální klik jej provede bez připnutí. Každá akce má Tooltip i v plné šířce (název akce, případně primaryAction.tooltip); ⋯ používá Tooltip místo title. Levý obsah si drží rezervu nejvýš 10 rem a zkrátí se s …, akce nikdy nepřekryje. error.fieldErrors jsou odkazy souhrnu; error.onFieldErrorSelect přepíše výchozí scroll a fokus. Nezaměňujte s mapou validačních chyb DocumentForm.fieldErrors.

```tsx
<RecordActionBar {...props} error={{ message: texts.invalid, fieldErrors, onFieldErrorSelect: focusFieldErrorLink }} />
```

### DocumentForm

datum výchozí sleduje vystavení. BA Bankovní pohyb s protiúčtem, ID Partner před Popisem a Datumy. Nové hodnoty hlavičky: taxDocumentNumber, taxDocumentNumberLinked, bankAccountKind, bankCode, bankIban, bankSwift. Navázané účetní datum a u FP/ZFP/DDPOZ ručně neměněné DUZP se zapisují přes onChange (při změně vystavení a jednou při otevření dokladu), takže zobrazené = uložené. Neplatné datum a varování čísla dodavatele pro VS jsou ⚠ v poli a celý text v pruhu nad formulářem; chybějící kurz DPH se hlásí jednou a ne u dokladu jen pro čtení. onAddBankAccount dostává hledaný text. Úvodní zápis odvozených datumů přes onChange probíhá jen u upravitelného dokladu; readOnly, posted, locked a cancelled zachovávají uložená data bez callbacku. error.fieldErrors jsou odkazy souhrnu; error.onFieldErrorSelect přepíše výchozí scroll a fokus. Nezaměňujte s mapou validačních chyb DocumentForm.fieldErrors.

```tsx
<DocumentForm {...props} error={{ message: texts.invalid, fieldErrors, onFieldErrorSelect: focusFieldErrorLink }} />
```

### RecordDialog

Jednotný dialog pro editaci i detail záznamu. Pro detail bez editace použijte readOnly; rovnocenné datové sekce předávejte přes tabs. Stav záznamu přes status (Aktivní / Neaktivní vedle nadpisu) a lifecycleAction (Deaktivovat / Aktivovat vlevo vedle Odstranit, s dirty nabídne „Uložit změny a …“). fieldErrors zobrazí stejný souhrn sticky nad patičkou dialogu.

```tsx
<RecordDialog {...props} fieldErrors={fieldErrors}>{fields}</RecordDialog>
```

### CheckboxField

Zaškrtávátko formuláře s jednořádkovým zkráceným popiskem a úplným textem v bublině. Hint je ikona Info u popisku; align="input" má výšku --control-h. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

```tsx
<CheckboxField label={texts.approved} checked={approved} onCheckedChange={setApproved} error={errors.approved} align="input" />
```

### SwitchField

Řádek okamžitého nastavení – popisek vlevo, přepínač vpravo, uloží se hned. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

```tsx
<SwitchField label={texts.enabled} checked={enabled} onCheckedChange={setEnabled} warning={warnings.enabled} />
```

### SegmentedField

Segmentová volba 2–3 vzájemně výlučných typů záznamu ve formuláři s ovládáním šipkami. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 12i (2.98.0): zakázaná vybraná volba používá plné muted pozadí, foreground a font-semibold bez primární barvy; nevybraná zůstává muted/40 a muted-foreground s normálním řezem. Povolená vybraná volba zachovává primary/10 a primary. Obě zakázané volby mají kontrast nejméně 4,5 : 1; segmenty gridu beze změny. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

```tsx
<SegmentedField label={texts.deduction} value={deduction} onChange={setDeduction} options={options} error={errors.deduction} />
```

### ToggleGroup

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

```tsx
<ToggleGroup type="single" label={texts.mode} value={mode} onValueChange={setMode} warning={warnings.mode}><ToggleGroupItem value="a">A</ToggleGroupItem></ToggleGroup>
```

### Textarea

Víceřádkové textové pole. Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

```tsx
<Textarea id="note" label={texts.note} value={note} onChange={handleNote} error={errors.note} />
```

