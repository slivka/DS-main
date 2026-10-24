# DPH – přiznání, kontrolní a souhrnné hlášení, podání (vlna 3)

Zadání řídicího chatu ze dne 24. 10. 2026. Termín je **podání za říjen 2026 do 25. 11.** a ověření na ostrém říjnu firmy Unidata do ~15. 11. Rozhodnutí Petra R4 a R5 jsou závazná. Kopie je v projektu Claude (`claude/zadani-dph-6-prizani.md`).

Rozdělení práce:
- **DPH A** – databáze (APP, dvoufázově: celé SQL ke kontrole → nasazení);
- **DPH B** – komponenty DS;
- **DPH C** – napojení v APP;
- **XML EPO** – generátor `src/lib/epo/*` napíše Claude.

## 0. Co už v DB je (ověřeno Claudem 24. 10.)

**Registrace a období**
- `company_vat_registrations` s polem `vat_period` month/quarter a funkcemi `vat_status_at`, `vat_period_for_date`, `vat_period_label`, `vat_periods_list`, `vat_period_options`.
- **Zámek podaného období:** `vat_period_filings`, `vat_period_set_filed(_company_id,_from,_to,_note)`, `vat_period_unfile`, `vat_period_filing_log` a guardy `*_vat_filed_guard`.

**Kódy plnění**
- `vat_codes`: 27 kódů se sloupci `direction`, `regime`, `rate_type`, `has_tax`, `self_assessment`, `kh_group` (A1, A2, A4A5, B1, B2B3), `sh_code` (0, 2, 3), `partner_dic`, `requires_pdp_subject`, `allowed_for_identified`.
- `vat_code_mappings`: 60 řádků pro formulář DPHDP3 se sloupci `form`, `valid_from`/`valid_to`, `component`, `return_row`, `xml_attribute`.
- `vat_pdp_subjects`, `company_vat_code_settings` / `_accounts`.

**Řádek dokladu a podklady**
- Řádek dokladu nese kód DPH a základ s daní. Řádky daně vytváří `document_vat_sync`.
- **Evidence pro daňové účely:** `v_vat_ledger` se sloupci `vat_date`, `vat_period`, `counterparty_dic`, `external_number`, `vat_code`, `direction`, `vat_rate`, `vat_base_dom`, `vat_amount`, `tax_deductible`, `tax_non_deductible`, `kh_group`, `sh_code`, `vat_correction_of_id`, `kh_limit_amount`, `kh_section`. K tomu funkce `kh_section`.
- `book_period_settings.vat_relevant_default` + `default_vat_code_out_id` / `_in_id`.

**Partneři**
- `partner_vat_checks`: `unreliable`, `unreliable_since`, `published_accounts`.
- `partner_bank_accounts`: `is_published`, `published_from`, `published_to`, `published_checked_at`.
- Doklad nese snímek `counterparty_dic`, `counterparty_vat_status`, `_unreliable_since`.

**Oprávnění:** moduly v `module_permissions` jsou adresar, ciselniky, majetek, pokladna, ucetnictvi, vykazy, zavazky. Modul DPH zatím není.

Před návrhem vše ověř proti živé DB a vypiš rozpory. Nic, co existuje, nezakládej znovu.

## 1. DPH A – databáze

### 1.1 Výpočty (čtecí RPC, INVOKER nebo DEFINER s kontrolou práva)
- **`vat_return(_company_id, _period_from, _period_to)`:** řádky přiznání DPHDP3 podle `vat_code_mappings` platných pro období.
  - Hodnota = součet `v_vat_ledger` podle komponenty (základ / daň / odpočet v plné výši / krácený).
  - Výstup: řádek, popis, komponenta, částka, počet dokladů, `xml_attribute`. Dopočty: daň na výstupu celkem, odpočet celkem, vlastní daňová povinnost / nadměrný odpočet (ř. 62–66).
  - Zaokrouhlení na celé Kč podle pravidel tiskopisu.
  - Pouze doklady, které nejsou koncept a nejsou smazané. Storno a opravné doklady se počítají v období svého data DPH.
- **`vat_kh(_company_id, _month)`:** kontrolní hlášení po oddílech A1, A2, A4, A5, B1, B2, B3.
  - **Limit 10 000 Kč včetně DPH počítat za doklad** (evidenční číslo + DIČ), ne za řádek.
  - A4 a B2 uvádějí doklady jednotlivě: DIČ odběratele/dodavatele **ze snímku `documents.counterparty_dic`**, evidenční číslo (`number` u výstupu, `external_number` u vstupu), DUZP / datum povinnosti, základy a daně po sazbách, kód režimu (0 / §89 / §90), příznak opravy dle § 44.
  - A5 a B3 jen souhrnně po sazbách.
  - A1 a B1 (přenesená daňová povinnost) s kódem předmětu plnění z `vat_pdp_subjects`.
  - **Opravný daňový doklad (§ 42) jde do stejného oddílu jako původní** a nese evidenční číslo opravného dokladu. Vazbu na původní řeš přes `vat_correction_of_id`.
- **`vat_sh(_company_id, _period)`:** souhrnné hlášení po DIČ odběratele v EU a kódu plnění (0, 1, 2, 3). Periodicita měsíc, nebo čtvrtletí jen u samotných služeb.
- **Kontroly před podáním** (`vat_checks(_company_id, _period)`, seznam nálezů s odkazem na doklad):
  - chybí DIČ protistrany u řádků, které ho vyžadují;
  - chybí evidenční číslo;
  - kód PDP bez předmětu plnění;
  - EU kód s DIČ, které není z EU;
  - koncepty s datem DPH v období (varování);
  - řádky se základem bez daně a naopak;
  - rozdíl proti zůstatku 343 (rekonciliace přiznání × účty 343 za období);
  - **nespolehlivý plátce:** přijaté plnění od plátce, který byl k DUZP nespolehlivý (§ 109/1 písm. b, informace pro ručení);
  - **platba na nezveřejněný účet:** úhrada přijatého plnění nad dvojnásobek limitu (2 × 270 000 Kč) na účet, který k datu platby nebyl zveřejněný (§ 109/2 písm. c). Upozornění, podání neblokuje.

### 1.2 Podání a snímky
- **Tabulka `vat_submissions`:**
  - firma, `form` (`DPHDP3` / `DPHKH1` / `DPHSHV`), období od–do;
  - `kind` – u přiznání řádné / opravné / dodatečné; u KH řádné / opravné / **následné**; u SH řádné / opravné / následné;
  - `status` (koncept / podáno), `snapshot jsonb` (řádky a **u KH i doklady**), `xml text`, `filed_at`, `filed_by`, `reason`, `supersedes_id`.
  - RLS po firmě, zápis jen RPC, audit.
- **RPC `vat_submission_create(_company_id, _form, _from, _to, _kind)`** uloží snímek z výpočtu 1.1. **`vat_submission_mark_filed(_id)`:**
  - u řádného přiznání nebo KH zamkne období přes stávající `vat_period_set_filed` – jeden zámek pro DPH i KH, žádný druhý mechanismus;
  - podané podání je neměnné.
- **Dodatečné přiznání a následné KH:** výpočet aktuálního stavu minus poslední podaný snímek. Dodatečné přiznání = jen rozdíl řádků (§ 141 DŘ). Následné KH = vždy úplné. Do následného KH jdou jen oddíly s rozdílem, u dokladů A4/B2 podle porovnání snímku.
- **Detekce změny po podání:** pohled nebo RPC „Čeká na dodatečné / následné“. V podaném období vznikla změna (opravný doklad, odpočet uplatněný později je řádný a do dodatečného nepatří) → upozornění v přehledu.

### 1.3 R4 a R5 (rozhodnutí Petra)
- **R4:** výchozí „Vstupuje do DPH“ na novém dokladu podle nastavení knihy (`book_period_settings.vat_relevant_default` – ověř, že je to skutečně jediný zdroj výchozí hodnoty, a vypiš rozpor s triggerem `documents_vat_relevant`). U neplátce k datu dokladu přepínač skrytý a vypnutý.
- **R5:** storno dokladu, jehož období DPH je podané, se neprovede jako prosté storno. Vznikne **opravný daňový doklad (§ 42)**:
  - zařazený do období opravy, tj. období data vystavení opravného dokladu;
  - `vat_correction_of_id` = původní doklad;
  - částky se zápornými znaménky;
  - účetně stejné jako storno.

  Prosté storno zůstává jen u nepodaného období. Doklad, který není daňový (mimo DPH), stornovat jde vždy. Chybová hláška a kód pro APP.

### 1.4 Oprávnění
Nový modul **`dph`** v `module_permissions` (view = přehledy, edit = vytvořit a podat podání, zamknout a odemknout období). Výchozí: owner / admin vše, ostatní nic. Rozšiř `get_my_access.modules`.

### 1.5 Testy (ROLLBACK, prostor Testovací)
- Výpočet na sadě dokladů: tuzemský výstup a vstup 21 / 12 %, bez nároku, krácený (poměrný), samovyměření EU zboží a služby, PDP dodavatel a odběratel s předmětem plnění, dovoz, osvobozené, mimo předmět, cizí měna s kurzem DPH, storno, opravný doklad, zálohové daňové doklady (DDPZ / DDPOZ) a odečty záloh.
- KH: limit 10 000 Kč na hranici (9 999,99 / 10 000 / 10 000,01 včetně DPH), doklad s více sazbami, A4 / B2 / A5 / B3.
- Podání: zámek, dodatečné z rozdílu, následné KH úplné.
- R5: storno v podaném období vytvoří opravný doklad.
- Izolace firem; člen bez modulu `dph` → 42501.
- **Výkon:** přiznání a KH za měsíc s 2 000 řádky ≤ 500 ms.

### 1.6 Vazba na generátor XML (hotový, `src/lib/epo/*`, Claude 24. 10.)
- `vat_code_mappings.xml_attribute` je dnes všude NULL. Doplň ho podle návrhu v `docs/epo/README.md` (atributy DPHDP3 po větách a řádcích) a výstup `vat_return` vracej s `xml_attribute`, ať APP předá data generátoru bez překladu.
- Výstup `vat_kh` a `vat_sh` tvaruj podle typů v `src/lib/epo/types.ts`, případně uveď rozdíl a Claude typy upraví.
- Neověřená místa tiskopisů (řádky 40–46, krácení, věty 5 a 6 DPHDP3, oddíly B1–B3 a C DPHKH1) jsou vyjmenovaná v `docs/epo/README.md`. Před prvním podáním je ověří Claude nahráním vzorového XML do kontroly EPO.

## 2. DPH B – DS (komponenty bez domény, data jen přes props)
- **`VatReturnView`:** strom řádků přiznání po oddílech (I. zdanitelná plnění, II. ostatní plnění, III. odpočet, IV. … VI. výpočet) s částkami, počtem dokladů a proklikem na řádek. Zvýraznění rozdílu proti podanému (`compare?: Record<row, number>`).
- **`VatControlStatementView`:** záložky oddílů A1–B3. A4/B2 jako grid dokladů (DIČ, evidenční číslo, datum, základy a daně po sazbách, kód režimu), A5/B3 souhrn. Proklik na doklad. Badge „změněno po podání“.
- **`VatRecapitulativeView`:** grid DIČ × kód plnění × částka.
- **`VatChecksPanel`:** seznam nálezů (chyba / varování) s proklikem.
- **`VatFilingBar`:** stav období (otevřené / podané / změněno po podání), druh podání, akce Vytvořit podání, Stáhnout XML, Označit podané, Dodatečné / Následné. Potvrzení zámku přes `ConfirmByTypingDialog` jen u odemknutí.
- **`VatPeriodPicker`:** měsíc nebo čtvrtletí podle registrace, s popiskem „DPH 4.Q 2026 · KH říjen 2026“.
- DsTexts CS/SK, katalog, unit testy, E2E spec (proklik řádku na doklady, přepnutí oddílu KH, stav podání).

## 3. DPH C – APP
- **Menu „DPH“:** Přiznání, Kontrolní hlášení, Souhrnné hlášení, Podání (historie). Brány podle modulu `dph`.
- **Napojení komponent DPH B na RPC 1.1–1.2.** XML přes `src/lib/epo/*` (Claude dodá generátor a testy proti XSD): stažení souboru, uložení XML do `vat_submissions`.
- **Kniha – nastavení:** výchozí „Vstupuje do DPH“ (R4).
- **Storno v podaném období** → dialog „Vytvořit opravný daňový doklad“ (R5).
- **Kontroly před podáním** a upozornění „změněno po podání“ na přehledu DPH.
- Chybové kódy DPH A do `lib/db-errors.ts`.

## 4. Mimo tuto vlnu
Koeficient § 76 a vypořádání, DPH v daňové evidenci (DE-4), automatické podání do datové schránky (jen XML ke stažení a ruční podání na EPO).

## 5. OSS – zvláštní režim jednoho správního místa (Petr 24. 10.: „Zahrň i MiniOneStop“)

Režim Unie (ZDPH, zvláštní režim jednoho správního místa – přesné paragrafy ověří Claude): prodej zboží na dálku a služby konečným spotřebitelům v jiných státech EU s DPH státu spotřeby, přiznání jednou za čtvrtletí přes aplikaci OSS na daňovém portálu (Moje daně). **Termín:** první čtvrtletí, které ostrá Unidata může potřebovat, je 4. Q 2026 s podáním do 31. 1. 2027. OSS proto jde **za DPH A/C** (od ~15. 11.), samostatné kolo „DPH A2 / C2 – OSS“. Dovozní režim (IOSS) a nevládní režim jsou mimo rozsah.

**DB (A2):**
- **Registrace:** příznak OSS u registrace firmy (`company_oss_registrations`: režim EU, platnost od–do, identifikace = DIČ). Kontrola, že OSS kód smí použít jen firma registrovaná k datu plnění.
- **Kódy plnění:** nový `regime = 'oss_eu'` ve `vat_codes` pro dodání zboží na dálku a služby B2C. Řádek nese **stát spotřeby** (`documents`, nebo řádek `oss_country`) a **sazbu státu spotřeby** z `vat_rates` (`country`, `rate_type`, platnost). Daň v Kč se nezapočítává do tuzemského přiznání ani do KH a SH. Účetně jde na samostatný technický účet 343 OSS (nastavení kódu po obdobích jako ostatní kódy).
- **Sazby členských států:** doplnit `vat_rates` o sazby všech států EU platné v roce 2026 (základní a snížené). Číselník je globální, jen ke čtení, mění se migrací.
- **Přiznání OSS:** výpočet `vat_oss_return(_company_id, _quarter)` po státech spotřeby × druh plnění (zboží / služby) × sazba: základ a daň **v EUR**. Přepočet kurzem ECB posledního dne čtvrtletí (podle pravidel OSS; kurz ECB k datu doplnit do kurzů, zdroj stejný jako ČNB job). Opravy předchozích čtvrtletí po státech a čtvrtletích (oprava se uvádí v pozdějším přiznání, ne dodatečným).
- **Podání a snímek:** přes `vat_submissions` (`form = 'OSS'`), uzamčení čtvrtletí OSS samostatně od tuzemského DPH.
- **Limit 10 000 EUR** (společný limit EU pro B2C): přehled obratu B2C do EU za kalendářní rok s upozorněním na překročení.

**DS (B2):** `OssReturnView` (stát × druh × sazba, základ a daň v EUR, opravy minulých období) a varianta `VatFilingBar` pro čtvrtletí OSS.

**APP (C2):**
- obrazovka „OSS“ v menu DPH (jen u firmy s registrací);
- volba státu spotřeby na dokladu u OSS kódu;
- výstup pro aplikaci OSS: přehled k opsání a export CSV/XML, pokud aplikace OSS import nabízí – ověří Claude.

**Claude:** ověří formát podání v aplikaci OSS (ruční vyplnění, nebo import souboru) a sazby členských států k 1. 1. 2026, případně rozšíří `src/lib/epo/` o export OSS.
