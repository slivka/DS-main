# DS 2.108.0 – Edit dokladu 15 (nic se nevydává)

## Verze a katalogy
- package.json a `.lovable/design-system.json meta.version`: 2.106.0 → **2.107.0**.
- CHANGELOG: „## 2.107.0 (nevydáno)“ → „## 2.107.0 – vydáno“; nová sekce „## 2.108.0 (nevydáno)“ s „Breaking / migrace pro aplikace“.
- Na konci programem porovnám 4 katalogové soubory (`.lovable/design-system.json`, `src/index.ts`, `src/components/ds/index.ts`, `components.md`) s výchozím commitem tohoto kola: žádný název, prop ani export neubude, počet komponent ≥ 441. Nové props se doplní aditivně (usage / examples / antipatterns).

## E1 Živý pruh chyb a upozornění
- Nový typ `FormIssue { fieldId?, rowId?, columnId?, label, message, severity: "error"|"warning", source: "client"|"server", code? }`; `FieldErrorLink` zůstává (alias / podmnožina, zpětně kompatibilní).
- Nová čistá funkce `mergeFormIssues(issues)` v lib: deduplikace podle (code ?? message, fieldId, rowId); chyba s `fieldId` hlavičky potlačí stejnou hlášku z řádku („Řádek N: …“); text `error.message` shodný s položkou se nevypíše podruhé.
- `FieldErrorSummary` přijme `issues` a obarví chyby / varování; `RecordActionBar.error` a `DocumentForm` dostanou `issues`, `saveFailed?: boolean`, `title?` a `validationActive?: boolean`.
- Titulek s počtem (DsTexts CS/SK): „Doklad nelze uložit (N)“ jen při `saveFailed`; jinak „Před zařazením doplňte (N)“; jen varování „Upozornění (N)“. Prázdný seznam → pruh zmizí (bez toastu), ✕ zůstává.
- Před prvním pokusem (`validationActive=false`) žádné červené rámečky ani klientské položky; poté klientské kontroly hlavičky i řádků přes `useDebouncedValue` (300 ms).
- Server položky DS jen zobrazí; nový `onFieldChange?(fieldId)` na DocumentForm (volá se při změně pole hlavičky i buňky řádku) – aplikace podle něj smaže své server položky; zdokumentováno v system.md.
- `documentValidationFeedback` vrací položky místo samostatných NoticeBarů; varování „víc než 10 číslic“ zůstane jen jedno (zruší se druhý NoticeBar u čísla dodavatele).
- Ukázka: chyba z DB na DUZP (`vat_date_required`, `date_tax`) + klientská chyba řádku → oprava DUZP → titulek 2 → 1 → oprava řádku → pruh zmizí.

## E2 VS se zámkem
- `VsField`: `linked?`, `onLinkedChange?`, `derivedValue?`, `pendingText?`, `warning?`; FieldToggleButton Lock / LockOpen jako TaxDocumentNumberField; zamčeno = readOnly s odvozenou hodnotou, zamknutí znovu odvodí.
- Hlavička dokladu: `variableSymbolLinked?: boolean` (výchozí true u nových FP/ZFP/DDPOZ/FV/ZFV/DDPZ).
- Čistá funkce `deriveVariableSymbol(source)` → `{ value, reason: "ok"|"tooLong"|"noDigits" }`:
  - přijaté: číslice z Čísla daňového dokladu, 1–10 → VS; jinak vazba se uvolní, VS se nezkracuje, žluté varování v poli + položka v pruhu;
  - vydané: číslice z coalesce(vlastní daňové číslo, číslo dokladu); koncept bez čísla → zamčené prázdné pole s „přidělí se při zařazení“.
- Zápis odvozené hodnoty jen u upravitelného dokladu (stejné hradlo jako vazby dat). DsTexts CS/SK: vazba, zamčeno, odemčeno, 2 varování.

## E3 Celkem za doklad
- Chování Σ beze změny. Výchozí `totalMode: "entered"` v ukázkách (use-document-form-showcase-state, FormDesignShowcase, DocumentDatesShowcase, stránka účetních formulářů) → `"sum"`, kromě ukázek, které režim zadané částky výslovně předvádějí (zůstane jedna označená).

## E4 Řádky dokladu
- Lišta: odstranit čip `journal-lines-toolbar-total`.
- Rekapitulace: `JournalRecapHomeTotal` se v editoru nevykresluje (komponenta a export zůstávají, označeny `@deprecated` 2.108.0).
- `AmountDifference` jen v režimu zadané částky a při rozdílu ≠ 0; stav „✓ Rozepsáno“ zrušen (`balancedLabel` deprecated, ignorován; klíč DsTexts zůstává).
- Patička součtů zůstává.

## E5 Interní doklad
- BasicSection pro ID: CounterpartyInputField (partner / ručně, stejná ikona), za ním IČO (3) a DIČ (3) – ReadField s IcoLink u partnera, Input u ručního; Popis na dalším řádku; bez adresy. ＋ a tužka jako u faktur.
- Ruční partner: žluté varování v poli + položka v pruhu „Ruční partner se nepřenese do řádků dokladu.“ (DsTexts).

## E6 Výpis – pohyby
- Odstranit náhradní zobrazení nového výpisu; sekce Pohyby vždy vykreslí slot `items`. Prázdný grid: „Výpis zatím nemá pohyby“ (DsTexts).
- Odstranit zbytky Zkontrolovat / Zrušit kontrolu (klíče `check/uncheck/checkHint/uncheckHint` deprecated, ponechány kvůli typům aplikací). Ukázka neuloženého výpisu s prázdným gridem.

## E7 Výpis – zůstatky
- Základní údaje jedním řádkem na mřížce 20: Datum výpisu · Počáteční zůstatek · Příjmy · Výdaje · Zůstatek na výpise (po 4); první tři částky FieldValue; zalamování po celých polích.
- „Zůstatek dle banky“ → „Zůstatek na výpise“ s FieldToggleButton Σ: `bankClosing = null` = vypočtený konečný zůstatek jen ke čtení; vypnutí předvyplní vypočtenou hodnotu. Rozdíl ≠ 0 → žluté varování v poli + položka pruhu „Rozdíl proti pohybům X“.
- Zrušit bloky „Rozdíl“, „Zůstatky dle pohybů“ a „Zůstatky v {měna}“.

## E8 Bankovní pohyb
- Protiúčet a symboly na mřížce 20 přes `field()`: Druh účtu (4) · Číslo účtu / IBAN (8) · Kód banky / SWIFT (8); VS (4) · KS (8) · SS (8). Bez FieldGrid 12 a vlastního @container.
- Kód banky: nové `bankCodeOptions?: { code, name }[]`, zobrazení „0100 – Komerční banka“ v seznamu i v poli, hledání podle kódu i názvu.
- Data: Datum pohybu (issueDate, popisek movementDate) a Datum účetního případu se zámkem (accountingDateLink jako PO/FV, stav z rovnosti dat); DUZP a Datum DPH beze změny.

## Testy a výsledky
- Unit: mergeFormIssues (dedup, hlavička vs řádek, titulky), validationActive, onFieldChange, deriveVariableSymbol (1–10, >10, 0, koncept), VsField zámek, E4 skrytí prvků, ID partner ručně, výpis prázdný grid, Σ zůstatku a varování rozdílu, kód banky s názvem.
- Chromium E2E: oprava pole odstraní položku a sníží počet; VS zámek; nový / uložený výpis stejný grid; Σ zůstatku; sloupce protiúčtu lícují při zoomu aplikace 70 / 100 / 200 % (< 1 px).
- Celé unit, starší E2E (document-controls, edit-document-thirteen, control-height, journal-control-height, bank-statement-form), lint 0 chyb, formát; výpis nových / změněných props.

## Technické poznámky
- DocumentForm má dnes 574 řádků (nad limitem 500): logiku pruhu a VS přesunu do nových hooků (`use-form-issues.ts`, `use-variable-symbol-link.ts`) a soubor zkrátím pod 500.
- Výpis (bank-statement-form 301 ř., sections 247 ř.) zůstane rozdělený; zůstatky do vlastního modulu.

## BREAKING (CHANGELOG 2.108.0)
- Pruh: obsah z `issues`, nové titulky; NoticeBary validace nahrazeny položkami pruhu.
- VS je u nových dokladů ve výchozím stavu zamčený a DS zapisuje odvozenou hodnotu přes onChange.
- Odstraněné zobrazení: čip Celkem v liště, Celkem v domácí měně v rekapitulaci, „✓ Rozepsáno“.
- Výpis: zrušené sekce zůstatků a náhradní zobrazení pohybů; „Zůstatek na výpise“ s Σ (`bankClosing: null` = vypočtený).
- Ukázky používají výchozí `totalMode: "sum"`.
