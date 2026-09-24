# DS 2.16.0 – dočasné a ponechané záložky, maximalizace, koncepty, rozložení

## Cíl
Rozšířit záložky v panelech z verze 2.12.0. Menu s hledáním, firma a období z 2.15.0 i tokeny zůstanou beze změny.

## Úpravy
1. **Stav záložek**
   - Každá záložka dostane `pinned` a `openerTabId`. Starší stav v2 se převede na `pinned = true`, `openerTabId = null`.
   - V jednom panelu může být nejvýš jedna dočasná záložka.
   - Maximalizace je jen za běhu a neukládá se.
   - Zásobník posledních 10 zavřených záložek (bez konceptů).
   - Pravidla pro `preview`, `openRecord` (a–f), keep/release, zavření s návratem na opener, limit 10 (dočasné se zavírají přednostně) a maximalizaci řeší čisté funkce, aby šly testovat.

2. **usePaneTabs**
   - `openTab` s cílem `preview`.
   - Nové funkce `openRecord`, `keepTab`, `releaseTab`, `openFromHistory`, `reopenClosedTab`, `maximizePane`, `restoreLayout`, `registerRecordNav`.
   - Automatický keep: při prvních neuložených změnách, po přesunu záložky a při otevření kroku historie.
   - Když se záznam otevře v jiném panelu, cílový panel krátce blikne (0,7 s; bez animace při prefers-reduced-motion).

3. **Koncepty**
   - Úložiště přes vyměnitelný adaptér: výchozí je paměť, volitelně IndexedDB (`idb-keyval`, připnutá verze).
   - Funkce `persistDrafts`, `listOrphanDrafts`, `clearDrafts`.
   - Ukládání s debounce 1 s, mazání po uložení, zahození nebo zavření; staré koncepty se smažou při startu.
   - Nová komponenta `DraftRestoredBanner` ve dvou variantách (obnoveno / záznam byl mezitím změněn).

4. **usePaneChrome a PageHeader**
   - Kontext panelu pro záhlaví stránky.
   - PageHeader uvnitř panelu vykreslí:
     - šipky ← → a seznam historie (podržení 400 ms nebo pravé tlačítko) s ⧉;
     - ● při neuložených změnách a špendlík;
     - listování záznamy ↑ n / N ↓;
     - maximalizaci a menu ⋯;
     - nadpis jako úchyt pro přetažení, dvojklik na nadpis = ponechat.
   - Mimo panel zůstane PageHeader beze změny.

5. **PaneTabBar**
   - Z lišty se odstraní ← → a ⋯.
   - Dočasná záložka má titulek kurzívou; dvojklik ji ponechá, prostřední tlačítko ji zavře.
   - Nový prop `tabBarMode` ('auto' | 'always'). Lišta se v režimu auto skrývá a při přetahování je vidět vždy.
   - Animace výšky 150 ms; dvojklik na prázdné místo lišty maximalizuje / obnoví.

6. **PaneLayout**
   - Při maximalizaci zobrazí jen maximalizovaný panel a pruh „Panel N je maximalizovaný · Obnovit rozložení“.
   - Nové zkratky: Alt+M, Esc (s ohledem na dialogy a editory), Alt+Shift+T, Alt+1/2/3 při maximalizaci.

7. **Uložená rozložení**
   - `serializeLayout` a `applyLayout` (vrací seznam přeskočených záložek).
   - Komponenta `LayoutMenu` s uložením, přepsáním a správou; data dodá aplikace přes props. Zkratka Alt+L.

8. **Ukázka, dokumentace, vydání**
   - Ukázka „Více oken“ se všemi scénáři z bodu 10.
   - Changelog 2.16.0 s popisem změn chování, components.md, `.lovable/system.md`, katalog, veřejné exporty, roadmapa, verze 2.16.0.
   - Ověření: unit testy nových pravidel stavu, typová kontrola, sestavení a průchod ukázkou v prohlížeči.

## Technické poznámky
- Změny chování (popíšu je v changelogu):
  - `openTab` bez cíle se dál chová jako `replace`;
  - `newTab` a `adjacentPane` zakládají ponechané záložky;
  - z PaneTabBar zmizí ← → a ⋯ (přesun do PageHeader);
  - lišta záložek se v režimu 'auto' skrývá.
- Stav gridu v uloženém rozložení se bere z konceptu záložky pod klíčem "grid", pokud ho stránka ukládá.
- Rozsah je velký. Pokud se některý dílčí bod nepodaří plně ověřit, uvedu ho na konci výslovně.
