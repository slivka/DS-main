# DS 2.20.0 – kontextový řádek gridu a hlavičky bez podtitulků

## Výsledek
- `PageHeader` a formulářové hlavičky přestanou zobrazovat doplňkový text; starý prop zůstane dočasně přijatelný a v režimu vývoje upozorní na přesun kontextu.
- Nad akcemi `DataGrid` a `TreeGrid` vznikne volitelný `GridContextBar`: vlevo účetní období, vpravo kniha.
- Při volbě „Všechny knihy“ grid automaticky přidá povinný první sloupec Kniha, aniž by zasáhl do uloženého nastavení ostatních sloupců.
- Verze knihovny bude 2.20.0; Release se nevytvoří.

## Implementace
1. **Hlavičky bez podtitulků**
   - Označit `PageHeader.description` jako zastaralý, přestat jej vykreslovat a přidat požadované vývojové upozornění.
   - Zachovat kompatibilní `description` u `DocumentForm` a `RecordDialog`, ale nevykreslovat jej viditelně; v dialogu použít pouze skrytý přístupnostní popis.
   - Odebrat `description` ze všech ukázkových použití `PageHeader`.
   - Doplnit závazné pravidlo do pokynů design systému.

2. **Období gridu**
   - Přidat čisté výpočty `gridPeriodRange`, `gridPeriodLabel`, `filterByGridPeriod` a hook `useGridPeriod` pro kalendářní i nekalendářní účetní období.
   - Přidat `GridPeriodFilter` s volbami celé období, měsíc, čtvrtletí, pololetí, od začátku období do dneška a vlastní rozsah.
   - Měsíce, čtvrtletí a pololetí počítat od `fiscalFrom`; rychlé volby zobrazit jen tehdy, když celé spadají do účetního období.
   - Posun vlevo/vpravo bude dostupný pouze pro měsíc, čtvrtletí a pololetí, s vypnutím na hranicích; zúžený rozsah bude oranžový a půjde zrušit křížkem.
   - Vlastní rozsah omezit hranicemi účetního období a zobrazovat jako `dd.MM.rrrr`.

3. **Kniha a kontextový řádek**
   - Přidat `GridBookSelect` s vyhledáváním: jedna kniha jako tučný text s kódem v nápovědě, více knih jako kompaktní výběr; „Všechny knihy“ zůstane neutrální.
   - Přidat samostatně exportovaný `GridContextBar`, jeho konfigurace `period` a `book` a zapojení nad `GridToolbar` v obou gridech.
   - Zarovnat knihu na pravý okraj nad hlavní akcí a zachovat spojený rámeček celého gridu.
   - Přidat popis zvoleného období do údajů Excel/PDF exportu.

4. **Automatický sloupec Kniha**
   - Při `book.value === 'all'` vytvořit interní sloupec s názvem knihy podle `getRowBookId`.
   - Držet jej vždy první, viditelný, nepřesunutelný a bez ruční změny šířky; současně zachovat řazení, filtr, seskupení a export.
   - Nepropouštět interní sloupec do uložené viditelnosti, pořadí, šířek ani pojmenovaných pohledů ostatních sloupců.
   - Při výběru konkrétní knihy sloupec odstranit bez změny uložených preferencí.

5. **Ukázky a dokumentace**
   - Ukázat grid Doklady se třemi knihami, samostatný stav jedné knihy a TreeGrid s účetním obdobím 1. 7. 2026–30. 6. 2027.
   - Aktualizovat veřejné exporty, katalog komponent, dokumentaci komponent, systémová pravidla, changelog a roadmapu včetně přechodu z `PageHeader.description` a `toolbarLeft`.
   - Doplnit metadata nových veřejných komponent a pomocných funkcí v katalogu.

6. **Ověření**
   - Unit testy výpočtů období: kalendářní i nekalendářní rok, YTD, hranice a posun.
   - Test automatického sloupce Kniha: vždy první, povinný a mimo uložené preference.
   - Spustit typovou kontrolu a automatické testy; zkontrolovat sestavení náhledu a vizuálně ověřit desktop i úzké zobrazení.

## Kompatibilita
- `period` a `book` budou volitelné; bez nich se grid chová jako dosud.
- `description` zůstane v typech, ale nebude se zobrazovat. Jde o záměrnou změnu vzhledu, nikoli odstranění veřejného API.
- Stávající `toolbarLeft`, `asOf`, záložky, panely, hledání a uložená nastavení gridů zůstanou funkční.
