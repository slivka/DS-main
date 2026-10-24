<!-- Kopie Claude Doc „Tempo – Daňová evidence (zadání)“ https://claude.ai/artifact/8RRAS3Vt5NNcuSYPfYQULj (rev 40, 24. 10. 2026) – zdroj pravdy je Claude Doc; oddíl 11 má přednost. -->

# Tempo – Daňová evidence: zadání pro Lovable

2026-10-24 · Petr Slivka

REŽIM PRO LOVABLE: pouze plánování. Nic nespouštěj ani nemigruj bez schválení. Výstupem je plán DB a UI po etapách, dopady na stávající funkce a otázky. Tento dokument nahrazuje návrh z 28. 9. (`claude/navrh-danova-evidence.md`) a fázi 1 (`claude/zadani-danova-evidence-1.md`) všude, kde se liší.

## 1. Rozhodnutí Petra

Firma s daňovou evidencí (DE) má stejné menu a stejné doklady jako účetní firma. Místo účtů se na řádku vybírá položka příjmů a výdajů. Dnešní stav („připravujeme“ a jen Kniha příjmů a výdajů) je nedodělek fáze 1, ne záměr.

| Téma | Rozhodnutí | Kdy |
|---|---|---|
| Režim | Uložen na firmě (`companies`), ne na období. Přechod mezi režimy se nepodporuje – při změně se zakládá nová firma. | 23. 10. |
| Tabulky | Doklady, řádky, knihy, řady, partneři, DPH, přílohy společné pro oba režimy. | 23. 10. |
| Účty v DE | Uživatel nikde nevidí účet (záhlaví dokladu, knihy, nastavení firmy, DPH, majetek). | 23. 10. |
| Architektura | **Varianta T:** položky DE jsou záznamy skryté osnovy firmy v tabulce `accounts`; technické účty zakládá a skrývá aplikace. Logika řízená druhem účtu (saldo, párování, zálohy, DPH, zaokrouhlení, kurzy) se v DE nepřepisuje. | 24. 10. |
| Zálohy | Přijatá záloha = daňový příjem při přijetí peněz. Poskytnutá = daňový výdaj při zaplacení. Výjimka: záloha na dlouhodobý hmotný majetek (výdajem jsou až odpisy). | 24. 10. |
| Kniha | Uložené zápisy, vznikají z peněz (úhrada, spárování), zápočtu a nepeněžních dokladů. V zamčeném období neměnné. | 24. 10. |
| Položka DE | Navázaná na systémovou daňovou kategorii (`tax_categories`: paragraf, druh, řádek přiznání, paušál) a na ekonomickou kategorii. | 24. 10. |
| Pořadí | Nejdřív neplátce DPH, plátce až v pozdější etapě. | 24. 10. |
| Výdaje procentem | Volba § 7 / § 9 zůstává na období (`expense_mode_s7`, `expense_mode_s9`). | 28. 9. (platí) |
| Kategorie § | V knize § 7, § 8, § 9 i § 10; daňovost řádku trojí: daňový / nedaňový / průběžná položka. | 28. 9. (platí) |
| Kdo | DE jen fyzická osoba (`entity_kind = 'natural'`), období jen kalendářní rok. | 28. 9. (platí) |

## 2. Princip: DE nad skrytou osnovou

DE firma má v `accounts` vlastní osnovu ze šablony DE. Řádky dokladu dál nesou `debit_account_id` / `credit_account_id` (zůstávají povinné); jedna strana je **položka**, druhá **technický účet**. Uživatel vidí jen položku.

Proč (ověřeno v DB 24. 10.):

- Logika dokladů nepoužívá pevná čísla účtů – saldo, párování, zálohy, daňové doklady k zálohám, DPH, zaokrouhlení i kurzy se řídí **druhem účtu** (`accounts.category`) a typem (`account_type`). Pevná čísla nebo třídy používají jen uzávěrka (701, 702, 710, 431), import deníku, výkazy, kontrola účtu zaokrouhlení (třída 5 / 6), struktura osnovy (syntetika = 3 číslice) a `private.book_default_main_account`.
- Varianta „položka na řádku, účty prázdné“ by znamenala upravit přes 50 funkcí, které čtou `debit_account_id`, `credit_account_id` nebo `main_account_id`, pohledy salda (`v_open_item_base`) a povinné `account_number` v `advance_allocations` / `advance_deductions` – a pak každou novou funkci psát dvakrát.
- Ve variantě T DE automaticky dostane i ekonomické kategorie (povolené kategorie u účtu z kroku A2), dimenze (A3), vzory, duplikace a vytěžování (návrh účtu = návrh položky).

Dva druhy záznamů v osnově DE (nový sloupec `accounts.de_role`):

| `de_role` | Co to je | Uživatel | Příklady |
|---|---|---|---|
| `item` | Položka příjmů a výdajů | vidí, vybírá na řádku, spravuje v číselníku | Tržby za služby, Materiál, Nájemné, Pojistné, Vklad podnikatele, Převod pokladna–banka |
| `technical` | Technický účet | nikdy nevidí | Pokladna a Banka (analytika za každou knihu), Pohledávky, Závazky, Poskytnuté a Přijaté zálohy, DPH, Nepeněžní pohyby, Zápočty, Kurzové rozdíly, Uzavření roku (701, 702, 710, 431) |

V účetní firmě je `de_role` vždy NULL. DB vynucuje: v DE firmě jen účty se `de_role`, v účetní firmě žádné. Čísla účtů v DE generuje DB podle šablony (třídy a skupiny z `account_catalog` zůstávají platné); uživatel u položky vidí jen název a volitelný kód.

## 3. Režim na firmě a zrušení fáze 1

Nový sloupec `companies.bookkeeping_method` (`double_entry` / `tax_records`, výchozí `double_entry`), zápis jen RPC, jen vlastník nebo správce.

- `tax_records` jen u `entity_kind = 'natural'`; všechna období firmy musí být kalendářní rok (dnešní guard přenést z období na firmu a na `create_fiscal_period`).
- Změna režimu jen u firmy **bez jediného dokladu, výpisu, dávky importu, počáteční položky a karty majetku**. Změna vymění osnovu ve všech obdobích firmy za šablonu cílového režimu a přenastaví technické účty (oddíl 5). Jinak se zakládá nová firma.
- Volba režimu je i v dialogu Nová firma (dnes tam chybí Osoba i právní forma).
- DE + Import deníku (`accounting_mode = 'import'`) zůstává zakázáno.

**Zrušit z fáze 1 (migrace 20260928042104 a 20260928072425):**

- `fiscal_periods.bookkeeping_method`, CHECK `fiscal_periods_method_consistency` a `fiscal_periods_method_mode` (přepsat na firmu), `set_period_bookkeeping_method`, `fiscal_periods_method_guard` (zůstane jen kontrola kalendářního roku a výdajů procentem).
- Dočasné zákazy: `tax_records_insert_guard` (doklady, výpisy), **`journal_lines_method_guard`** (zákaz řádků v DE – ve variantě T je řádek v DE normální), `private.assert_no_tax_records` v `close_period` / `open_period`, DE větev v `private.import_check` a `private.period_mode_blocks`.
- DE filtr ve `v_open_item_base` (`f.bookkeeping_method = 'double_entry'`) a blokace párování v `private.match_validate`.
- Ponechat: `expense_mode_s7` / `_s9` na období, `set_period_expense_modes`, `tax_categories`, `companies_entity_kind`, právní formy 101–108.
- Funkce, které dnes čtou `tax_records` (17): `private.assert_no_tax_records`, `asset_disposal_calc`, `import_check`, `period_is_tax_records`, `period_mode_blocks`, `public.asset_depreciation_preview`, `asset_postings_run`, `close_period`, `companies_entity_kind`, `create_fiscal_period`, `fiscal_periods_method_guard`, `journal_lines_method_guard`, `open_period`, `set_period_accounting_mode`, `set_period_bookkeeping_method`, `set_period_expense_modes`, `tax_records_insert_guard`. U každé uveď v plánu: zrušit / přepojit na firmu / beze změny.
- APP: `isTaxRecords(period)` → podle firmy, `PeriodModeGate`, „· DE“ ve výběru období, sloupec Metoda v Účetních obdobích, dialog Změnit metodu – nahradit volbou na firmě.

Data: firmy „Ing. Petr Slivka – neplátce“ a „Petr Mukařovský – plátce“ mají období 2026 v DE a 0 dokladů → po migraci `tax_records` na firmě a osnova DE. Ostatní firmy `double_entry`.

## 4. Číselník Položky příjmů a výdajů

V DE nahrazuje Účtový rozvrh: Nastavení firmy → **Položky příjmů a výdajů**. Je to pohled na `accounts` s `de_role = 'item'`, po obdobích stejně jako osnova (nové období převezme položky z předchozího).

| Pole | Uložení | Pravidlo |
|---|---|---|
| Název, Kód | `accounts.name`, nový `accounts.display_code` | kód nepovinný; jedinečná dvojice kód – název ve firmě a období (jako u ekonomických kategorií) |
| Druh | `account_type`: `vynosovy` = Příjem, `nakladovy` = Výdaj, rozvahový typ = Pohyb mimo příjmy a výdaje | měnit jen dokud na položku není v období zápis (jako dnes u účtu) |
| Daňovost | nový `accounts.tax_treatment`: `taxable` / `non_tax` / `transit` | `non_tax_default` se odvodí jen u příjmů a výdajů – trigger accounts_non_tax_default ho u rozvahových typů nedovolí (`tax_treatment <> 'taxable'`); u Pohybu mimo příjmy a výdaje nikdy `taxable` |
| Daňová kategorie | nový `accounts.tax_category_code` → `tax_categories.code` | povinná u `taxable`; druh kategorie (`income` / `expense`) musí odpovídat Druhu; platnost kategorie k datu období |
| Ekonomická kategorie | stávající povolené kategorie u účtu (krok A2) | jako u účtu: na řádku se vybírá, jediná povolená se doplní sama; ve firmě jdou kategorie vypnout |
| Zvláštní význam | `accounts.category` | jen `nerozliseno`, `ekonomicka_kategorie`, `porizeni_majetku`, `porizeni_zasob`; saldové druhy (`pohledavky` …) a `dph` mají jen technické účty |

- **Šablona DE:** systémová, jako `account_template` (přidat sloupec `chart_kind` nebo samostatnou tabulku – navrhni). Obsah navrhne plán, Claude ho ověří. Musí pokrýt: příjmy § 7 (zboží, výrobky, služby, ostatní), § 9 nájem, § 8 a § 10 (`taxable`, svá kategorie); výdaje (zboží, materiál, služby, nájemné, energie, PHM, cestovné, telefon a internet, opravy, pojištění majetku, mzdy a odvody zaměstnanců, odpisy, paušální výdaje na dopravu, drobný majetek, zaokrouhlení); nedaňové (sociální a zdravotní pojištění podnikatele, zálohy na daň z příjmů, soukromá spotřeba, pokuty a penále, pořízení dlouhodobého majetku); průběžné (vklad a výběr podnikatele, přijatý a splacený úvěr, převod mezi pokladnou a bankou).
- **Zrušit ****`company_tax_categories`** (krok A2, 0 řádků): ekonomickou kategorii nese položka přes povolené kategorie, tabulka je zbytečná. Upravit i funkce a texty A2, které ji čtou.
- Technické účty (`de_role = 'technical'`): zakládá je šablona a DB, nejdou upravit ani smazat, nenabízejí se v žádném výběru, nezobrazují se v gridech, historii ani exportech (tam vždy název položky nebo „—“).
- Vzorový číselník ve workspace (jako u ostatních číselníků) až po etapě DE-3 – do té doby jen systémová šablona (Petr 24. 10.). Konkrétní seznam položek šablony navrhne plán DE-1, Claude ověří paragrafy a daňovost, Petr schválí hotový seznam.

## 5. Doklady a nastavení v DE

Menu DE = menu účetní firmy (vydané a přijaté faktury, zálohové listy, daňové doklady k zálohám, pokladna, banka, interní doklady, majetek, partneři, ekonomické kategorie, dimenze) plus **Kniha příjmů a výdajů** a **Přehled podle daňových kategorií**. Skryté: Účetní deník, Předvaha, výkazy z účtů, Účtový rozvrh, Uzávěrka.

| Místo | Účetnictví | DE |
|---|---|---|
| Řádek FV, FP, ZL, PO, BA | sloupce MD a DAL (jedna strana z hlavičky) | jeden sloupec **Položka**** a sloupec Kategorie (jen se zapnutými kategoriemi)**; druhá strana = technický účet z knihy |
| Interní doklad | MD a DAL | **Položka** + druh pohybu: nepeněžní příjem / nepeněžní výdaj (protistrana = technický účet Nepeněžní pohyby), nebo přeřazení mezi dvěma položkami (obě strany položky, v knize zápis mínus u původní a plus u nové položky) |
| Hlavička dokladu | `main_account_id`, `main_account_side` viditelné | vyplní DB z knihy, nezobrazuje se |
| Nastavení knihy | hlavní účet, kurzové účty | nic; DB založí technickou analytiku Pokladny / Banky pro každou knihu a nastaví ji |
| Nastavení firmy | účty zaokrouhlení, kurzových rozdílů, zápočtů | výchozí **položky** (Zaokrouhlení – příjem / výdaj; kurzové rozdíly v DE nejsou, viz oddíl 7) |
| Kódy DPH | účty daně ke každému kódu | technický účet DPH, nastaví DB, obrazovka účtů skrytá |
| Majetek | účetní sady, účty vyřazení a zaokrouhlení odpisů | jen daňová řada odpisů; účty sad technické; viditelné jen položky Odpisy a Zůstatková cena |
| Počáteční položky | číslo účtu | druh položky (pohledávka, závazek, záloha) – `opening_items.item_kind` už existuje |
| Vytěžování | návrh účtu | návrh položky (beze změny logiky) |
| Hromadné zaúčtování, šablony banky | účty | položky |
| Tisk faktury | beze změny | beze změny |

- DS: grid řádků potřebuje režim DE (sloupec Položka místo MD / DAL, bez přepínače rozšířené a krátké formy účtu). Výběr položky: název, ne číslo.
- Kniha s DE musí jít použít jen ve firmě s DE (knihy jsou po firmách, stačí kontrola při založení).
- Historie dokladu, chyby z DB a exporty v DE nesmí ukázat číslo technického účtu – hlášky DB s číslem účtu přeložit na název položky nebo druh (např. „Pohledávky“).

## 6. Kniha příjmů a výdajů

Kniha je **uložená tabulka zápisů** (pracovně `tax_book_entries`), kterou plní jen DB. Uživatel v ní nic nezadává. Zápis vzniká z peněz, ne z vystavení faktury.

Řádky dokladů zůstávají jako v účetnictví (technicky jsou deníkem skryté osnovy a drží saldo a zůstatky), uživatel je v DE jako deník nevidí. Kniha je z nich odvozená, nikdy se nezadává souběžně: každý zápis nese doklad a řádek platby a případně fakturu a její řádek. Ze zápisu se proklikne na doklad, v panelu dokladu (Propojené) jsou vidět jeho zápisy v knize. Kontrola DB: součet zápisů z pokladen a bank = součet jejich řádků.

**Kdy vzniká zápis**

- Řádek pokladny nebo banky s položkou → zápis hned, položka z řádku (platba bez faktury, vklad, převod).
- Řádek pokladny nebo banky na technickém účtu Pohledávky / Závazky → zápis až při **spárování** s fakturou, s datem platby; položky z řádků faktury poměrně (níže). Nespárovaná úhrada se v knize ukáže jako „Nezařazená úhrada“ s upozorněním a v přehledu kontrol; v Přehledu podle daňových kategorií má vlastní řádek, aby základ daně nebyl tiše podhodnocen. Vyřeší se spárováním, přeřazením řádku platby na položku (příjem / výdaj bez faktury), nebo na technický účet záloh (zálohou je daňová hned). **Uzavření roku DB odmítne, dokud v roce zůstává nezařazená úhrada.**
- Řádek na technickém účtu Přijaté / Poskytnuté zálohy → zápis hned; položka z řádku zálohového listu (spárovaného), jinak výchozí položka knihy ZL. Dlouhodobý hmotný majetek: položka druhu Pořízení majetku je vždy `non_tax`.
- Zápočet → zápis k datu zápočtu na obou stranách.
- Interní doklad DE (nepeněžní příjem / výdaj, odpisy z majetku, paušál na dopravu) → zápis k datu dokladu, sloupec „nepeněžní“.

Zápis vzniká u dokladů ve stavu Zařazen a vyšším (koncept nikdy). Změna dokladu nebo párování v otevřeném měsíci zápisy přepočítá; v zamčeném měsíci nebo období DB změnu odmítne (zámek platí i na odvozené zápisy).

**Rozpočet úhrady faktury**

- Úhrada se rozdělí na řádky faktury v poměru jejich zbývajících částek (s DPH). Zbývající částka řádku = řádek − poměrný podíl odečtených záloh (po kódech DPH podle odečtu) − dříve rozpočtené úhrady.
- U plátce: z podílu řádku se oddělí DPH → zápis s položkou řádku (bez DPH) a zápis „DPH“ jako průběžná položka. Do základu daně jde jen částka bez DPH.
- Řádek zaokrouhlení je běžný řádek s položkou Zaokrouhlení.
- Rozpočet se uloží jako snímek (zápis nese doklad platby, řádek platby, fakturu, řádek faktury, `match_id`); pozdější úprava faktury v uzamčeném období ho nezmění.

**Sloupce zápisu:** firma, období, datum, doklad a řádek platby, zdrojová faktura a řádek, položka, daňovost, daňová kategorie (snímek kódu a paragrafu), ekonomická kategorie, dimenze (odkaz na řádek), částka v Kč, částka a měna pohybu, z toho DPH, příznak nepeněžní.

**Výstupy:** Kniha (grid, filtry, export do Excelu podle standardu), Přehled podle daňových kategorií (§ 7–10, příjmy, výdaje, u výdajů procentem výpočet z příjmů se stropem z `tax_categories`), kontrola peněz (počáteční stav + součet pohybů pokladen a bank v knize = zůstatek peněz), na konci roku neuhrazené pohledávky a závazky k 31. 12. a převod zůstatků do dalšího roku (oddíl 8).

## 7. Daňová pravidla (ověřeno 24. 10.)

Ověřeno z odborných zdrojů a tiskopisu Finanční správy; plné znění ZDP nebylo dostupné, paragrafy jsou podle zdrojů. Kde zákon pravidlo nemá, jde o převažující praxi – aplikace ji má jako výchozí a nastavitelnou.

| Pravidlo | Výsledek | Dopad na TEMPO |
|---|---|---|
| Zálohy | Přijatá = příjem při přijetí, poskytnutá = výdaj při zaplacení. Záloha na **hmotný** dlouhodobý majetek není výdaj (§ 25/1/a), výdajem jsou odpisy. **Nehmotný majetek se od 2021 neodepisuje** – výdaj při úhradě (§ 24/2/zn). Kauce není příjem ani výdaj. | položka Pořízení hmotného majetku `non_tax`; Nehmotný majetek `taxable`; Kauce `transit` |
| Leasing | Akontace a zálohy na nájemné u finančního leasingu se časově rozlišují (§ 24/2/h). | DE-5: rozlišení akontace interním dokladem DE; ve v1 jen upozornění v nápovědě položky |
| DPH u plátce | Příjmy a výdaje bez DPH, DPH průběžná. **Neodpočtená DPH** (bez nároku, krácený nárok) je součástí výdaje (§ 24/2/ch). | DE-4: část DPH bez nároku jde do zápisu s položkou řádku, ne do průběžné DPH |
| Částečná úhrada | Rozdělení na základ a DPH zákon ani GFŘ neupravuje; poměrné je nejběžnější a nejlépe obhajitelné. | poměrně (oddíl 6) – praxe, ne zákon |
| Cizí měna | Příjem a výdaj kurzem ČNB ke dni úhrady, nebo jednotným kurzem – volba na celý rok (§ 38/1). **Samostatný kurzový rozdíl v DE nevzniká** – faktura se v Kč daňově nezaznamenává. Sporné: kurzové zisky na devizovém účtu. | kniha bere částku platby v Kč; doklad kurzových rozdílů z párování v DE jen technický (srovná saldo), do knihy nejde; volba „jednotný kurz“ na období až později |
| Pohledávky a dluhy k 31. 12. | Přepočet kurzem ČNB k 31. 12. nebo jednotným; na základ daně bez vlivu. | DE-6 přehled |
| Hmotný majetek | Odpisuje se nad 80 000 Kč a nad 1 rok (§ 26/2); technické zhodnocení nad 80 000 Kč za rok (§ 33); drobný = výdaj při zaplacení; zůstatková cena při prodeji a likvidaci = výdaj (§ 24/2/b), při škodě jen do výše náhrady. | DE-5 |
| Výdaje procentem 2026 | 80 % / 1,6 mil. (řemeslné, zemědělství), 60 % / 1,2 mil. (ostatní živnosti), 40 % / 800 tis. (jiná samostatná činnost), 30 % / 600 tis. (nájem). Každá činnost § 7 svou sazbou; § 7 a § 9 lze kombinovat. Paušalista vede příjmy a pohledávky. | sedí s `tax_categories`; výdaje daného § v knize zůstanou, jen se nezapočtou |
| Paušál na dopravu | **§ 24/2/zt** (ne zk): 5 000 Kč za celý měsíc a vozidlo, smíšené užití 4 000 Kč a ostatní výdaje na vozidlo jen 80 %; max. 3 vozidla; nahrazuje PHM a krátkodobé parkovné; **nelze s výdaji procentem**. | DE-5: interní doklad DE po měsících a vozidlech (evidence Vozidel z A3); DB zakáže při výdajích procentem u § 7 |
| Zápočet | Stejné účinky jako zaplacení: příjem i výdaj ke dni zápočtu. | oddíl 6 bod 4 |
| Karta, platební brána | Příjem dnem transakce, v hrubé výši; poplatek je samostatný výdaj. Zákon to výslovně neřeší. | výchozí: příjem s datem transakce přes položku Peníze na cestě (průběžná, stejná jako převod pokladna–banka); řešit s importem plateb kartou (později) |
| Konec roku | Inventura zásob, hmotného majetku, pohledávek a dluhů se záznamem (§ 7b/1). Příloha č. 1, tabulka D: majetek v zůstatkové ceně, hotovost, banky (nepovinné), zásoby, pohledávky, ostatní majetek, dluhy, rezervy, mzdy – začátek a konec roku. | DE-6; řádky ověřit na tiskopisu 2026 |

## 8. Dopad na stávající funkce

Ve variantě T většina funkcí funguje beze změny; mění se hlavně to, co uživatel vidí. Plán Lovable má u každé funkce z oddílu 3 a z níže uvedených potvrdit chování v DE.

| Oblast | Chování v DE | Změna |
|---|---|---|
| Ukládání dokladu a řádků (`document_save_*`, `check_journal_line`) | technická strana se doplní z knihy, položka z řádku | kontrola `de_role` (DE firma jen DE účty, řádek DE: jedna strana `item`, druhá `technical` – kromě přeřazení v interním dokladu, kde jsou obě strany položky) |
| DPH (`document_vat_sync`, `_calc`, `_validate`) | řádky daně na technický účet DPH | beze změny; v etapě neplátce jen ověřit, že doklad mimo DPH projde |
| Saldo a párování (`v_open_item_base`, `match_validate`, `auto_match_period`) | přes technické účty Pohledávky / Závazky / Zálohy | jen zrušit DE blokace (oddíl 3); spárování spouští zápisy knihy |
| Zálohy, DD, odečty (`advance_*`) | přes technické účty záloh | beze změny; zápisy knihy podle oddílu 6 |
| Kurzové rozdíly při párování (`fx_match_document`) | doklad jen technický (srovná saldo v Kč), do knihy nejde | u DE technický účet místo kurzových účtů |
| Zaokrouhlení (`documents_rounding_sync`) | položka Zaokrouhlení z nastavení firmy | beze změny logiky |
| Ekonomické kategorie a dimenze (A2, A3) | z položky / jako v účetnictví | zrušit `company_tax_categories` |
| Uzávěrka (`close_period`, `open_period`) | v UI **Uzavření roku**: technicky převede zůstatky peněz, salda a otevřené položky do dalšího roku, položky příjmů a výdajů vynuluje | jen pojmenování a skrytí účetních kroků; zápisy uzávěrky se do knihy nepočítají |
| Majetek (`asset_postings_run`, `asset_depreciation_preview`, `asset_disposal_calc`) | jen daňová řada odpisů | v DE účtovat daňové odpisy a daňovou zůstatkovou cenu; účetní a bilanční řadu skrýt |
| Výkazy z účtů (`report_*`), deník, předvaha | skryté | nic |
| Manažerská nadstavba (zůstatky peněz) | z knih pokladny a banky | beze změny |
| Vytěžování, vzory, duplikace, série, storno | návrh a přenos položky | beze změny |
| Import deníku a osnovy | v DE zakázán | ponechat zákaz |
| Hlášky DB, historie, exporty | nesmí ukázat technický účet | překlad na název položky nebo druh |

## 9. Etapy realizace

Začít až po dokončení a publikaci **Kategorií a dimenzí** (A3 výkon, B1/B2 DS, C napojení) – obě témata mění ukládání řádků. Každá etapa: DB (plán a celé SQL ke kontrole) → DS → APP, samostatně publikovatelná.

- **DE-1 Režim a osnova (DB + APP):** režim na firmě, zrušení fáze 1 (oddíl 3), sloupce `de_role`, `tax_treatment`, `tax_category_code`, `display_code`, šablona DE, technické účty a jejich automatické nastavení (knihy, firma, kódy DPH), zrušení `company_tax_categories`, převod dvou DE firem, menu DE, číselník Položky příjmů a výdajů.
- **DE-2 Doklady neplátce (DS + APP):** grid řádků v režimu DE, FV, FP, PO, BA, ID, nastavení knih a firmy bez účtů, výběr režimu v Nové firmě. Po této etapě jde v DE pořizovat doklady.
- **DE-3 Kniha (DB + APP):** `tax_book_entries`, vznik zápisů (oddíl 6, body 1, 2, 4), párování v DE, Kniha, Přehled podle daňových kategorií, kontrola peněz, nezařazené úhrady.
- **DE-4 Zálohy a plátce DPH:** ZL, DD k zálohám, odečty, rozpočet úhrady s DPH, oddíl 6 bod 3.
- **DE-5 Majetek a nepeněžní pohyby:** daňová řada, odpisy a zůstatková cena do knihy, drobný majetek, interní doklad DE, paušál na dopravu.
- **DE-6 Konec roku:** Uzavření roku (DB odmítne při nezařazených úhradách), neuhrazené pohledávky a závazky k 31. 12., výstup pro přiznání (řádky přiznání v `tax_categories.return_line` doplnit podle tiskopisu 2026), převod do dalšího roku.

## 10. Trvalé pravidlo a otevřené otázky

**Trvalé pravidlo (ulož do znalostí projektu):** každé nové nastavení, funkce nebo tabulka musí zohlednit režim daňové evidence. Každý plán má samostatný bod „Dopad na daňovou evidenci“. Ve variantě T to obvykle znamená: logika přes druh účtu funguje sama, v UI místo účtu položka, technický účet nikdy neukázat.

**Rozhodnuto Petrem 24. 10.****:**

- Nespárovaná úhrada faktury: v knize „Nezařazená úhrada“ s upozorněním. **Ano** – a před Uzavřením roku se musí vyřešit, protože i nespárovaná platba může být příjem (oddíl 6).
- Interní doklad DE: nepeněžní příjem / výdaj **i přeřazení mezi dvěma položkami**.
- Uzavření roku technicky přes stávající uzávěrku, v UI bez účetních kroků. **Ano.**
- Cizí měna: teď kurz ČNB ke dni úhrady; volba jednotného kurzu na období později. **Ano.**
- Karta a platební brána: řešit až s importem plateb kartou, do té doby ručně přes položku Peníze na cestě. **Ano.**
- Paušál na dopravu v DE-5 jako interní doklad po měsících a vozidlech z evidence Vozidel; DB ho zakáže při výdajích procentem. **Ano.**

Doplněno Petrem 24. 10. (po kontrole):

- Vzorový číselník položek ve workspace až po DE-3.
- Ekonomická kategorie jako v účetnictví: více povolených kategorií u položky, výběr na řádku; v DE lze kategorie vypnout.
- Seznam položek šablony navrhne plán DE-1, Claude ověří, Petr schválí.

**Otázky pro Lovable:** vypiš rozpory se stávající implementací a se svými staršími plány DE; nic neřeš sám.

## 11. Upřesnění po kontrole proti DB (24. 10.)

Tyto body mají přednost před stručnějšími formulacemi výše.

**Osnova DE a pevná pravidla DB**

- Šablona DE je v **běžném číslování**, aby prošly `accounts_validate`, `closing_account`, uzávěrka a kontrola zaokrouhlení: technické syntetiky 211, 221, 311, 321, 314, 324, 343, 395 (Zápočty, Nepeněžní pohyby), 563 / 663 (kurzové), 701, 702, 710, 431; položky jsou **analytiky** pod syntetikami 5xx / 6xx (příjmy a výdaje) a pod rozvahovými syntetikami (např. 261 Peníze na cestě a převody, 491 Vklady a výběry, 46x úvěry, 042 Pořízení majetku). Syntetiky mají `de_role = 'technical'` a nikdy se nenabízejí; uživatel vidí jen analytiky-položky a jejich `display_code`.
- Matice položek: nákladová / výnosová položka má `category = ekonomicka_kategorie` napevno (`accounts_validate`); rozvahová položka smí mít `ekonomicka_kategorie`, `nerozliseno`, `porizeni_majetku`, `porizeni_zasob`. Ekonomickou kategorii jde přiřadit jen položce druhu `ekonomicka_kategorie` (`account_allowed_categories_set`). **Ekonomická kategorie v DE funguje stejně jako v účetnictví (Petr 24. 10.):** u položky povolené kategorie (prázdné = všechny), na řádku se kategorie vybírá, jediná povolená se doplní sama, povinnost při zaúčtování; firma s DE může kategorie vypnout (`economic_categories_enabled`), pak se sloupec skryje. Nahrazuje bod 9 v `claude/zadani-kategorie-dimenze.md` („na řádku se nevybírá“).
- `journal_lines.non_tax` se v DE nepřepisuje, odvodí se z položky.
- `account_template` dostane klíč druhu osnovy; dotčené funkce `account_template_apply`, `apply_template_to_company`, `workspace_account_templates`, `copy_chart_of_accounts` (přenáší `de_role`, `tax_treatment`, `tax_category_code`, `display_code` a povolené kategorie). Neplatná daňová kategorie k datu nového období → chyba při založení období s výpisem položek.
- `company_tax_categories` zrušit včetně funkcí `company_tax_category_set`, větví v `purge_scope` a `soft_delete_economic_category`.
- CHECK `fiscal_periods_method_consistency` / `_method_mode` nemůže odkazovat na `companies` → nahradit triggerem.
- Kurzové rozdíly: `fx_match_document` v DE používá technické 563 / 663 (s technickou kategorií nebo výjimkou z povinnosti kategorie – navrhni), knihu KR založí DB; zápisy z nich nejdou do knihy ani do Ekonomiky firmy.

**Pravidla knihy, která výše chyběla**

- Do knihy nikdy nejdou řádky dokladů s `entry_kind` `opening` a `closing`.
- Řádek pokladny nebo banky na technickém účtu DPH (platba DPH finančnímu úřadu, vratka) → zápis s průběžnou položkou DPH. Na Zápočtech → podle oddílu 6 bod 4. Peníze na cestě a převod pokladna–banka jsou položka (průběžná), obě nohy převodu se v knize vyruší.
- **Přechod přes rok:** úhrada pohledávky nebo závazku z minulého roku musí znát řádky původní faktury. Převod otevřených položek do nového roku nese odkaz na původní doklad (navrhni: `source_document_id` u počátečního řádku / `opening_items`). Ručně zadaná počáteční položka v DE (první rok) nese položku a rozdělení základ / DPH (`vat_base_dom`, `vat_dom` už existují).
- **Dobropisy a přeplatky:** spárování faktury s dobropisem bez peněz zápis nevytváří; dobropis snižuje zbývající částky řádků. Je-li zbývající součet 0 nebo opačného znaménka, použije se poměr řádků původní faktury. Vrácení přeplatku = záporný zápis.
- **N:N párování:** peněžní strana je doklad z knihy pokladny nebo banky (případně zápočet); částka v Kč z této strany. Zrušení párování v otevřeném období přepočte zápisy dotčených faktur v pořadí podle data platby; v zamčeném období ho DB odmítne (storno platby proto jen v otevřeném období, jako v účetnictví).
- **Neplátce / plátce** se určuje z `company_vat_registrations` k datu dokladu. Neplátce: doklad mimo DPH, celá částka faktury od plátce je výdaj, pole DPH skrytá. DPH se odděluje jen z řádků, které mají řádek daně s nárokem; daň bez nároku zůstává u položky řádku.
- Stavy dokladů v DE stejné jako v účetnictví (Zařazen, Zaúčtován, Uzamčen); Uzavření roku vyžaduje zaúčtované doklady jako dnes `period_close_check`.

**Etapy a dopočet**

- Párování v DE se odblokuje až v DE-3 (ne v DE-1). Každá etapa, která přidává zdroj zápisů (DE-3 úhrady, DE-4 zálohy, DE-5 interní doklady a majetek), **dopočte zápisy pro existující doklady a párování** v otevřených obdobích.
- Převod dvou DE firem v DE-1: ověřit 0 dokladů, výpisů, počátečních položek a karet majetku; pak osnovu 2026 smazat a založit ze šablony DE.

