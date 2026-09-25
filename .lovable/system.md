# Slivka Design System – pravidla pro AI agenty

## Filozofie

Slivka Design System je sdílený základ firemních aplikací Slivka. Vizuální identita
„Navy Trust": tmavě modrá jako hlavní barva, klidné neutrální pozadí, profesionální
a důvěryhodný dojem. Systém běží výhradně na ukázkových datech v paměti – žádné
napojení na databázi ani produkční data. Czech UI texty, české formáty dat a částek.

## Pevná pravidla

1. **Skladuj výhradně z design systému.** Nové obrazovky skládej jen z komponent
   exportovaných z `@/components/ds` (jediný veřejný vstup). Shadcn primitiva
   (`@/components/ui/*`) používej jen uvnitř ds komponent, ne přímo na stránkách.
   Pokud komponenta chybí, doplň ji do design systému, ne do stránky.
2. **Tokeny, ne surové hodnoty.** Barvy, rozestupy, poloměry, stíny a typografii
   vždy ber ze `src/styles.css` (CSS proměnné a Tailwind utility na nich). Nikdy
   nezapisuj surové hex hodnoty ani ad-hoc pixel rozestupy do komponent.
3. **Tisíce vždy odděluj** – v komponentách, v gridech, v tiskových sestavách
   a ve všech exportech (Excel, PDF a další). Používej formátovací funkce z
   `@/lib/format` a `@/lib/date-time-preferences`, nikdy vlastní formátování.
4. **Akční tlačítka v editačních dialozích jsou jen textová, bez ikon.**
   Akční tlačítka v řádku gridu jsou naopak ikonová.
5. **Sdílené komponenty důsledně** – nová funkcionalita se skládá ze stávajících
   ds komponent, aby se vše chovalo kompaktně. Nevytvorej paralelní varianty.
6. **Exporty do Excelu** ve formě tabulky včetně součtu v tabulce; všechny sloupce
   roztažené tak, aby byl vidět obsah (výjimka: extra dlouhé texty se zalamují).
   Používej `GridExport` / `grid-export` komponentu.
7. **Tiskové a PDF sestavy**: nadpis vždy tmavě modrý; u vícestránkových sestav
   opakuj v záhlaví jen důležité údaje.
8. **Nic nepřepisuj ani nezjednodušuj.** Vzhled a chování importovaných komponent
   zůstávají beze změny; rozšiřuj, nepřepisuj.
9. **Žádné pevné uživatelské texty v komponentách.** Všechny popisky, nápovědy,
   zástupné texty, prázdné stavy a přístupnostní názvy předávej přes props;
   výchozí hodnoty jsou vždy české. Grid používá `DEFAULT_GRID_TEXTS` a prop
   `texts`, aby aplikace mohla dodat slovenské nebo jiné překlady.
10. **Načti firemní písma v dokumentu aplikace.** Hostitelská aplikace musí v
    hlavičce stránky načíst IBM Plex Sans (řezy 400–700) a IBM Plex Mono (400–500),
    protože náhledová obálka knihovny se do připojených projektů nekopíruje.
11. **Exporty a tisk používají firemní ikony.** Pro Excel vždy použij dodanou
    ikonu Microsoft Excel a pro PDF nebo tiskovou sestavu dodanou ikonu Adobe
    Acrobat Reader ze sdílených assetů design systému; nenahrazuj je obecnými ikonami.
12. **Zaoblení rohů je pevné a jednotné.** Používej výhradně tokenovou škálu
    `rounded-sm` / `rounded-md` / `rounded-lg` (4 / 6 / 6 px; větší plochy nejvýše
    8 px). Poloměr nikdy neodvozuj z `em`, `rem`, velikosti písma, výšky prvku ani
    zoomu. Běžná tlačítka, výběry a pole používají `rounded-md` (6 px).
13. **Sekční nadpisy jsou verzálkami.** Nadpisy sekcí formulářů, dialogů, karet
    a panelů vždy skládej přes `SectionHeading`. Nadpisy stránek v `PageHeader`
    a záhlaví gridů zůstávají bez verzálek.
14. **Směr peněžního pohybu má vlastní významové tóny.** Jemná zelená a červená
    plocha je povolená pro Příjem a Výdej. Plná červená zůstává vyhrazená pro
    chyby, Odstranit a záporné částky.

## Čísla a data

- Tisíce odděluj mezerou – v editech, gridech, tiscích i exportech.
- Částky na 2 desetinná místa, zarovnané vpravo, záporné červeně
  (`AmountCell`, `AmountInput`, `formatAmount`).
- Částky používají IBM Plex Sans s tabulkovými číslicemi; IBM Plex Mono je pouze
  pro kódy a identifikátory (účty, čísla dokladů, VS, IČO/DIČ).
- Datum vždy ve formátu `dd.MM.rrrr`.
- Číselné vstupy vždy `DecimalInput` / `AmountInput`, nikdy holý `input`.
- Formátování ber z `@/lib/format` a `@/lib/date-time-preferences`.

## Tlačítka a dialogy

- Editační dialog: akční tlačítka jen text, bez ikon. Řádek gridu: ikonová tlačítka.
- „Odstranit“ je červené a stojí vlevo v patičce dialogu, ostatní tlačítka vpravo.
- Edit vyvolaný z gridu se po Zrušit / Odstranit / Uložit vrací zpět na grid,
  odkud byl vyvolán.
- Potvrzení vždy přes `ConfirmDialog`, nikdy `window.confirm`.
- Výběry vždy `OptionSelect` / `EntitySelect` / `AccountSelect`, nikdy nativní
  `select`.
- Výběr s jedinou možností se nezobrazuje jako zakázaný select, ale jako text hodnoty.
- Texty komponent se předávají přes props; výchozí hodnoty jsou české
  (aplikace běží česky i slovensky).

## Gridy, exporty, tisk

- Nadpis gridu je ve výchozím stavu skrytý; zobrazuj ho pouze na výslovné
  vyžádání přes `showTitle`. Lišta, hlavička a součtový řádek tvoří jeden spojený blok.
- Filtr datumového sloupce s `exportType: "date" | "datetime"` nabízí vedle
  jednotlivých dat také rychlé volby podle roku, čtvrtletí a měsíce.
- Sloupce se stavovými odznaky, datumem, číslem dokladu, variabilním symbolem
  a krátkými účty MD/DAL mají vždy nejmenší šířku podle obsahu a nezalamují se.
- Export do Excelu vždy jako tabulka Excelu se součty a roztaženými sloupci
  (výjimka: extra dlouhé texty se zalamují).
- Tiskové sestavy a PDF: nadpis tmavě modrý; u vícestránkových sestav opakuj
  v hlavičce jen důležité údaje.

### Řádek akcí gridu

- `DataGrid`, `TreeGrid` a vlastní obsah v `ZoomPane` používají jediný `GridToolbar`.
- Pořadí vlevo: `addAction`, oddělovač, Tabulka/Strom, Rozbalit/Sbalit, oddělovač, Stav k datu, `toolbarLeft`. Vpravo nad 640 px jsou skupiny: Najít = Hledat, Filtr │ Zobrazení = Seskupit (jen DataGrid s `groupable`), Sloupce, Hustota + zoom │ Data = Vybrat více, `actions`, Stáhnout, `moreActions` │ Obnovit. Oddělovače vykresluj jen mezi neprázdnými skupinami, nikdy na kraji ani dvakrát vedle sebe.
- Stáhnout (`GridExport`) obsahuje výhradně Excel, PDF a `extraExports`; importy a vedlejší akce patří do `moreActions` nabídky ⋯.
- Pod šířkou gridu 640 px zůstává vlevo Přidat jen jako ikona, Tabulka/Strom a Rozbalit/Sbalit; vpravo zůstávají Hledat, Filtr a právě jedna nabídka ⋯. Ta řadí nástroje podle skupin Zobrazení, Data a Obnovit; oddělovače skupin se v liště skryjí.
- Upravit a Odstranit jednotlivého záznamu patří jen do sloupce akcí řádku; dvojklik znamená Upravit. Tyto akce nepoužívej v řádku akcí gridu ani v hlavičce stránky. Hromadné akce jsou pouze přes Vybrat více.
- Nepovolená akce řádku, u které má uživatel vědět proč, zůstává zešedlá s tooltipem přes `editDisabledReason` / `deleteDisabledReason`; jinak se nezobrazuje přes `canEditRow` / `canDeleteRow`.
- Oranžová znamená, že ovládání zužuje nebo přeskupuje data: filtr, hledání, seskupení a `GridToggleButton tone="grouping"`. Modrá plná znamená zapnutý režim (`AsOfDateToggle`, `tone="mode"`) nebo primární Přidat.
- Hlavní parametry obrazovky vkládej do `toolbarLeft`; účetní období a knihu však při použití `GridContextBar` předávej výhradně přes `period` a `book`. Pomocné filtry patří do `filters`; vedlejší akce do `moreActions`; akce celé stránky (Importovat, Výkazy…) do `PageHeader.menuActions`.
- „Nový“ nikdy nevkládej do `PageHeader`; použij `addAction`. Export v gridu je vždy jediný ikonový `GridExport` s nabídkou. `ExcelExportButton` je v gridu zakázaný a zůstává jen pro samostatný obsah.
- Ovládání nad gridem mimo tento řádek akcí je zakázané. Lišta zůstává vždy v jednom řádku bez vodorovného posuvníku. Podle skutečně změřené šířky přesouvá méně důležité skupiny Zobrazení a Data do jediné nabídky ⋯; Obnovit zůstává úplně vpravo.

### Kontextový řádek gridu

- `GridContextBar` je součást spojeného bloku gridu a stojí bezprostředně nad `GridToolbar`. Vlevo Kniha: · Období:, vpravo volitelně přepínač (u pokladny a banky Vše / Příjmy / Výdaje). Přepínač mimo výchozí hodnotu je oranžový. Jedna dostupná kniha = jen tučný název, nikdy zakázaný výběr.
- Knihu vždy uvozuje popisek „Kniha:“ a období popisek „Období:“; texty lze změnit přes `texts`. Popisky jsou přístupnostně svázané s hodnotou nebo výběrem. Kontextový řádek má podklad záhlaví gridu, spodní linku a menší výšku než bílý řádek akcí.
- Kontext, akce, hlavička, řádky a součet tvoří jeden blok s jediným vnějším okrajem a stínem. Mezi `PageHeader` a tímto blokem používej jednotnou mezeru `mt-3`; nadpis stránky zůstává bez linky.
- Používej jej na seznamech dokladů a účetních výkazech, kde uživatel mění rozsah účetního období nebo knihu. Samostatně jej lze použít nad obsahem v `ZoomPane`.
- „Celé období“ je neutrální. Měsíc, čtvrtletí, pololetí, období od začátku roku a vlastní rozsah jsou oranžové, protože zužují data.
- Období respektuje `fiscalFrom` a `fiscalTo`, i když účetní rok nezačíná v lednu. Stav může aplikace zachovat přes `useTabDraft`.
- Kontextový řádek se škáluje se zoomem a hustotou gridu stejně jako řádek akcí.
- Popisky Kniha, Období a popisek pravého kontextu mají jediný styl. Výběry i segmentový přepínač mají stejnou výšku a písmo jako prvky řádku akcí.
- Panel pomocných filtrů stojí bezprostředně pod řádkem akcí. Ovládací prvky mají přirozenou šířku podle obsahu, popisek vlevo a zalamují se až při nedostatku místa.
- Záložky sekcí stránky a formuláře používají 15–16px střední řez; aktivní záložka je tučná a podtržená primární barvou.

## Export do Excelu

- Pro grid i vlastní sestavy používej veřejné funkce `buildExcelWorkbook` a
  `downloadWorkbook`; React komponenta `GridExport` pouze předává data a volby.
- Data musí být vždy skutečná tabulka Excelu (`sheet.addTable`), nikdy obyčejná
  oblast buněk. Víceřádkové záhlaví sluč do názvů „Sekce – Sloupec“ a zajisti
  jejich jedinečnost. Seskupení zapisuj jako úrovně osnovy řádků tabulky.
- Součtový řádek tabulky používá `sum` nebo `count`; součty musí zůstat vzorci
  založenými na `SUBTOTAL`, aby reagovaly na filtry. Vlastní součtové řádky pod
  tabulkou používají `SUBTOTAL(109, Tabulka[Sloupec])`, pokud sčítají sloupec.
- Výchozí číslo má formát `#,##0.00;[Red]-#,##0.00`, zaokrouhlení na dvě
  desetinná místa a nikdy zápornou nulu. Celá čísla, roky a procenta jsou
  výjimky pouze přes `columnMeta` / `DataGridColumn.exportType`; formát nikdy
  neodhaduj z názvu sloupce a nepřidávej pevnou měnu.
- Zarovnání dat i záhlaví vychází z `align` a číselného typu sloupce. Datum a
  text jsou vlevo, čísla vpravo, na střed jen explicitně označené sloupce.
- Šířku každého sloupce minimalizuj podle skutečně zobrazených hodnot, záhlaví
  a součtů stejně jako automatické přizpůsobení šířky v Excelu; minimum je 8
  znaků a záhlaví počítá i s místem pro filtr. U více než 2 000 řádků měř
  reprezentativní vzorek. Obsahuje-li textová buňka více než 100 znaků, nastav
  sloupec přibližně na šířku 100 znaků a zalamuj tyto dlouhé buňky.
- Na prvním listu je pouze tmavě modrý název a datová tabulka. Parametry exportu
  (firma, období, datum a čas, uživatel, aktivní filtry) vypiš přehledně na
  samostatný druhý list „Parametry exportu“, nikdy do hlavičky datového listu.
- Záhlaví sloupců je vždy šedé a má zapnuté automatické zalamování. Všechny buňky
  jsou svisle vystředěné. Tabulka nepoužívá střídání barev řádků.
- Pokud je grid seskupený podle sloupců nebo má stromovou strukturu, zachovej
  stejné skupiny v Excelu pomocí úrovní osnovy; neseskupená data osnovu nemají.
- Vlastní kontrolní součet pod tabulkou nevytvářej. Standardní součtový řádek
  tabulky zůstává řízený metadaty sloupců a používá vzorce `SUBTOTAL`.
- Tisk nastav na A4, přizpůsobení na jednu stránku na šířku, vhodnou orientaci,
  okraje 1 cm a zápatí s názvem sestavy a „Strana &P z &N“.
- Vyplň vlastnosti sešitu title, creator, company a created. Název souboru je
  `{exportName}_{rrrr-MM-dd}.xlsx`, název listu bezpečně odvoď z nadpisu.
- Tabulka používá jednoduché šedé záhlaví, tmavý text, bez pruhovaných řádků;
  standardní součtový řádek je zvýrazněný.

## Účetní konvence

- Číslo účtu se ukládá jako `221001`, zobrazuje se jako `221.001` (`AccountCode`);
  analytika má proměnnou délku.
- Každý grid se zaúčtováním používá `accountColumns()`: viditelné jsou sloupce
  „MD účet“ / „DAL účet“ ve tvaru `321.100 - Závazky`, krátké „MD“ / „DAL“ jsou
  výchozí skryté. Čísla účtů se zobrazují, filtrují a exportují vždy s tečkou
  jako text; řazení používá číselný kód účtu.
- Stav dokladu vždy přes `DocumentStatusBadge`. Stavy: `draft` = Koncept
  (přerušovaný rámeček, doklad se nikde nepočítá), `filed` = Zařazen (má číslo,
  počítá se, není zaúčtován, informační tón), `posted` = Zaúčtován (success),
  `locked` = Uzamčen (tmavší neutrální tón s ikonou zámku), `cancelled` =
  Stornován (danger).
- Příznak `approved` na `DocumentStatusBadge` zobrazí vedle stavu malý odznak
  „Schválen“ (success, fajfka). Je nezávislý na stavu dokladu.
- Hlavičku stránky skládej z `PageHeader` (nadpis a akce vpravo), ne vlastním nadpisem na stránce. Pod nadpisem stránky ani formuláře není doplňkový text.
- Částkové sloupce přes `debitCreditColumns`: výchozí popisky jsou „MD částka“ /
  „DAL částka“ a součet kontroluje rozdíl obou stran.
- Účetní období přes `FiscalPeriodSelect` (Otevřené / V uzávěrce / Uzavřené).
- Kontext firmy a období v horní liště skládej přes `CompanySwitcher` a
  `PeriodSwitcher`; pracovní prostor přepínej přímo v `UserMenu`. `PeriodSwitcher`
  musí rozlišit stav bez výběru a firmu bez období; popisek a hodnota nesmí být
  stejný text. Firma používá neutrální obrys bez stavové barvy; barvu nese pouze
  období. Výběr firmy má jediný seznam bez skupiny posledních položek. Oba výběry
  zavírej přes řízené `open` / `onOpenChange`, ne změnou React `key` podle cesty.


## Doklady, číselníky a navigace

- Číselníky (partneři, zakázky, knihy) se editují v `RecordDialog`; doklady vždy
  v celostránkovém `DocumentForm` (hlavička, `JournalLinesEditor`, stav a akce).
- `DocumentForm.identity` nahrazuje viditelný nadpis identifikačním řádkem a
  `directionBadge` zobrazuje Příjem/Výdej vlevo v pruhu akcí. Kurz cizí měny
  zadávej přes `RateField`; ruční kurz vždy vyžaduje důvod.
- Řádky účetního zápisu vždy `JournalLinesEditor`: MD/DAL účet přes `AccountSelect`,
  částka přes `DecimalInput`, zakázka přes `DimensionSelect`, partner přes
  `PartnerSelect`, variabilní symbol přes `VsField`. Rozdíl proti částce dokladu
  se hlídá průběžně; režim jen pro čtení se předává propem `readOnly`.
- Částka v cizí měně vždy `CurrencyAmount` (částka 2 desetinná místa, kurz 6).
- Výkazy: úrovně rozbalení přes `TreeGrid.expandLevels`, výběr třídy / skupiny přes `AccountSelect allowLevels + catalog`, rozbor po skupinách přes `BarBreakdownChart`, aktivní filtry přes `FilterChips`. Export stromu má souhrn pod dětmi se vzorci SUBTOTAL.
- Stromová data (účtová osnova, zakázky) zobrazuj přes `TreeGrid` – součty za uzel,
  hledání zachová cestu k nalezeným uzlům, export do Excelu nese úrovně osnovy.
- Boční navigaci skládej z `AppShell` s `navGroups`; nedostupné položky označ
  `disabled` (štítek „Připravujeme“), viditelnost položek řeší aplikace.
- Související po sobě jdoucí skupiny menu spoj do bloku stejnou hodnotou
  `NavGroup.section`; sekce je pouze neklikací nadpis, sbalují se dál jednotlivé skupiny.
- `AppShell` používá horní lištu přes celou šířku. Standardně nezačíná blokem
  značky: `CompanySwitcher` ve slotu `contextLeft` je úplně vlevo. Blok `logo`
  a `appName` zapínej jen explicitně přes `showBrand`.
- Pravá část lišty má pořadí `actions`, tlačítka `panels`, `notificationBell`,
  `themeToggleButton`, `userMenu`; jednotlivé skupiny odděluj Separatorem.
- Pod 1 280 px se kontextové přepínače zobrazují kompaktně a boční menu se bez
  předchozí volby uživatele automaticky sbalí. Pod 768 px zůstává menu v Sheetu.
  Horní lišta se nikdy nezalamuje ani nevytváří vodorovný posuvník.
- Sbalení menu ovládá tlačítko na jeho spodním okraji nebo zkratka Ctrl+B;
  respektuj řízené vlastnosti `collapsed` a `onCollapsedChange`.
- Oznámení vkládej přes prezentační `NotificationBell`; data a všechny akce
  dodává aplikace. Rychlé přepnutí motivu dělej přes `ThemeToggleButton`, který
  sdílí uloženou volbu s `ThemeSetting`.
- Nastavení firmy, administraci a další režimy skládej přes `panels`; otevřený
  panel nahradí hlavní navigaci a zavírá se tlačítkem nebo klávesou Esc.
- Pro nový kód používá AppShell navigaci přes `navGroups`; administrační a jiné
  režimy přes `panels`, `activePanel` a `onActivePanelChange`. Staré aliasy a
  plochý seznam jsou pouze dočasná zpětná kompatibilita a jsou deprecated.
- `FontSizeSetting` a `ThemeSetting` patří na stránku Předvolby, ne do horní lišty.
- AppShell ve výchozím stavu nabízí hledání v menu; zkratka `/` je vyhrazena pro něj. Sbalení skupin ukládej přes `navStateKey`, aby se aplikace a její panely navzájem neovlivňovaly.
- Nedostupné akce obaluj `PermissionGate`, důvod zamčení formuláře ukazuj
  `ReadOnlyBanner`, prázdný stav chystaného modulu `ComingSoon`.

## Struktura

- `src/components/ds/` – design systém, jediný veřejný vstup `ds/index.ts`
  (layout, grid, form, feedback, data-display, accounting)
- `src/components/ui/` – shadcn primitiva
- `src/hooks/`, `src/lib/` – hooky a pomocné funkce (format, period, font-scale,
  theme, grid-prefs, date-time-preferences, legal-forms, regions, postal-code,
  person-name, form-errors, utils)
- `src/routes/` – ukázkové stránky (showcase), jen náhled, není součástí knihovny
- `src/styles.css` – barvy, typografie, rozestupy, tisk, tmavý režim

## Přístupnost a konvence

- Semantické elementy (`button`, `a`, `label` připojený k inputu), viditelný focus.
- Variace komponent přes pojmenované props (`variant`, `size`), ne booleovské
  styling props ani duplicitní komponenty.
- Přijímej a slučuj `className`, přeposílej ref a zbývající props elementu.

## Řádky účetního zápisu

- `JournalLinesEditor` je specializovaný in-place grid. Obecný `DataGrid` se pro editaci řádků zápisu nemění.
- Řádek obrazovky je předkontace MD účet / DAL účet / částka a odpovídá právě jednomu řádku v `journal_lines`. Ukládání vždy přes `toJournalRow`, načítání přes `fromJournalRow` (camelCase v komponentě, snake_case v databázi).
- Převod řádků jen přes `toJournalRow` / `fromJournalRow` (1:1 s databází). JournalLinesEditor: `mode` ('internal' | 'mainAccount'), `mainSide` ('MD' | 'D'), `mainAccount` (číslo účtu), `sideFieldRules` (vlastní pravidla stranových polí). DocumentForm tyto props předává editoru přímo.
- Dva režimy jedné komponenty: bez `mainAccount` jde o interní doklad (MD i DAL účet na řádku, `sideFields="split"` je výchozí); s `mainAccount` je hlavní strana jen ke čtení a zadává se pouze protiúčet.
- `sideFields="split"` (výchozí) má oddělené sloupce MD/DAL, ve výběru sloupců výchozí skryté, pokud nemají hodnotu. `sideFields="shared"` má jeden sloupec VS / Partner / Zakázka a zapisuje jej podle `sharedSide` ("debit" | "credit" | "both", výchozí "both").
- `mainAccount={{ accountId, side }}` používá `side: 'MD' | 'D'` (shodně s `documents.main_account_side`). Hlavní strana (účet, VS, partner, zakázka) je jen pro čtení a šedá; `AccountSelect` protiúčtu nenabídne účty se stejnou `category` jako hlavní účet.
- Povinnost stranových polí určuje `sideFieldRules(account, { dimensionRequired })` podle `account.category` a `account.accountType`: VS u `pohledavky` / `zavazky` / `poskytnute_zalohy` / `prijate_zalohy` / `saldokonto`, zakázka u `bilance` při `dimensionRequired`, partner se nabízí u saldokontních účtů. Validace je jen nápověda s uvedením strany, rozhoduje databáze.
- Stranová pole jsou i v rozbalitelném detailu řádku (Alt+↓); chybějící povinné pole se v řádku ukazuje jako kompaktní štítek.
- Nedaňový (`non_tax`) nemá vlastní sloupec – je to přepínací značka u částky (jen u nákladových / výnosových účtů, zkratka Ctrl+N) a zaškrtávátko v detailu řádku; výjimky určuje `isNonTaxAllowed(line)`.
- Řádek haléřového vyrovnání (`isRounding`) je vždy poslední, šedý, jen pro čtení a bez akcí, s nápovědou „Zaokrouhlení měňte v hlavičce dokladu". U dokladu s hlavním účtem a `totalMode="entered"` se proti `totalAmount` ukazuje „Zbývá rozepsat" a při rozdílu do `roundingLimit` tlačítko „Dorovnat zaokrouhlením" (`onRoundingFill`).
- U zaúčtovaných dokladů se upravitelnost řídí přes `editableFields` (typicky text, VS, partneři, zakázky, Nedaňový); uzamčený doklad předá prázdné pole. Ukládají se jen změněné klíče.
- Psaní znaku přepíše aktivní buňku, F2 a dvojklik upravují původní hodnotu, Enter/Tab uloží a pokračují, Esc vrátí původní hodnotu.
- Účet se hledá číselným prefixem; neaktivní a `postable: false` účty jsou viditelné, ale nevolitelné.
- Nový řádek přebírá text, VS, partnera a zakázku z předchozího řádku, jinak z `defaults`; kladný zbytek do `totalAmount` předvyplní částku.
- Komponenta vždy kontroluje MD účet, DAL účet a nenulovou částku. Další účetní pravidla dodává aplikace přes `validate`.
- Zapnutí `showCurrency` přidá Měnu, Částku v měně a Kurz; Kč částka se přepočítá na dvě desetinná místa, ale zůstává ručně upravitelná.
- Každá produkční instance má stabilní `storageKey`, aby se zachovaly šířky sloupců, zoom a hustota.

## Režim více oken (panely)

- Aplikace může obsah `AppShell` vykreslit přes `PaneLayout` (1 / 2 / 3 panely). Přepínač `LayoutSwitcher` patří do horní lišty vedle `SearchButton`.
- Editace dokladu je vždy stránka v panelu, nikdy modál. Firma a období jsou společné pro všechny panely.
- Každý panel má záložky. Otevírání z menu nebo gridu přes `usePaneTabs().openTab(route, params, { target: 'replace' | 'newTab' | 'adjacentPane', kind, recordKey })`; odkazy přes `PaneLink` (Cmd/Ctrl + klik = nová záložka, + Shift = sousední panel, prostřední tlačítko = nová záložka). Konkrétní záznam vždy `kind: 'record'` – otevře se jen jednou.
- Neuložené změny hlas přes `useTabDirty(isDirty)`. Záložky na pozadí se odpojují – stav formuláře a gridu drž přes `useTabDraft(tabId, initial, key)`, nikdy jen v `useState`.
- Minimální šířka panelu je 560 px při měřítku písma 100 %. Nedostupná rozložení nech zašedlá s vysvětlením.
- Komponenty uvnitř panelu se přizpůsobují šířce panelu přes container queries (`@min-[…]`), nikdy přes breakpointy okna. Horní lišta a boční menu se řídí šířkou okna.
- Klávesové zkratky mřížek a editorů platí jen v aktivním panelu. Globální zůstávají Ctrl+K a Ctrl+B; panely a záložky ovládá Alt(Option)+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T (kontrola přes `event.code`). Cmd/Ctrl+W ani Ctrl+1–9 nepřepisuj.
- Stav panelů serializuj přes `serializePaneTabs` / `parsePaneTabs` (databáze) a `serializeActiveTabUrl` (URL).
- Lišta záložek je v každém panelu vždy viditelná, i s jedinou nebo žádnou záložkou. Všechny záložky jsou rovnocenné; nepoužívej dočasné/ponechané záložky ani špendlík v záhlaví.
- Běžný klik v menu používá `openTab(..., { target: 'replace' })`: aktivní záložku nahradí jako nový krok historie. Cmd/Ctrl+klik používá `newTab`, Cmd/Ctrl+Shift+klik `adjacentPane`.
- Záznamy ze seznamu vždy otevírej přes `openRecord(route, params, { fromTabId: usePane().tabId, isNew, modifiers: event })`. Čistý detail ze stejného seznamu se nahradí; při neuložených změnách se otevře další záložka; nový záznam vždy další záložka.
- Stránka v panelu vždy začíná `PageHeader`: vlevo má jen nadpis a dirty tečku, vpravo jen ↑/↓, ←/→, maximalizaci a ⋯. Akce celé stránky dávej do `menuActions`; `actions` je jen pro stránky mimo panel. „Nový“ patří do `DataGrid.addAction`.
- `LayoutMenu trigger="icon"` patří přes `AppShell.navSearchMenu` vedle hledání v menu, nikdy do horní lišty.
- Rozepsané formuláře: `useTabDraft(tabId, initial, key, { route, params, recordVersion: updated_at })`, po uložení `meta.markSaved()`, nad formulářem `DraftRestoredBanner`. `persistDrafts({ userKey, companyId })` volej po přihlášení / změně firmy.
- Zkratky navíc: Alt+M, Esc (jen při maximalizaci), Alt+Shift+T, Alt+L (LayoutMenu).


## Doklady a platební kalendář (2.7.0)
- Doklad vždy `DocumentForm`; typ předávejte přes `documentType`, který sám zvolí pole a účetní popisky. `fields` použijte jen pro výjimku. Číslo, kurz, kniha po založení a směr jsou jen pro čtení.
- Hlavička `DocumentForm` má základní a platební údaje vlevo a vlastnosti, kurz a částku vpravo. Zamčený hlavní účet je text se stranou MD/DAL, nikoli zakázaný výběr; ID a UZ mají režim součtu řádků vždy zamčený.
- Stav Zaúčtován řiďte přes `editableFields` (hlavička) a `linesEditorProps.editableFields` (řádky); `readOnly` jen pro uzamčené doklady.
- Další obsah dokladu (Platební kalendář, Historie) přidávejte přes `tabs`; Řádky jsou vždy první.
- Platební kalendář vždy `PaymentScheduleEditor`; rozložení přes `generatePaymentSchedule`. Ukládá se celé pole jedním voláním.
