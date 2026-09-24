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

## PaneLayout

- Změna `layout` na 2 nebo 3 doplní chybějící panely s `route: ""` a aktivuje první nový panel.
- `renderEmpty?: (pane) => ReactNode` přepisuje výchozí `PaneEmpty`.
- `isPinned?: (pane) => boolean` a `onTogglePin?: (pane) => void` řídí připnutí neprázdných panelů.
- Prázdný panel nevstupuje do historie, `renderPane`, `uniqueKey` ani `paneKey`; serializace ho zachová.

## PinnedBar

`PinnedBar` je jednořádková lišta trvalých záložek stránky. Přijímá `items`, `onOpen(id, { newPane })`, `onUnpin(id)`, volitelné `onReorder(ids)` a `texts`. Při prázdném `items` se nevykreslí.

## AppShell

Slot `subHeader?: ReactNode` se vykresluje přímo pod horní lištou. Při otevřeném Nastavení firmy nebo Administraci se automaticky skryje.