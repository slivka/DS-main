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
    hlavičce stránky načíst Work Sans (řezy 400–700) a JetBrains Mono (500–700),
    protože náhledová obálka knihovny se do připojených projektů nekopíruje.
11. **Exporty a tisk používají firemní ikony.** Pro Excel vždy použij dodanou
    ikonu Microsoft Excel a pro PDF nebo tiskovou sestavu dodanou ikonu Adobe
    Acrobat Reader ze sdílených assetů design systému; nenahrazuj je obecnými ikonami.
12. **Zaoblení rohů je pevné a jednotné.** Používej výhradně tokenovou škálu
    `rounded-sm` / `rounded-md` / `rounded-lg` (4 / 6 / 6 px; větší plochy nejvýše
    8 px). Poloměr nikdy neodvozuj z `em`, `rem`, velikosti písma, výšky prvku ani
    zoomu. Běžná tlačítka, výběry a pole používají `rounded-md` (6 px).

## Čísla a data

- Tisíce odděluj mezerou – v editech, gridech, tiscích i exportech.
- Částky na 2 desetinná místa, zarovnané vpravo, záporné červeně
  (`AmountCell`, `AmountInput`, `formatAmount`).
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
- Texty komponent se předávají přes props; výchozí hodnoty jsou české
  (aplikace běží česky i slovensky).

## Gridy, exporty, tisk

- Název gridu, lišta, hlavička a součtový řádek tvoří jeden spojený blok.
- Filtr datumového sloupce s `exportType: "date" | "datetime"` nabízí vedle
  jednotlivých dat také rychlé volby podle roku, čtvrtletí a měsíce.
- Sloupce se stavovými odznaky, datumem, číslem dokladu, variabilním symbolem
  a krátkými účty MD/DAL mají vždy nejmenší šířku podle obsahu a nezalamují se.
- Export do Excelu vždy jako tabulka Excelu se součty a roztaženými sloupci
  (výjimka: extra dlouhé texty se zalamují).
- Tiskové sestavy a PDF: nadpis tmavě modrý; u vícestránkových sestav opakuj
  v hlavičce jen důležité údaje.

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
- Hlavičku stránky skládej z `PageHeader` (nadpis, popis, akce vpravo,
  spodní linka), ne vlastním nadpisem na stránce.
- Částkové sloupce přes `debitCreditColumns`: výchozí popisky jsou „MD částka“ /
  „DAL částka“ a součet kontroluje rozdíl obou stran.
- Účetní období přes `FiscalPeriodSelect` (Otevřené / V uzávěrce / Uzavřené).
- Kontext firmy a období v horní liště skládej přes `CompanySwitcher` a
  `PeriodSwitcher`; pracovní prostor přepínej přímo v `UserMenu`.


## Doklady, číselníky a navigace

- Číselníky (partneři, zakázky, knihy) se editují v `RecordDialog`; doklady vždy
  v celostránkovém `DocumentForm` (hlavička, `JournalLinesEditor`, stav a akce).
- Řádky účetního zápisu vždy `JournalLinesEditor`: MD/DAL účet přes `AccountSelect`,
  částka přes `DecimalInput`, zakázka přes `DimensionSelect`, partner přes
  `PartnerSelect`, variabilní symbol přes `VsField`. Rozdíl proti částce dokladu
  se hlídá průběžně; režim jen pro čtení se předává propem `readOnly`.
- Částka v cizí měně vždy `CurrencyAmount` (částka 2 desetinná místa, kurz 6).
- Stromová data (účtová osnova, zakázky) zobrazuj přes `TreeGrid` – součty za uzel,
  hledání zachová cestu k nalezeným uzlům, export do Excelu nese úrovně osnovy.
- Boční navigaci skládej z `AppShell` s `navGroups`; nedostupné položky označ
  `disabled` (štítek „Připravujeme“), viditelnost položek řeší aplikace.
- `AppShell` 2.0 používá horní lištu přes celou šířku a sloty `contextLeft`,
  `actions`, `panelButtons` a `userMenu`. Boční menu začíná až pod lištou a lze je
  sbalit na pruh ikon.
- Nastavení firmy, administraci a další režimy skládej přes `panels`; otevřený
  panel nahradí hlavní navigaci a zavírá se tlačítkem nebo klávesou Esc.
- AppShell přijímá navigaci výhradně přes `navGroups`; administrační a jiné režimy
  výhradně přes `panels`, `activePanel` a `onActivePanelChange`. Staré aliasy ani
  plochý seznam navigace nejsou součástí veřejného API.
- `FontSizeSetting` a `ThemeSetting` patří na stránku Předvolby, ne do horní lišty.
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
- Řádek obrazovky je předkontace MD účet / DAL účet / částka; do `journal_lines` se ukládá přes `toDbLines` jako dva řádky se společným `pairNo`. Načítání vždy používá `fromDbLines`.
- U zaúčtovaných dokladů se upravitelnost řídí přes `editableColumns`; `readOnly` je pouze zpětně kompatibilní zkratka pro žádný upravitelný sloupec.
- Psaní znaku přepíše aktivní buňku, F2 a dvojklik upravují původní hodnotu, Enter/Tab uloží a pokračují, Esc vrátí původní hodnotu.
- Účet se hledá číselným prefixem; neaktivní a `postable: false` účty jsou viditelné, ale nevolitelné.
- Nový řádek přebírá text, VS, partnera a zakázku z předchozího řádku, jinak z `defaults`; kladný zbytek do `expectedTotal` předvyplní částku.
- Komponenta vždy kontroluje MD účet, DAL účet a nenulovou částku. Další účetní pravidla dodává aplikace přes `validate`.
- Zapnutí `showCurrency` přidá Měnu, Částku v měně a Kurz; Kč částka se přepočítá na dvě desetinná místa, ale zůstává ručně upravitelná.
- Každá produkční instance má stabilní `storageKey`, aby se zachovaly šířky sloupců, zoom a hustota.
