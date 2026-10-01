# DS 5b + 5d – společný rám gridů a klávesy AppShell (zůstává 2.83.0)

Beze změny chování a veřejného API. Žádné props se neodstraňují (3.0.0). Nevydávat, meta.yaml nedotčeno.

## Zjištěný stav

| Soubor | Řádků | Poznámka |
|---|---|---|
| grid/DataGrid.tsx | 1 793 | lišta (ř. ~1014–1360) skládá GridContextBar, GridToolbar, Collapsible, oddělovače, ZoomGrid |
| grid/TreeGrid.tsx | 1 079 | stejná skladba lišty (ř. ~568–855) téměř 1 : 1 |
| layout/AppShell.tsx | 1 372 | 3 globální `keydown` posluchače (ř. 818, 908, 948) |
| grid/grid-virtual.tsx | 142 | `useGridVirtual` dnes v gridech nezapojen |

- Doménová ID natvrdo v DataGrid: `PINNED_COLUMN_IDS` (`status`, `is_active`, `is_system`, `source`) a `COMPACT_COLUMN_IDS` (`status`, `date`, `document`, `vs`, `symbol`, `md`, `dal`, `debit`, `credit`, …).
- Efekt bez pole závislostí: AppShell ř. 948–955 (Escape zavře panel) – posluchač se přepojuje při každém renderu.
- Ctrl+B efekt (ř. 818) má zbytečné závislosti `[appZoom, isCollapsed]` (čte ref).
- `activeToggleMenuItem` v DataGrid/TreeGrid přímo nenajdu – před refaktorem dohledám, kde vzniká (pravděpodobně grid-action), a `useRowActions` ho použije, ne zduplikuje.
- Uložení sloupců se v API jmenuje `storageKey` (ne `stateKey`); testy proto na `storageKey`.

## Postup

1. **Testy proti dnešnímu kódu** (musí projít před refaktorem):
   - `tests/unit/data-grid-behavior.test.tsx`: řazení, sloupcový filtr, výběr sloupců + uložení přes `storageKey` (po novém připojení zůstane), výběr řádků + `selectionSummary`, `groupTotals`, menu řádku (upravit / odstranit s potvrzením / zakázaný důvod), Obnovit volá `onRefresh`, připnuté a kompaktní sloupce mají dnešní šířky.
   - `tests/unit/tree-grid-behavior.test.tsx`: rozbalení/sbalení uzlu, menu řádku, Obnovit.
   - `tests/unit/app-shell-shortcuts.test.tsx`: Ctrl+B sbalí menu (ne v poli), „/“ zaměří hledání, Escape zavře panel, zoom zkratky beze změny, Alt+Shift+T obnoví zavřenou záložku (pokud jde přes AppShell).
2. **5b refaktor gridů** (mapa níže), pak stejné testy beze změny.
3. **Virtualizace** pro `paginated={false}` v režimu výšky „fill“: test 5 000 řádků → vykreslí jen viditelné + rezervu; po rolování se okno posune. Režim „auto“ (formuláře) zůstává bez virtualizace jako dnes.
4. **Doménová ID ven**: nové exportované konstanty `DEFAULT_PINNED_COLUMNS` a `DEFAULT_COMPACT_COLUMNS` (v novém `grid-column-presets.ts`), nové volitelné props `pinnedColumnIds` / `compactColumnIds` s dnešními hodnotami jako výchozí. `isPinnedColumn` zůstává (jen nové doplnění API = minor, verze se nemění dle zadání).
5. **5d AppShell**: hook `useGlobalShortcuts` s registrem (jeden `window` posluchač, záznamy `{ id, match, run, allowInEditing }` přes ref, odregistrace při odpojení). Escape efekt dostane závislost `[currentPanel]`, Ctrl+B prázdné závislosti přes ref. Test: `addEventListener("keydown")` zavolán právě 1× za AppShell, `removeEventListener` při odpojení. Zoom zkratky z `useAppZoomShortcuts` se připojí do registru jen pokud dnes běží ve stejném AppShell; jinak hook zoomu beze změny (ověřím a uvedu).
6. Texty nových prvků přes `DsTexts` (CS + SK) – předpoklad: žádné nové viditelné texty nevzniknou.
7. Závěr: format, typecheck, lint (0 chyb v nových/změněných), test, build; CHANGELOG 2.83.0 doplnit (5b, 5d – pro APP nic povinného; nové konstanty a volitelné props); tabulka souborů s řádky; co nezměněno a proč.

## Mapa souborů před → po (odhad)

| Soubor | Odpovědnost | Řádků |
|---|---|---|
| grid/DataGrid.tsx | skládání, data (řazení, filtr, stránky, skupiny) | 1 793 → ~480 |
| grid/data-grid-types.ts | `DataGridProps`, `DataGridColumn` (re-export z DataGrid zachován) | nový ~300 |
| grid/data-grid-columns.ts | šířky, připnuté/kompaktní, odvození viditelných | nový ~200 |
| grid/DataGridBody.tsx | tělo tabulky, skupiny, součtový řádek, virtualizace | nový ~400 |
| grid/TreeGrid.tsx | skládání stromu | 1 079 → ~450 |
| grid/TreeGridBody.tsx | řádky stromu, rozbalení | nový ~350 |
| grid/GridFrame.tsx | lišta akcí, hledání, Sloupce, Obnovit, zoom/hustota, kontextový řádek, pruh zkrácení, ZoomGrid – jednou pro oba | nový ~300 |
| grid/grid-base-props.ts | `GridBaseProps` – společné props (typ, API beze změny) | nový ~150 |
| grid/useRowActions.tsx | menu řádku, `activeToggleMenuItem`, potvrzení odstranění | nový ~150 |
| grid/grid-column-presets.ts | `DEFAULT_PINNED_COLUMNS`, `DEFAULT_COMPACT_COLUMNS` | nový ~40 |
| layout/AppShell.tsx | rám aplikace | 1 372 → ~1 250 (pod 500 až v 3.0.0, viz níže) |
| layout/useGlobalShortcuts.ts | registr globálních zkratek, jeden posluchač | nový ~90 |

Každý nový soubor: hlavička (co · vlastní · nesmí), JSDoc česky ke každému exportu a propu.

## Co se nemění a proč

- AppShell zůstane nad 500 řádků: zadání 5d je jen efekty a klávesy; rozdělení panelů/navigace je samostatný úklid (navrhnu jako 5e).
- Žádné props se neodstraňují ani nepřejmenovávají; zastaralé props AppShell zůstávají.
- `storageKey` formát uložení beze změny – existující uložené sloupce v APP platí dál.
