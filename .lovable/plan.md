# Slivka DS 2.17.0 – jednotná lišta gridu a rovnocenné záložky

## Cíl
Dokončit verzi 2.17.0 jako jeden celek: zachovat a znovu prověřit již rozpracovanou jednotnou lištu gridů a současně nahradit dočasné/ponechané záložky z 2.16.0 rovnocennými záložkami, novým záhlavím stránky a přesunutým menu uložených rozložení.

Předpoklad: samostatná komponenta `PinnedBar` pro připnuté stránky zůstane zachována. Odstraní se pouze `PaneTab.pinned` a celý mechanismus dočasná/ponechaná záložka; připnutí stránky nebude součástí nového přesně vymezeného menu záložky.

## 1. Jednotný řádek akcí gridu
- Dokončit audit sdíleného `GridToolbar` v DataGrid, TreeGrid a ZoomPane: pevné pořadí skupin, oddělovače, stejné velikosti ovladačů, zalamování od 560 px a pravostranné zarovnání.
- Zachovat `ViewModeToggle` jako první prvek. Rozbalení stromu a seskupení sjednotit na dvě ikonová tlačítka s nabídkou pojmenovaných nebo automatických úrovní a volbou „Vše“.
- Dokončit `AsOfDateToggle` a `GridToggleButton` v tónech `mode` / `grouping`; `AsOfDateField` označit jako deprecated.
- Sjednotit filtry pod lištou, výchozí versus změněné filtry, `FilterChips` při zavřeném panelu a oranžové seskupení.
- V obou gridech ponechat jediný `GridExport` s Excel/PDF/HTML a extra exporty; stromový Excel zachová osnovu a `SUBTOTAL`. Přidat, další akce a kompatibilní `actions` seřadit dle zadání.
- Sjednotit Ctrl/Cmd+kolečko přes celý blok DataGrid, TreeGrid a ZoomPane; obyčejné kolečko zachová rolování.

## 2. Rovnocenné záložky a migrace stavu
- Odstranit `pinned`, target `preview`, `keepTab` / `releaseTab` a všechna související automatická pravidla, texty, ikony, kurzívu a nabídky.
- `openerTabId` ponechat pro vazbu seznam → detail. Parser přijme starý stav s `pinned`, hodnotu ignoruje; serializace ji už nezapíše. Maximalizace zůstane pouze v paměti.
- `replace` bude běžný klik: aktivace již otevřeného záznamu, otevření v prázdném panelu nebo nahrazení aktivní záložky novým krokem historie. Dirty nahrazení zachová dialog Uložit / Zahodit / Otevřít v nové záložce / Zrušit.
- `newTab` a `adjacentPane` zůstanou pro Cmd/Ctrl, prostřední tlačítko a Cmd/Ctrl+Shift. `openRecord` zachová pravidla a–f, ale čistý existující detail nahradí podle `openerTabId`; nový záznam vždy otevře novou záložku.
- Limit 10 zavře nejdéle nepoužitou čistou záložku. Historie a zásobník zavřených záložek zůstanou zachované.

## 3. Vždy viditelná lišta a nové záhlaví panelu
- Odstranit `tabBarMode` a animované skrývání. `PaneTabBar` bude vždy viditelný i s jedinou nebo žádnou záložkou a zůstane cílem přetažení.
- Zachovat DnD mezi panely, zavření prostředním tlačítkem, overflow „»“ a dvojklik na prázdnou část pro maximalizaci. Kontextové menu sjednotit s nabídkou záložky bez funkcí Ponechat/Uvolnit.
- `PageHeader` uvnitř panelu: vlevo pouze přetahovatelný nadpis a dirty tečka; vpravo record navigation, historie, maximalizace a ⋯. Historie dostane text „Otevřít v nové záložce“.
- Přidat `PageHeader.menuActions` pro skupinu „Akce stránky“. `actions` se v panelu nevykreslí a ve vývojovém režimu upozorní; mimo panel zůstane beze změny.
- Menu ⋯ doplní akce stránky a přesně vymezené ovládání záložky: zavření, zavření ostatních, přesun, duplikaci seznamu, maximalizaci/obnovení, obnovení zavřené záložky a zavření panelu.
- Doplnit Alt+↑/↓ pro listování záznamy; tooltipy panelových ikon uvedou Alt+←/→, Alt+M a Alt+↑/↓.

## 4. Uložená rozložení v menu aplikace
- `AppShell` rozšířit o `navSearchMenu`, který se vykreslí jako ⋯ vedle hledání v hlavním, panelovém, mobilním i sbaleném menu.
- `LayoutMenu` rozšířit o `trigger="icon"`; obsah, dialogy a Alt+L zůstanou. Ukázka jej odstraní z horní lišty a vloží do nového slotu.

## 5. Ukázky, veřejné API a dokumentace
- Upravit navigační ukázku na nové otevírání, vždy viditelnou lištu, scénář seznam/detail ve dvou panelech, dirty odbočení do nové záložky, nové záhlaví a rozložení vedle hledání.
- Dokončit gridové ukázky obou stromů, tónů přepínačů, filtrů, seskupení, stavu k datu, exportu, ⋯ a Přidat.
- Synchronizovat veřejné exporty, katalog komponent, příklady a antipatterny.
- Aktualizovat systémová pravidla, přehled komponent, README, roadmapu a changelog 2.17.0 včetně breaking změn a návodu na přechod z 2.16.0.

## 6. Ověření
- Upravit unit testy stavu záložek: replace aktivní záložky, dirty dialog, pravidlo c s čistým detailem, nový záznam, limit 10 a načtení starého stavu s `pinned`.
- Spustit typovou kontrolu, unit/E2E testy a produkční sestavení.
- Playwrightem ověřit gridy na 100 %, 125 % a 560 px, Ctrl/Cmd+kolečko nad TreeGridem a požadované barvy i pořadí.
- Ověřit lištu s jedinou záložkou, nové záhlaví, historii, dirty dialog, výměnu detailu a ⋯ u hledání menu.

## Technické změny veřejného API
- Nové/rozšířené: `GridToolbar`, `GridToolbarSeparator`, `GridToggleButton`, `AsOfDateToggle`; gridové props `viewMode`, `onViewModeChange`, `asOf`, `toolbarLeft`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`; TreeGrid navíc `filters`, `filterChips`, `onClearFilters`, `loading`; `PageHeader.menuActions`; `AppShell.navSearchMenu`; `LayoutMenu.trigger="icon"`.
- Odstraněné breaking API: `OpenTabTarget='preview'`, `PaneTab.pinned`, `keepTab`, `releaseTab`, `PaneLayout.tabBarMode` a související texty/funkce. Odstraní se také panelové napojení `isPinned` / `onTogglePin`; samotný `PinnedBar` zůstává veřejný.
- Zachované: `openerTabId`, historie, closed-tab stack, koncepty, DnD, maximalizace, serializace v2 a kompatibilní načtení starých dat.
