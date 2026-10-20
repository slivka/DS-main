## DS 2.118.0 (nevydáno)

### DPH 5 – krok B

- [ ] Opravné kolo Chromium: pořadí Tab/Enter/Shift+Tab, překrytí ND, první klik na partnera; tři specy jednou a check:full.

- [x] Pořadí sloupců Popis · Kód DPH · Částka bez DPH · MD · DAL · Zakázka; Sazba/DPH/Celkem z gridu pryč.
- [x] Klávesnice Enter / Shift+Enter, výběr psaním, nový řádek s kódem a účty, zahození prázdného řádku.
- [x] Zakotvení sloupce špendlíkem.
- [x] Výběr kódu DPH ve skupinách; obousměrný režim; klíč id.
- [x] Rekapitulace po oddílech, bez nároku, KH, informativní text; patička se zálohami a K úhradě.
- [x] Ruční oprava DPH tužkou; u vydaných jen v ⋯.
- [x] Záložka Zaúčtování (`DocumentPostingGrid`).
- [ ] Napojení v APP (krok C).

### Zálohové listy – krok B

- [x] Varianta ZFV / ZFP jen konfigurací (`advanceListVariant`), stav úhrady, ukázka.

- Známé body FF / WebKit viz 2.116.0 (beze změny).

## DS 2.117.0 – Drobné opravy 1

- Vydáno 20. 10. 2026 (commit 615e76af). E2E Chromium run 39485783990 na e1d73f3 🟢 (předchozí run 39483284611 na 624bf09 měl 2 zastaralé testy – D6 pořadí účet / způsob platby, selektor tužky D3; opraveny testy, ne kód).

### Drobné opravy 1 (edity)

- [x] D1 Období v horní liště se nezkracuje; rozsah jen celý; šířky v rem; zkracuje se firma.
- [x] D2 ✕ zavře záložku; „Zavřít panel“ poslední v ⋯ jen při více panelech.
- [x] D3 Tužka Změnit účet hned za textem účtu.
- [x] D4 Tečka neuložených změn ve středu štítku.
- [x] D5 Pořadí polí pokladny; „Číslo daňového dokladu“.
- [x] D6 FV/ZFV: Bankovní účet | Způsob platby.
- [x] D7 Štítek Neověřený dodavatel vedle Vstupuje do DPH.
- [x] D8 Výpis bez značek měny; měna v nadpisu sloupce; oprava zoomu vnořeného gridu.
- [x] D9 VS = KS pod účtem; Reference u IBAN / SWIFT.
- [x] D10 Ctrl/Cmd+Enter → `onSaveAndClose`.

- Známé body FF / WebKit viz 2.116.0 (beze změny).

## DS 2.116.0 – Navázané okno panelu

- Vydáno 20. 10. 2026 (commit fa873c2f). E2E Chromium run 39476599967 na 86fa919 běžel při vydání (Petr: pokračovat bez čekání); následný run 39477750480 🟢.

### Navázané okno panelu (krok 5B)

- [x] Druh záložky `linked`: vznik z RecordSidePanel, hlavička „Sekce – záznam“, sledování zdroje.
- [x] Špendlík zamkne záznam; zavření zdroje nechá navázanou připnutou na posledním záznamu.
- [x] Pod 3 panely vždy nový panel vpravo od zdroje; při 3 obsazených potvrzení a nahrazení obsahu, odmítnutí nechá obsah v panelu.
- [x] „Vrátit do panelu“ v záhlaví i menu; ukázka, CS/SK texty, katalog, 8 unit testů.

- Firefox i WebKit: tooltip důvodu zablokované akce lišty gridu po kliknutí (grid-add-actions-13g:86) – v CI selhává / nestabilní.
- WebKit: narrow-fields-290 (zoom 0.7) – text kódu MJ za tužkou (run 39456236558, dříve procházelo; kód polí beze změny – nejspíš měření se `style.zoom` ve WebKitu); edit-document-eleven:161 (tooltip Ruční kurz); record-dialog-2111:35 vypršení času; nestabilní browser-page-errors, design-three 70 %, document-controls 1200 px 200 %, form-design-two:80, journal-control-height.
- Firefox: vs-lock-2108:103 (GridToolbar výška) – `page.goto` přerušeno (NS_BINDING_ABORTED) obnovou stránky po načtení modulu; test čekat stabilněji.
- Chromium: nestabilní design-three 70 % / 1280.
- Ukázka řádků dokladu (/components/accounting-lines) se po načtení několik sekund dopočítává (Firefox 8–10 s) – rozdělit na menší ukázky.

## DS 2.115.0 – Propojené doklady

- Vydáno 20. 10. 2026 (commit 59b3147f).


### Propojené doklady (krok 4B)

- [x] SettlementBar, LinkedRecordsPanel: skupiny, oprávnění, potvrzení a tok dokladů.
- [x] LinkRecordDialog: návrhy, hledání, typ vazby, poznámka a ochrana změn.
- [x] Ukázky v záložce Propojené; CS/SK, unit testy, katalog a check:full --harness.

- Ověřeno: 11 nových testů; check:full --harness 941/941 unit v 97 souborech, lint 0 chyb / 341 stávajících varování (nové moduly 0/0), katalog 448 → 452 komponent / 942 → 985 props, 0 odebrání; formát a peněžní audit OK. E2E Chromium run 39465817412 na 0c20bda prošlo.


## DS 2.114.0 – Historie záznamu + oprava výběru myší

- Vydáno 20. 10. 2026 (commit 85aefea4). E2E `all` run 39456236558 na 2fc27d2: Chromium 133/133, Firefox 135 + 1 (přerušená navigace), WebKit 134 + 1 (narrow-fields-290 zoom 0.7) + 1 nestabilní známé.
- Oprava regrese z 2.113.0: klik myší na položku výběru s hledáním v poli nevybíral (commit 2fc27d2; původně patch 2.113.1).

### Historie záznamu (krok 3A)

- [x] RecordHistoryTimeline: režimy, filtr typů, dny, tabulka změn, řádky, automatické přepočty, CS/SK.
- [x] HistoryPanel @deprecated (smazat v příští major).
- [x] Ukázky: ~15 událostí, prázdná, načítání, úzký panel, záložka panelu záznamu.
- [x] Testy chování (5 unit); check:quick.

- Firefox i WebKit: tooltip důvodu zablokované akce lišty gridu po kliknutí (grid-add-actions-13g:86) – v CI stále selhává.
- WebKit: edit-document-eleven:161 (tooltip Ruční kurz); record-dialog-2111:35 vypršení času při kliknutí na „Nový“ (run 39438666270, dříve nestabilní); nestabilní browser-page-errors (accounting-forms), design-three 70 %, document-controls 1200 px 200 %, form-design-two:80, journal-control-height.
- Chromium: nestabilní design-three 70 % / 1280.
- Ukázka řádků dokladu (/components/accounting-lines) se po načtení několik sekund dopočítává (Firefox 8–10 s) – rozdělit na menší ukázky.

## DS 2.113.0 – Panel dokladu (přílohy a poznámky) + Edit dokladu 16

- Vydáno 20. 10. 2026 (commit f613cbc9). E2E run 39438666270 na 1d48e82: Chromium 129 + 1 nestabilní, Firefox 132 + 1 známé selhání, WebKit 125 + 3 selhání (2 známá) + 5 nestabilních.

### Edit dokladu 16

- [x] 1. Štítek nadpisu: centrování na účaří + polovinu x-výšky.
- [x] 2. Zavřít panel vpravo v záhlaví, nikoli v nabídce záložky.
- [x] 3. Zámek VS mění jen uživatel; neodvoditelné číslo zůstává zamčené s varováním.
- [x] 4. Hledatelné výběry: hledání přímo v poli, Tab bez výběru, zachování hodnoty.
- [x] 5. Kalendář: fokus v měsíci, výraznější měsíc a Dnes uprostřed.
- [x] 6. Jednotná výška ovládání lišt při všech zoomech.
- [x] 7. Pokladna: jedno číslo vedle partnera, Popis přes celou šířku.
- [x] 8. Identita bez zalomení, zkracuje se jen název účtu; výpis bez měny v identitě.
- [x] 9. Protiúčet: přepínač v poli, rozpoznání IBAN a ověřený převod CZ.
- [x] Kontroly quick průběžně a full --harness na závěr; bez vydání a bez E2E dávek.

- Ověřeno: check:full --harness 916/916 unit (94 souborů; 22 nových testů), lint 0 chyb / 341 varování, formát a peněžní audit OK. Jediný Chromium spec 4/4; bez pageerror. Katalog 440 → 445 komponent, 902 → 952 props, 0 odebrání. Automatický build OK.
- Odchylka ověření: Firefox/WebKit a plná E2E sada neběžely; potvrzení čeká na GitHub. Package/meta zůstávají 2.112.0, bez vydání.

- Firefox: tooltip důvodu zablokované akce lišty gridu po kliknutí (grid-add-actions-13g:86) – v CI stále selhává.
- WebKit: edit-document-eleven:161 (tooltip Ruční kurz), nestabilní document-controls, journal-control-height, vat-groups.

### Edit dokladu 16 – čtvrté opravné kolo (Firefox)

- [x] Tab z Částky na Kód DPH: zaměření buňky proběhne v jednom snímku (přesun mezi buňkami už nepřekresluje celý editor řádků); test čeká na dokončené načtení stránky místo opakování akcí se 1s sondou.
- [x] vat-code-tab-256, vat-groups a journal-control-height 5× opakovány v Chromiu, Firefoxu i WebKitu; Firefox navíc pod zátěží jako v GitHubu (8 workerů) – bez selhání.
- [x] check:full --harness 919/919, lint 0 chyb, tsc --noEmit bez chyb, build OK; katalog bez ztrát; verze 2.112.0, nevydáno.

### Panel dokladu – přílohy a poznámky (krok 2)


- [x] Obecný RecordSidePanel a RecordPanelTriggers; sdílené sloty formuláře a dialogu.
- [x] AttachmentList a useFileDrop: oprávnění, odebrání/smazání, zdroj, průběh a odmítnuté soubory.
- [x] Zpětně kompatibilní RecordNotes, připnutí a PinnedNoteBar; texty CS/SK.
- [x] DataGrid record-indicators, číselný Excel export, useFollowSelection a MultiSelectionPanel.
- [x] Ukázka Panel záznamu, testy chování a nejvýše jeden Chromium E2E spec.
- [x] Průběžné kontroly quick, katalog a dokumentace; bez vydání a bez změn bodů Firefox/WebKit.

- Ověřeno: 18 nových testů chování; check:full --harness 894/894 unit (88 souborů), lint bez chyb, formát a peněžní audit OK. Jeden nový Chromium spec 1/1; úzké prostředí a zoom 200 %. Katalog 440 → 445 komponent, 902 → 951 props, 0 odebrání. Automatický build OK.
- Neběžela plná E2E sada ani nové Firefox/WebKit kontroly; spustí Claude v GitHubu. Nic nevydáno.

## DS 2.112.0 – Opravy pro Firefox a Safari

- [x] Prověřeno ve Firefoxu / WebKitu: bez pageerror; kruhový import nepotvrzen. Opožděná hydratace při studeném načtení reprodukována, společná produktová výjimka z CI nikoli.
- [x] Opravená identita a centrování Firefoxu, flex obal PartnerSelect při 200 %; tolerance štítků 0,5 px. Design 3 + pageerror 32/32, vsazení Edit 13 2/2.
- [x] Řízené záložky RecordDialog: activeTab / onTabChange, 2 testy chování, props i příklad v katalogu.
- [x] Kontrola pageerror na hlavních ukázkách pro Firefox / WebKit (6/6).
- [x] Quick / full --harness: 876/876 unit, lint 0 chyb, formát OK; katalog 440/900 → 440/902 bez ztrát a bez odebraných referenčních sekcí; verze 2.111.0, nevydáno.
- [ ] Plná E2E sada a potvrzení původní CI regrese – spouští Petr v GitHub Actions; lokálně se společná výjimka nepotvrdila.

## DS 2.111.0 – Dialogy záznamů
- [x] S1–S6 RecordDialog: povinná velikost, ochrana změn, jen pro čtení, error, deleteAction, Ukládám…
- [x] S7 pravidla, S8 ukázka a testy chování
- [x] Opravné kolo po c23a7f35: textové Input jen pro čtení, past fokusu v panelu, busy u lifecycleAction, výběr nově založené zakázky, Chromium spec dialogů.
- [ ] Plná E2E v GitHub Actions – spouští Petr.

## DS 2.110.0 – Design 3
- [x] Druhé opravné kolo po GitHub run 39296790881: body 1–8; pět cílených Chromium speců 29/29 (5,8 min), unit 854/854, lint 0 chyb / 322 varování, full --harness 60,0 s; katalog 470/922 bez ztrát. Verze 2.109.0, bez vydání.
- [x] Opravné kolo po 831f9342: body 1–12; Chromium 13/13 (54,0 s), unit 852/852, lint 0 chyb / 322 varování; full --harness 49,5 s; katalog 470/922 bez ztrát. Hledání překlepu mimo CHANGELOG: 0 výsledků.
- [x] Srovnání vydané verze 2.109.0 a základu 29bdeb24.
- [x] D1 záložky panelu, D2 tlačítka, D3 kalendář.
- [x] D4 štítky a nadpis, D5 identita bez poskočení.
- [x] Ukázka Design 3, unit 847/847 (84 souborů), lint 0 chyb / 322 varování, formát a peněžní kontrola OK; check:full --harness 72,1 s.
- [x] Chromium design-three.spec.ts 10/10; identita 70/100/200 % a šířky 1280/560, centrování štítku a stálý popover. Náhled build OK.
- [x] Katalog proti 29bdeb24: 470 → 470 komponent, 910 → 922 props, bez ztrát.
- [ ] Plná E2E v GitHub Actions včetně Firefox/WebKit – spouští Petr.

## DS 2.109.0 – DPH krok 4B
- [x] Verze srovnána na vydanou 2.108.0 (package.json i meta.version)
- [x] computeVatGroups + unit testy podle DB scénářů
- [x] Zrušen režim s DPH a ruční daň (deprecace), pevná daň se zámkem
- [x] Pomocník Cena s DPH (buňka + detail řádku)
- [x] Rekapitulace DPH se skupinami, úpravy dle dokladu, tolerance, cizí měna
- [x] Patička Součet · Zaokrouhlení · Rozdíl s nabídkou dorovnání
- [x] Showcase, unit, Chromium E2E, katalog, CHANGELOG, system.md
- [x] Druhé opravné kolo: zaokrouhlení ve všech cestách DPH, zaúčtovaný doklad z řádků daně, samovyměření ve skupinách, kurz 0, Zaokrouhlení jen v domácí měně, pomocník 4 desetinná místa
- [x] Stránky ukázek rozděleny; document-field-ids prošel 6/6 třikrát bez zvýšení čekání.
- [x] Třetí opravné kolo T1–T6: samovyměření bez přepisu, přesný kurz/jednotka, prázdné částky bez kurzu, katalog, peněžní editor a kontrolní skript.
- [x] Uzavření třetího kola: check:full --harness 61,1 s; unit 836/836, lint 0 chyb / 322 varování, format OK, peněžní kontrola 174 souborů; katalog 449/890 → 470/910. Chromium vat-groups 4/4 a grid-amount-editor 1/1. Typecheck/build ponechány automatické kontrole Lovable; plná E2E sada neběžela.
- [x] Roztřídění 22 selhání GitHub E2E (run 39244635839): regrese pomocníka v pořadí Tab, smršťování gridů, přetékání lišty; zastaralé testy srovnány, LibreOffice v CI.
- [ ] Plná E2E sada v GitHub Actions po opravě – spouští Petr.


## Nástroje – zrychlení kontrol
- [x] `check:quick` (průběžná) a `check:full` (úplná), ESLint cache
- [x] `check:catalog` místo jednorázových verify-*.py, `.lovable/release-base.json`, `.lovable/catalog-removals.json`
- [x] GitHub Actions E2E (ručně / noc / vydání), Playwright na CI 4 workery, 1 opakování
- [x] První běh GitHub Actions 39228766521: selhal na úložišti unit testů.
- [x] Oprava CI: Bun 1.3.3 přes .bun-version, úložiště happy-dom, Ubuntu 24.04; checkout v7, cache v6, upload-artifact v7 (ověřeno Node 24); check:quick --harness a actionlint prošly, regresní testy 20/20.
- [ ] Opakovaný běh GitHub Actions po opravě: Claude zde nemá dostupné připojení GitHub pro spuštění workflow.

## DS 2.108.0 – Edit dokladu 15
- [x] E1 živý pruh (issues, dedup, titulky, validationActive jen klient, onFieldChange vč. přepínačů a rowId/columnId)
- [x] E2 VS se zámkem – DS jen zobrazuje náhled, ukládá stav vazby
- [x] E3 ukázky totalMode sum
- [x] E4 bez čipu Celkem, home total, Rozepsáno (deprecated + poznámka v katalogu)
- [x] E5 ID partner ručně / IČO / DIČ
- [x] E6 výpis vždy grid pohybů
- [x] E7 zůstatky v jednom řádku, Σ zůstatku na výpise, pořadí při zalamování
- [x] E8 protiúčet na mřížce 20, kód banky s názvem, datum pohybu s vazbou
- [x] Opravné kolo 4: DocumentForm 499 řádků; unit 751/751; lint 0 chyb / 314 varování; Chromium 41/41 včetně id FP/FV/ID/PO/BA a skutečné opravy buňky. Výpisové testy převedeny na posted, limit nezvýšen. Kontrola výšek 5/5 bez změny testu.
- [x] Katalog proti 8db33914: 441/856 → 449/890, žádné ubylé komponenty ani props; CHANGELOG a pravidla aktuální; verze 2.107.0, 2.108.0 nevydáno.
- [x] Automatický build OK; formát všech dotčených zdrojů a katalogu OK.

## Poslední dorovnání 2.105.0 (nevydáno)

- [x] Sjednocen Výdaj; ochrana datumů readOnly/posted/locked/cancelled, reset DUZP při value.id; migrace a hint dorovnány; ContactSelect zkrácení s title; duplicitní přidání CS/SK s důvodem. Unit 681/681; lint 0 chyb / 297 varování; Chromium document-controls 11/11 + edit-document-thirteen 10/10. Katalog 432 komponent / 814 props, původních 432 názvů a 813 props zachováno; CounterpartyField.createDisabledReason doplněn. Verze 2.104.0 / CHANGELOG 2.105.0, nic nevydáno.

## Edit dokladu 14 – opravné kolo po kontrole (2.105.0, nevydáno)

- [x] 1 S9: vazby dat zapisují odvozené hodnoty přes onChange; reset při změně value.id; test.
- [x] 2 S1: žádný text pod polem (externí číslo, detail řádku); chyby do pruhu; vatRateMissing jednou.
- [x] 3 S5: tooltip u každé akce RecordActionBar, ⋯ přes Tooltip; levý obsah nepřekryje akce.
- [x] Před vydáním: měřicí kopie jako neinteraktivní prvky uvnitř odsazení lišty; měření odečítá skutečné odsazení a mezeru. Příjem/Výdaj v úzkém výpisu přejdou pod sebe bez zalomení textu. Očekávání testu zachována, selektor rozestupu míří na skutečné akce. Chromium 30/30 (celé edit-document-thirteen, bank-statement-form, document-controls, grid-add-actions-13g); unit 670/670; lint 0 chyb / 297 varování; formát a automatická sestava OK. Katalog 432 komponent / 813 props; obě verze 2.104.0, CHANGELOG 2.105.0. Jednotná výška odložena, nic nevydáno.
- [x] 4 S6: ＋ v hledání u CounterpartyField a TagPicker; UnitSelect důvod; typy (searchText).
- [x] 5 S7: popover protistrany ds-select-popover; CategorySelect rem; ContactSelect jednořádkově.
- [x] 6 Texty protiúčtu, TaxDocumentNumberField odsazení, protiúčet pohybu dle editableFields.
- [x] 7 „Výdaj“ v e2e, system.md, katalogu a komentáři.
- [x] 8 Počet kopií StepperInput; víceciferné psaní.
- [x] 9 Katalog: obnovit plné popisy proti 9fa377ff, výčty, upstream_package; ověření programem.
- (odloženo) Plán DS 2.105.0 jednotná výška a chyby bez změny výšky – čeká na schválení.

## Edit dokladu 14 – 2.105.0 (nevydáno)

- Ověření: unit 668/668; Chromium 19/19 v cílených bězích (matice 10, výpis 5, regrese 3, nový výpis 1), radio Firefox/WebKit 2/2; lint 0 chyb / 298 varování. Ruční typy/build neprovedeny dle omezení, automatická kontrola OK.
- Katalog: 432 komponent, všech 430 původních názvů; 813 props. Manifest 532 → 543 bez odstranění původních cest. Původní manifest obsahuje 38 náhledových cest, zachovány podle výslovného zákazu mazání; attach je nadále vylučuje přes .dsignore.

- [x] S1–S2: jednotné výstrahy uvnitř polí a stálá geometrie součtu.
- [x] S3–S4: StepperInput 1–5 v nastavení a měřené vystředění radio.
- [x] S5: měřená kaskáda akcí formulářů, text → sekundární ikony → Uložit ikona.
- [x] S6–S8: přidání v hledání, šířky nabídek a rychlé/relativní datumové volby.
- [x] S9–S10: rozložení a vazby dokladů, bankovní pohyb a nový výpis.
- [x] Ukázky CS/SK, testy chování a geometrie, lint a katalogy bez ztrát.
- [x] CHANGELOG 2.105.0 s migrací změněných props; obě verze srovnat na poslední vydanou 2.104.0 podle schválení, nic nevydávat.

## DS 2.104.0 – Edit dokladu 13j–13l

- [x] 13l: geometrie, Uložit, zámky, tooltipy a přístupné názvy; katalog proti 1131b2b4 beze ztrát.
- [x] 13l: Chromium 19/19 v dílčích konečných bězích, široký/úzký i CS/SK 70–200 %; lint 0/292, unit 660/660, formát a automatická sestava OK. Tsgo zakázáno prostředím; verze 2.103.0, bez Release.

- [x] 13k: textové Uložit ve všech šířkách, číslo v identitě, odstranit poznámku.
- [x] 13k: základní údaje a nenulový rozdíl, zůstatky dle pohybů, vysvětlení kontroly CS/SK.
- [x] 13k: katalogy 429 → 430 / props 759 → 764 beze ztrát; manifest 526 → 508 dle .dsignore; migrace BREAKING.
- [x] 13k: unit 660/660, lint 0 chyb / 293 varování, E2E Chromium 5/5 (3 nové + 2 regresní), formát dotčených souborů OK, automatická sestava OK.
- 13k: samostatné tsgo/build neprovedeny kvůli nadřazenému zákazu prostředí; verze obou míst 2.103.0, bez Release.

- [x] RecordActionBar, GridAddActions, RecordDialog lifecycle: zablokovaná akce s důvodem = aria-disabled + tooltip i klepnutím/Enter.
- [x] Položky nabídek s důvodem: druhý řádek místo tooltipu (DisabledReasonMenuItem).
- [x] Testy: unit 656/656, E2E Chromium 4/4; tsgo 0, lint 0 chyb; katalog 429 komponent / 759 props beze ztrát.

## DS 2.100.0 – Edit dokladu 13e (bez vydání)

- [x] Sjednotit pravidlo zkrácených popisků, opravit překrytí prvního řádku a obnovit tvrzení šířky pole.
- [x] Unit 639/639; E2E 60/60 jedinečných scénářů (57 v prvním běhu + 3 po zpřesnění tlačítka Zpět); všechny tři prohlížeče, retries=0.
- [x] Lint 0 chyb / 293 varování; formát OK; katalogy 429 → 429 proti dae1b93b, pouze doplněný archivovaný plán v manifestu.
- [x] Doplnit pravdivé výsledky a kontrolní tabulku; verze 2.100.0, bez Release. Ruční tsc/typecheck/build neprovedeny dle omezení prostředí.

## DS 2.100.0 – Edit dokladu 13d (bez vydání)

- [x] Obnovit popisky a velikost Switch, zpřístupnit všechny hodnoty výpisu, upravit mřížku a ukázku.
- [x] Unit 636/636; E2E 48/48 jedním čistým během (16 na prohlížeč, retries=0; datumová vazba ponechává toPass 60 s); lint 0 chyb / 293 varování; formát OK.
- [x] Katalogy proti 98810718: 426 → 429, odstraněné 0, 416 shodných; props 722 → 758, odstraněné 0; manifest 505 → 518.
- [x] CHANGELOG obsahuje kontrolní tabulku a pravdivé výsledky; verze 2.100.0, bez Release.
- [ ] Ruční tsc/typecheck: blokováno nadřazeným zákazem prostředí, neprovedeno.

## DS 2.100.0 – Edit dokladu 13c (bez vydání)

- [x] Obnovit vydaný vzhled ND, společné rozvržení, datumové měření a dostupné důvody.
- [x] Unit 636/636; E2E 45/45 unikátních scénářů v rozdělených bězích a opakováních; lint 0 chyb / 293 varování; formát OK.
- [x] Katalogy 426 → 429, odstraněné 0; 417 shodných objektů; props 722 → 758, odstraněné 0; manifest 505 → 519.
- [x] CHANGELOG: migrace, pravdivá kontrolní tabulka, omezení typové kontroly; verze 2.100.0 bez Release.
- [ ] Ruční tsc: blokováno nadřazeným zákazem prostředí, neprovedeno.

## DS 2.100.0 – Edit dokladu 13b (bez vydání)

- [x] Opravit body 1–13, zachovat chování mimo zadání; verze 2.100.0.
- [x] Unit 633/633; E2E 39/39 (13 na prohlížeč); lint 0 chyb / 293 varování; formát OK.
- [x] Katalogy proti 98810718: 426 → 429, odstraněné 0, 419 shodných; props 722 → 757, odstraněné 0, tři povolené změny, 35 nových řádků.
- [x] CHANGELOG obsahuje migraci BREAKING a kontrolní tabulku; Release neproběhl.
- [ ] `tsc --noEmit`: blokováno pravidly prostředí zakazujícími ruční typové kontroly; nelze vykázat úspěch.

## DS 2.100.0 – Edit dokladu 13 (bez vydání)
- [x] D1–D3: společný přepínač a převod protistrany, příkazu, součtu a našeptávače.
- [x] D4: dostupné zamčení ND a vazby data bez změny geometrie.
- [x] D5: formulář bankovního výpisu a ukázky.
- [x] D6: unit 631/631; E2E 30/30 (10 na prohlížeč), lint 0 chyb / 293 varování;
  formát OK, automatický build OK. Katalogy 426 → 428, odstraněné 0,
  šest změněných a 420 bajtově shodných komponent; manifest bez ztrát, #enrichment zachován.
  Samostatný typecheck/build se dle omezení nespouští; Release neproběhl.

## DS 2.99.0 – Edit dokladu 12i
- [x] Odlišit zamčenou vybranou segmentovou volbu a porovnat s povolenou.
- [x] Ověřit rámečky lišty bez neohlášených změn CSS.
- [x] Unit 617/617, E2E 30/30 ve třech prohlížečích, lint 0 chyb / 293 varování;
  cílené katalogy 426 ×4 proti 082c0b07. Ruční tsc/typecheck prostředí nepovoluje.

## DS 2.97.0 – Edit dokladu 12h (nevydáno)
- [x] Obnovit aktivní a hover stav lišt a odlišit zakázanou vybranou volbu.
- [x] Zachovat přístupný součet, opravit kurz a doplnit úplná měření polí.
- [x] Unit, tři prohlížeče, lint a cílený bajtový důkaz katalogů.

## DS 2.97.0 – Edit dokladu 12g (nevydáno)
- [x] Úplná inventura zakázaných výběrů, tlumený čitelný text a stavové rámečky.
- [x] Sjednocené písmo částky a úplné testy formuláře ve třech prohlížečích.
- [x] Cílené katalogy, manifest, chronologie a důkaz všech sekcí proti b27379e4.

## DS 2.97.0 – Edit dokladu 12f (nevydáno)
- [x] Odolné účty a hledání, jednotný zakázaný vzhled s kontrastem.
- [x] Ohraničené měření datumů a testy ve třech prohlížečích.
- [x] Opravit dokumentaci a doložit všechny sekce a katalogy vůči b27379e4.

## DS 2.97.0 – Edit dokladu 12e (nevydáno)
- [x] Částka, kurzy a měna ve standardní výšce; součet tučný se standardním písmem.
- [x] Ukázka a ověření při 100 / 150 / 200 %, ruční i odvozený součet.
- [x] Unit, E2E, lint, cílené katalogy a přehled změn.

## DS 2.97.0 – Edit dokladu 12d (nevydáno)
- [x] Společný zakázaný Input: stejný podklad jako zamčený datum, bez nové barvy.
- [x] Ověřit KS/SS, ostatní vstupy a světlý/tmavý režim.
- [x] Unit 612/612, související E2E 18/18, lint 0 chyb / 294 varování; formát a automatický build OK.
- [x] Cílené katalogy, seznam změn; verze 2.97.0 nevydaná.

## DS 2.97.0 – Edit dokladu 12c (nevydáno)
- [x] Šipka účtu při 100/200 %, filtrování účtů a formátované hledání IBAN.
- [x] Stabilní izomorfní měření, delší datumové popisky v úzkém panelu.
- [x] Dokumentace API, cílené katalogy, vysvětlení metadat nesouvisející stránky.
- [x] Unit 612/612; E2E 15/15 (5 v každém prohlížeči); lint 0 chyb / 293 varování;
  formát a automatický build OK. Samostatný typecheck prostředí nepovoluje.

## DS 2.97.0 – Edit dokladu 12b (nevydáno)
- [x] Standardní písmo, aktivní formát, delší popisky a tabulka měření.
- [x] Přístupná jména zamčených KS/SS a účty pouze s IBAN.
- [x] Cílené katalogy proti b27379e4, manifest a dokumentace.
- [x] Unit, Chromium/Firefox/WebKit, lint, formát; samostatný typecheck zakázán prostředím.

## DS 2.96.0 – oprava kontroly b632d10b (nevydáno)
- [x] Obnovit katalogy proti fbeae823 a doložit nedotčené záznamy.
- [x] Jednotná geometrie ikon a datumů, zalamování bez rolování, CS/SK měření.
- [x] Přístupné zamčené symboly, hover a regresní testy FV/ZFV/DDPOZ.
- [x] Unit, související e2e, lint, oprava CHANGELOG a manifestu.

## DS 2.94.0 – Edit dokladu 11 (nevydáno)
- [x] A1 ikony menu; A2 tooltipy a stav kurzů
- [x] A3/A4 společné zamčené účty a priorita způsobu platby
- [x] A5 rozvržení přijatých dokladů a ukázky
- [x] Kontrola edb1cd4a: všechny čtyři katalogy mají 426→426 komponent, žádný název nezmizel; původní bloky z 546e5737 obnoveny doslova.
- [x] Přístupný zamčený přepínač, společný důvod jen FP/ZFP, vyčištění validace, žádné dvojí tooltipy.
- [x] Unit 589/589; související e2e 9/9 (3 Chromium, 3 Firefox, 3 WebKit; poslední WebKit po opravě čekání na zavírací animaci). Lint 0 chyb / 293 varování; formát a automatický build OK; nevydáno.
- [ ] Samostatný výsledek automatického typechecku není dostupný;
  ruční spuštění kontrolní prostředí nepovoluje.

## DS 2.92.0 – Design formulářů 2 (nevydáno)
- [x] Kurzy vlevo, pod celkem v úzkém panelu; RateField zarovnání
- [x] Přepočtený celek v hlavičce rekapitulace
- [x] FV/ZFV způsob platby nahoře vedle účtu
- [x] Čtyři varianty potvrzení odchodu, CS/SK, ochrana při chybě
- [x] Ukázky, chování a související e2e ve třech prohlížečích
- [x] Metadata přírůstkově, verze package 2.92.0; bez vydání
- [x] Závěrečné kontroly: 574/574 unit, 6/6 souvisejících e2e, lint 0 chyb, formát OK; harness typecheck/build OK

## DS 2.90.0 – Design formulářů
- [x] Pořadí účtu a čísla přijatého dokladu, lícování a Tab
- [x] Výzva účtu bez dodavatele uvnitř pole
- [x] Křížek a šipka všech výběrů bez překrytí
- [x] Pevná měna rozměrově shodná s výběrem
- [x] Input.formatPattern, pravidla a CS/SK
- [x] Ukázky, testy, zoom 70–200 %, lint a ověření
- [x] Sjednotit verzi 2.90.0 a CHANGELOG; nevydávat

## DS 2.85.0 – Edit dokladu 9 + obecná pravidla
- [x] Drobnosti z DOM měření: zarovnání checkboxů, radius ghost/ikon, prázdné datum stavu
- [x] Opravy po kontrole Clauda: body 1–18, rozdělení formuláře a ukázky pod 500 řádků
- [x] Poslední kontrola 2.85.0: pravidla, datum, platební checkbox, šířka Ř., ukázky, výběry a společné DOM testů
- [x] A1–A8: společné formátování kódů, prázdná pole, radius, volby, datumy a akce
- [x] A: ukázka zaoblení, pravidla, BREAKING dokumentace a behavior testy
- [x] B9–B19: pořadí sekcí, částka, datumy, rekapitulace, řádky, DPH a platební údaje
- [x] B20: hotové záložky Odběratel a Tiskové údaje včetně řízených hodnot
- [x] B21: ukázky FV CZK/EUR, FP, PO a ID; kontrola zoomů a úzkého panelu
- [x] Verze 2.85.0, format, typecheck, lint bez chyb, testy a build; Release neprovádět

## DS 2.84.0 – dialogy záznamů
- [ ] Opravit ukázky A–D přesně podle kontroly v náhledu
- [ ] Ověřit shodné pozice ovládání a svislice FieldTable / FieldGrid v DOM
- [ ] Opravit lint chyby celého projektu nebo přesně doložit jejich původ
- [x] Jednotný token výšky a shodné ikony výběrů
- [x] FieldValue, CheckboxField, FieldGrid, SectionHeading a GridSegmentedToggle
- [x] RecordDialog: velikosti, titulkové štítky, jedna/stabilní záložka
- [x] Nové FieldTable a MaskInput včetně CS/SK textů
- [x] Čtyři dialogové ukázky a zobrazení mřížky
- [x] Pravidla, CHANGELOG, verze 2.84.0 a úplné kontroly
## DS 2.83.0 – Úklid 5b + 5d + 5e
- [x] Behavior testy DataGrid / TreeGrid / AppShell proti dnešnímu kódu
- [x] GridFrame, useRowActions, GridBaseProps; doménová ID sloupců jako exportované výchozí konstanty
- [x] Virtualizace pro paginated={false} (test 5 000 řádků, výběr, groupTotals, sticky hlavička)
- [x] AppShell: useGlobalShortcuts (1 posluchač), efekty se závislostmi, rozdělení na části ≤ 500 ř.
- [x] CHANGELOG 2.83.0, kontroly
## DS 2.83.0 – Úklid 5a + 5c
- [x] Behavior testy editoru řádků proti původnímu kódu, rozdělení JournalLinesEditor beze změny API
- [x] Texty editoru do DsTexts (CS + SK), ds-texts rozdělen na cs / sk / types / index
- [x] useDialogBackClose bezpečný ve StrictMode (test)
- [x] RecordDialog: vnořený submit neodešle vnější formulář (test i s editorem a DocumentForm)
## DS 2.82.0 – Úklid 1C: pojistky kvality
- [x] Skripty test a typecheck (tsgo přes @typescript/native-preview), test grid-toolbar na bun:test
- [x] ESLint pravidla; any / as unknown as / as never v src opraveny typem, kde to šlo bez změny logiky
- [x] CHANGELOG.md vyčleněn z README a system.md, seřazen, doplněny 2.70–2.80
- [x] GridExport.fileName + zastaralý alias fijename; smazán soubor null
- [x] Pravidla kvality v src/components/ds/AGENTS.md + odkaz v kořenovém AGENTS.md
## DS 2.73.0 – Edit dokladu 8 a panely
- [x] Zapracovat kontrolu commit 3e0e121c: VS, měna, úzké rozložení, datumy, bankovní účet, changelog a regresní testy
- [x] Upravit částky, měnu, datumy a pořadí sekcí dokladu; živá varování řadit podle polí
- [x] Přidat BankAccountField bez samovolného předvyplnění a automatické VS
- [x] Rozšířit české/slovenské texty a ukázky
- [x] Opravit titulek, tooltip, varování a odznaky AppShellu
- [x] Doplnit veřejné exporty, dokumentaci, katalog a verzi 2.73.0
- [x] Doplnit a spustit testy, typy, sestavení a vizuální kontrolu
## Verze 2.71.0 – AppShell panely a rozsah platnosti

- [x] Přeskládat panelové menu a pevný řádek panelu včetně mobilního pořadí.
- [x] Přidat šedý tón panelových menu, tokeny a čitelné stavy v obou motivech.
- [x] Přidat řízené části panelu a rozsahy company / workspace / platform bez narušení měření horní lišty.
- [x] Upravit skupiny, hledání a součty odznaků.
- [x] Doplnit ukázky, dokumentaci, katalog a verzi 2.71.0; Release neprovádět.
- [x] Opravy po kontrole kódu 2.71.0 (body 1–14).
- [x] Doplnit testy a ověřit všechny testy, typy, sestavení a požadované viewporty/zoom.

## Verze 2.70.0 – oprava zoomu aplikace (reklamace)
- [x] Zkratky Cmd (Mac) / Ctrl + plus / minus / 0 podle `event.key`, i v polích; BREAKING: Ctrl+Alt zrušeno.
- [x] Ctrl/Cmd + kolečko podle polohy: grid × aplikace; otevřený nativní `<select>` se nezachytává.
- [x] Automat gridů nekompenzuje zoom aplikace; kaskáda editoru řádků se přepočítá po každé změně zoomu aplikace; ruční zoom gridu zůstává.
- [x] Testy se skutečnými událostmi v AppShell, dokumentace a ukázka.
- [x] Opravit vnitřní šířku, pořadí kaskáda → zoom → rolování a auto zoom DataGrid/TreeGrid podle zoomu aplikace.
- [ ] Doplnit regresní testy a Playwright matici 2 gridy × 5 šířek × 5 zoomů.

## Verze 2.68.0 – opravy po kontrole kódu
- [x] Změna hlavního účtu jen z neprázdných `mainAccountOptions`; popisek svázaný s `value.mainAccountId`.
- [x] Návrat fokusu na „Změnit účet“, zaměřitelná zamčená tužka, `AccountSelect.ariaLabel` „Hlavní účet“.
- [x] `internal` nikdy nevykreslí účet; dvojice Celkem + Měna na vlastním řádku bez přetečení.
- [x] Měna: ve spouštěči kód, v nabídce „kód - název“ (`SelectOption.selectedLabel`).
- [x] Úklid: `SideBadge`, mrtvé texty, `documentIdentityVariantForType` v `document-fields.ts` (re-export zůstává).
- [x] Obnovená ukázka formulářů včetně gridu se skrytým seskupením; osm stavů hlavičky jako samostatná sekce.
- [x] Nové testy (337/337), typy.
- [x] Druhá kontrola: nezkracované Celkem s nápovědou pod polem, zalamování měny, nový popisek účtu z aplikace, úplný seznam BREAKING změn a opravená FP ukázka.


## Verze 2.62.0 (sjednocení formulářů karty záznamu)

- [x] Společný vzhled `Field` pro karty a účetní doklady včetně hintu, chyby a `FieldValue`.
- [x] `CheckboxField` zarovnaný k prvnímu řádku víceřádkového popisku.
- [x] Nový obecný `RecordActionBar`; `DocumentForm` jej používá interně.
- [x] Ukázka karty majetku a závazná pravidla skládání karet.

## Verze 2.61.0 (centrální texty a slovenština)

- Nové exporty `DsTextsProvider`, `useDsTexts`, `DsTexts`, `DS_TEXTS_CS` a `DS_TEXTS_SK`; bez provideru zůstávají české výchozí texty.
- `SlivkaProvider` přijímá volitelné `locale` a `texts`. Lokální props komponent mají prioritu před providerem.
- `locale` sjednocuje kalendáře, `Intl`, tisk/export a slovní vyjádření částek.
- Slovenská aplikace nastaví v kořeni `<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">`.
## Verze 2.60.0 (párování P2b – část B)
- [x] DocumentForm: `titleBadges`, `notices`, `readOnlyTitle` a `readOnlyActions` v pevném pořadí pruhů.
- [x] Nový `NoticeBar` se čtyřmi tóny, akcemi, zavřením a interakčními testy.
- [x] DataGrid: popisek skrytého seskupovacího sloupce v čipu i záhlaví skupiny.
- [x] Ukázky, katalog, pravidla, všechny testy, typy, produkční build a vizuální kontrola.

## Verze 2.58.0 (párování P2a – část B)
- [x] groupTotals, řízený výběr, sumSelected, editor + GridAmountEditor, ukázka Saldokonto / Párování.

## Verze 2.57.1 (výchozí kód DPH nového řádku)
- [x] Nový řádek přebírá kód DPH z předchozího řádku, teprve pak výchozí kód knihy (`makeLine`); bez změny API.

## Verze 2.57.0 (opravy editoru řádků s DPH)
- [x] Samovyměření v režimu S DPH, nárok u samovyměření, opožděný výchozí kód, neaktivní přepínač při readOnly, hláška chybějícího kurzu DPH, předběžné Kurzové zaokrouhlení.
- [ ] Tisk a export do Excelu s DPH (dříve odloženo).

## Verze 2.56.0 (opravy po prokliku DPH)
- [x] Celkem za doklad z rozpisu = celek editoru včetně předběžné daně (`computeJournalTotals`, `onTotalsChange`)
- [x] Odznak Řádky jen z řádků v gridu
- [x] Tab z Částky na Kód DPH a psaní otevře výběr
- [x] Kurz DPH v sekci Částka (`vatRateField`)
- [x] Nastavení dokladu: Zadávat částky Bez DPH / S DPH (`showVatCalcMode`)

## Verze 2.55.0 (DPH v editoru řádků dokladu – krok 2, část B)
- [x] Datový model DPH na řádku, `toJournalRow(s)`, `fromJournalRow`
- [x] Předběžný výpočet daně (`journal-vat.ts`) – FV, FP, ruční daň, PDP, bez nároku, poměrný, S DPH, cizí měna
- [x] Editor: sloupce, přepínač Bez / S DPH, detail, kontroly, předběžná daň v součtech (DB řádky jen u dokladu jen ke čtení)
- [x] Rekapitulace – záložka DPH
- [x] Výběr Kódu DPH v gridu se otevírá hned při editaci a psaní filtruje podle kódu i názvu (`VatCodeSelect`)
- [x] Značky měn z dat v rekapitulaci DPH; patička odděluje základ, DPH a celek a při skrytém celku jej ukazuje v liště
- [x] Ukázka Účetní formuláře a testy
- [ ] Později: DPH v tisku dokladu a v exportu do Excelu (v 2.55.0 záměrně neřešeno)
- [ ] Vydání (Release) a Update v aplikaci – provede Petr

## Verze 2.54.0 (grid řádků dokladu a nezalamování nadpisů)
- [x] Nezalamování nadpisů a popisků ve sdílených formulářových prvcích
- [x] Pružná sekce Datumy s DPH daty vpravo
- [x] Sloupec Ř., přidání řádku, fokus a chyby buněk editoru
- [x] Měnové popisky, jednořádkový detail a onValidationChange
- [x] Testy, katalog, changelog a vizuální kontrola

## Verze 2.53.0 (rolování menu a panelů, zoom per záložka)
- [x] Omezit AppShell na výšku okna a oddělit rolování menu, main a panelů
- [x] Přidat PageLayout list/form a výšku gridů fill/auto podle rodiče
- [x] Uložit zoom a hustotu po instanci a záložce přes GridPreferencesProvider
- [x] Upravit editor řádků, sticky prvky, tisk a obnovu pozice rolování
- [x] Rozšířit PaneShowcase a ověřit A10 včetně tisku a nízkého okna
- [x] Doplnit testy, katalog, pravidla a changelog
- [x] Druhá kontrola: BREAKING migrace v dokumentaci, useGridVirtual z PageLayout, stabilní ref callbacky, šířky sloupců bez dvojího zoomu, min. šířka Textu, PageHeader vs. pruh akcí, úklid klíčů rolování

## Verze 2.52.0 (Partneři D, část B)
- [x] Přidat FieldValue pro popsané hodnoty jen ke čtení
- [x] Přidat SegmentedField pro volbu 2–3 typů záznamu
- [x] Rozšířit FieldGrid na 12 sloupců a Field o řízený span
- [x] Doplnit vlastní text prázdné hodnoty OptionSelect
- [x] Přestavět ukázku karty partnera podle schváleného rozvržení
- [x] Doplnit katalog a pravidla
- [ ] Dokončit testy a vizuální kontrolu

## Verze 2.51.0 (tisk pokladního dokladu podle nastavení)
- [x] Rozšířit počet kopií pokladního dokladu na 1–5 a skládat je po dvou na A4
- [x] Přidat volitelný tisk čísla dokladu (printNumber, výchozí true)
- [x] Předat výchozí hodnoty dialogu přes defaultCopies / defaultTwoPerPage / defaultPrintNumber
- [x] Doplnit testy a changelog

## Verze 2.49.0 (doplnění editace dokladu 7, část B)
- [x] Dokončit výchozí Zakázku, množstevní sloupce, dvouřádkový detail a sbalování režimu shared
- [x] Převést texty chybového pruhu a název účtu na veřejné texty a Tooltip
- [x] Prověřit celý repozitář na samostatný popisek IČ
- [x] Doplnit volbu zobrazení účtu v gridu a do nastavení dokladu
- [x] Zpřístupnit Zakázku ve Sloupcích a chránit ručně zapnuté sloupce před automatickým sbalením
- [x] Přestavět detail řádku na pružné jedno- až dvouřádkové rozložení
- [x] Přidat jednotný chybový pruh formuláře a pravidlo použití
- [x] Sjednotit uživatelské popisky na IČO
- [x] Doplnit testy, dokumentaci a vizuální kontrolu 560 / 1 280 / 1 920 px

## Verze 2.48.0 (edit dokladu 7, část B)
- [x] Zarovnat identitu, DPH data a jednořádkové nápovědy
- [x] Upravit řádkovou buňku, prázdné hodnoty, Nedaňový a přidání řádku
- [x] Sjednotit Enter / Tab navigaci a prázdné řádky s `isBlank`
- [x] Zobrazit značku měny a přidat `DocumentSettingsDialog`
- [x] Doplnit testy, dokumentaci, ukázku a vizuální kontrolu 560 / 1 280 / 1 920 px

## Verze 2.46.0 (Partneři, část B)
- [x] LookupField a IcoField s digitsOnly
- [x] CheckboxField, CheckboxGroup, SwitchField, SettingsSection a pravidlo v system.md
- [x] DocumentForm CheckboxField, AddressFieldGrid Mapa
- [x] Bankovní účet a IBAN, VatStatusBadge
- [x] Stav záznamu Aktivní / Neaktivní v dialogu, gridu a výběrech
- [x] Testy, ukázka Partneři, vizuální kontrola, verze 2.46.0

## Verze 2.44.0 (doplnění editace dokladu 6)
- [x] Zobrazit popisek období pod Datem DPH s předností výstrahy podaného období
- [x] Předat varování k jednotlivým datovým polím formuláře dokladu
- [x] Tisknout měnové značky v pokladním dokladu s návratem ke kódu měny
- [x] Doplnit ukázku, testy, dokumentaci a verzi 2.44.0

## Verze 2.43.0 (edit dokladu 6, část B)
- [x] Opravit in-place editaci, navigaci a automatické otevření výběrů v řádcích
- [x] Přestavět sloupce, detail řádku, sticky Akce a přepínač Nedaňový
- [x] Upravit rekapitulaci, formulář dokladu, Datum DPH a měnové značky
- [x] Změnit LegalFormField, záložky panelů, české texty a dokumentaci
- [x] Dokončit typy, lint, testy, build a vizuální matici

## Verze 2.41.0 (Vstupuje do DPH)
- [x] DocumentForm: doplnit řízený přepínač `vat.relevant` včetně režimu jen pro čtení
- [x] Skrýt DUZP a Období DPH při vypnutém příznaku bez mazání hodnot a zachovat dosavadní chování bez handleru
- [x] Doplnit ukázku plátce zapnuto / plátce vypnuto / neplátce
- [x] Aktualizovat testy, dokumentaci, katalog a verzi 2.41.0; odstranit `upstream_versions` z meta
- [x] Ověřit typy, lint, všechny testy a build

## Verze 2.40.0 (kontext panelů a detail jen pro čtení)
- [x] AppShell: badge a context v hlavičce panelu pro Administraci, Nastavení prostoru a Nastavení firmy
- [x] RecordDialog: režim readOnly se záložkami a pouze akcí Zavřít
- [x] StatusBadge: accent a ukázkové stavy uživatelů
- [x] Navigace: tři panely, grid Uživatelé a detail prostoru se třemi gridovými záložkami
- [x] Dokumentace, katalog, changelog, verze 2.40.0 a lokální meta bez upstream_versions
- [x] Typy, lint, build, testy a vizuální kontrola 1 280 / 560 px, světlý / tmavý, sbalené menu

## Verze 2.38.0 (data a období DPH na dokladu)
- [x] Přidat řízený zámek svázaného data do DateField
- [x] Přesunout DUZP a Období DPH vpravo v sekci Data
- [x] Doplnit podaná období, neplátce, ukázky, testy a dokumentaci

## Verze 2.36.0 (limit haléřového vyrovnání)
- [x] DocumentForm: prop `roundingLimit` (výchozí 1,00) a `roundingLabel` předávané do `JournalLinesEditor` jako `rounding.limit` / `rounding.label`
- [x] Changelog, components.md a test

## Verze 2.35.0 (edit dokladu 5) – dříve 2.34.0
- [x] Sjednotit typografii formuláře, sekcí, editoru a rekapitulace v rem
- [x] Upravit částku, kurz, měny a ovládání Σ
- [x] Přepracovat sloupce, vyrovnání, součty a řazení řádků
- [x] Přidat množství, měrné jednotky a cenu za MJ
- [x] Řídit stav rekapitulace aplikací a opravit její měny
- [x] Doplnit ukázky, testy, dokumentaci a verzi 2.35.0

## Verze 2.32.0 (edit dokladu 4 a jednotná lišta gridu)
- [x] Sjednotit rámečky akcí ve všech gridových lištách
- [x] Opravit seznam partnerů a přidat SuggestInput
- [x] Rozšířit DocumentForm o našeptávání, ruční Celkem a štítky MD/DAL
- [x] Doplnit JournalLinesEditor o horní lištu, hledání, patu a rekapitulace
- [x] Upravit ukázky, testy, dokumentaci a verzi 2.32.0

## Verze 2.31.0 (rozvržení údajů DocumentForm)
- [x] Zmenšit badge směru, vystředit identitu a odstranit linku pruhu akcí
- [x] Zavést mřížku 70 / 15 / 15 a přeuspořádat partnera, data, částku a platební údaje
- [x] Rozšířit hlavičku o IČO, DIČ a předávajícího včetně propojení partnera
- [x] Zvýraznit identifikační řádek a sjednotit výšku badge směru a stavu
- [x] Přesunout haléřové vyrovnání do lišty řádků vedle zbývající částky
- [x] Upravit ukázky, testy, changelog a verzi 2.31.0
- [x] Ověřit všechny testy, typy, lint, build a vzhled 1 280 px / 560 px ve světlém i tmavém režimu

## Verze 2.30.0 (identita dokladu v těle formuláře; dříve 2.28.1)
- [x] Vrátit vždy viditelný nadpis stránky a přesunout identitu se směrem do karty
- [x] Přesunout stav vlevo v pruhu akcí a zachovat veřejné API
- [x] Upravit ukázky, testy, dokumentaci a verzi 2.30.0
- [x] Ověřit typy, lint, testy, build a šířky 1 280 px / 560 px

## Verze 2.27.0 (tisk gridu do PDF)

- [x] Tisk (PDF)… v DataGrid a TreeGrid, parametry z kontextu, orientace, velké objemy, ukázky, testy

## Verze 2.26.1 (opravy částek slovy, PDF a pruhu dokladu)
- [x] Opravit skloňování, haléře, zaokrouhlení, cizí měny a miliardy v amountInWordsCs
- [x] Upravit pokladní doklad bez ztráty řádků, s dynamickou A4 a zápatím každé kopie
- [x] Opravit číslování, logo a vlastní sekce tiskových sestav
- [x] Upravit zakázané akce, měření úzkého pruhu a odstranit duplicitní stav z panelu
- [x] Ověřit typy, lint, testy, build a vizuálně požadované PDF


## Verze 2.26.0 (akce dokladu a tiskové PDF)
- [x] Přidat trvale viditelný pruh akcí DocumentForm a klávesovou zkratku Uložit
- [x] Zobrazit přeložitelné záhlaví Akce v DataGrid a TreeGrid
- [x] Přidat tiskové jádro, náhled PDF a český převod částek slovy
- [x] Přidat šablonu a dialog Pokladní doklad
- [x] Doplnit stránku Tisk, testy, dokumentaci a ověření PDF
# Roadmap

## 2.96.0 – Edit dokladu 12 (nevydáno)
- [x] D1: shodná kompaktní datumová pole, nerozdělitelná dvojice DPH; měření před/po při 70–200 %.
- [x] D2: KS/SS vždy viditelné, při nepoužité platbě prázdné a zakázané s důvodem; bez mazání dat.
- [x] Přírůstkové katalogy, otisky pouze změněných zdrojů, CHANGELOG a související kontroly.

- [x] 597/597 unit, lint 0 chyb / 292 varování, související e2e 7/7 v posledních samostatných bězích; automatický typecheck/build OK. Samostatné tsc nebylo povoleno.
- [ ] Speciální #enrichment: algoritmus pipeline není dostupný, původní SHA-256 zůstal zachován.

## Verze 2.25.0 (protistrana v DocumentForm)
- [x] CounterpartyField, counterpartyName, homeCurrency, currencyLocked, ID s protistranou, testy, ukázky

## Verze 2.24.2 (měření řádku akcí)
- [x] Měřicí kopie řádku akcí uvnitř kontejneru gridu (správné container queries, Obnovit se neořízne).
- [x] Pod 640 px: hledání s textem se v úrovni 3 zúží, nic se nevytlačí.
- [x] Doplňky levé části (Stav k datu, toolbarLeft, Tabulka/Strom) se v úrovni 3 nevykreslují v řádku – bez duplicitních id.
- [x] Kopie se nepřestavuje při psaní v hledání, jen při změně nástrojů/stavů, zoomu, hustoty nebo velikosti.

## Verze 2.24.1 (bezeztrátová adaptivní lišta)
- [x] Přesunout hlavní parametry a Stav k datu na úrovni 3 do jediné nabídky
- [x] Zachovat Přidat, hledání a Obnovit v jednom řádku od šířky 360 px
- [x] Měřit skryté skupiny a skutečné mezery nezávisle na aktuální úrovni
- [x] Doplnit DOM testy pořadí, oddělovačů, hystereze a krajních šířek

## Verze 2.23.2 (dokončení adaptivního řádku akcí)
- [x] Výpočet úrovně z přirozených šířek včetně kompaktního Přidat a hledání
- [x] Hystereze 16 px, žádné ořezávání ani vodorovný posuvník, jedno `⋯`, Obnovit vždy vpravo
- [x] Čtvercový neaktivní Filtr, shodná výška záložek a zkrácený YTD popisek
- [x] Obnovené testy pořadí, oddělovačů a čistého výpočtu úrovní

## Verze 2.24.0 (DocumentForm podle Money)
- [x] Přeskládat hlavičku na základní údaje a pravý panel vlastností
- [x] Doplnit typové popisky hlavního účtu a partnera, IČO a DIČ
- [x] Přesunout MD/DAL dovnitř účtu a zamčený účet zobrazit jako text
- [x] Doplnit období, kurz za množství a režim součtu z rozpisu
- [x] Přidat ukázky PO, FV a FP v EUR a regresní testy

## Verze 2.23.1 (opravy adaptivní lišty a kontextu)
- [x] Sjednotit nabídku ⋯ a ponechat Obnovit pouze úplně vpravo
- [x] Měřit celý řádek a při kritické šířce zkrátit Přidat a hledání
- [x] Opravit přebité stavy Filtru a GridSegmentedToggle
- [x] Upravit rozestupy a centrování firmy s obdobím
- [x] Omezit nový vzhled záložek na stránky a formuláře
- [x] Zkrátit popisek YTD na skutečný rozsah účetního období
- [x] Doplnit regresní testy a vizuální kontrolu

## Verze 2.23.0 (stabilní horní kontext a jednořádkový grid)
- [x] Sjednotit šířku firmy s obdobím a vložit skutečný oddělovač v horní liště
- [x] Zarovnat knihu a období vlevo a upravit adaptivní šířku období
- [x] Přesunout panel filtrů pod řádek akcí a sjednotit přirozené šířky jeho prvků
- [x] Udržet řádek akcí v jednom řádku dynamickým přesunem nástrojů do nabídky
- [x] Sjednotit výšku a písmo kontextových ovládacích prvků a popisků
- [x] Zjemnit vzhled GridSegmentedToggle při zachování oranžového aktivního filtru
- [x] Zvětšit záložky stránek a formulářů podle vizuální hierarchie
- [x] Aktualizovat ukázky, changelog, dokumentaci, testy a provést vizuální kontrolu

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
- [x] Nedaňový jako značka u částky (Alt+N) místo samostatného sloupce
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
- [x] Ukázky: FP s kalendářem, zaúčtovaná FP, pokladna výdaj, interní doklad
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

## Verze 2.28.0 (DocumentForm – identita, směr a nový kurz)
- [x] Přidat SectionHeading a sjednotit sekční nadpisy formulářů, dialogů, karet a panelů
- [x] Přestavět DocumentForm bez pravého panelu, s identitou a badge směru
- [x] Přidat RateField a rozšířit hodnotu dokladu o ruční a doporučený kurz
- [x] Rozšířit IcoLink, PartnerOption a formát IČO v gridu
- [x] Upravit volbu „Nový partner…“ a předání seed hodnot
- [x] Upravit zavírání a dirty stav záložek panelů
- [x] Doplnit ukázky, testy, dokumentaci a verzi 2.28.0
- [ ] Ověřit typy, lint, testy, sestavení a formuláře v obou motivech a šířkách

## Verze 2.64.0 (zoom aplikace, automatický zoom gridů a šířka menu)
- [x] Nahradit oba mechanismy velikosti písma jediným zoomem aplikace 70–200 % uloženým pro zařízení
- [x] Doplnit automatický neukládaný zoom formulářových gridů s pořadím plné sloupce → zoom → kaskáda → rolování
- [x] Zachovat veřejné šířky sloupců v px při 100 % a vykreslovat je přes rem bez migrace definic aplikací
- [x] Převzít šířku a sbalení menu do AppShell, doplnit přístupný posuvník a ochranu počtu panelů
- [x] Odstranit staré exporty, persistence a mrtvý kód; aktualizovat ukázku a dokumentaci pro BREAKING 2.64.0
- [x] Ověřit návrat sloupců a zoomu při 3 → 1 panelu, produkční ukázku, všechny testy, typy, lint a build

## Verze 2.66.0 (sloupce účtů MD / DAL – pravidlo 23)
- [x] Nabídnout v každém gridu krátkou i rozšířenou formu účtu; výchozí rozšířená kromě editoru řádků
- [x] Přestavět JournalLinesEditor na dvojice účetních sloupců a chránit poslední formu i v uložených rozloženích a pohledech
- [x] Převést JournalLinesRecap na DataGrid bez změny částek, měn, součtů a pořadí řádků
- [x] Odstranit BREAKING accountDisplay z editoru a nastavení dokladu; přidat accountColumnPair a storageKey rekapitulace
- [x] Aktualizovat ukázky, pravidla, changelog, katalog a package verzi 2.66.0; .lovable/meta.yaml neměnit
- [x] Ověřit unit testy, typy a sestavení; Release neprovádět

## DS 2.68.0 – jednotný identifikační řádek dokladů

- [x] Nahradit `identity.items` typovanou identitou variant cashBank / invoice / internal.
- [x] Přesunout hlavní účet výhradně do identifikačního řádku; `mainAccountLocked` vždy skryje tužku.
- [x] U invoice/internal přesunout měnu vedle Celkem; `currencyLocked` ji zobrazí jako text.
- [x] Zachovat M1–M4: bez přepočtu řádků ve FE, období jako kód, účet per kniha a období.
- [x] Při změně účtu odvodit okamžitý popisek z `mainAccountOptions`; invoice bez účtu nesmí mít koncový oddělovač ani štítek.
- [x] Rozšířit typy dokladů, texty, ukázky, testy, katalog a BREAKING dokumentaci.
- [x] Verze 2.68.0; `.lovable/meta.yaml` beze změny; Release neprovádět.
- [x] Ověřit unit testy, typy, build a produkční sestavení náhledu v běžné i úzké šířce.

## DS 2.73.0 – druhá kontrola (fee28914)
- [x] Opravit režim Jiný účet, datum s varováním, VS patch/reset, ořez částky, README 2.66, testy B2/B4

## DS 2.75.0 – podmenu a zavírání panelů
- [x] Přestavět LayoutMenu bez výchozího rozložení a ikon počtu panelů
- [x] Zjednodušit nabídku záložky a zachovat bezpečné oddělovače
- [x] Zavřít panel včetně záložek, kontroly změn, zásobníku a obnovy
- [x] Dodržet limit záložek při slučování rozložení
- [x] Přeskupit UserMenu, přidat workspaceAction a odebrat ikonu z nadpisu panelu
- [x] Ověřit všechny testy, typy, sestavení a ukázku

- 2.77.0: zkratky panelů ignorují opakování při držení klávesy (kromě šipek); výchozí texty nabídek rozložení a záložek mají jediný zdroj v DS_TEXTS_CS.

- [x] 2.79.0 – StandaloneShell, StandaloneNav, ContextSwitcher, ConfirmByTypingDialog, DangerZone, NoticeBar neutral, useAppZoomShortcuts (Release dělá uživatel)

## DS 2.86.0 – Edit dokladu 10
- [x] Přidat přepínač protistrany Vybraný/Ručně včetně potvrzení a zamčení.
- [x] Upravit záložku Odběratel: editace, zamčení aplikací, ručně upravená pole, obnovení a zmrazení.
- [x] Přesunout a rozšířit účet přijatých dokladů včetně přepínače platebního příkazu a validace CZ/IBAN/SWIFT.
- [x] Přesunout účet FV/ZFV před Základní údaje a podporovat zakázání s důvodem.
- [x] Dokončit rozložení dat, částky/měny a pružné Platební údaje.
- [x] Zarovnat VS vlevo, přidat vsColumn a hledatelné KS/způsob platby.
- [x] Doplnit tužky výběrů, datum nespolehlivosti DPH a sjednotit holá tlačítka.
- [x] Aktualizovat texty, system.md, AGENTS, CHANGELOG, ukázky a verzi 2.86.0.
- [x] Přidat testy chování a DOM měření; ověřit format, typecheck, lint, testy, build a limit 500 řádků.
- [x] Opravy po kontrole kódu (73a7ade) body 1–17.
- [x] Dialog neuložených změn, nová záložka místo nahrazení rozepsané, vzhled aktivní záložky (18–20).
## DS 2.88.0 – dokončení Edit dokladu 10
- [x] Prioritizovat rozepsané a aktivní záložky při přeplnění lišty.
- [x] Doplnit řízenou spodní záložku DocumentForm.
- [x] Doplnit úpravu měrné jednotky a zakázky z editoru řádků.
- [x] Zapojit volitelnou akci otevření v nové záložce do dialogu změn.
- [x] Zarovnat pevnou měnu k pravému okraji a změřit náhled.
- [x] Rozdělit pane-context pod 500 řádků bez změny chování.
- [x] Doplnit ukázky, testy, dokumentaci, verzi a závěrečné kontroly; nevydávat.


### DS 2.92.0 – opravy po kontrole 4164ecdd (nevydáno)
- [x] Obnovit a sladit obohacení katalogu, zachovat 426 komponent.
- [x] Opravit kurzové pásmo, nápovědy a mezery; změřit v prohlížeči.
- [x] Opravit patičku a intent dialogu, texty formuláře a přístupnost rekapitulace.
- [x] Smysluplně rozdělit typy, hlavičku rekapitulace a navigaci záznamů.
- [x] Unit 575/575, související e2e 6/6, lint 0 chyb (293 varování), formát OK, automatický build OK; nevydávat.
- [ ] Samostatný výsledek automatického typechecku: kontrolní prostředí neposkytlo jeho výstup; ruční spuštění je v této relaci zakázáno.

### DS 2.94.0 – opravy po kontrole edb1cd4a (nevydáno)
- [x] Obnovit doslovné katalogové texty, zdrojový manifest a ověřit všechny čtyři katalogy.
- [x] Opravit přístupnost přepínače, společnou podmínku FP/ZFP, tooltipy a odpojení validace.
- [x] Doplnit skutečná měření a behavior testy; unit, související e2e, lint a automatické kontroly.

## 2.102.0 – Edit dokladu 13f–13h (nevydáno)
- [x] BankStatementForm.checkDisabledReason, ukázka, katalogy, test
- [x] Sjednocení package.json a meta.version, pravidlo vydání
- [x] 13g: BA DUZP, dvě primární akce lišty (zkrácení, nabídka), verze 2.101.0 pro Release

- [x] 13h: dostupná šířka primárních akcí, texty, katalogy; unit 650/650, E2E 9/9 ve třech prohlížečích jedním během, lint 0 chyb / 292 varování. Katalog 429 → 429, manifest 523 → 503 (21 vyloučených ukázek, 1 doplněný test); verze 2.101.0, bez Release.

## 2.107.0 – jednotná výška a stav polí (nevydáno)

- [x] Dokončit skutečné měření buněk a detailu dokladu bez inline výšky.
- [x] Vlastní error/warning pro SegmentedField, ToggleGroup a Textarea; test zakázky v buňce.
- [x] Aditivně doplnit katalog a porovnat čtyři soubory s 8a53e95.
- [x] Všechny unit, Chromium výšky a starší document-controls / edit-document-thirteen, lint.

- [x] Verze 2.106.0 (package.json, meta.version), CHANGELOG 2.105.0 vydáno, 2.106.0 záznam, 2.107.0
- [x] Pravidlo výšky do system.md, components.md, AGENTS.md, stránky Pravidla
- [x] --control-h jako jediný zdroj výšky, Button size="control", Toggle, detail řádku
- [x] useFieldStatus / FieldStatusIndicator / FieldHintIcon; hint jako ikona
- [x] Jedna bublina u polí s vlastní bublinou (RateField, FieldToggleButton) + test
- [x] Líná bublina buněk mřížky + test, že bez chyby nevzniká
- [x] FieldErrorSummary v RecordActionBar / DocumentForm / RecordDialog, fokus i v detailu řádku
- [x] JournalRowDetail: chyba a varování u všech polí
- [x] BankAccountField.entryMode
- [x] A9: onCreateDimension, ID partner ＋ a tužka
- [x] received-bank-account-field: ověřit, že pod poli není zpráva
- [x] Ukázka „Chyby a varování v polích“ + test „nic pod prvkem“ nad všemi poli
- [x] Chromium E2E výšek (zoom aplikace 70/90/100/125/200 %, mřížky 60/100/140 %)
- [x] Katalogy beze ztrát

- Dokončení 2.107.0: skutečné výšky shodné v 18 kombinacích; unit 703/703, Chromium 27/27, lint 0 chyb / 299 varování, katalog 441 komponent / 856 props (baseline 432 / 800), automatický build OK. Nic nevydáno.
- Opravné kolo 2.108.0 (kontrola e8825790): fieldErrors z 2.107 zachovány, ✕ vždy (onIssuesClose), issues → pole i buňky (cellIssues), popisky z DsTexts + fieldId = skutečné id, VS pořadí derived→uložený, onFieldChange hlásí id pole, validationActive skrývá jen klientské chyby, rozdíl výpisu v pruhu, BA zámek „datum pohybu“. Unit 733/733, lint 0 chyb, katalog 448 komponent / 880 props (vydaná 2.107.0: 441 / 856 – nic neubývá). Nic nevydáno.
