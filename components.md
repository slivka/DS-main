# Komponenty design systému

## DataGrid

`DataGrid` používá jednotné pořadí akcí v liště: Hledat, Filtr, Obnovit, Export, Sloupce, Seskupit, Zoom, vlastní `actions` a Vybrat více.

- `onRefresh?: () => void | Promise<unknown>` zobrazí ikonové tlačítko Obnovit data. Komponenta po dobu vrácené Promise sama zobrazí stav načítání.
- `refreshing?: boolean` umožní řídit stav načítání z aplikace.
- Nadpis je standardně skrytý. Zobrazí se pouze s `showTitle`; `title` lze dál použít pro název exportu.
- Hromadný výběr používá `GridSelectionToggle`; aktivní stav ukazuje počet vybraných záznamů.
- Zkratka F5 není komponentou přepsána.

## TreeGrid

`TreeGrid` používá stejné ovládání obnovení a výběru jako `DataGrid`.

- `onRefresh?: () => void | Promise<unknown>` a `refreshing?: boolean` řídí obnovení.
- `selectable?: boolean`, `selectedRows?`, `onSelectedRowsChange?` a `selectionActions?` řídí hromadný výběr.
- `gridTexts?: Partial<GridTexts>` přepisuje společné texty gridové lišty včetně `refresh`.
- Nadpis je standardně skrytý a zobrazí se pouze s `showTitle`.

## Záložky v panelech (2.12.0)

- `PaneTabsProvider` drží stav `PaneTabsState` (`version: 2`) přes `state` / `onChange`; `onSaveTab(tabId)` zobrazí v dialogu tlačítko Uložit, `onNewTabRequest` obsluhuje Alt+T. Obalte jím AppShell i PaneLayout – navigace pak otevírá záložky.
- `usePaneTabs()` – `openTab(route, params, { target: 'replace' | 'newTab' | 'adjacentPane', kind: 'list' | 'record', recordKey, title, shortTitle, icon })`, `closeTab`, `closeOtherTabs`, `moveTab`, `activateTab`, `activatePane`, `duplicateTab`, `setLayout`, `closePane`, `back`, `forward`, `setTabTitle`.
- Pravidla: prázdný panel → nová záložka, jinak nahrazení aktivní (rozepsaná → dialog Uložit / Zahodit / Otevřít v nové záložce / Zrušit); `record` jen jednou; limit 10 záložek na panel (zavře nejdéle nepoužitou čistou, jinak odmítne); zavření/ubrání panelu přesune záložky doleva (u prvního doprava) bez dotazu; automatické zúžení podle šířky se po zvětšení obnoví.
- `PaneLayout` – `renderTab(tab, pane)`, `getTabIcon(tab)`, `renderEmpty`, `isPinned(tab)`, `onTogglePin(tab)`, `minPaneWidth`, `texts`. Vykresluje jen aktivní záložku každého panelu.
- `PaneTabBar` – záložky 120–200 px s tooltipem, ● při neuložených změnách, nabídka „»“, ← →, menu ⋯ (Maximalizovat panel, Zavřít ostatní záložky, Zavřít panel), kontextové menu (Zavřít, Zavřít ostatní, Přesunout do panelu N, Duplikovat jen u seznamů), přetahování v liště, do jiné lišty i na plochu panelu.
- `useTabDraft(tabId, initial, key?)` – stav, který přežije odpojení i přesun; `useTabScrollRestore`; `clearTabState` po zavření.
- `useTabDirty(isDirty, key?)` nahrazuje `usePaneDirty`.
- `PaneLink`, `getOpenTarget(event)`, `handlePaneLinkEvent(event, open)` – Cmd/Ctrl + klik a prostřední tlačítko = nová záložka, Cmd/Ctrl + Shift + klik = sousední panel.
- Stav: `serializePaneTabs` / `parsePaneTabs` (DB, v1 převede automaticky), `serializeActiveTabUrl` / `parseActiveTabUrl` (URL), `migratePaneStateV1`.
- Zkratky: Alt(Option)+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T.

## Dočasné a ponechané záložky (2.16.0)

- `PaneTab.pinned` (false = dočasná, v panelu nejvýš jedna) a `openerTabId`. Starší stav v2 → `pinned = true`, `openerTabId = null`. Maximalizace se neukládá.
- `openTab(route, params, { target: 'preview' | 'newTab' | 'adjacentPane' | 'replace', openerTabId })` – `preview` jen aktivuje otevřený záznam, jinak použije dočasnou záložku aktivního panelu (nový krok historie) nebo ji založí za aktivní.
- `openRecord(route, params, { fromTabId, isNew, modifiers })`: a) otevřený → aktivovat; b) Cmd/Ctrl → ponechaná za fromTab, Cmd/Ctrl+Shift → sousední panel; c) čistý dočasný detail z fromTab → nahradit; d) panel s detaily z fromTab; e) prázdný sousední panel (ne při maximalizaci); f) nová za fromTab. Cílový jiný panel blikne 0,7 s.
- `keepTab` / `releaseTab` (dirty → false + toast), automatický keep při první změně, přesunu a `openFromHistory`. `reopenClosedTab` (10 posledních), `maximizePane` / `restoreLayout` / `toggleMaximize`, `registerRecordNav(tabId, getOrderedItems)`.
- `usePaneChrome()` – kontext pro `PageHeader` (historie, dirty, pinned, recordNav, maximalizace, `menuActions`, `dragHandleProps`).
- `PaneTabBar` jen se záložkami a „»“; `PaneLayout.tabBarMode` 'auto' | 'always'.
- Koncepty: `useTabDraft(..., { route, params, recordVersion })` → `[value, set, meta]`, `persistDrafts`, `listOrphanDrafts`, `clearDrafts`, `DraftRestoredBanner`.
- Rozložení: `serializeLayout`, `applyLayout(snapshot, { keepDirty: true })`, `LayoutMenu` (Alt+L).
- Zkratky: Alt+M, Esc, Alt+Shift+T, Alt+1/2/3 (při maximalizaci přepne maximalizovaný panel).

## PinnedBar

`PinnedBar` je jednořádková lišta trvalých záložek stránky. Přijímá `items`, `onOpen(id, { newPane })`, `onUnpin(id)`, volitelné `onReorder(ids)` a `texts`. Při prázdném `items` se nevykreslí.

## AppShell

Slot `subHeader?: ReactNode` se vykresluje přímo pod horní lištou. Při otevřeném Nastavení firmy nebo Administraci se automaticky skryje.

- Skupiny mají oddělená záhlaví a ukládají sbalení do `ds:nav-groups:<navStateKey>:<group.id>`; `navStateKey` je výchozí `appName`, panely přidávají své `id`.
- `navSearch?: boolean` je výchozí `true`; texty mění `navSearchPlaceholder` a `navSearchEmptyText`.
- Hledání ignoruje diakritiku a velikost písmen. `/` ho aktivuje, šipky mění výsledek, Enter otevře položku a Esc smaže hledání nebo pole opustí.
- Cmd/Ctrl+Enter otevře novou záložku, Cmd/Ctrl+Shift+Enter sousední panel. Zakázané položky jsou vidět, ale klávesové zvýraznění je přeskočí.

## CompanySwitcher a PeriodSwitcher

- `label` se nezobrazuje nad hodnotou; zůstává přístupnostním názvem a součástí nápovědy.
- Firma zobrazuje výrazný název a v nápovědě IČO. Období zobrazuje stavový štítek; otevřené je zelené, období v uzávěrce jantarové a uzavřené se zámkem.
- Kompaktní `compactValue`, prázdné stavy a obsah nabídek zůstávají beze změny.