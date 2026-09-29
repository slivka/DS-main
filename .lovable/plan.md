# DS 2.64.0 – zoom aplikace, automatický zoom gridů a šířka menu

## Cíl a ověřený výchozí stav
Realizovat tři oddělené mechanismy bez vrstvy zpětné kompatibility:

- **A – zoom aplikace** uložený pro zařízení;
- **B – automatický zoom gridů ve formulářích**, který se neukládá;
- **C – šířka a sbalení menu** uložené pro zařízení.

V projektu je nyní `package.json` 2.62.0 a katalog `.lovable/design-system.json` 2.63.0; obě verze se sjednotí na **2.64.0**. Ověřené staré mechanismy jsou zapojené současně přes `font-scale.ts`, `useAppFontSize.ts`, `FontSizeSetting`, `AppFontSizeControl`, `GridPreferencesProvider`, stav `gridPreferences` v záložkách a řízené props sbalení menu. `.lovable/meta.yaml` se nebude měnit.

## Veřejné API

### Nové exporty
- `APP_ZOOM_MIN`, `APP_ZOOM_MAX`, `APP_ZOOM_STEP`, `APP_ZOOM_STORAGE_KEY`.
- `getAppZoom()`, `setAppZoom(value)`, `resetAppZoom()`, `estimateAppZoom(innerWidth)` z nového `lib/app-zoom.ts`.
- `useAppZoom()` pro jednotné napojení `UserMenu`, `AppShell` a výpočtů panelů na `app:zoom-change`.
- Čisté pomocné funkce automatického zoomu a omezení šířky menu budou exportované jen tehdy, pokud jsou součástí testovatelného veřejného chování; komponentové API gridů se kvůli automatice rozšiřovat nebude.

### Odstraněné API – BREAKING
- komponenty `FontSizeSetting`, `FontSizeSettingProps`, `AppFontSizeControl`;
- celý modul a exporty `font-scale`: `FONT_SCALE_KEY`, `FONT_SCALES`, `getFontScale`, `applyFontScale`, `setFontScale` a událost `app:font-scale`;
- celý hook a exporty `useAppFontSize`: `APP_FONT_SIZES`, `DEFAULT_APP_FONT_SIZE`, `readAppFontSize`, `applyAppFontSize`, `useAppFontSize`;
- `GridPreferencesProvider`, `GridPreferencesProviderProps`, `GridPreferencesContextValue`, `GridPreferenceValues`, `useGridPreferences`;
- `GRID_DEFAULTS_DEBOUNCE_MS`, `createDebouncedCall` a poskytovatelské/localStorage výchozí hodnoty `zoom:<key>` / `density:<key>`;
- `AppShellProps.collapsed` a `AppShellProps.onCollapsedChange`;
- zoomové `preferences` v uloženém `LayoutSnapshot` a podpora jejich obnovení.

`useGridZoom`, `ZoomControl`, `ZoomGrid`, `ZoomPane`, zoom 60–140 % a hustota řádků zůstanou, ale jejich uložení se změní podle typu stránky. `ZoomPane` zachová současné CSS zoomování netabulkových zobrazení, jen přestane ukládat výchozí hodnotu. `DataGridColumn.width` a `TreeGridColumn.width` zůstávají číselné v **px při 100 %**; jejich veřejný význam se nemění.

## Technické řešení

### A. Jediný zoom aplikace
1. `src/lib/app-zoom.ts` bude jediný zdroj pravdy:
   - clamp 0,70–2,00 a krok 0,05;
   - odhad 0,90 / 1,00 / 1,10 / 1,25 podle zadaných hranic;
   - ruční změna uloží `app:zoom`, reset klíč smaže a použije aktuální jednorázový odhad;
   - čtení i zápis úložiště bude v `try/catch`;
   - aplikace nastaví kořenové písmo na `16 × zoom px` a vyšle `app:zoom-change` s hodnotou zoomu.
2. `AppShell` použije zoom při prvním layout efektu, aby se obsah nevykreslil ve staré velikosti. Resize okna během relace odhad nemění.
3. `UserMenu` dostane nezavírající řádek „Velikost zobrazení“ s −, celými procenty, + a „Obnovit“; texty se doplní do `DsTexts`, českého i slovenského balíku, aby zůstalo zachované pravidlo knihovny.
4. Globální zkratky budou v `AppShell` vyhodnocovat `event.code`: Ctrl+Alt/Option + plus, minus a nula. `AltGraph` se vždy ignoruje a `preventDefault` proběhne jen po skutečném zásahu. Ctrl+kolečko mimo grid se nepřevezme.
5. Nový sdílený hook efektivní šířky bude vracet `innerWidth / appZoom`. `AppShell` podle něj rozhodne mobil pod 768, automatické sbalení pod 1 280 a desktopové zobrazení; `PaneLayout` podle stejné veličiny rozhodne dostupný počet panelů. CSS media query už nebudou rozhodovat tyto tři behaviorální zlomy.

### Převod rozměrů na rem/em
- `grid-zoom.tsx`: `GRID_BASE_FONT` bude 0,8125 rem; gridový zoom bude násobit rem základ.
- `DataGrid.tsx`, `TreeGrid.tsx`, `grid-columns.tsx`, `grid-column-resize.tsx` a účetní gridy ponechají všechny definice v px při 100 % a vykreslí je jako `${width / 16}rem`; stejně se převedou výběrový sloupec 40, pobočka 78, připnuté/systemové šířky 84/118 a minimum 60.
- Uložené ruční šířky zůstanou ve stejné jednotce jako veřejné definice: px při root 16 px a grid zoomu 1. Změřená šířka se uloží jako `measuredPx / (rootFontPx / 16) / gridZoom`. Klíč se zvýší pouze tehdy, pokud implementace skutečně mění dnešní uloženou jednotku; výsledek kontroly bude v závěrečné zprávě.
- `use-resizable-width.ts` zachová veřejnou px jednotku při 100 %; vizuální měření se normalizuje přes aktuální kořenové písmo a příslušný zoom.
- Pevné typografické px v menu se převedou na rem. Rohy v `styles.css` zůstanou záměrně v px.

### B. Automatický zoom gridů ve formuláři
`PageLayout variant="form"` rozšíří kontext o režim automatického zoomu. `DataGrid`, `TreeGrid`, `ZoomGrid` a `JournalLinesEditor` jej použijí automaticky pouze při výsledném `height="auto"`; seznamy `variant="list"` zůstanou ruční.

Nový modul `src/components/ds/grid/grid-auto-zoom.ts` oddělí čistý výpočet od React napojení:

```text
viditelné sloupce + ruční šířky při 100 %
                    ↓
zoom = floor_0,05(clamp(volná šířka / potřebná šířka, 0,75, 1,00))
                    ↓
zoom >= 0,75 a vše se vejde → hotovo
                    ↓
nevleze se při 0,75 → jednou kaskáda JournalLinesEditor při 0,75
                    ↓
stále nevleze → overflowFallback / vodorovné rolování
```

- Každý přepočet začne od nuly: plná požadovaná sada sloupců při 100 % → zoom → jednorázová kaskáda při 0,75 → rolování. Po rozšíření panelu se proto sloupce vrátí z detailu a zoom může vystoupat zpět na 100 %; po kaskádě se zoom v témže průchodu znovu nezvyšuje.
- Obecný `DataGrid`/`TreeGrid` získá potřebnou šířku ze zobrazených definic a ručních šířek. První měření a výpočet proběhnou v `useLayoutEffect`; grid se nikdy nebude skrývat. Při šířce kontejneru 0 se výpočet přeskočí a zůstane poslední stabilní hodnota, u nového gridu 100 %, dokud nebude šířka kladná.
- `JournalLinesEditor` spočítá šířku z požadovaných sloupců a ručních rem šířek. `resolveJournalColumnLayout` se zavolá až tehdy, když výpočet při 0,75 nestačí; dostane pevně 0,75. `overflowFallback` se určí až z výsledku tohoto jediného průchodu.
- `ResizeObserver` bude mít debounce 150 ms; přepočet vyvolá také `app:zoom-change` a změna viditelnosti, pořadí nebo ruční šířky sloupců.
- Ruční −/+ a Ctrl+kolečko ve formulářovém gridu přepnou stav na ruční 60–140 % a popisek z „Auto 85 %“ na „85 %“. Hodnota bude pouze v paměti záložky, přežije její přepnutí, ale ne zavření/F5. Následující změna šířky, sloupců nebo zoomu aplikace ruční stav přepíše novou automatickou hodnotou.
- Seznamový grid bude dál držet zoom a hustotu v konceptu konkrétní záložky. Nová záložka začne zoomem 100 %; výchozí hustota se převezme přesně ze současného fallbacku ověřeného v kódu. Bez panelů bude stav jen lokální. Žádná výchozí hodnota se nebude číst ani ukládat. `serializeLayout` zachová ostatní stav gridu, ale vynechá zoomové `preferences`.

### Zámek během tažení a pořadí přepočtů
Nový interní modul `src/lib/resize-lock.ts` sjednotí `beginResize()` / `endResize()`:

- při `pointerdown` nastaví `document.documentElement.dataset.resizing = "true"`;
- při `pointerup`, `pointercancel` i `lostpointercapture` zámek odstraní a vyšle právě jednu událost `app:resize-end`;
- během zámku `ResizeObserver` pouze označí odložený přepočet; automatický zoom i `resolveJournalColumnLayout` ponechají poslední stabilní výsledek;
- po `app:resize-end` každý dotčený grid provede jeden přepočet v pořadí **zoom → případná kaskáda při 0,75 → rozhodnutí o rolování**.

`PaneLayout` bude při tažení držet zvláštní vizuální `draftWidths`; `api.setWidths` se zavolá pouze na konci tažení. Stejný zámek použije nový posuvník menu. Obsluhy budou uklízet capture i globální listenery ve všech ukončovacích cestách.

### C. Vlastní šířka menu
1. `AppShell` převezme vlastnictví sbalení a šířky:
   - `app:menu-width` v rem, rozsah 12,5–26,25 rem, výchozí 15 rem;
   - `app:menu-collapsed`, sbalená šířka 3,5 rem;
   - dvojklik na oddělovač obnoví 15 rem;
   - Ctrl+B zůstane a mění interní stav;
   - automatické sbalení pod 1 280 efektivních px platí, dokud uživatel v aktuální relaci sám nerozhodne.
2. Oddělovač bude mít `role="separator"`, úplné `aria-valuemin/max/now`, pointer capture a klávesy ←/→ po 0,5 rem. Během tažení se mění jen vizuální šířka; localStorage a přepočty se provedou na konci.
3. `PaneLayout` nahlásí do `AppShell` aktuální počet panelů a `minPaneWidth`. Maximum menu se omezí podle `requiredPaneWidth`; zámek zabrání dočasnému sloučení během pohybu a vypočtené maximum zajistí, že se panely kvůli menu nesloučí ani po puštění.
4. Položky, skupiny, štítky a stav „Připravujeme“ budou v jednom nezalamovaném řádku. Zkrácený název dostane tooltip i u zakázané položky.
5. Uložená šířka větší než aktuální maximum se omezí jen pro vykreslení; hodnota v localStorage se nepřepíše a po uvolnění omezení se vrátí. Změna zoomu aplikace smí změnit počet panelů, změna šířky menu nikoli.

## Konkrétní soubory

### Nové
- `src/lib/app-zoom.ts` – stav, odhad, persistence, událost a hook zoomu aplikace.
- `src/lib/resize-lock.ts` – společný zámek tažení a `app:resize-end`.
- `src/components/ds/grid/grid-auto-zoom.ts` – čistý výpočet, měření a stav auto/ručního zoomu.
- `tests/unit/app-zoom-264.test.ts` – hranice, clamp, krok, persistence a AltGraph/zkratky.
- `tests/unit/grid-auto-zoom-264.test.tsx` – automatika, první výpočet, pořadí kaskády a zámek.
- `tests/unit/appshell-menu-264.test.tsx` – šířka, klávesy, persistence a maximum podle panelů.
- `tests/e2e/zoom-layout-264.spec.ts` – viditelná kontrola 70/200 %, menu, 1↔3 panely, Auto % a stabilita tažení.

### Upravené – běhové části
- `src/components/ds/grid/grid-zoom.tsx` – rem základ, režimy list/form, „Auto %“, odstranění defaults/localStorage a transientní ruční stav formuláře.
- `src/components/ds/grid/DataGrid.tsx`, `TreeGrid.tsx` – automatický režim pro form+auto, rem šířky a přepočet po změně sloupců.
- `src/components/ds/grid/grid-columns.tsx`, `grid-column-resize.tsx` – px-at-100% persistence a normalizovaný resize přes root font a grid zoom; klíč jen při skutečné změně uložené jednotky.
- `src/components/ds/accounting/journal-lines-editor.tsx` a `journal-lines-recap.tsx` – pevné pořadí zoom/kaskáda/overflow, rem šířky a zamrznutí při tažení.
- `src/components/ds/layout/page-layout.tsx` – kontext typu stránky a auto-zoom pravidla.
- `src/components/ds/layout/AppShell.tsx` – inicializace zoomu, efektivní breakpointy, interní menu, oddělovač, zkratky a registrace požadavků panelů.
- `src/components/ds/layout/user-menu.tsx` – ovladač „Velikost zobrazení“.
- `src/components/ds/panes/pane-layout.tsx` – app zoom, hlášení potřebné šířky, draft šířek a resize lock.
- `src/components/ds/panes/pane-context.tsx`, `pane-state.ts`, `layout-menu.tsx`, `pane-tab-store.ts` – odstranění zoomových preferences ze snapshotů a oddělená krátkodobá paměť formulářových gridů.
- `src/hooks/use-resizable-width.ts`, `src/lib/grid-prefs.ts`, `src/ds-texts.tsx`, `src/styles.css` – rem comboboxy, odstranění prefixů zoom/density, nové texty a nezalamování.
- `src/components/ds/index.ts`, `src/index.ts`, `src/hooks/index.ts` – nové exporty a odstranění starých.
- `src/components/showcase/ShowcaseLayout.tsx`, `PaneShowcase.tsx`, `src/routes/components.navigation.tsx` – odstranění řízeného sbalení/staré volby písma a funkční ukázka 3 panelů, dvou 40řádkových dokladů, posuvníku menu a Auto %.

### Odstraněné soubory
- `src/lib/font-scale.ts`.
- `src/hooks/useAppFontSize.ts`.
- `src/components/ds/layout/FontSizeSetting.tsx`.
- `src/components/ds/layout/app-font-size.tsx`.
- `src/components/ds/grid/grid-preferences.tsx`.

### Testy a dokumentace
- Přepsat zastaralé testy `scrolling-zoom-253.test.tsx`, `scrolling-fixes-253.test.ts`, `journal-width-zoom-253.test.ts` a doplnit kontroly `PaneLayout`/`AppShell`.
- `components.md`, `.lovable/system.md`, `README.md`, `roadmap.md`, `AGENTS.md` – tři mechanismy, rem pravidla, zámek, zkratky, hustota `normal`, zákaz persistence auto zoomu a BREAKING migrační seznam.
- `package.json` a `.lovable/design-system.json` – verze 2.64.0, nové/odstraněné exporty a aktualizované příklady/použití.
- `.lovable/meta.yaml` zůstane beze změny.

## Testy a dokončení
- Jednotkové testy: přesné hranice `estimateAppZoom`, clamp/krok/reset, bezpečné úložiště, `event.code`, AltGraph, efektivní breakpointy, auto zoom a zaokrouhlení dolů po 0,05, kaskáda až při 0,75, overflow až po kaskádě, odložený jediný přepočet po resize locku, 3 → 1 panel vrátí sloupce i zoom, nulová šířka zachová poslední stabilní stav, transientní formulářový zoom, současný výchozí stav hustoty, snapshot bez preferences a maximum menu bez přepsání uložené šířky.
- Vizuální/pravidlo 20: při 70 % i 200 % ověřit nadpisy, popisky, panelové záložky a menu bez zalomení, s výpustkou a tooltipem.
- V náhledu projít „Režim více oken“: 1 → 3 → 1 panel, oba 40řádkové doklady, změny Auto %, posuvník menu a panelů bez poskakování; zkontrolovat konzoli.
- Spustit všechny jednotkové testy, lint, kontrolu typů a produkční build. Produkční výstup spustit a stejnou ukázku ověřit proklikem i tam.
- Na konci uvést verzi, přesný seznam změněných souborů, nové a odstraněné exporty, výsledky testů/lintu/typů/buildu a potvrzení, že vydání zůstává na Petrovi.
