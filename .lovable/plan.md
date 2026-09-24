# Záložky v panelech – DS 2.12.0 (minor, s breaking changes)

## Cíl
Každý panel v režimu více oken bude místo jedné stránky obsahovat seznam záložek. Vzhled a tokeny z verze 2.11.0 se nemění.

## Úpravy
1. **Stav v2** – nový formát `{ version: 2, layout, widths, active, panes: [{ id, activeTab, tabs: [{ id, route, params, kind, recordKey, title, shortTitle, icon, history, historyIndex, lastUsed }] }], hiddenPanes }`.
   - `migratePaneStateV1` (každý panel v1 = jedna záložka), `serializePaneTabs` / `parsePaneTabs` (plná verze pro DB), `serializeActiveTabUrl` (jen aktivní záložka aktivního panelu).
   - Čisté funkce (reducer) pro otevření, zavření, přesun, aktivaci, rozložení a historii – kvůli testům.
2. **usePaneTabs** – `openTab(route, params, { target: 'replace'|'newTab'|'adjacentPane', kind, recordKey, title })`, `closeTab`, `moveTab`, `activateTab`, `setLayout`, `closePane`, `back`/`forward`, `duplicateTab`, `closeOtherTabs`.
   - Záznam (`kind: 'record'`) jen jednou – druhé otevření aktivuje existující záložku i v jiném panelu.
   - Limit 10 záložek na panel: zavře nejdéle nepoužitou čistou záložku s upozorněním; když jsou všechny rozepsané, otevření odmítne.
   - Nahrazení rozepsané záložky → dialog Uložit / Zahodit / Otevřít v nové záložce / Zrušit (přes `ConfirmDialog`, rozšířený o další tlačítka, pokud chybí).
   - Zvýšení počtu panelů přidá prázdný aktivní panel; snížení/zavření přesune záložky doleva (u prvního doprava) bez dotazu.
   - Automatické zúžení podle šířky uloží rozdělení do `hiddenPanes` a po zvětšení ho obnoví (jen existující záložky) s upozorněním.
3. **Koncepty a neuložené změny**
   - `useTabDraft(tabId, initial)` – úložiště mimo komponentu (stav formuláře, posuv, stav gridu); přežije odpojení i přesun; smaže se po zavření záložky. Záložky na pozadí se neudržují připojené.
   - `useTabDirty(isDirty)` nahrazuje `usePaneDirty` (odstraněno): potvrzení při zavření, nahrazení a zavření okna prohlížeče; přesun se neptá.
   - `useTabScrollRestore` pro pozici posuvu; DataGrid/TreeGrid dostanou volitelný `stateKey` napojený na koncept záložky.
4. **PaneTabBar** – ikona, zkrácený titulek (120–200 px, celý v tooltipu), ✕ nebo ● při změnách; nabídka „»“ pro nevejdoucí se (aktivní vždy viditelná); vpravo ← → a menu ⋯ (Maximalizovat panel, Zavřít ostatní záložky, Zavřít panel). Kontextové menu: Zavřít, Zavřít ostatní, Přesunout do panelu N, Duplikovat (jen seznamy). Přetahování přes dnd-kit: pořadí, do lišty jiného panelu, na plochu jiného panelu. Prázdný panel: „Otevřete položku z menu“.
5. **PaneLayout** přepsán na záložky (hlavička panelu = PaneTabBar, samostatný křížek panelu zrušen).
6. **Zkratky** – Alt(Option)+1/2/3 panel, Alt+←/→ záložka, Alt+W zavřít záložku, Alt+Shift+W zavřít panel, Alt+T otevře vyhledávání do nové záložky. Kontrola přes `event.code`. Ctrl+1/2/3 a Ctrl+Shift+W zrušeny.
7. **PaneLink** + `getOpenTarget(event)` – Cmd/Ctrl+klik a prostřední tlačítko → nová záložka, Cmd/Ctrl+Shift+klik → sousední panel; `preventDefault` i pro `auxclick`. Použito v navigaci AppShellu.
8. **Ukázka Navigace / Více oken** – 3 panely s několika záložkami, rozepsaný formulář přesunutelný bez ztráty dat, tlačítko pro test limitu a „»“.
9. **Vydání** – verze 2.12.0, changelog s návodem na přechod, roadmapa, `components.md`, `.lovable/system.md`, katalog komponent, veřejné exporty; testy reduceru a e2e ukázky, typová kontrola, sestavení, ověření v prohlížeči.

## Technické poznámky
- Instalace `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (připnuté verze).
- `PinnedBar.onOpen(id, { newPane })` zůstává; v ukázce `newPane` = nová záložka.
- Breaking: `usePaneDirty` → `useTabDirty`, `PaneState`/`PaneLayoutState` v1 → v2 (převod přes `migratePaneStateV1`), `openInPane` → `openTab`, zkratky Ctrl → Alt.
