# Roadmap

## Verze 2.23.0 (stabilní horní kontext a jednořádkový grid)
- [x] Sjednotit šířku firmy s obdobím a vložit skutečný oddělovač v horní liště
- [x] Zarovnat knihu a období vlevo a upravit adaptivní šířku období
- [x] Přesunout panel filtrů pod řádek akcí a sjednotit přirozené šířky jeho prvků
- [x] Udržet řádek akcí v jednom řádku dynamickým přesunem nástrojů do nabídky
- [x] Sjednotit výšku a písmo kontextových ovládacích prvků a popisků
- [x] Zjemnit vzhled GridSegmentedToggle při zachování oranžového aktivního filtru
- [x] Zvětšit záložky stránek a formulářů podle vizuální hierarchie
- [ ] Aktualizovat ukázky, changelog, dokumentaci, testy a provést vizuální kontrolu

## Verze 2.22.0 (vyvážený kontext firmy a období)
- [x] Odstranit skupinu Poslední, její veřejné props a související dělení seznamu firem
- [x] Zavřít nabídku firmy a období po výběru i po založení nové položky přes řízený stav
- [x] Sjednotit geometrii firmy a období, zachovat stavové barvy pouze na období
- [x] Doplnit světlou, tmavou, kompaktní a otevřenou ukázku všech pěti stavů
- [x] Aktualizovat changelog, pravidla, katalog, testy, typovou kontrolu a sestavení

## Verze 2.21.2 (skupiny pravé části lišty gridu)
- [x] Seskupit pravé ovládání DataGridu a TreeGridu v pořadí Najít, Zobrazení, Data a Obnovit
- [x] Zobrazovat oddělovače pouze mezi neprázdnými skupinami
- [x] Oddělit exporty ve Stáhnout od importů a vedlejších akcí v nabídce ⋯
- [x] Zachovat jedinou úzkou nabídku a shodné pořadí jejích skupin
- [x] Aktualizovat ukázky, pravidla, testy, typovou kontrolu a lint

## Verze 2.21.1 (opravy lišty a stínu gridu)
- [x] Sjednotit jednu nabídku ⋯ pro široký a úzký DataGrid i TreeGrid
- [x] Ponechat Stav k datu a hlavní parametry dostupné pod 640 px
- [x] Přesunout další akce před hustotu a zoom na široké ploše
- [x] Řídit stín sloupce akcí zbývajícím přetečením vpravo a přepočítat jej při změně velikosti a zoomu
- [x] Doplnit testy, typovou kontrolu a lint

## Verze 2.21.0 (nové pořadí lišty a akce ve stromu)
- [x] Přesunout Nový vlevo a Obnovit úplně vpravo v DataGridu i TreeGridu
- [x] Přesunout méně důležité nástroje do nabídky ⋯ pod šířkou 640 px
- [x] Doplnit důvody zakázání a stín sticky sloupce akcí DataGridu
- [x] Přidat shodný sloupec akcí, potvrzení a dvojklik do TreeGridu
- [x] Doplnit ukázky, pravidla, veřejný katalog a ověření

## Verze 2.20.3 (popisky a oddělený kontextový řádek)
- [x] Doplnit přístupně svázané popisky Kniha a Období s přeložitelnými texty
- [x] Vizuálně oddělit kontextový řádek tokenovým podkladem, linkou a nižší výškou
- [x] Sjednotit kontext, akce a tabulku do jednoho bloku s jedním okrajem a stínem
- [x] Stabilizovat šířku výběru knihy a období podle nejdelšího popisku
- [x] Přidat pravou část kontextového řádku a přístupný směrový přepínač
- [x] Doplnit ukázky, testy, pravidla a veřejný katalog

## Verze 2.20.2 (kniha vlevo a jednohodnotové výběry)
- [x] Přesunout knihu před období a vložit mezi ně hustotně řízený oddělovač
- [x] Zobrazovat jedinou nebo needitovatelnou knihu jen jako text
- [x] Rozšířit formulářový BookSelect o textové zobrazení jediné aktivní knihy
- [x] Doplnit ukázky, testy, pravidla a veřejný katalog

## Verze 2.20.1 (zoom a hustota kontextového řádku gridu)
- [x] Škálovat `GridContextBar` stejným zoomem a hustotou jako `GridToolbar`
- [x] Převést ovládací prvky období a knihy na společné rozměry v `em`
- [x] Ověřit DataGrid i TreeGrid při 60 %, 100 %, 140 % a kompaktní hustotě

## Verze 2.20.0 (kontextový řádek gridu a hlavičky bez podtitulků)
- [x] Přidat `GridContextBar`, `GridPeriodFilter`, `GridBookSelect` a veřejné nástroje období
- [x] Zapojit volitelné `period` a `book` do DataGridu a TreeGridu
- [x] Při „Všechny knihy“ držet povinný první sloupec Kniha mimo uložená nastavení
- [x] Přestat zobrazovat `PageHeader.description` a viditelné popisy formulářových dialogů
- [x] Doplnit ukázky, testy, changelog, pravidla a katalog veřejného API

## Verze 2.19.0 (bloky sekcí v levém menu)
- [x] Rozšířit `NavGroup` o volitelné `section` a zachovat stávající skupiny beze změny
- [x] Zobrazit bloky v rozbaleném, sbaleném, mobilním i panelovém menu
- [x] Skrýt prázdné bloky při hledání bez zahrnutí názvu sekce do hledání
- [x] Doplnit ukázku, testy, changelog a katalog veřejného API

## Verze 2.18.1 (společný zoom tabulky a stromu)
- [x] Sdílet zoom a hustotu mezi tabulkovým a stromovým zobrazením přes `viewZoomKey`
- [x] Použít pro přepnutí do tabulky jednoznačnou ikonu tabulky

## Verze 2.17.1 (veřejné pomocné nástroje)
- [x] Zpřístupnit nastavení gridů, výpočty období, validaci formulářů a opakování síťových požadavků
- [x] Ponechat interní zachytávání chyb a nouzovou serverovou stránku mimo veřejný vstup
- [x] Zachovat metadata místní knihovny bez externích verzí a samostatné bezpečné zapojení hlavičky dokumentu

## Verze 2.16.0 (nahrazeno změnou záložek ve 2.17.0)
- [x] Stav pinned / openerTabId, převod staršího v2, jedna dočasná záložka na panel
- [x] preview, openRecord a–f, keep/release, historie jako ponechaná záložka, zásobník zavřených, limit s přednostní dočasnou
- [x] Maximalizace s pruhem, Alt+M, Esc, Alt+Shift+T, bliknutí panelu
- [x] usePaneChrome a ovládání v PageHeader; PaneTabBar jen se záložkami, tabBarMode
- [x] Trvalé koncepty (IndexedDB), DraftRestoredBanner
- [x] serializeLayout / applyLayout, LayoutMenu (Alt+L)
- [x] Ukázka, changelog, components.md, katalog, testy, typová kontrola, sestavení

## Verze 2.15.0 (skupiny a hledání v menu, výraznější kontext)
- [x] Oddělené skupiny menu s vodicí linkou, uloženým sbalením, odznaky a aktivní tečkou
- [x] Hledání bez diakritiky, klávesové ovládání, zkratka / a překryv sbaleného menu
- [x] Jednořádková firma a stavový štítek období v horní liště
- [x] Ukázky, dokumentace, typová kontrola, sestavení a ověření v prohlížeči

## Verze 2.13.0 (bílý vzhled, tmavě modré menu, IBM Plex)
- [x] Bílé plochy, neutrální šedé hover/záhlaví/součty, nové linky a okraje
- [x] Tmavě modré levé menu s kontrastem ≥ 4,5 : 1
- [x] IBM Plex Sans / IBM Plex Mono místo Work Sans / JetBrains Mono

## Verze 2.12.0 (záložky v panelech)
- [x] Stav v2 se záložkami, převod z v1, serializace pro DB a URL
- [x] PaneTabsProvider / usePaneTabs, limit 10 záložek, jeden záznam jen jednou
- [x] PaneTabBar s „»“, historií, menu ⋯, kontextovým menu a přetahováním
- [x] useTabDraft, useTabDirty (náhrada usePaneDirty), dialog Uložit / Zahodit / Otevřít v nové záložce / Zrušit
- [x] Zkratky Alt+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T; PaneLink v navigaci AppShellu
- [x] Ukázka Režim více oken, testy pravidel, dokumentace

## Verze 2.11.0 (čitelnost, plochy a typografie)
- [x] Jemně modré pozadí stránky, bílé navigační plochy a výraznější oddělení karet a gridů
- [x] Oranžový stav aktivního hledání, filtrů, počtu filtrů a štítků
- [x] Primární levý pruh vybraného řádku a upravené stavové barvy
- [x] Work Sans pro nadpisy, popisky, záhlaví, součty a částky; JetBrains Mono jen pro kódy
- [x] Typografický znak minus u záporných částek a aktualizovaná typografická ukázka
- [x] Ověření světlého a tmavého režimu, zoomů gridu, tisku/PDF a Excel exportu

## Import design systému z GitHubu (slivka/slivka-design-system)
- [x] Stáhnout a prozkoumat repozitář
- [x] Přenést tokeny (src/styles.css), komponenty (src/components/ds, src/components/ui)
- [x] Přenést hooky (src/hooks) a pomocné funkce (src/lib) dle seznamu
- [x] Přenést ukázkové stránky ze src/routes jako showcase (vč. /components/feedback)
- [x] Nainstalovat závislosti, udržet vzhled a chování beze změny
- [x] Vytvořit .lovable/ konfiguraci (meta.yaml, system.md, sources.yaml) a lovable.toml
- [x] Ověřit build a showcase (doplněn Tailwind plugin do konfigurace překladu; přehled, mřížka, formuláře i zpětná vazba vykresleny bez chyb)

## Verze 1.1.0 (Accounting APP)
- [x] DocumentStatusBadge: stavy draft/filed/posted/locked/cancelled + příznak Schválen
- [x] Nová komponenta PageHeader (layout) + export v ds/index.ts
- [x] Ukázky v showcase (Přehled: Hlavička stránky, Stavy a štítky)
- [x] Aktualizace .lovable/system.md (účetní konvence, PageHeader)
- [x] Verze knihovny 1.1.0

## Verze 1.2.0 (čeština a přepisovatelné texty)
- [x] Opravit slovenské viditelné texty a locale ve všech komponentách design systému
- [x] Přidat společné přepisovatelné texty DataGridu a souvisejících grid komponent
- [x] Přidat české přepisovatelné texty AddressFields / AddressFieldGrid a ostatních formulářů
- [x] Aktualizovat pravidla knihovny a verzi na 1.2.0
- [x] Ověřit typovou kontrolu, sestavení a showcase

## Verze 1.2.1 (zapojení knihovny)
- [x] Zachovat styly při výběrovém načítání komponent
- [x] Zpřístupnit motiv a nastavení data a času přes veřejný vstup
- [x] Přesně připnout ověřené základní závislosti
- [x] Doplnit pravidlo pro načtení firemních písem v připojených aplikacích
- [x] Ověřit typovou kontrolu, sestavení a showcase


## Verze 1.3.0 (standard exportu do Excelu)
- [x] Vytvořit veřejné funkce buildExcelWorkbook a downloadWorkbook
- [x] Převést GridExport vždy na skutečnou Excel tabulku se vzorci a metadaty sloupců
- [x] Doplnit hlavičku sestavy, tisk, vlastnosti souboru, šířky a Navy Trust styl
- [x] Přidat showcase Export do Excelu s účetními daty a kontrolním seznamem
- [x] Aktualizovat pravidla knihovny a verzi na 1.3.0
- [x] Ověřit typovou kontrolu, sestavení, showcase a obsah staženého XLSX

## Verze 1.3.1 (stálé zaoblení při zoomu)
- [x] Zachovat stejné zaoblení tlačítek a výběrů při změně velikosti písma
- [x] Ověřit výběr účetního období ve všech podporovaných měřítkách

## Verze 1.3.2 (zarovnání odznaků v gridu)
- [x] Zarovnat všechny systémové odznaky v datových sloupcích vždy vlevo
- [x] Ověřit typovou kontrolu, sestavení a showcase gridu
- [x] Zajistit spolehlivé stažení platného vzorového XLSX napříč prohlížeči

## Verze 1.3.3 (datumové filtry v gridu)
- [x] Doplnit do datumových sloupců volby podle roku, čtvrtletí a měsíce
- [x] Zachovat výběr jednotlivých dat a kombinování více voleb
- [x] Ověřit typovou kontrolu, sestavení a účetní showcase

## Verze 1.3.4 (kompaktní systémové sloupce)
- [x] Stavové odznaky, datumy, čísla dokladů, VS a účty MD/Dal držet na nejmenší šířce podle obsahu
- [x] Zachovat jednořádkové hodnoty, filtry, řazení a zarovnání
- [x] Ověřit typovou kontrolu, sestavení a skutečné šířky v účetním showcase

## Verze 1.3.5 (automatické testy vzorového Excelu)
- [x] Ověřit stažení vzorového exportu v Chromium, Firefoxu a WebKitu
- [x] Kontrolovat skutečnou Excel tabulku, součtové vzorce, formáty a chybové hodnoty
- [x] Otevírat stažený soubor v LibreOffice a odmítnout hlášení o opravě či poškození
- [x] Ověřit celou testovací sadu, typovou kontrolu a sestavení

## Verze 1.4.1 (šířka součtů v Excel exportu)
- [x] Zahrnout zobrazené automatické součty do výpočtu šířky sloupců
- [x] Formátovat hodnoty vlastních součtových řádků stejně jako běžné buňky
- [x] Předávat z DataGridu metadata, hledání a aktivní sloupcové filtry
- [x] Ověřit vzor se součtem širším než jednotlivé hodnoty a typovou kontrolu

## Verze 1.5.0 (standard sloupců účtů MD / DAL)
- [x] Přidat veřejný helper accountColumns se skrytými MD/DAL a viditelnými názvy účtů
- [x] Používat formátované textové hodnoty účtů ve filtrech, hledání, seskupení a exportu
- [x] Doplnit oddělenou hodnotu pro číselné řazení sloupců
- [x] Zapojit standard do ukázek Datová mřížka a Export do Excelu
- [x] Ověřit typovou kontrolu, sestavení, showcase a text účtu ve staženém XLSX

## Verze 1.5.1 (názvy částkových sloupců)
- [x] Přejmenovat výchozí částkové sloupce na MD částka a DAL částka
- [x] Ověřit typovou kontrolu, sestavení a ukázku datové mřížky

## Verze 1.5.1 (kompatibilita exportu s Microsoft Excelem)
- [x] Opravit osnovu řádků, názvy tabulky a sloupců a strukturu vlastních součtů
- [x] Ukládat datum bez časového posunu a zachovat místní čas u data s časem
- [x] Zpřísnit stažení souboru a odstranit falešnou osnovu ze vzorového exportu
- [x] Ověřit rozbalenou strukturu XLSX, typovou kontrolu, stažení a sestavení

## Verze 1.5.1 (veřejné zapojení knihovny)
- [x] Zpřístupnit základní ovládací prvky a formátovací nástroje z hlavního vstupu
- [x] Zpřístupnit odkazy na firemní písma a použít je v ukázce
- [x] Vyčistit metadata místní knihovny bez neplatných údajů externího balíčku
- [x] Ověřit typovou kontrolu a sestavení

## Verze 1.5.2 (sjednocení lišty gridu a veřejných stavebních prvků)
- [x] Zachovat stejné pevné zaoblení výběru období a tlačítek při každém přiblížení
- [x] Zpřístupnit odznaky, karty, tabulky, dialogy, oddělovače a záložky z hlavního vstupu
- [x] Ověřit typovou kontrolu a sestavení

## Verze 1.7.0 (Excel, navigace aplikace a účetní formuláře)
- [x] Opravit rozsah filtru tabulky v exportu (filtr končí posledním datovým řádkem)
- [x] Doplnit strukturální kontrolu filtru, rozsahu tabulky a řádku souhrnů do testů
- [x] Boční menu se sbalovacími skupinami, štítky a položkami Připravujeme
- [x] Administrace jako samostatný režim překrývající boční menu
- [x] Přidat PermissionGate, ReadOnlyBanner a ComingSoon
- [x] Přidat TreeGrid pro stromová data se součty za uzel a exportem s úrovněmi
- [x] Přidat PartnerSelect, DimensionSelect, BookSelect, VsField a CurrencyAmount
- [x] Přidat JournalLinesEditor s ovládáním klávesnicí a kontrolou rozdílu
- [x] Přidat DocumentForm pro celostránkovou editaci dokladů
- [x] Nové ukázkové stránky Účetní formuláře a Navigace
- [x] Zvýšit verzi na 1.7.0, doplnit pravidla a ověřit typovou kontrolu a testy

## Verze 1.7.1 (oprava otevírání exportu v Microsoft Excelu)
- [x] Oprava: Excel export se otevíral s opravným dialogem (pořadí prvků sheetPr)
- [x] Post-processing přesunut do testovatelné funkce finalizeWorkbookBuffer
- [x] Ověřit přeskládání prvků, typovou kontrolu a testy stažení

## Verze 1.7.2 (sjednocený vzhled a struktura Excel exportů)
- [x] Použít jednoduchou tabulku s šedým záhlavím bez střídání barev řádků
- [x] Automaticky zalamovat záhlaví a svisle vystředit všechny buňky
- [x] Přesunout parametry exportu na samostatný druhý list
- [x] Odstranit vlastní kontrolní součet ze vzorového exportu
- [x] Zachovat seskupení gridu a stromu v osnově Excelu
- [x] Ověřit typovou kontrolu, stažení, obsah sešitu a sestavení

## Verze 1.7.3 (automatické šířky Excel exportů)
- [x] Minimalizovat šířky sloupců podle záhlaví, zobrazených hodnot a součtů
- [x] Texty delší než 100 znaků zobrazit ve sloupci širokém přibližně 100 znaků a zalamovat
- [x] Doplnit dlouhý text do vzorového exportu a automaticky ověřit šířku i zalamování
- [x] Ověřit typovou kontrolu, stažení, otevření sešitu a sestavení

## Verze 1.7.4 (jednotné pevné zaoblení)
- [x] Sjednotit poloměry rohů na pevnou tokenovou škálu 4 / 6 / 8 px
- [x] Odstranit zaoblení odvozené od písma, výšky prvku a zoomu
- [x] Sjednotit ovládací prvky lišty gridu na mírnější zaoblení 6 px
- [x] Ověřit stejné rohy při různých úrovních zoomu, typovou kontrolu a sestavení

## Verze 2.0.0 (AppShell 2.0)
- [x] Horní lišta přes celou šířku a sbalitelné boční menu pod ní
- [x] Řízené panely přes jednotné rozhraní AppShellu
- [x] ContextPill, CompanySwitcher, PeriodSwitcher, UserMenu, SearchButton a ThemeSetting
- [x] Řízený CommandPalette a samostatné předvolby písma a motivu
- [x] Ukázka navigace se dvěma panely, přepínači, uživatelem a tmavým motivem
- [x] Changelog, pravidla knihovny, typová kontrola a sestavení

## Verze 2.1.0 (editovatelný grid řádků zápisu)
- [x] Odstranit z AppShellu staré props, aliasy a plochý seznam navigace
- [x] Přidat převody předkontací na databázové řádky a zpět včetně osiřelých starších dat
- [x] Přepracovat JournalLinesEditor na in-place grid se zoomem, hustotou a uloženými šířkami
- [x] Doplnit řízenou editovatelnost, měnové sloupce, výchozí hodnoty a validaci buněk
- [x] Doplnit klávesové ovládání, duplikaci, odebrání s vrácením a součtový řádek
- [x] Přidat čtyři ukázky a automatické testy klávesnice i převodů
- [x] Doplnit pravidla a changelog, zvýšit verzi a ověřit typy i sestavení

## Verze 2.2.0 (horní lišta AppShell)
- [x] Odstranit výchozí blok značky a zachovat ho volitelně přes showBrand
- [x] Seřadit pravé ovladače horní lišty
- [x] Přidat sdílený ThemeToggleButton
- [x] Přidat prezentační NotificationBell včetně všech stavů
- [x] Zachovat a označit zastaralé vlastnosti AppShellu
- [x] Doplnit exporty, ukázky, dokumentaci a ověření

## Verze 2.5.0 (režim více oken)

- [x] `PaneLayout`, `PaneHeader`, `LayoutSwitcher`, historie panelu a `openInPane`
- [x] Neuložené změny (`usePaneDirty`, `confirmAllPanesClean`), `uniqueKey`, automatické skrytí panelů
- [x] Container queries v gridu, hlavičce stránky, dialogu a formulářích dokladu
- [x] Zkratky jen v aktivním panelu, tisk jen aktivního panelu, serializace stavu
- [x] Ukázka na stránce Navigace (3 panely, šířky 1100/1440/1920, měřítko 100/125 %)

## Verze 2.4.0 (řádky zápisu 1:1 s databází)

- `toJournalRow` / `fromJournalRow`, deprecated `toDbLines` / `fromDbLines` / `pairNo`
- `sideFields`, `sharedSide`, `mainAccount`, `isNonTaxAllowed`, řádek zaokrouhlení
- Ukázky: interní doklad (split), pokladní doklad (hlavní účet 211 na MD), zaúčtovaný doklad

## Verze 2.3.1 (oprava kompaktní hodnoty období)
- [x] Zobrazovat v kompaktním režimu kód období místo identifikátoru
- [x] Ověřit kompaktní hodnoty firmy a ContextPill (nikdy identifikátor)
- [x] Rozšířit min. šířku kódu období na mobilu na 72 px
- [x] Zvýšit verzi a ověřit typy i sestavení

## Verze 2.3.0 (adaptivní lišta a období)
- [x] Doplnit do PeriodSwitcher stav bez výběru, bez období a volitelné založení
- [x] Přepnout kontextové volby do kompaktního režimu pod 1 280 px a mobilního režimu pod 768 px
- [x] Automaticky sbalit boční menu pod 1 280 px a přidat zkratku Ctrl+B
- [x] Zajistit jednořádkovou lištu bez vodorovného posuvníku
- [x] Doplnit náhled šířek a prázdných stavů na stránku Navigace
- [x] Zvýšit verzi, doplnit changelog a ověřit typy i sestavení

## Verze 2.6.0 (JournalLinesEditor – dva režimy podle hlavního účtu)
- [x] sideFields="split" jako výchozí, mainAccount.side používá 'MD' | 'D'
- [x] Hlavní strana jen ke čtení (šedá), protiúčet bez účtů stejné kategorie
- [x] Povinná stranová pole podle category / account_type (sideFieldRules) s uvedením strany
- [x] Rozbalitelný detail řádku (Alt+↓) a kompaktní štítky chybějících polí
- [x] Nedaňový jako značka u částky (Ctrl+N) místo samostatného sloupce
- [x] Řádek haléřového vyrovnání jen ke čtení s nápovědou, „Zbývá rozepsat" a „Dorovnat zaokrouhlením"
- [x] editableFields místo editableColumns/readOnly, totalAmount / totalMode / roundingLimit
- [x] Ukázky: interní doklad, faktura přijatá s hlavním účtem 321 (D), banka v EUR

## Verze 2.8.0 (výkazy účetnictví)
- [x] TreeGrid: úrovně rozbalení, zvýraznění uzlu, výběr sloupců, zoom, akce vpravo od zoomu
- [x] TreeGrid export: souhrn pod dětmi + SUBTOTAL, otevření bez chyby
- [x] AccountSelect: allowLevels + catalog (prefix třídy / skupiny)
- [x] BarBreakdownChart, FilterChips
- [x] Ukázky, testy (19 zelených), typová kontrola, changelog

## Verze 2.8.1 (horní lišta a veřejné nástroje)
- [x] Vystředit firmu a období, při kolizi je přesunout vlevo
- [x] Odebrat ikonu z výběru firmy
- [x] Zpřístupnit sdílené nástroje a hooky přes hlavní vstup knihovny
- [x] Zachovat metadata místní knihovny bez údajů externího balíčku

## Verze 2.7.1 (úklid API řádků zápisu)
- [x] Odstranit toDbLines / fromDbLines / pairNo
- [x] JournalLinesEditor: mode, mainSide, mainAccount, sideFieldRules; DocumentForm je předává přímo
- [x] Testy, typová kontrola, sestavení, changelog, design-system.json

## Verze 2.7.0 (DocumentForm pro skutečné doklady + PaymentScheduleEditor)
- [x] DocumentForm: nová hlavička, pole jen ke čtení, fields / documentFieldsForType, editableFields, hlavní účet, režim částky, linesEditorProps, tabs
- [x] PaymentScheduleEditor + generatePaymentSchedule s unit testy
- [x] Ukázky: FP s kalendářem, zaúčtovaná FP, pokladna výdej, interní doklad
- [x] Verze 2.7.0, changelog s přechodem, design-system.json

## Verze 2.6.1 (decentní stav menu a pořadí akcí gridu)
- [x] Nahradit dlouhý štítek „Připravujeme“ v menu kompaktním stavovým symbolem s nápovědou
- [x] Umístit hlavní akci „Nový“ bezprostředně vpravo od ovládání zoomu gridu
- [x] Doplnit ukázky, zvýšit patch verzi a ověřit typy, sestavení a náhled

## Verze 2.10.0 (panely, připnuté stránky a lišty gridů)
- [x] PaneLayout doplňuje prázdné panely při přepnutí na 2/3 a zachovává je v serializaci
- [x] PaneEmpty, připnutí v PaneHeaderu a nová PinnedBar
- [x] AppShell subHeader skrytý v Nastavení/Administraci
- [x] DataGrid a TreeGrid: GridSelectionToggle, onRefresh a refreshing
- [x] Ukázky, veřejné exporty, changelog, testy a typová kontrola

## Verze 2.9.0 (token světlého podkladu)
- [x] Nový token --surface-page (utility bg-surface-page), --background z něj odvozen
- [x] Sdílená konstanta PAGE_SURFACE_LIGHT pro samostatné HTML výstupy (chybová stránka, HTML náhled exportu gridu)
- [x] Odstraněny pevné hodnoty #FAFAFA z kódu

## Verze 2.10.1 (nadpisy gridů pouze na vyžádání)
- [x] DataGrid a TreeGrid standardně skrývají nadpis
- [x] Nový prop showTitle pro výslovné zobrazení nadpisu

## Verze 2.17.0 (jednotný řádek akcí gridu)
- [x] GridToolbar, GridToolbarSeparator, AsOfDateToggle a GridToggleButton
- [x] Jednotné pořadí a zalamování akcí v DataGrid a TreeGrid
- [x] Stromové rozbalení ikonami a nabídkou pojmenovaných / automatických úrovní
- [x] Filtry a chipy pod lištou, oranžové seskupení a ikonový GridExport
- [x] addAction, moreActions, vlastní PDF a další exporty
- [x] Společný wheel zoom DataGrid, TreeGrid a ZoomPane; loading v TreeGrid
- [x] PageHeader bez spodní linky; ukázky, dokumentace, katalog a ověření
- [x] Rovnocenné záložky bez pinned/preview/keep/release a kompatibilní načtení starého stavu
- [x] Vždy viditelná PaneTabBar, replace historie, openRecord čistý/dirty detail a limit 10
- [x] PageHeader v panelu: ↑↓, ←→, maximalizace, menuActions a ⋯
- [x] LayoutMenu jako ⋯ vedle hledání přes AppShell.navSearchMenu
