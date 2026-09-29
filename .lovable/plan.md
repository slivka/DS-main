# DS 2.58.0 – Párování P2a, část B

Nová MINOR verze, zpětně kompatibilní: bez nových props se DataGrid chová přesně jako v 2.57.1. `package.json` 2.58.0; `.lovable/meta.yaml` beze změny (žádné `upstream_versions`).

## B1 – součty skupiny pod sloupci
- `DataGridProps.groupTotals?: "header" | "row"` (výchozí `"header"` = dnešní součty v záhlaví skupiny).
- `"row"`: za posledním řádkem každé skupiny (i vnořené) řádek součtů v buňkách číselných sloupců (`total: "sum"` nebo `numeric`), tučně, popisek „Celkem {hodnota skupiny}“ v prvním viditelném textovém sloupci (text přes `texts.groupTotal`). Záhlaví skupiny pak jen název + počet. Sbalená skupina řádek součtů skrývá spolu s řádky.
- `paginated={false}`: seskupení i součty přes všechny filtrované řádky (ověřit a zajistit, že se neřeže na stránku).
- Excel/PDF export beze změny (SUBTOTAL, osnova).

## B2 – řízený výběr
- `selectedKeys?: string[]`, `onSelectedKeysChange?: (keys: string[]) => void`. Když je `selectedKeys` zadané, grid výběr jen zobrazuje a hlásí změny; jinak vnitřní stav jako dnes. Vnitřní výběr se při vypnutí `selectMode` maže jen v neřízeném režimu.
- Výběr skrytý filtrem/hledáním zůstává; `onSelectedRowsChange`, `selectionActions`, `selectionSummary` dostávají řádky z celé množiny `rows`. „Vybrat vše“ přidá/odebere jen viditelné filtrované řádky; zaškrtávátko v záhlaví ukazuje stav vůči viditelným.
- `selectionSummary?: (rows: Row[]) => ReactNode` – vlevo v patičce gridu (v součtovém řádku / pruhu patičky), jen v `selectMode`.
- `DataGridColumn.total` rozšířen o `"sumSelected"` – součet vybraných řádků (i skrytých filtrem); v exportu mapováno na `"none"`.
- V `selectMode` klik na `input`, `button`, `textarea`, `select`, `a`, `[role=combobox]` či `[data-grid-interactive]` uvnitř buňky řádek nepřepíná.

## B3 – editovatelný sloupec
- `DataGridColumn.editor?: (row: Row) => ReactNode` – u vybraných řádků (v `selectMode`) místo `render`; jinak `render`/`value`. Export i řazení/filtr berou `value`.
- Nová komponenta `GridAmountEditor` (props `value: number | null`, `onChange(value)`, `max?`, `currencySymbol?`, `decimals?` = 2, `invalid?`, `invalidMessage?`, `ariaLabel`, + className/ref/zbytek props inputu). Postavená na `DecimalInput`/formátování s mezerou pro tisíce, vpravo, bez rámečku aktivní buňky; chyba = červený roh `::after` + tooltip (stejné třídy jako editor řádků dokladu). Tab/Shift+Tab přechází mezi editory gridu (`data-grid-editor`), Enter potvrdí, Esc vrátí hodnotu z doby zaostření. Převýšení `max` se hlásí přes `invalid` (řídí aplikace; komponenta nabídne i helper `exceedsMax`).
- Export z barelu `src/components/ds/index.ts`, typ `GridAmountEditorProps`, záznam v `design-system.json` (usage/examples/antipatterns).
- `system.md`: „Editovatelná buňka v obecném DataGrid jen přes `editor` (+ `GridAmountEditor`); editace řádků zápisu dál jen JournalLinesEditor.“

## B4 – ukázka „Párování“
Nová stránka v sekci Účetní formuláře (`/components/matching`, odkaz v navigaci ukázek), vlastní head().
- Přepínač stránky Saldokonto | Párování (PageTabs).
- **Saldokonto**: `PageLayout list`; `contextRight` = `GridSegmentedToggle` Druh (Pohledávky · Závazky · Zálohy · Saldokonto), `GridToggleButton` „Jen po splatnosti“, `asOf` „Stav k datu“; přepínač Položky | Věková struktura. Položky: grid seskupený po partnerovi (`defaultGroupBy`, `groupTotals="row"`, `paginated={false}`), sloupce Partner · Účet · VS · Doklad · Datum · Splatnost · Dní po splatnosti · Měna · Částka · Spárováno · Zbývá · Zbývá v domácí měně · Stav (StatusBadge); akce řádku Párovat… / Historie párování (přepne na Párování); v liště `moreActions`/`toolbarLeft` akce „Spárovat automaticky“ (ne addAction). Věková struktura: řádek = partner, sloupce Do splatnosti · 1–30 · 31–90 · 91–180 · 181–365 · Nad 365 · Celkem, součtový řádek.
- **Párování**: `PageLayout list`; hlavička položky ve `FieldGrid` + `FieldValue` (Doklad, Partner, VS, Účet, Měna, Částka, Spárováno, Zbývá); `PageTabs` Protipoložky | Historie párování.
  - Protipoložky: DataGrid v selectMode, `selectedKeys`, filtry v kontextovém řádku (GridToggleButton Stejný VS · Stejný partner · Stejná částka · Stejný účet; GridSegmentedToggle Typ Doklady · Platby · Vše), sloupec „Párovat částkou“ s `editor` = GridAmountEditor (výchozí min(zbývá položky, zbývá protipoložky), max = zbývá; převýšení = chyba), `total: "sumSelected"`, `selectionSummary` („Vybráno 3 · Páruje se … · Zbude …“), tlačítko Spárovat (zakázané při chybě nebo prázdném výběru).
  - Historie: DataGrid seskupený po skupině párování, zrušená párování šedě, akce řádku Zrušit párování (destructive) → dialog s povinným důvodem (RecordDialog/ConfirmDialog vzor).
- Mock data v `src/lib/mock/matching.ts`; značky měn z dat, tisíce s mezerou, čeština, nezalamované popisky.

## Testy (bun test tests/unit)
- `grid-group-totals-258.test.tsx`: řádek součtů pod číselnými sloupci s popiskem, záhlaví bez součtů; bez stránkování počítá všechny řádky; výchozí `header` beze změny.
- `grid-selection-258.test.tsx`: řízený výběr (klik volá `onSelectedKeysChange`, bez změny props se nezmění); výběr skrytý filtrem zůstává a je v `onSelectedRowsChange`; „Vybrat vše“ jen viditelné; `sumSelected`; klik do inputu v buňce nepřepíná řádek.
- `grid-amount-editor-258.test.tsx`: editor jen u vybraných řádků; Tab/Shift+Tab mezi editory; Enter/Esc; chybový roh + tooltip text; export bere `value`.
- Stávajících 265 testů musí projít beze změny.

## Dokumentace a verze
`package.json` 2.58.0, changelog v README, `roadmap.md`, `components.md` (DataGrid nové props, GridAmountEditor), `system.md` pravidlo, `.lovable/meta.yaml` nedotčen.

## Dotčené soubory
- `src/components/ds/grid/DataGrid.tsx`, `grid-grouping.tsx`, `grid-texts.ts`, `grid-export.tsx` (mapování `sumSelected`)
- nový `src/components/ds/grid/grid-amount-editor.tsx`; `src/components/ds/index.ts`; `src/styles.css` (styl editoru, řádek součtů skupiny)
- nová `src/routes/components.matching.tsx`, `src/components/showcase/MatchingShowcase.tsx`, `src/lib/mock/matching.ts`, navigace ukázek v `ShowcaseLayout`
- testy výše; README, roadmap, components.md, `.lovable/system.md`, `.lovable/design-system.json`, `package.json`

## Předpoklady
- Nová ukázka je samostatná stránka odkazovaná ze sekce Účetní formuláře (ne další blok na již dlouhé stránce).
- `"sumSelected"` se zobrazuje v součtovém řádku jen když je `showTotalRow` nebo `selectionSummary` aktivní.
- Popisek „Celkem {hodnota}“ je přes texty gridu (výchozí česky).
