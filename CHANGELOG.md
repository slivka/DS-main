# Changelog – Slivka Design System

## 2.109.0 (nevydáno) – DPH krok 4B

### Opravy
- **Třetí opravné kolo T1–T6:** Rozdíl nabízí dorovnání DPH pouze běžných kódů s daní, nikdy PDP/EU; `setOverride` i `upsertVatOverride` odmítají vytvořit přepis samovyměření.
- **Kurz / jednotka:** skupiny, pevná daň a spodní souhrn používají `mulDivRound(částka, kurz, jednotka)` bez mezidělení (−900 × 3,715 / 100 = −33,44); tolerance porovnává přesný součin křížovým násobením bez mezizaokrouhlení. `ComputeVatGroupsOptions.exchangeRateAmount` doplněno (výchozí 1).
- **Bez platného kurzu** jsou částky v měně firmy prázdné v obou rekapitulacích DPH; `VatSummaryRow.baseHome` / `vatHome` mohou být `null`.
- **Peněžní editor gridu** potvrzuje i porovnává maximum zaokrouhlením polovinou od nuly (−1,005 → −1,01).
- **Kontrola peněžního zaokrouhlování** přesunuta z unit testu do `scripts/check-money-rounding.ts`, zapojena do `check:quick` i `check:full`; zahrnuje účetnictví, gridy a lib, hledá volání Math.round i toFixed. Výstupní formátování a nepeněžní výpočty mají jeden seznam výjimek s důvody.
- **Katalog T4 dle `check:catalog --base 03f1c677`:** 449 → 470 komponent, 890 → 910 props; v tomto kole + `storedVatAllocation`, + `VatGroup.selfAssessment`, + `ComputeVatGroupsOptions.vatEnabled`, + `ComputeVatGroupsOptions.exchangeRateAmount`. Jediná úmyslná náhrada je zastaralý příklad „Řádky s DPH (2.55.0)“ (záznam v catalog-removals.json); žádný export ani prop neubyl.
- **Katalog:** veřejný `storedVatAllocation`, `VatGroup.selfAssessment`, `ComputeVatGroupsOptions.vatEnabled` a `exchangeRateAmount`; ukázka editoru převedena z deprecated calcMode na řádky bez DPH a vatOverrides.
- **Záložka DPH ve spodní rekapitulaci editoru řádků** chyběla (souhrn se do rekapitulace nepředával) – vrácena. Daň bere ze skupin DPH (stejný výpočet jako DB, včetně přepisu „dle dokladu“); u zaúčtovaného dokladu z uložených řádků daně, jen ke čtení. U dokladu mimo DPH se nezobrazí.
- **Zaokrouhlení jako DB:** výpočty DPH (daň skupiny, rozpočet na řádky, pomocník Cena s DPH, `taxFromGrossTotal`, sloupce v měně firmy) používají `roundHalfAwayFromZero` / `mulDivRound` – polovina od nuly v celých jednotkách jako Postgres `round(numeric, 2)` (10,075 → 10,08; −7,875 → −7,88). Dříve Math.round dával na záporných a hraničních hodnotách jiné výsledky.
- **Zaúčtovaný doklad** má rekapitulaci DPH z uložených řádků (daň z řádků daně DB, přepisy jako „dle dokladu“), bez úprav a bez pomocníka (`vatGroupsFromStored`).
- **Výkon:** pomocník Cena s DPH je v buňce jen lehké tlačítko, okno je jedno na editor; výpočet skupin a mapa rozpočtených řádků jsou memoizované. Ukázka skupin DPH se připojí až při posunu k ní.
- **Tolerance přepisu** jako DB `document_vat_validate`: |přepis − vypočtená| × kurz se porovnává nezaokrouhleně (0,04 × 25,10 = 1,004 → mimo toleranci).
- **Přepis při nulovém základu:** úpravy DPH / Celkem dle dokladu se nenabízejí; existující přepis ≠ 0 je položka pruhu (`overrideZeroBase`).
- **Dorovnat základ** vynuluje Rozdíl: u skupiny s přepisem posune základ o celý rozdíl, bez přepisu hledá posun, po kterém základ + round(Σ × sazba / 100) dá cíl; když neexistuje, nabídka ho nenabízí.
- **Zaokrouhlení v nabídce Rozdílu** jen když |stávající zaokrouhlení + rozdíl| ≤ limit. U dokladu v cizí měně se nenabízí (zaokrouhlení je v měně firmy, Rozdíl v měně dokladu); zůstává Dorovnat DPH / základ. Domácí měna beze změny.
- **Rekapitulace a výška řádku (2.107):** „vypočteno · rozdíl“ je v bublině ikony ⓘ, stav skupiny je rámeček uvnitř buňky – výška řádku se nemění.
- **Patička:** jediný řádek Součet v mřížce (bez samostatného „Celkem“, bez zaokrouhlení); lišta nese Zaokrouhlení a Rozdíl. Celkovou částku lišta ukáže jen při skrytém sloupci s DPH (`journal-footer-sum-total`).
- `DocumentForm` (FP, ZFP, ZFV, DDPOZ): otevření existujícího dokladu nic nezapisuje ani nevolá `onChange`. Stav vazby Datum účetního případu ↔ Datum vystavení se u existujícího dokladu odvodí z dat (`!issueDate || accountingDate === issueDate`) a přepočítá se při změně id. Nastavení `accountingDateLinked` platí jen pro nový doklad. Dříve se odpojené datum při otevření přepsalo na datum vystavení a doklad se zaúčtoval do špatného období. Řízený `accountingDateLink` beze změny.
- Rekapitulace DPH: sloupce v měně firmy řídí aplikace přes `recap.vatHomeOpen` / `recap.onVatHomeOpenChange` (bez nich se přepínač nezobrazí). U zaúčtovaného dokladu se rekapitulace zobrazí jen ke čtení, místo aby zmizela.

### Opravy po kontrole kódu 2.109.0 (druhé kolo)
- **Zaokrouhlení i ve zbylých cestách:** daň řádku (`calculateVatFromBase`, PDP / EU), dělení při částečném odpočtu, domácí částka řádku daně, náhled Kurzového zaokrouhlení, `summarizeVat`, domácí částky řádků v cizí měně (`toHomeAmount`, `roundJournalAmount`, `calculateLineAmount`), pevná daň v rekapitulaci, `convertAmount`, součty `DocumentForm`, zůstatky výpisu, platební kalendář a `roundTo` počítají polovinou od nuly jako DB (−12,50 × 21 % → −2,63, dříve −2,62). Převody kurzem jako DB `round(x × kurz, 2)` po řádcích. Test hlídá, že v účetních komponentách a `lib` nezůstal Math.round v peněžních výpočtech.
- **Zaúčtovaný doklad:** sloupec DPH v mřížce a Součet DPH v patičce berou daň z uložených řádků daně (Σ řádků se stejným `vatParentLineId`), ne z výpočtu po řádcích (3 × 0,50 při 21 % = 0,32, dříve 0,33).
- **Samovyměření (PDP, EU)** se skupinuje stejně jako ostatní kódy (daň skupiny round(Σ základů × sazba / 100, 2), rozpočet na řádky); rekapitulace ho ukáže bez úprav. Přepis daně ani pomocník Cena s DPH nemá; zadaný přepis se ignoruje (DB `vat_override_self_assessment`). Kód bez daně ani řádek bez známé sazby do skupin nevstupuje. `VatGroup.selfAssessment`, `ComputeVatGroupsOptions.vatEnabled` (doklad mimo DPH → žádné skupiny).
- **Kurz DPH 0 / prázdný:** tolerance se nehodnotí (žádná položka pruhu) a částky v měně firmy nejsou dopočítané; dříve se počítalo s kurzem 1.
- **Pomocník Cena s DPH u Jedn. ceny:** vstup i výsledek na 4 desetinná místa.
- Test skupin DPH v prohlížeči má po rozdělení stránky běžné limity.

### Opravy po kontrole 2.108.0 (páté kolo)
- BA: chyba čísla účtu, IBAN, kódu banky i SWIFT z `issues` (server i klient) se promítne do správného pole. Zpětné mapování id → klíč je explicitní tabulka; sdílená id (`document-movement-account`, `document-bank-code`) rozlišuje typ dokladu a `bankAccountKind`.
- Popisky `bookId`, `taxDocumentNumber`, `taxDocumentNumberLinked` doplněny; test selže, když popisek chybí nebo zazní `console.warn`.
- fieldId: `taxDocumentNumberLinked` → `document-taxDocumentNumber`; `bookId` a `direction` → `document-identity` (nové id identifikačního řádku; odznak směru dál `document-direction`); zamčený účet přijatého dokladu má `id="document-bankAccount"`.
- `BankStatementForm` se zastaralým `status="checked"` zůstává zamčený s důvodem `bankStatement.locked` („Výpis je uzamčený“, nový klíč CS/SK).

### BREAKING
- `VatSummaryRow.baseHome` a `vatHome` jsou `number | null`: bez platného kurzu vykreslete prázdnou buňku, ne nulu.
- **Řádky jsou vždy bez DPH.** `JournalLinesVat.calcMode` a `onCalcModeChange` jsou @deprecated (odstraní se ve 3.0.0) a ignorované; přepínač Bez / S DPH v liště zmizel. Typ `VatCalcMode`, `applyVatCalcMode`, `baseFromGross`, `calculateVatFromGross` zůstávají exportované jako @deprecated.
- **Ruční daň na řádku zrušena.** Buňka DPH ani Celkem s DPH se needitují, akce „Vrátit vypočtenou daň“ v řádku zmizela. `toJournalRow(s)` už neposílá `vat_manual`, `vat_amount_foreign` ani `amount_gross`. Řádek s `vatManual` z DB je pevná systémová daň (odpočet zálohy, import) – jen zobrazení se zámkem a bublinou.
- **Patička Součet · Zaokrouhlení · Rozdíl** (`data-slot="journal-difference-bar"`, `journal-footer-sum`, `journal-footer-rounding`, `journal-lines-remaining`). Tlačítko „± Zaokrouhlení“ (`journal-lines-rounding`) a stav rozepsání v liště zrušeny, stejně jako automatický návrh zaokrouhlení na jakýkoli rozdíl. `JournalLinesRounding.limit` je @deprecated – použijte `roundingLimit`.
- **Rekapitulace DPH** se přesunula pod mřížku (`journal-vat-recap`).
- **Položky skupin DPH** jdou do `onValidationChange` jako chyba i varování (`severity`, `label`, bez `line`); `count` počítá jen chyby. Typy: `errors[].line` je volitelné a varování jsou ve stejném poli.

### Nové
- `JournalLinesEditor`: `vatOverrides`, `onVatOverridesChange`, `vatExchangeRate`, `vatExchangeRateAmount`, `roundingLimit`, `onRoundingChange`, `vatOverrideSeverity`. Sazba pro výpočet se bere z `VatCodeOption.rate` (sazba k Datu DPH) – samostatné `vatRateByCode` není potřeba.
- Rekapitulace DPH po skupinách kód × sazba se stejným výpočtem jako DB; úpravy „dle dokladu“: DPH, Celkem s DPH (přepis + jednorázové dorovnání základu), Základ (jednorázové dorovnání řádku s největším základem); „Vrátit vypočtenou daň“; tolerance ±1,00 v měně firmy kurzem DPH. Přepis nad tolerancí: varování v řádku skupiny, při `vatOverrideSeverity="error"` položka v `onValidationChange` s `fieldId="journal-vat-group-{kód}-{sazba}"`.
- Pomocník „Cena s DPH“ v buňce Částka / Jedn. cena a v detailu řádku.
- Nabídka u Rozdílu: Dorovnat DPH (výběr skupiny), Dorovnat základ, Zaokrouhlení (jen do limitu). Výchozí volba: jedna skupina a |rozdíl| ≤ 0,01 × počet řádků → DPH, jinak Zaokrouhlení v limitu, nad limit žádná.
- Čisté funkce `computeVatGroups`, `resolveDifferenceActions`, `baseFromGrossAmount`, `taxFromGrossTotal`, `upsertVatOverride`, `removeVatOverride`, `largestBaseLineId`, `applyVatAllocation`, `allocateVatGroupTax`.
- `DocumentForm` předává svůj limit zaokrouhlení editoru jako `roundingLimit`.
- Texty `journalEditor.vatGroups` (CS i SK); `vatMode*` a `vatManual` jsou @deprecated.

### Migrace pro aplikace
1. Odeberte `vat.calcMode` / `onCalcModeChange` a sloupec `amount_gross` z ukládání.
2. Ukládejte přepisy spolu s řádky: `_vat_overrides: vatOverrides.map(o => ({ vat_code_id: o.vatCodeId, vat_rate: o.vatRate, tax_amount: o.taxAmount }))`; `[]` = smazat.
3. Předejte `vatExchangeRate` (kurz DPH), `roundingLimit` (limit firmy) a `onRoundingChange`.
4. `vatOverrideSeverity="warning"` u konceptu, `"error"` při zařazení (DB vrací `vat_override_diff;skupina;sazba`).
5. Testy a selektory na `journal-lines-rounding` nahraďte `journal-footer-rounding`.
6. V `onValidationChange` ošetřete `line === undefined` (položky skupin DPH nemají řádek) a filtrujte podle `severity` (varování jsou ve stejném poli jako chyby).
7. Při vlastním vykreslování `VatSummaryRow` ošetřete `baseHome === null` / `vatHome === null` prázdnou buňkou; pro kurz s jednotkou předávejte `exchangeRateAmount` spolu s `exchangeRate`.

### Ukázky (jen náhled, knihovna ani katalog beze změny)
- Stránka účetních formulářů rozdělena na sedm stránek s přepínačem: Editor dokladů (původní adresa), Další doklady, Ovládací prvky a hlavičky, Bankovní výpis a pohyb, Řádky dokladu a DPH, Řádky zápisu, Pole a sestavy. Žádná ukázka nezmizela; každá stránka se načte do 8,1 s (dříve celá stránka 10–16 s). Testy v prohlížeči míří na novou stránku a čekají na signál připravenosti stránky; žádné čekání se nezvyšovalo.

### Katalog
- design-system.json proti poslední vydané 2.108.0 (`03f1c677`): **449 komponent / 890 props → 469 / 907**; nic neubylo. Předchozí údaj „nic neubylo“ byl počítán proti `8db33914` a nebyl pravdivý: proti 2.108.0 chyběly `DocumentAccountingDateLink`, `FormIssue`, `formIssuesTitle`, `mergeFormIssues`, `visibleFormIssues`, `deriveVariableSymbol` a props `DocumentForm.issues`, `saveFailed`, `onIssuesClose`, `onFieldChange`, `validationActive`, `bankCodeOptions`, `value.variableSymbolLinked`, `JournalLinesEditor.cellIssues`, `BankStatementForm.value.bankClosing` – vráceny.
- Nové záznamy: `allocateVatGroupTax`, `applyVatAllocation`, `baseDeltaForDifference`, `baseFromGrossAmount`, `computeVatGroups`, `largestBaseLineId`, `removeVatOverride`, `resolveDifferenceActions`, `taxFromGrossTotal`, `upsertVatOverride`, `vatGroupsFromStored`, `roundHalfAwayFromZero`, `mulDivRound`, `exactSum`, typy `JournalVatOverride`, `VatGroup`, `VatGroupLineShare`, `VatFixedTax`, `VatGroupsResult`, `ComputeVatGroupsOptions`; props `JournalLinesEditor.vatOverrides`, `onVatOverridesChange`, `vatExchangeRate`, `vatExchangeRateAmount`, `roundingLimit`, `onRoundingChange`, `vatOverrideSeverity`, `AccountSelect.id`, `VsField` (9 props).

## 2.108.0 – Edit dokladu 15

- **Katalog:** obnoveny záznamy ztracené po vydání 2.107.0 (`8db33914`): FieldStatus, useFieldStatus, FieldErrorLink, focusFieldErrorLink, useCellStatusTooltip, props FieldStatusIndicator, FieldFeedbackIndicator (error/warning), ToggleGroup (label/error/warning), RecordActionBar a DocumentForm `error.fieldErrors` / `error.onFieldErrorSelect`, JournalLinesEditor `onCreateDimension` / `onValidationChange`. Kód se neměnil.

### Opravné kolo (kontrola kódu)
- **`error.fieldErrors` z 2.107.0** zůstává zachováno: při samotných `fieldErrors` se vykreslí `FieldErrorSummary` (max 5 + „a další N“) s funkčním `error.onFieldErrorSelect`; nepřevádí se na `FormIssue` (label je ReactNode).
- **FormIssuesBar má vždy ✕**: nové `onIssuesClose` na `RecordActionBar` / `DocumentForm`; bez callbacku si pruh zavření drží sám do další změny seznamu. Vlastní `error.title` nepřebije počet – titulek = vlastní text + „(N)“.
- **`issues` se promítají do polí a buněk**: položka s `fieldId` → rámeček + ikona + bublina v poli (varování žlutě), s `rowId`/`columnId` → stav buňky přes nový `JournalLinesEditorProps.cellIssues`. Dedup klient × server stejného pole a textu bez ohledu na `code` (server má přednost); dedup hlavička × řádek jen při shodném `code` nebo `fieldId`.
- **Popisky a fieldId v pruhu**: nikdy technický klíč – popisky z DsTexts (aliasy partnerId → Partner, counterpartyIco → IČO, paymentMethodId, mainAccountId…); `fieldId` odpovídá skutečnému id ovládacího prvku (document-partner, document-partner-ico…), test ověřuje existenci v DOM.
- **VS po odemčení**: pořadí `derived.value || value.variableSymbol` – uživatel vidí hodnotu z náhledu; při automatickém uvolnění (0 / >10 číslic) zůstane uložený VS. Text „přidělí se při zařazení“ jen u vydaných (FV/ZFV/DDPZ) v konceptu bez čísla; u přijatých bez čísla prázdné zamčené pole.
- **`onFieldChange` hlásí id pole, ne vazby**: zámek VS → `document-variableSymbol`, Σ → `document-amountTotal`, zámek data účetního případu vždy (i s řízeným `accountingDateLink`).
- **`validationActive=false`** skrývá jen klientské chyby; žlutá varování (ruční partner, VS) se zobrazují vždy.
- **BankStatementForm**: rozdíl zůstatku je položka pruhu (`issues`), ne samostatný NoticeBar; odstraněny zbytky stavu `checked` v ukázce, text `unsavedMovements` je deprecated.
- **Bankovní pohyb**: zámek data účetního případu s texty „Svázat s datem pohybu“ / „Stejné jako datum pohybu“ (`documentEdit.movementDateLink` / `movementDateLinked`); stav vazby se přepočítá při změně dokladu. `DocumentAccountingDateLink` má nové `unlockedHint`.
- **Katalog**: doplněny `mergeFormIssues`, `visibleFormIssues`, `formIssuesTitle`, `deriveVariableSymbol`, `FormIssue`, `FormIssuesBar`, `JournalLinesEditor.cellIssues`; z `JournalLinesEditor` odstraněny `recapTotalAmount` / `recapTotalLabel` (nic nevykreslují) a zmínka o přepočteném celku v hlavičce.

### Opravné kolo 2 (kontrola kódu)
- **Chyby řádků se mažou**: do `cellIssues` se promítají jen položky `source: "server"`; vlastní chyby editoru vrácené přes `onValidationChange` se do buněk nevrací, takže po opravě buňky rámeček i položka pruhu zmizí (projekce přesunuta do `useDocumentIssueProjection`).
- **Popisky a fieldId pro všechny klíče**: `HEADER_FIELD_ID` doplněno (bankCode → `document-bank-code`, bankAccount → `document-movement-account`, variableSymbolLinked → `document-variableSymbol`, totalMode → `document-amountTotal`); `headerFieldLabel` nemá fallback na technický klíč – chybějící popisek je chyba (test ověřuje fieldId v DOM pro všechny klíče všech typů dokladů vč. BA).
- **`validationActive=false`** neskrývá serverové chyby v polích (jen klientské); dedup klient × server stejného pole bez ohledu na text (server má přednost); projekce issues i do polí vykreslených přes `Field` (BA protiúčet, kód banky).
- **Zámek data**: `onFieldChange("document-accountingDate")` se hlásí i u řízeného `accountingDateLink.onToggle`.
- **Chyba + varování**: když aplikace pošle `error` a `issues` obsahují jen varování, pruh je červený („Doklad nelze uložit“ / „Před zařazením doplňte“) s chybou a varováními pod ní – nový `FormIssuesBar.forceError`.
- **FieldErrorSummary uvnitř FormIssuesBar** (`fieldErrors` / `onFieldErrorSelect`): zavření ✕ skryje i souhrn; podpis zavření se počítá z celého obsahu (code + message + fieldId), takže se pruh při změně textu znovu ukáže.
- **„Přidělí se při zařazení“** jen u vydaných dokladů ve stavu koncept (kontrola `status`).
- **BankStatementForm**: `status: "checked"` a texty `lockedChecked` / `check` / `uncheck` / `checkHint` / `uncheckHint` označeny @deprecated (kontrola výpisu zrušena). Odstraněno `data-slot="bank-statement-{key}"` (nově `data-bank-statement-value`) a `data-slot="bank-statement-difference"`; `BankStatementBalanceSection` vrací null.
- **Katalog**: odstraněn příklad `recapTotalAmount`; doplněny `onIssuesClose` (DocumentForm, RecordActionBar), `DocumentAccountingDateLink.unlockedHint` a nové props `FormIssuesBar`.

### Opravné kolo 4 – dokončení a kontroly
- Serverové chyby zůstávají přímo v polích při `validationActive=false`; klientské chyby se skryjí, varování zůstávají. BA promítá chyby i varování do Druhu účtu, Čísla/IBAN a Kódu/SWIFT.
- Vlastní validace editoru nese `origin: "editor"` a nevrací se zpět do buněk. Klientské i serverové položky aplikace se do buněk promítají. Prohlížečový test skutečně zadá nulovou částku a opraví ji: rámeček i položka pruhu zmizí. Popisky řádků pocházejí ze sdílených překladů sloupců, nikoli z technických klíčů.
- Chybějící popisek za běhu formulář neshodí: použije „Pole formuláře“ a `console.warn`; úplnost popisků ověřují testy. `rateInfo`, `suggestedRate`, `print` a upozornění zdrojů nejsou položky polí.
- Doplněna skutečná id účtu v ručním režimu, účtu identity i v klidu, čísla a směru dokladu a přepínače DPH. Veřejné `IdentityLine.numberId` označí číslo; aliasy vazeb, země, zaokrouhlení a ručního kurzu míří na příslušné existující pole. Nové Chromium testy pokrývají vykreslené varianty FP / FV / ID / PO / BA.
- Obecná chyba s varováními má červený pruh a titulek podle `saveFailed`; stejná zpráva chyby se nezapočítá podruhé. `handedOverBy` používá popisek podle směru. Text `checked` je deprecated; větev důvodu zamčení zkontrolovaného výpisu odstraněna.
- Dva jednotkové testy výpisu stále očekávaly zrušený stav `checked`; nyní ověřují platný zamčený stav `posted`. Časový limit samostatného běhu způsoboval rozsáhlý výpis cyklického DOM při neúspěšném porovnání (36 MB), nikoli čekání formuláře; limit nebyl zvýšen.
- Dřívější rozdíl výšky 57,6 px se v opakovaném ani úplném běhu nereprodukoval. Test ani výšky se neupravovaly; všech pět kontrol `control-height-2107` prošlo.
- Ověření: unit **751/751** (73 souborů); lint **0 chyb / 314 varování**; automatický **build OK**, formát dotčených zdrojů a katalogu OK. Chromium **41/41**: document-controls 11/11, edit-document-thirteen 10/10, control-height-2107 5/5, journal-control-height 1/1, edit-document-fifteen 2/2, bank-statement-form 5/5, vs-lock-2108 1/1, document-field-ids 6/6 (pět typů + oprava buňky). Dávka rozdělena kvůli limitu délky příkazu, bez zvýšení testových limitů.
- Katalog proti `8db33914`: **441/856 → 449/890** (komponenty/props); odstraněné názvy komponent ani props **žádné**. `recapTotalAmount` / `recapTotalLabel` byly odstraněny v průběhu nevydané práce, nikoli proti této základně (tam nebyly). Verze v package a meta zůstává **2.107.0**, nic nevydáno.

### Nové
- **Živý pruh chyb a upozornění** (`FormIssuesBar`, `FormIssue`, `mergeFormIssues`, `visibleFormIssues`, `formIssuesTitle`): položka `{ fieldId?, rowId?, columnId?, label, message, severity, source, code? }`; deduplikace podle (code nebo text, pole, řádek), chyba hlavičky se neopakuje jako „Řádek N“; titulek s počtem („Doklad nelze uložit (N)“ jen při `saveFailed`, jinak „Před zařazením doplňte (N)“, bez chyb „Upozornění (N)“); prázdný seznam pruh skryje.
- `DocumentForm`: `issues`, `saveFailed`, `validationActive`, `onFieldChange(fieldId, rowId?, columnId?)`, `bankCodeOptions`; hlavička `variableSymbolLinked`.
- `RecordActionBar`: `issues`, `saveFailed`.
- `VsField`: `linked`, `onLinkedChange`, `derivedValue`, `pendingText`, `warning`; pravidla `deriveVariableSymbol`, `variableSymbolSource`, `supportsVariableSymbolLink`, `effectiveVariableSymbolLinked`.
- `AmountDifference.overLabel` („Rozpis převyšuje X“).
- Výpis: Σ u „Zůstatek na výpise“, rozdíl jako žluté varování v poli a v pruhu, prázdný grid „Výpis zatím nemá pohyby“.
- Interní doklad: partner / ručně, IČO a DIČ, varování „Ruční partner se nepřenese do řádků dokladu.“
- Bankovní pohyb: protiúčet a symboly na mřížce 20 (4 / 8 / 8), kód banky „kód – název“.

### Breaking / migrace pro aplikace
1. **Pruh chyb:** místo samostatného `error` / `notices` předávejte `issues` (serverové položky `source: "server"`), `saveFailed` po neúspěšném uložení a `validationActive` po prvním pokusu o uložení / zařazení. `validationActive` řídí jen klientské položky a červené rámečky; serverové se zobrazí vždy. Serverové položky maže aplikace: DS volá `onFieldChange(fieldId)` při každé změně pole i přepínače (zámek data, VS, Σ), u buněk řádku s `rowId` a `columnId`.
2. **VS:** dříve DS zapisoval odvozený VS do hodnoty; nyní **DS zobrazuje odvozenou hodnotu jako náhled a ukládá jen stav vazby** `variableSymbolLinked`. Autoritou je DB (`variable_symbol_auto`); zamčený VS aplikace do DB neposílá. Při 0 nebo > 10 číslicích DS vazbu uvolní a stávající VS ponechá (nikdy nezkracuje). U vydaných v konceptu bez čísla je pole prázdné s „přidělí se při zařazení“.
3. **Bankovní pohyb (BA):** „Datum pohybu“ ↔ `issueDate` (`date_issued`), „Datum účetního případu“ ↔ `accountingDate` (`date_accounting`) se zámkem svázaným s datem pohybu (stav vazby z rovnosti dat jako u PO). Dříve se datum pohybu zapisovalo do `accountingDate` – aplikace musí mapování upravit.
4. **Výpis:** kontrola výpisu zrušena (`onCheckedChange`, `checkDisabledReason` se ignorují), sekce „Zůstatky dle pohybů“ a „Zůstatky v {měna}“ zrušeny (`home`, `onHomeBankClosingChange` se ignorují). `bankClosing: null` = Σ (zůstatek z pohybů), číslo = zůstatek z banky. Pohyby vždy ze slotu `items` (i nový výpis); `isNew` a `onSaveThenAdd` se ignorují – přidání řeší `addAction` gridu.
5. **Řádky:** zrušen čip „Celkem“ v liště, „Celkem v {měna}“ v rekapitulaci a stav „✓ Rozepsáno“; rozdíl se ukazuje jen v režimu zadané částky a jen ≠ 0. Výchozí režim ukázek je `sum`.
6. **Zastaralé props** (přijímají se, maže je nejbližší major; nepoužívat – rozhodnutí 18. 10.): `BankStatementForm.home`, `.onHomeBankClosingChange`, `.isNew`, `.onSaveThenAdd`, `.checkDisabledReason`, `.onCheckedChange`; `JournalLinesEditor.recapTotalAmount`, `.recapTotalLabel`; `AmountDifference.balancedLabel`; komponenta `JournalRecapHomeTotal`.

## 2.107.0 – vydáno

Pravidlo: Pod ovládacím prvkem se nikdy nic nevykresluje. Chyba ani varování nemění výšku ani
zarovnání řádku. Všechny prvky v jednom řádku mají přesně výšku --control-h svého prostředí.

- Výška: jediný zdroj `--control-h`; detail řádku mřížky nastaví lokálně `--control-h: 2.25em`
  místo přepisu `!important`. SegmentedField, Toggle, UnitSelect (i mimo mřížku, stejné
  zaoblení), DateRangeField, SS, číslo dodavatele, daňové číslo a adresa bez pevných h-9/h-8.
- Stav pole: `useFieldStatus`, `FieldStatusIndicator` (alias `FieldFeedbackIndicator` zůstává),
  ikona vlevo u čísel, `placement="label"` pro zaškrtávátka a přepínače, `extraInfo` pro jednu
  společnou bublinu (RateField, FieldToggleButton).
- Detail řádku dokladu: chyba i varování u všech polí podle sloupce, popisek nahoře a prvek
  pod ním, nic dalšího; buňky mřížky mají línou bublinu místo `title`.
- Nápověda: `Field.hint`, `CheckboxField.hint`, `SwitchField.hint`, `DateField.hint`
  a `FormDescription` jsou ikona Info v řádku popisku; `FormMessage` je ikona s bublinou.
- Souhrn chyb: `FieldErrorSummary` (max 5 + „a další N“), klik fokusuje pole i v řádku mřížky.
- A9: `JournalLinesEditor.onCreateDimension` v buňce i detailu řádku; interní doklad nabízí
  u partnera ＋ Nový partner a tužku.

### Dokončení a ověření

- Registrace `--control-h` má výchozí nezávislou délku `36px`; `2.25rem` není platné
  initial-value registrované délky. Formulář dál bere `2.25rem` z kořene. Detail i buňky
  nastavují relativní délku na kontejneru; odstraněn starý přepis inline vstupů v buňkách.
- `SegmentedField`, `ToggleGroup`, `Textarea`: vlastní `error`, `warning`, rámeček,
  přístupný popis a stavová ikona v popisku (`label`). Bez popisku dejte ikonu do okolního
  popisku pomocí `FieldStatusIndicator placement="label"`.
- Skutečný JournalLinesEditor: sedm polí detailu včetně chybného Poměru %, buňky i editor
  buňky mají shodnou výšku v 18 kombinacích zoomu aplikace 70/100/200 %, gridu
  60/100/140 % a obou hustot. Inline výška z ukázky odstraněna.
- Ověření: unit 703/703, Chromium E2E 27/27 (skutečný editor 1, ukázka 5,
  document-controls 11, edit-document-thirteen 10); lint 0 chyb / 299 varování.
- Čtyři katalogy proti 8a53e95 beze ztrát: 432 → 441 komponent, 800 → 856 props.
  Obě vydané verze zůstávají 2.106.0; nic nevydáno.

### Breaking / migrace pro aplikace

- `hint` se už nekreslí pod polem, ale jako ikona Info v popisku; dlouhé texty přesuňte do
  `FieldGrid.hint`. `FormDescription`/`FormMessage` vrací `span` s ikonou místo `p`.
- `DateField.warningDisplay` je deprecated a bez účinku (odstraní se ve 3.0.0); `DateField.hint`
  bez obalu `Field` je jen přístupný text – nápovědu dejte do `Field.hint`.
- `BankAccountField`: ruční vstup už není pod výběrem. Nové `entryMode: "selected" | "manual"`,
  `onEntryModeChange`, `manualFormatPattern`; přepínač je uvnitř pole.
- `RecordActionBar.error.fieldErrors`, `DocumentForm.error.fieldErrors`, `RecordDialog.fieldErrors`:
  pole `{ fieldId, label, message, rowId?, columnId? }`.
- `JournalLinesEditor.onValidationChange`: položky navíc `fieldId`, `rowId`, `columnId`.
- `Button size="control"` pro tlačítka v řádku polí; ostatní velikosti beze změny.
- `onCreateDimension?: (searchText: string) => void` v `JournalLinesEditor`.
- Nové klíče DsTexts: `recordAction.moreErrors`, `documentForm.bankAccountManualToggle`,
  `bankAccountManualOn`, `bankAccountManualOff`, `bankAccountFormatPattern` (CS i SK).
- Popisky zaškrtávátek a přepínačů jsou jednořádkové a zkrácené s … (celý text v `title`).

## 2.106.0 – vydáno (dorovnání verze po 2.105.0, bez dalších změn)

## 2.105.0 – Edit dokladu 14 (vydáno)

- S1: chyby a varování jako rámeček a výstraha uvnitř pole před akcemi, celé zprávy
  také v pruhu formuláře. Bez textu výstrah pod polem, výška se nemění.
- S2: tooltip Σ pouze „Sčítá částky z rozpisu“, stálá šířka Celkem v obou režimech.
- S3–S4: StepperInput, kopie 1–5 včetně psaní/šipek/hranice; geometricky středová radio tečka.
- S5: nahrazuje pravidlo 2.104.0 o vždy viditelném textu Uložit. Standardně akce bez ikon,
  skutečně měřená kaskáda text → sekundární ikony → Uložit ikona; názvy a tooltipy zůstávají.
- S6–S8: přidání vpravo v hledání s dotazem a důvodem zákazu; rostoucí nezalamované
  nabídky do 36 rem/dostupné šířky; rychlá splatnost a relativní +14, kalendářní měsíc.
- S9: FV/ZFV platba před účtem, daňové číslo s vazbou; účetní datum a DUZP sledují
  vystavení do odpojení; BA protiúčet, datum pohybu, ID Partner před Popisem a Datumy.
  Peněžní směr Výdaj; výpisový pohyb Bankovní pohyb. Texty CS/SK.
- S10: výpis bez viditelného štítku stavu, nový výpis s prázdnými pohyby a onSaveThenAdd.
- Poslední vydaná verze v package.json i meta.version je 2.104.0. Nic nevydáno.
- Měřicí kopie lišty akcí jsou uvnitř jejího odsazení; sticky/backdrop oblast je neposouvá
  přes jeho okraj a měření nezasahuje do skutečných akcí. Pravidla nezalamování beze změny.
- Dostupná šířka akcí odečítá odsazení a skutečnou mezeru; prázdný levý obsah mezeru
  nevytváří. Neinteraktivní měřicí kopie používají stejné styly jako skutečná tlačítka.
  Příjem/Výdaj nového výpisu při 200 % přejdou pod sebe, texty zůstávají jednořádkové.

### Ověření

- Poslední dorovnání: unit 681/681; Chromium 21/21 (celé document-controls 11/11
  a edit-document-thirteen 10/10 včetně matice CS/SK 70–200 %); lint 0 chyb /
  297 varování. Katalog 432 komponent / 814 props, zachováno všech 432 názvů
  a 813 dosavadních props; doplněn CounterpartyField.createDisabledReason.
  Programová kontrola beze ztrát, pouze výslovně opravená věta Field o hint.
  Vyhledání zastaralého označení směru v src/tests/.lovable/roadmap bez výsledku.
  Dlouhé jméno ContactSelect ověřeno v prohlížeči s výpustkou a celým title.
  Verze package.json = meta.version = 2.104.0; nic nevydáno.
- Před vydáním zopakováno: Chromium 30/30 (celé soubory edit-document-thirteen,
  bank-statement-form, document-controls, grid-add-actions-13g), včetně matice CS/SK
  70–200 %, 1/2/3 panelů a 360 px bez oslabení očekávání. Unit 670/670;
  lint 0 chyb / 297 varování; formát dotčeného kódu a automatická sestava OK.
- Unit 668/668; Chromium 19/19 v cílených konečných bězích: geometrie 10,
  výpis 5, regrese 3, nový výpis 1. Radio při 70/200 % Firefox + WebKit 2/2.
- Lint 0 chyb / 298 varování; automatická kontrola sestavy a typů OK.
  Ruční tsgo/build prostředí nepovoluje. Formát dotčených souborů ověřen.
- Katalog 430 → 432 komponent, zachováno 430/430 původních názvů,
  props 764 → 813 bez odstranění. Manifest proti skutečnému začátku kola
  532 → 543, odstraněno 0. Původních 38 náhledových cest zachováno podle
  zákazu mazání; .dsignore je nadále vylučuje při attach.
- Plná matice Firefox/WebKit a fyzický telefon neověřeny; radio ano.

### BREAKING – migrace

- Úplné `DsTexts` doplňte také o povinné klíče `selectCreate.tag`,
  `selectCreate.emptyQuery`, `selectCreate.duplicate` a `documentForm.invalidDate`.
  Duplicitní název štítku nebo název/kód jednotky zakáže ＋ s vysvětlením CS/SK.
- U nového nebo upravitelného dokladu `DocumentForm` zapisuje odvozené datum účetního
  případu a automatické DUZP přes `onChange`; aplikace musí tyto hodnoty uložit.
  Při otevření dokladu jen pro čtení, zaúčtovaného, uzamčeného či stornovaného
  se nic nezapisuje a původní uložená data zůstávají zobrazena.
- `hint` u Field, DateField a CheckboxField zůstává pod polem; převod na ikonu
  je odložen do 2.106.0. Chyby a varování se pod polem nevykreslují.
- `Field.error`, chyby Input/RateField a varování DateField již nevykreslují text pod polem.
  Odstraňte vlastní podpolové zprávy; chyby/varování předejte také společnému pruhu,
  u DocumentForm použijte `fieldErrors`, `fieldWarnings`, `taxDocumentNumberWarning`.
  `DateField.warningDisplay="below"` je přijímáno jen pro kompatibilitu a ignorováno.
- `ContactSelect.onCreateNew` a `BankAccountField.onAddAccount` dostávají `searchText`;
  původní callback bez argumentu zůstává platný. Přidání není položkou výsledků.
- Vlastní rozšíření lišty nesmějí vyžadovat textové Uložit v každé šířce; cílení přes
  přístupný název zůstává stejné. Busy i dirty/disabled beze změny.
- `DocumentForm.accountingDateLinked` má výchozí true u příslušných druhů;
  pro staré samostatné datum předejte false. Existující `accountingDateLink` má přednost.
- Hlavičku rozšiřte o `taxDocumentNumber`, `taxDocumentNumberLinked`, `bankAccountKind`,
  `bankCode`, `bankIban`, `bankSwift`. Vazba čísla je výchozí true; znovuzamčení obnoví číslo.
- BA účetní datum nyní „Datum pohybu“, protiúčet má samostatný kód banky nebo IBAN/SWIFT;
  přemapujte dřívější spojený účet. ID má Partner a při DPH DUZP/Datum DPH.
- BankStatementForm stav stále řídí uzamčení, ale není štítkem. Pro nový výpis předejte
  `isNew` a `onSaveThenAdd(direction)`; aplikace musí nejprve úspěšně uložit výpis.
- Úplné DsTexts doplňte o stepper, selectCreate, dateQuick a documentEdit; částečné přepisy se doplní.


## 2.104.0 – Edit dokladu 13j–13l

### 13l – opravy kontroly

- Bankovní zůstatek má v obou měnách šířku 3 z 12 sloupců a stojí vpravo,
  nenulový rozdíl těsně vlevo; úzký panel pole zalomí. Číslo výpisu dědí velikost
  a písmo IdentityLine i při zamčení; vstup nepřetéká ani při 200 %.
- Uložit obnovuje původní ikonu Save + text; text zůstává i pod 640 px,
  primární varianta a dirty/disabled/busy beze změny. Busy ikonu nahrazuje spinnerem.
  Zamčený výpis předává Uložit disabledReason = lockedReason.
- FieldValue vrací zámek size-4 (16 px při 100 %), bez zvětšení na control-h;
  plain zůstává bez podkladu, klik/klepnutí vysvětlí důvod.
- Kompaktní zablokovaná primární akce: tooltip „Název: důvod“. Položky menu mají
  přístupný název jen z prvního řádku, důvod pouze v aria-describedby.
  PageHeader bez důvodu zachovává nativní disabled; destruktivní fokus zachován.
- Povolené Zkontrolovat/Zrušit kontrolu používá openOnTouch, nikoli blocked:
  běžný klik provede akci a tooltip nepřipíná; dotyk provede akci a původní
  vysvětlení ukáže na 3 s (Escape, odchod fokusu či klepnutí mimo jej zavře).
- Vyrovnaný AmountDifference nepřidává měnu stejně jako editor řádků;
  výpis nulový rozdíl nevykresluje. Nepoužitý import odstraněn.
- Manifest sladěn s .dsignore: 508 → 489, odebráno 19 náhledových cest
  (routes, router, start, routeTree.gen a náhledové texty); ukázky již byly vyloučeny.
  Historický rozsah 13k opraven na 526 → 508 (23 odebráno, 5 přidáno).
- Katalog proti 1131b2b4: 429 → 430 komponent, 759 → 764 props, odstraněné
  komponenty/props/sekce 0; 424 původních objektů shodných. Tokeny, assets,
  constraints a #enrichment beze změny. Verze obou míst zůstává 2.103.0.
- Lint 0 chyb / 292 varování; unit 660/660 (65 souborů). Samostatné tsgo ani
  build neprovedeny kvůli nadřazenému zákazu prostředí.
- E2E Chromium: 19/19 v konečných dílčích bězích (výpis 5, lišta 4,
  matice CS/SK a zoom 1, ostatní regrese 9). Původní souhrnný běh byl časově
  přerušen, proto se dokončil po souborech; nejde o jeden nepřerušený běh.
  Snímky a měření 960/360 px, domácí i cizí měna, číslo při zamčení a zámek
  při 100 % ověřeny. Skutečný Enter ověřen v Chromium, ne simulací jsdom.
  Dotyk provede kontrolu a vysvětlení zmizí po 3 s. Formát dotčených souborů
  OK, automatická sestava OK; Firefox/WebKit a fyzický telefon neověřeny.

### 13k – bankovní výpis

- Uložit používá společný RecordActionBar jako DocumentForm: primární tlačítko
  s ikonou a textem v každé šířce, nikdy jen ikona; společné dirty/disabled/busy.
  Příčinou ikonové podoby byl kompaktní režim
  RecordActionBar pod 640 px, který schovával text i u ukládání. Nyní krátí pouze
  sekundární akce; oprava platí pro všechny formuláře.
- Číslo výpisu se upravuje vpravo v IdentityLine; při pohybech nebo zamčení FieldValue
  ukáže číslo a zámek s důvodem dostupným i klepnutím.
- Datum vlevo a nepovinný „Zůstatek dle banky“ vpravo. Rozdíl pouze při vyplněném
  bankovním zůstatku a nenulové odchylce; společný AmountDifference také v editoru řádků.
- „Zůstatky dle pohybů“ mají pouze čtyři součty. Kontrola i zrušení kontroly vysvětlují
  svůj účel tooltipem dostupným také klepnutím; texty CS/SK.

### BREAKING – migrace 13k

- Odstraňte `value.note` z BankStatementValue a `texts.note` z BankStatementTexts;
  poznámka již není součástí výpisu.
- Číslo je pouze v identifikačním řádku: upravte cílení testů a vlastních rozšíření,
  které očekávaly číslo mezi Základními údaji; `value.number` a onChange se nemění.
- Vlastní úplné jazykové sady BankStatementTexts doplňte o `checkHint` a `uncheckHint`;
  přepište `bankClosing` a `balances` na nové názvy. Partial přepisy se doplní z DS.
- Veřejné nepovinné `IdentityLine.numberContent` umožňuje ovládání čísla;
  AmountDifference je nový sdílený veřejný export. Verze zůstává 2.103.0, bez Release.

### Ověření 13k

- Unit 660/660 (65 souborů); lint 0 chyb / 293 varování; kontrola formátu dotčených
  souborů prošla. E2E Chromium 5/5: nový výpis široký/úzký a dotyk 3/3 v jednom
  konečném běhu, původní scénáře výpisu a společného Uložit 2/2. První dotykový test
  neprošel kvůli změně vysvětlení po kontrole; tooltip nyní drží původní text klepnutí.
- Katalog proti začátku 13k: 429 → 430 komponent, 759 → 764 props, odstraněné 0;
  425 původních komponent beze změny. Manifest 526 → 508 položek včetně #enrichment:
  23 náhledových ukázek odebráno, 5 souborů přidáno; toto je historický rozsah 13k.
  Další sladění náhledových cest s .dsignore popisuje 13l. #enrichment zachován.
- Automatická sestava OK. Samostatné tsgo ani build neprovedeny: prostředí zakazuje
  ruční typové kontroly a sestavení. Nelze vykázat úspěch tsgo. Firefox/WebKit neběžely.

### 13j

- Bez BREAKING: `RecordSaveAction` a `RecordPrimaryAction` (tedy i `DocumentSaveAction`,
  `DocumentPrimaryAction`) mají nepovinný `disabledReason`. Zakázaná akce s důvodem v
  RecordActionBar, primární akce GridAddActions a lifecycle akce RecordDialog už nejsou
  nativně `disabled`: `aria-disabled`, `aria-describedby` s důvodem, klik/klepnutí/Enter/
  mezerník akci nespustí a otevřou tooltip (`DisabledReasonTooltip`). Bez důvodu beze změny.
- Položky nabídek s důvodem (sloučené „+ ▾“, další akce RecordActionBar, nabídka PageHeader)
  ukazují důvod jako druhý tlumený řádek; tooltip u položek zrušen. Interní
  `DisabledReasonMenuItem`.
- Tužka účtu v DocumentIdentityLine ukáže důvod i klepnutím.

## 2.103.0 – Edit dokladu 13i

- Bez BREAKING: zablokovaná akce s důvodem otevře tooltip i klikem/klepnutím (dotyk);
  zavře se po ~3 s, odchodem fokusu, Escape nebo klepnutím mimo. Klávesnice a čtečka beze
  změny. Jedno interní místo `DisabledReasonTooltip` pro BankStatementForm
  (checkDisabledReason), FieldToggleButton (lockedReason a tím CounterpartyInputField,
  PaymentOrderAccountField, AmountSection Σ, SuggestInput, DateField) a GridAction
  (disabledReason, tedy i useRowActions). Veřejné API se nemění.
- Oprava: součty skupin gridu (záhlaví, řádek součtu skupiny, tisk se seskupením)
  respektují `total: "none"` stejně jako ukotvený součtový řádek a export.

## 2.102.0 – Edit dokladu 13f–13h

### 13h

- Bez BREAKING: `DsTexts.grid.addMenu` je nepovinný s českou náhradou. Vlastní úplné
  sady textů nemusí přidávat klíč. Kaskáda měří plné i zkrácené texty a skutečnou šířku
  sloučeného tlačítka; pořadí plné → zkrácené → nabídka nezávisí na hranici 640 px.
- Zakázané položky nabídky zůstávají dostupné s tooltipem důvodu a neprovedou akci.
  Katalog doplňuje tokeny, popis checkDisabledReason a opravený typ IdentityLine.
- Manifest vyřazuje všechny náhledové ukázky podle `.dsignore`; doplňuje existující
  test přetečení záhlaví. Komponenty 429 → 429, žádný název nezmizel. Manifest
  523 → 503: 21 vyloučených ukázek a 1 doplněný test, ostatní soubory zachovány.
- Ověření 13h: unit 650/650 (63 souborů), E2E 9/9 jedním během bez opakování
  (Chromium, Firefox, WebKit: tři šířky, menu klik/klávesnice, 15 hranic bez přetečení,
  BA DUZP), lint 0 chyb / 292 varování. Automatická sestava OK; ruční typová kontrola
  ani build se dle omezení prostředí nespouštěly. Verze zůstává 2.101.0, bez Release.

### 13g

- BA (příjem i výdej) zobrazuje při zapnutém DPH DUZP stejně jako PO; Datum DPH se tak
  neváže na neexistující pole. Zamčení u příjmu (`vat.dateLockReadOnly`), odemykatelná vazba
  u výdeje (`vat.dateLink`) a výchozí hodnoty DUZP řídí aplikace – DS hodnoty nedoplňuje.
  Kurz DPH (`vatRateField`) se u BA zobrazuje beze změny podmínek. Ukázka BA výdej EUR.
- Lišta gridu: `GridAddAction` má nové nepovinné `shortLabel` a `icon`. Dvě a více
  primárních akcí: plný text → zkrácený text podle dostupné šířky → v úrovni 3 jedno modré tlačítko
  „+ ▾“ (`aria-haspopup="menu"`) s položkami. Jedna akce beze změny. `onClick` dostane
  z nabídky událost výběru (typ rozšířen na `SyntheticEvent | Event`, existující handlery
  zůstávají kompatibilní). `GridAddActions` přesunuto do vlastního modulu, veřejné
  importy beze změny. Nový nepovinný klíč `DsTexts.grid.addMenu` (CS/SK) s českou náhradou,
  bez BREAKING změny pro vlastní sady textů.
- Verze: `meta.version` a `package.json` = 2.101.0 (poslední vydaná), aby Release nabídl 2.102.0.

### 13f

- BankStatementForm: nový nepovinný prop `checkDisabledReason`. Vyplněný důvod zakáže
  „Zkontrolovat“ sdíleným mechanismem (aria-disabled, tlačítko zůstává fokusovatelné,
  tooltip a aria-describedby s důvodem, klik nevolá `onCheckedChange`). „Zrušit kontrolu“
  se tím neřídí; bez propu je chování beze změny. Ukázka „nelze zkontrolovat“.
- Verze: `package.json` a `meta.version` jsou nově vždy stejné (dialog Release bere
  Current z `meta.version`). Bez BREAKING změn.

## 2.101.0 – Edit dokladu 13–13e

- Obsah kol 13–13e byl vydán pod štítkem v2.101.0 (dříve zde uváděno jako 2.100.0).

- Nové FieldToggleButton: vsazená geometrie, jednotný pravý prostor, stálý název,
  aria-pressed, fokusovatelný zakázaný stav a tooltip důvodu.
- Převedeny CounterpartyInputField (ContactRound), PaymentOrderAccountField (Landmark),
  součet v DocumentForm/AmountSection (Sigma) a všechny SuggestInput (History).
  Jiný přepínač uvnitř polí nebyl nalezen; ND v JournalCell a DateField.link jsou výjimky.
- ND a vazba data: stálé názvy, aria-pressed, sdílený zakázaný vzhled a důvody;
  datumové tokeny a šířky dokladů zůstávají beze změny.
- BankStatementForm: identita, přilepené akce, zůstatky, porovnání s bankou,
  domácí měna, položky v řízeném slotu, readOnly/dirty a CS/SK ukázky.
  Ukázkové Uložit pracuje jen se stavem ukázky; knihovna neukládá produkční data.
### BREAKING – migrace (Edit dokladu 13 a opravná kola 13b–13e)

- CounterpartyInputField používá ContactRound v obou režimech; partner má
  aria-pressed=true. `partnerModeLabel` / `manualModeLabel` zůstávají jako nepovinné
  `@deprecated` od 2.100.0, ale jsou ignorované; přepisy přesuňte do
  `DsTexts.fieldToggle.directory` / `directoryUnpressed`. Odstranění v 3.0.0.
- `DocumentForm.texts.sumFromLines` / `selectFromDirectory` / `enterManually`
  jsou nepovinné `@deprecated` od 2.100.0 a ignorované. Použijte
  `fieldToggle.sumPressed` / `directory` / `directoryUnpressed`.
  `journalEditor.nonTaxOn` / `nonTaxOff` jsou nepovinné `@deprecated`, ignorované;
  jejich náhradou je `fieldToggle.nonTaxPressed` / `nonTaxUnpressed`.
  Odstranění těchto kompatibilních klíčů je plánováno v 3.0.0.
- Úplné `DsTexts` musí nově obsahovat povinné oblasti `bankStatement` a
  `fieldToggle` (včetně `locked`) a `documentForm.vatDateLinkLabel`.
  Vycházejte z DS_TEXTS_CS / DS_TEXTS_SK; částečné přepisy provideru zůstávají podporované.
- Přístupné názvy přepínačů jsou stálé: adresář, našeptávač, součet a ND nepojmenovávají
  cílový stav. Výchozí vazba má název „Svázat s datem vystavení“, Datum DPH
  „Svázat s DUZP“ (CS/SK přes DsTexts); vlastní název předá `DateFieldLink.label`.
- Přepínače polí a vazeb používají `aria-disabled` místo nativního `disabled`:
  zamčené prvky jsou nově fokusovatelné. Stav čtěte z aria-pressed / aria-disabled,
  důvod z aria-describedby. Neprovádějte akce na zamčeném prvku.
- SuggestInput má vsazené, nikoli celovýškové tlačítko. Odstraňte vlastní polohování
  historie; rezervu určuje --field-toggle-space odvozená na každém prvku z lokální
  --control-h. Zamčení bez konkrétního důvodu vysvětluje fieldToggle.locked,
  nikoli text vybízející ke kliknutí.

### Opravy 13e (bez vydání)

- Pravidlo 20 obnoveno přesně podle 98810718: jednořádkový popisek může při
  krajním nedostatku místa použít výpustku; plný text zůstává v title/tooltipu.
  Sekce 13b/13c a rules prověřeny; nikde nevyžadují nezkrácené běžné popisky.
- ZoomGrid při overflowFallback vypíná přilnutí typu pane: vlastní rolovací
  kontejner nepřebírá posun vnější lišty a záhlaví nepřekrývá první řádek.
  Bez nového !important, bez změny rozměrů ND a bez změny veřejného API.
- Obnoveno tvrzení @min-[40rem]:col-span-4. Manifest doplňuje archivovaný plán 13b.
- Záznam 13d upřesňuje skutečné toPass a časové limity; posluchač kolečka existuje.
- Verze zůstává 2.100.0; Release ani ruční tsc/typecheck/build neproběhly.

#### Kontrola 13e

- **Unit 639/639**, 62 souborů, 2 021 assertions; **lint 0 chyb / 293 varování**;
  formát všech změněných TS/TSX souborů OK, automatická sestava build OK.
- **E2E 60/60 jedinečných scénářů**, po 20 v Chromium, Firefox a WebKit:
  edit-document-thirteen (10), journal-editor (6), grid-control-styles (3),
  document-date-link (1): 10 + 6 + 3 + 1 = 20 na prohlížeč.
  První běh: 57 prošlo, 3 selhaly na nejednoznačném výběru „Zpět“ v journal-editor.
  Po zpřesnění na exact:true cílený běh tří stejných scénářů prošel 3/3.
  Nejde o jeden čistý běh; workers=1, retries=0, žádné limity nebyly prodlouženy.
  Nový test ND má vlastní limit 90 s místo zděděného limitu 480 s matice.
  Datumová vazba ponechává toPass 60 s; grid-control-styles také ponechává
  existující toPass pro barevné stavy. Žádné nové toPass nebylo přidáno.
- Důkazy: /tmp/13e-e2e.log (35,7 min), /tmp/13e-undo-final.log (1,9 min),
  /tmp/13e-unit-final.log, /tmp/13e-lint-final.log. Izolované ověření nového ND
  navíc prošlo 3/3; není připočítané k 60 jedinečným scénářům.
- Katalogy proti **dae1b93b**: 429 → 429, všechny komponenty a props shodné;
  components.md a oba markdownové katalogy bajtově shodné. JSON shodný kromě
  jedné přidané položky manifestu archivovaného plánu 13b (518 → 519).
  Kontrolní skript proti 98810718 rovněž prošel: 426 → 429, odstraněné 0,
  props 722 → 758, odstraněné 0; žádné nové změny props v 13e.

| Bod 13e | Stav | Důkaz |
|---|---|---|
| 1 | Hotovo | Pravidlo 20 přesně z 98810718; rules a sekce 13b/13c bez rozporného požadavku |
| 2 | Hotovo | elementFromPoint zasáhne ND prvního řádku; jeden nd.click bez force přepne stav při zoomu 100/100 ve třech prohlížečích |
| 3 | Hotovo | Obnovené tvrzení col-span-4; jednotkové testy prošly |
| 4 | Hotovo | Pravdivé toPass/limity i posluchač kolečka; archivovaný plán v manifestu; katalogy beze změny |

### Opravy 13d (bez vydání)

- RecordActionBar: zalamování a růst levých textových tlačítek platí jen pro
  `[data-slot=button]` výslovně mimo `role=switch` a `role=checkbox`. DPH Switch
  se neroztahuje; geometrie vydání 2.99.0 je 20 × 36 px při 100 %, 40 × 72 při 200 %.
- Zrušeno dynamické měření a zmenšování běžných popisků Field včetně samostatného
  hooku, importu, volání a manifestového záznamu. Písmo se nezmenšuje, dlouhý text
  má původní výpustku a celý text v title. Sdílené kompaktní datumové měření zůstává.
- FieldGrid v úzkém kontejneru převádí **všechny přímé děti** do jednoho sloupce,
  nikoli jen Field. Výpis nemá zbytečné col-span-2 ani lokální vzhledové výjimky.
- FieldValue má výchozí role group; aria-labelledby váže číslo, poznámku, všechny
  čtyři součty, zůstatek podle banky i rozdíl na jejich popisky. Unit ověřuje osm skupin
  přímo podle přístupného jména. Vlastní DOM props včetně role zůstávají předatelné.
- Ukázka zamčeného našeptávače má vlastní aria-label. Test běžného našeptávače
  vybírá pole Popis a jeho jediné tlačítko, nikoli první ze dvou stejně pojmenovaných.
- Obnovena výslovná tvrzení grid-cols-1 a @min-[40rem]:grid-cols-12; test platebního
  příkazu kliká nepodmíněně a ověřuje výchozí i výsledný stav.
- Manifest odstraňuje neexistující plán a přidává referenční ND měření.
  Katalogový skript povoluje pouze odstranění tohoto smazaného souboru, nikoli komponent.
- Specifikace edit-document-thirteen nepoužívá toPass. Datumová vazba v
  document-date-link ponechává toPass s limitem 60 s; edit-document-twelve
  ponechává celkový limit 480 s (v bázi 98810718 byl 240 s). Celkový limit
  480 s zůstává pro rozsáhlou matici 40 rozvržení a 18 ND měření v pomalých prohlížečích;
  běžné očekávání je 10 s. Dvě animationFrame po změně zoomu čekají na vykreslení.
  ND mění zoom skutečnými tlačítky lišty a stav nativní klávesou Space.
  Posluchač kolečka v grid-zoom existuje; tehdejší pokus syntetickou událostí
  neověřil správný cíl ani odezvu. Překrytí prvního řádku záhlavím opravuje 13e.
  Geometrie přepínačů se měří ve stabilní ukázce, ne v průběžně nahrazovaných datech.
- tsc/typecheck **neproběhl** kvůli nadřazenému zákazu prostředí; nesdělujeme úspěch.
  Verze zůstává 2.100.0 a Release nebyl proveden.

#### Kontrola 13d

- **Unit 636/636**, 61 souborů, 2 016 assertions. **E2E 48/48 jedním čistým během**
  (Chromium 16, Firefox 16, WebKit 16), 36 minut, workers=1, retries=0;
  bez toPass v edit-document-thirteen; datumová vazba ponechává toPass 60 s.
  Předchozí diagnostické běhy byly zastaveny po selhání; jejich výsledky
  nejsou připočteny. Konečný důkaz: `/tmp/13d-e2e-single.log`.
- **Lint 0 chyb / 293 varování**, formát změněných zdrojů a testů OK, automatický build OK.
  Ruční tsc ani build neproběhl; typy po Update zůstávají neověřené.
- Katalogy proti **98810718**: **426 → 429**, odstraněné komponenty/sekce **0**,
  deset dotčených původních objektů, **416 bajtově shodných**. Props **722 → 758**:
  odstraněné 0, 36 nových, tři již povolené změny defaultů. Manifest **505 → 518**:
  proti bázi odebrán pouze neexistující plán, nový referenční soubor zahrnut;
  #enrichment zachován. Kontrolní skript prošel všemi čtyřmi katalogy.

| Bod 13d | Stav | Důkaz |
|---|---|---|
| 1 | Hotovo | DPH Switch 20 × 36 / 40 × 72 px v E2E všech tří prohlížečů |
| 2 | Hotovo | Hook odstraněn; title, výpustka, stejné písmo a hranice pole ve 40 rozvrženích CS/SK |
| 3 | Hotovo | Osm pojmenovaných skupin přes getByRole(group, name), unit prošel |
| 4 | Hotovo | Úzká mřížka aplikuje col-span-1 a col-start-auto na všechny přímé děti |
| 5 | Hotovo | Obnovená obě třídová tvrzení; nepodmíněný klik a stavy příkazu ve třech prohlížečích |
| 6 | Hotovo | Zamčený SuggestInput má aria-label, běžný test vybírá jediné tlačítko pole Popis |
| 7 | Hotovo | Katalogový skript, referenční soubor v manifestu, bez col-span-2 výpisu |
| 8 | Hotovo | Pravdivé cílení textových tlačítek; žádné dynamické zmenšování Field; tsc neproveden |

### Opravy 13c (bez vydání)

- ND: žádné nové `!important`, čtyři obecná gridová pravidla přesně podle 98810718;
  původní `text-[0.65rem]`, stálý název a samostatné `aria-describedby` při zamčení.
  Skutečné DOM konstanty změřeny na dočasně spuštěném zdroji 98810718 po načtení písem
  v Chromium, Firefox a WebKit: oba stavy × aplikační 70/100/200 % × gridový 60/100/140 %.
  Test `non-tax-baseline.ts` uchovává 54 měření; tolerance rozměrů i písma ±0,5 px.
- BankStatementForm: PageLayout a karta bez vlastních přepisů, datum měří společný
  `useCompactDateGeometry` také použitý DocumentDatesSection. FieldGrid pod 40 rem skládá
  pole do jediného sloupce; popisky zachovávají původní zkrácení a title.
- BREAKING: hustá FieldGrid pod 40 rem nyní jeden sloupec místo mobilních dvojic;
  přestaňte spoléhat na dvojice nebo vlastní col-span v úzkém kontejneru. Nový volitelný
  Field.labelId slouží k aria-labelledby hodnot jen ke čtení bez nesprávného htmlFor.
  Úplné vlastní BankStatementTexts doplňte o lockedChecked, lockedPosted, lockedReadOnly;
  existující částečné přepisy texts zůstávají kompatibilní.
- Textová tlačítka levého obsahu RecordActionBar mohou růst na výšku; pravidlo
  cíleně vynechává přepínače a checkboxy (oprava rozsahu v 13d).
- Důvody akcí výpisu vyjadřují stav výpisu v CS/SK; číslo, poznámka a bankovní zůstatek
  mají vlastní přístupné jméno z popisku. Ukázka nepoužívá zastaralé režimové popisky.
- `--field-toggle-space` je v @layer base a na každém prvku závisí na lokálním --control-h.
  Zrušené --non-tax-font-size, --text-bank-label a --bank-date-scale nejsou ani v katalogu.
- DateField.className má shodně v JSON a tabulce props výchozí hodnotu neurčenou.
- Požadovaný `bunx tsc --noEmit -p tsconfig.json` nebyl spuštěn: nadřazená pravidla
  tohoto prostředí výslovně zakazují ruční typecheck i build. Výsledek typů nelze
  prohlásit za ověřený; po Update ověřte v aplikaci. Automatickou sestavu kontroluje platforma.

- Ověření 13c: **unit 636/636**, 61 souborů, 2 004 assertions;
  **lint 0 chyb / 293 varování**, kontrola formátu změněných souborů OK,
  automatická sestava build OK. Ruční tsc/build neprovedeny z výše uvedeného zákazu.
- **E2E 45/45 unikátních scénářů**, 15 na prohlížeč. Chromium 13 + dvě cílená
  opakování ND/vsazení; Firefox 14 + opakování symbolů po čekání na skutečný stav;
  WebKit 4 cílené + 10 zbývajících + opakovaný panelový test s delším čekáním.
  Původní běhy měly časová selhání; nejde o jediný čistý běh 45 testů.
  Tolerance ±0,5 px ani podmínka scrollWidth <= clientWidth nebyly zmírněny.
- Katalogy proti **98810718**: 426 → 429, odstraněné komponenty i sekce 0;
  devět dotčených původních objektů, **417 bajtově shodných**. Manifest 505 → 519,
  odstraněné 0 a #enrichment zachován. Tabulky props **722 → 758**, odstraněné 0,
  36 nových řádků; tři explicitní změny defaultů z 13b beze změny, DateField shodně
  v JSON i tabulce bez defaultu className. Důkaz: katalogový kontrolní skript.

| Bod 13c | Stav | Důkaz |
|---|---|---|
| 1 | Hotovo | CSS gridu přesně dle báze; ND 54 DOM konstant, oba stavy a všech devět zoomů; E2E ve 3 prohlížečích |
| 2 | Hotovo | Bez bankovních přepisů; sdílené datumové měření a FieldGrid; CS/SK, 1/2/3 panely, 360 px, 70–200 %, popisky s title |
| 3 | Blokováno | Nadřazené pravidlo zakazuje ruční tsc/typecheck; příkaz nebyl spuštěn, typy po Update neověřeny |
| 4 | Hotovo | E2E DocumentForm 360 px / 200 %, text nepřesahuje tlačítko |
| 5 | Hotovo | lockedChecked / lockedPosted / lockedReadOnly CS/SK, stavové důvody v akcích |
| 6 | Hotovo | Unit aria-labelledby čísla, poznámky a zůstatku dle banky |
| 7 | Hotovo | Kontrolní skript porovnává default DateField.className JSON a tabulku |
| 8 | Hotovo | Rezerva v @layer base, dokumentace lokálního --control-h, E2E lokální výšky |
| 9 | Hotovo | Computed style Landmark/Sigma/History; Svázat s DUZP / Prepojiť s DUZP ve 3 prohlížečích |
| 10 | Hotovo | Ukázka bez deprecated režimových popisků, interakce ve 3 prohlížečích |

### Opravy 13b a ověření

- Výpis používá RecordActionBar bez selektorových úprav potomků. Uložit odpovídá
  DocumentForm: při šířce lišty ≥ 640 px ikona + text, pod 640 px ikona s názvem
  a tooltipem; busy vykreslí spinner. Levý obsah se ve sdílené liště drží mimo akce.
- IdentityLine je společný veřejný řádek pro oba formuláře; jejich identita i pole
  používají stejnou kartu sekce. Výpis podporuje Ctrl/Cmd+S a vlastní TooltipProvider.
- V kole 13b byla ND chybně vynucena na 24 × 24 px a ikonu 14 px; 13c tento přepis
  odstraňuje a obnovuje skutečnou vydanou kaskádu gridu. Datumové šířky dokladu ani --document-date-* se nezměnily.
- Datum výpisu používá stejné tokenové měření aktivního formátu. V kole 13b měla krajně úzká
  karta vlastní přepisy popisků a data; 13c je nahrazuje společným datumovým měřením a 13d obnovuje původní popisky.
  E2E od 13d kontroluje původní zkrácení s title a rozměry uvnitř pole, ne menší písmo.
- Texty výpisu jsou rozdělené na CS/SK moduly, sekce uložené běžným písmem;
  verzálky zajišťuje CSS. Domácí sekce je „Zůstatky v {currency}“.
- Odstranění a změna kontroly mají při zamčení vysvětlení; popisky jen čtených
  hodnot nemají htmlFor ukazující na div. Jednotkový test renderuje výpis s položkami
  bez vnějšího TooltipProvider.
- **Unit: 633/633**, 61 souborů, 1 995 assertions. **E2E: 39/39** jedinečných
  scénářů: Chromium / Firefox / WebKit po 13 (Edit 13b po 6, Edit 12 po 5,
  datumová vazba a částka po 2). Běhy rozdělené kvůli časovému limitu prostředí;
  WebKit datumový a panelový test mají delší limit, měření čeká na stabilní stav.
- **Lint: 0 chyb / 293 varování.** Prettier kontrola změněných TS/TSX/CSS prošla.
  Automatická sestava: build OK. **`tsc --noEmit` nebyl spuštěn**: prostředí zakazuje
  ruční build i typové kontroly; není vykázán jako úspěšná kontrola.
- Báze **98810718** je zdroj vydaného v2.99.0, ale její **meta.version je 2.98.0**,
  nikoli 2.99.0. Připravené package.json i meta.version zůstávají 2.100.0; bez Release.
- Katalogy a indexy: **426 → 429**, odstraněné **0**; nové FieldToggleButton,
  BankStatementForm a IdentityLine. Jen sedm dotčených původních objektů,
  **419 bajtově shodných**. Manifest **505 → 517**, odstraněné **0**,
  #enrichment zachován. DocumentActionBar a cizí objekty/sekce zůstaly shodné.
- Tabulky props: **722 → 757**, odstraněné původní řádky **0**, nové **35**.
  Tři změny proti bázi jsou explicitně ověřené: DateField.className již nemá
  výchozí `relative`; SuggestInput.enabledLabel / disabledLabel přecházejí
  z pevných českých defaultů na DsTexts. `warningDisplay=below` a `debounceMs=200`
  jsou obnovené a přesně shodné s bází.
  Důkaz: `python3 scripts/verify-edit-document-thirteen-catalogs.py`.

| Bod 13b | Stav | Důkaz |
|---|---|---|
| 1 | Hotovo | E2E shoda Uložit s DocumentForm, text/ikona, tooltip a busy spinner |
| 2 | Nahrazeno v 13c | Původně vynucené rozměry neodpovídaly vydané kaskádě |
| 3 | Hotovo | DateFieldLink.label + DPH CS/SK; date-link hledá jedinečný název |
| 4 | Hotovo | Unit obecného důvodu CS/SK, fokus a neprovedená změna |
| 5 | Hotovo | BankStatement unit s hasItems bez vnějšího provideru |
| 6 | Hotovo | IdentityLine, společná karta, Ctrl/Cmd+S unit a datumové regrese |
| 7 | Kód a dokumentace hotové; tsc neprovedeno | Nepovinné deprecated props, migrace a pravdivá meta báze; omezení prostředí |
| 8 | Hotovo | Katalogový skript porovnává každý řádek props a oba defaulty |
| 9 | Hotovo | E2E scrollWidth <= clientWidth pro všechny popisky CS/SK |
| 10 | Hotovo | Landmark/Sigma/History/ContactRound rozměry + computed zakázané barvy |
| 11 | Hotovo | CS/SK moduly a nadpis domácích zůstatků ověřen v unit/E2E |
| 12 | Hotovo | Zamčené akce mají důvod; htmlFor jen u skutečných ovládání |
| 13 | Hotovo | E2E lokální --control-h=3rem mění rezervu přepínače |

## 2.99.0 – Edit dokladu 12i

Obsah 12i byl nejdřív omylem vydán znovu pod štítkem v2.98.0, spotřebitelům se proto dodává jako v2.99.0.

- SegmentedField: pouze zakázaná vybraná volba nově používá plné `bg-muted`,
  `text-foreground` a tučný řez bez primární barvy. Zakázaná nevybraná ani povolené
  volby se nemění; žádné ikony ani nové tokeny. Segmenty gridu a sdílené CSS beze změny.
- Ukázka porovnává shodné povolené a zakázané segmenty; lišta obsahuje zakázané
  textové tlačítko. Unit kontroluje oba stavy a zachování ovládání povolené volby.
- E2E nově porovnává oba zamčené segmenty s povoleným stavem a měří kontrast každého.
  Rámečky lišty ověřuje proti sondě tokenů: běžný a ikonový prvek border, Přidat steel
  a hover navy, otevřený neaktivní rozbalovač primary/chrome mix, kontext chrome-border,
  zakázaný input a 1px. Příprava čeká na připojení lišty; otevřený rozbalovač sleduje
  stabilně podle jména, nikoli podle měnícího se aria-expanded.
- `package.json` srovnána s vydanou verzí 2.98.0. Katalogy upraveny pouze pro
  SegmentedField proti 082c0b07; nevkládají poznámky do cizích sekcí.
- Kontroly: unit **617/617**, 59 souborů, 1 947 assertions; lint **0 chyb / 293 varování**;
  formát všech upravených TS/TSX souborů OK. Ruční `tsc`/typecheck ani build nebyly
  spuštěny, protože je prostředí nepovoluje; automatický build OK.
- Finální E2E **30/30**: `grid-control-styles.spec.ts` 9/9,
  `document-disabled-inputs.spec.ts` 6/6, `edit-document-twelve.spec.ts` 15/15;
  Chromium, Firefox a WebKit po 10 scénářích. Datumové běhy byly rozdělené podle
  prohlížeče kvůli limitu příkazu. První gridový běh měl čekání na hydrataci WebKitu
  příliš krátké; po explicitním čekání na připojenou lištu všech 9 testů prošlo.

| Zakázaný segment | Světlý režim | Tmavý režim |
|---|---:|---:|
| Vybraný | 14,67 : 1 | 12,19 : 1 |
| Nevybraný | 5,75 : 1 | 7,23 : 1 |

Naměřeno shodně v Chromium, Firefox i WebKit; všechny hodnoty ≥ 4,5 : 1.
Všechny požadované rámečky odpovídají CSS a tokenům, nebylo třeba měnit CSS.

Výstup `python3 scripts/verify-edit-document-catalogs.py`:

```text
JSON: 426; změněné: SegmentedField; shodné: 425
components.md: 426; všech sekcí: 38; změněné: []; nové: ['### SegmentedField 2.98.0 – Edit dokladu 12i [1]']
.lovable/rules/components.md: 426; všech sekcí: 426; změněné: ['### SegmentedField [1]']; nové: []
.lovable/rules/library-guidelines.md: 426; všech sekcí: 11; změněné: []; nové: ['## SegmentedField – Edit dokladu 12i (2.98.0) [1]']
DocumentActionBar i všechny neuvedené sekce a JSON objekty jsou bajtově shodné; #enrichment zachován.
```

Změněné soubory proti 082c0b07:

- `package.json`
- `roadmap.md`
- `CHANGELOG.md`
- `src/components/ds/form/segmented-field.tsx`
- `src/components/showcase/FormDesignTwoShowcase.tsx`
- `src/routes/components.grid.tsx`
- `tests/unit/disabled-controls.test.tsx`
- `tests/e2e/grid-control-styles.spec.ts`
- `scripts/verify-edit-document-catalogs.py`
- `.lovable/design-system.json`
- `components.md`
- `.lovable/rules/components.md`
- `.lovable/rules/library-guidelines.md`

Jediná zdrojově změněná veřejná komponenta: **SegmentedField**, bez změny API.
Nové kontrolní poznámky mají vlastní sekce; ostatních 425 JSON objektů a všechny
původní cizí sekce zůstaly bajtově shodné. Escapování `<` zachováno.

## 2.97.0 – Edit dokladu 12h (nevydáno)

- Základní pravidla lišty gridu vylučují zakázané prvky přes `:where()`, bez zvýšení
  specificity. Aktivní filtr, hledání a kontextové období zachovávají filter-active
  a tónovaný podklad; hover Přidat i ikonového ovladače mění barvu nebo podklad.
- Zakázaná vybraná SegmentedField zachovává primary/10 a primary. Kontrast vybrané
  volby je **6,33 : 1 světlý / 5,35 : 1 tmavý** ve všech třech prohlížečích.
- Celkem zůstává při zákazu editace readOnly, nikoli disabled; jde zaměřit klávesnicí,
  označit a kopírovat. Zachovává tučný bezpatkový řez a tlumený podklad. RateField
  nemá aria-disabled na obecném div; tooltip a trvalý přístupný popis zůstávají.
- Radix ukázka obsahuje SelectContent a SelectItem EUR. E2E porovnává pozadí všech
  měřených ovládání (i bez id), rámečky s DUZP stejného formuláře, vyplněné hodnoty
  nejsou kurzívou. Datum DPH zachovává varovný rámeček. Zakázaná pole mají kontrast
  **5,75 : 1 světlý / 6,30 : 1 tmavý**, samostatné výběry **5,75 / 7,23 : 1**.
- Odstraněny mrtvé disabled utility na Plus a zamčeném div a duplicitní utility Input.
  Button má zakázané varianty šedé s tlumeným textem; plošné přebarvení vnořených
  spanů odstraněno, aby nerušilo odznaky. Duplicitní úvod 12g opraven.
- Starší unit kontrola zdrojového textu rámečku nahrazena výpočtem skutečného stavu;
  computed rámečky a hover kontroluje prohlížečový test. Žádné nové API ani vydání.
- Unit **616/616**, 59 souborů, 1 939 assertions. Lint **0 chyb / 293 varování**.
  Samostatný typecheck a ruční build nebyly spuštěny (prostředí je zakazuje);
  automatický build OK. Finální ověření všech 30 souvisejících scénářů prošlo (Chromium 10, Firefox 10,
  WebKit 10). Běhy byly rozdělené; úplné zakázané ovládání 6/6, vybrané segmenty
  s kontrastem 3/3, aktivní/hover lišty 3/3, datumy 15/15 a částka 3/3.
  První společný běh překročil limit 600 s; souběžné běhy původně kolidovaly ve
  složce stop a krátké čekání na připravenou ukázku selhalo. Po izolaci výstupů
  a úpravě čekání finální běhy výše prošly. Formát src/tests OK.
- Gridová ukázka pro měření izoluje první existující grid od dalších smrštěných ukázek
  a poskytne mu dostatečnou šířku pro plnou lištu; nemění třídy ani stavové barvy.
  Aktivní hledání a období vznikají skutečnou interakcí; režim mění skutečný přepínač.
- Zdrojově dotčené veřejné komponenty tohoto kola: **Button, Input, SegmentedField,
  RateField, DocumentForm, TagPicker, ChipMultiSelect**; interní LockedAccountValue.
  Sdílené CSS obnovuje vzhled GridToolbar/GridSearch/GridFilterToggle/GroupControl/
  GridPeriodFilter/GridContextBar a jejich ikonových akcí, beze změny veřejného API.
- Katalogy **426/426/426/426**; kumulativní rozdíl proti b27379e4 je 30 komponent,
  **396 ostatních JSON objektů bajtově shodných**. Ověřují se všechny sekce ##/###,
  včetně DocumentActionBar. Níže je přesný výstup kontrolního skriptu:

```text
JSON: 426; změněné: AccountSelect, BankAccountField, BookSelect, Button, CalendarPicker, CategorySelect, ChipMultiSelect, ContactSelect, CountrySelect, DateField, DateRangeField, DecimalInput, DimensionSelect, DocumentForm, Field, Input, LegalFormField, MultiSelect, OptionSelect, PartnerSelect, PaymentOrderAccountField, RateField, ResizableCombobox, SegmentedField, SelectTrigger, TagPicker, Textarea, UnitSelect, VatCodeSelect, VsField; shodné: 396
components.md: 426; všech sekcí: 37; změněné: ['### DocumentForm 2.31.0 [1]']; nové: []
.lovable/rules/components.md: 426; všech sekcí: 426; změněné: ['### AccountSelect [1]', '### BankAccountField [1]', '### BookSelect [1]', '### Button [1]', '### CalendarPicker [1]', '### CategorySelect [1]', '### ChipMultiSelect [1]', '### ContactSelect [1]', '### CountrySelect [1]', '### DateField [1]', '### DateRangeField [1]', '### DecimalInput [1]', '### DimensionSelect [1]', '### DocumentForm [1]', '### Field [1]', '### Input [1]', '### LegalFormField [1]', '### MultiSelect [1]', '### OptionSelect [1]', '### PartnerSelect [1]', '### PaymentOrderAccountField [1]', '### RateField [1]', '### ResizableCombobox [1]', '### SegmentedField [1]', '### SelectTrigger [1]', '### TagPicker [1]', '### Textarea [1]', '### UnitSelect [1]', '### VatCodeSelect [1]', '### VsField [1]']; nové: []
.lovable/rules/library-guidelines.md: 426; všech sekcí: 10; změněné: ['## Edit dokladu 12 (2.96.0) [1]']; nové: ['## Edit dokladu 12b (2.97.0) [1]', '## Edit dokladu 12c (2.97.0) [1]', '## Edit dokladu 12f (2.97.0) [1]', '## Edit dokladu 12g (2.97.0) [1]', '## Edit dokladu 12h (2.97.0) [1]']
DocumentActionBar i všechny neuvedené sekce a JSON objekty jsou bajtově shodné; #enrichment zachován.
```

- Soubory změněné v tomto kole proti 27cb7569:

- `.lovable/design-system.json`
- `.lovable/rules/components.md`
- `.lovable/rules/library-guidelines.md`
- `CHANGELOG.md`
- `components.md`
- `roadmap.md`
- `scripts/verify-edit-document-catalogs.py`
- `src/components/ds/accounting/document-form/AmountSection.tsx`
- `src/components/ds/accounting/locked-account-value.tsx`
- `src/components/ds/form/TagPicker.tsx`
- `src/components/ds/form/chip-multi-select.tsx`
- `src/components/ds/form/rate-field.tsx`
- `src/components/ds/form/segmented-field.tsx`
- `src/components/showcase/FormDesignTwoShowcase.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/styles.css`
- `tests/e2e/document-disabled-inputs.spec.ts`
- `tests/e2e/grid-control-styles.spec.ts`
- `tests/unit/disabled-controls.test.tsx`
- `tests/unit/grid-toolbar-2211.test.ts`

## 2.97.0 – Edit dokladu 12g (nevydáno)

- Úplná inventura spouštěčů: PartnerSelect, AccountSelect, VatCodeSelect, DimensionSelect,
  UnitSelect, CategorySelect, CountrySelect, LegalFormField, ContactSelect, CalendarPicker,
  DateRangeField, MultiSelect, TagPicker a ChipMultiSelect; BookSelect dědí OptionSelect,
  ResizableCombobox je pouze obal a dědí stav vloženého výběru. Společný Button sjednocuje
  také ikonové akce polí, přepínače a zakázané akce lišty. MultiSelect, ContactSelect,
  TagPicker, ChipMultiSelect a ResizableCombobox nemají vlastní disabled prop; nové API
  se nezavádí, společný stav je připravený na jejich podkladovém prvku.
- Zakázaný text je muted-foreground bez průhlednosti. Placeholder i prázdná hodnota mají
  navíc kurzívu. Podklad zůstává muted/40 a běžný rámeček input. Pravidlo leží ve vrstvě
  components; stavové warning/destructive/aria-invalid a spotřebitelské utility mají přednost.
  Starší lišta gridu již nepřebíjí barvy zakázaných akcí. E2E ověřuje warning rámeček Data DPH.
- Celkem, Kurz i VS používají sans, text-sm a tabular-nums. Celkem zůstává tučně v obou
  režimech součtu; při 100/150/200 % mají stejnou výšku a písmo. Horní hrany se porovnávají
  v každém skutečném řádku: při nedostatku šířky se celé skupiny mohou přirozeně zalomit.
- Doklad jen pro čtení ověřuje dynamicky všechna zakázaná ovládání, včetně Partnera,
  externího čísla, všech dat a kalendářů, VS/KS/SS, Popisu, zamčeného účtu a jeho příkazu,
  Kurzu, Celkem, Σ, Měny a akcí řádků. Samostatně je zakázaný výběr měny, prázdný výběr
  a Radix SelectTrigger. Režim mění skutečné tlačítko, kontroluje html.dark a čeká na dokončení
  barevných přechodů. Barva zakázaného textu se liší od povoleného, prázdný obsah od hodnoty.

| Měřená skupina (Chromium / Firefox / WebKit) | Světlý kontrast | Tmavý kontrast |
|---|---:|---:|
| Všechna zakázaná pole a akce stejného dokladu | 5,75 : 1 | 6,30 : 1 |
| Samostatný výběr Měna, prázdná hodnota, Radix SelectTrigger | 5,75 : 1 | 7,23 : 1 |

- Výsledky: unit **615/615**, 59 souborů, 1 937 assertions; související E2E **24/24**
  (Chromium 8, Firefox 8, WebKit 8; datumy 15, částka 3, zakázaná pole 6).
  Finální datumový běh 15/15, finální běh zakázaných polí 6/6, částka 3/3.
  Předchozí běhy odhalily monospace VS, starší přepis barev lišty a přechod barev WebKitu;
  po opravách všechny uvedené finální kontroly prošly. Lint **0 chyb / 294 varování**,
  formát src a tests OK. Automatický build OK. Samostatný typecheck a ruční build
  nebyly spuštěny (prostředí je zakazuje). Verze zůstává 2.97.0, nevydáno.
- Duplicitní manifestový klíč odstraněn; měření dat v system.md odpovídá per-pole opravám
  po 12c; odstavce DocumentForm jsou chronologicky, úvodní mezera OptionSelect odstraněna,
  hledání bez mezer popsáno v jeho veřejném katalogu. Datumový soubor zůstává nad 300 řádky:
  tato změna pouze sdílí vzhled spouštěče a nerozděluje stávající provázané maskování/kalendář.
- Bajtový důkaz všech JSON objektů i všech sekcí ##/###:
  `python3 scripts/verify-edit-document-catalogs.py`. Katalogy **426/426/426/426**,
  **396** nedotčených JSON objektů shodných s b27379e4; #enrichment zachován.
  Kumulativně změněné komponenty proti vydání:

AccountSelect, BankAccountField, BookSelect, Button, CalendarPicker, CategorySelect, ChipMultiSelect, ContactSelect, CountrySelect, DateField, DateRangeField, DecimalInput, DimensionSelect, DocumentForm, Field, Input, LegalFormField, MultiSelect, OptionSelect, PartnerSelect, PaymentOrderAccountField, RateField, ResizableCombobox, SegmentedField, SelectTrigger, TagPicker, Textarea, UnitSelect, VatCodeSelect, VsField

- Markdown: components.md pouze DocumentForm 2.31.0; pravidla komponent pouze stejné
  uvedené komponenty; guidelines změněný blok Edit dokladu 12 a nové bloky 12b/12c/12f/12g.
  DocumentActionBar a všechny neuvedené sekce jsou bajtově shodné s b27379e4.
- Soubory změněné kumulativně proti b27379e4 (včetně nového testu):

- `.lovable/design-system.json`
- `.lovable/rules/components.md`
- `.lovable/rules/library-guidelines.md`
- `.lovable/system.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `components.md`
- `package.json`
- `roadmap.md`
- `scripts/verify-edit-document-catalogs.py`
- `src/components/ds/accounting/AGENTS.md`
- `src/components/ds/accounting/account-select.tsx`
- `src/components/ds/accounting/bank-account-field.tsx`
- `src/components/ds/accounting/dimension-select.tsx`
- `src/components/ds/accounting/document-form/AmountSection.tsx`
- `src/components/ds/accounting/document-form/DatesSection.tsx`
- `src/components/ds/accounting/document-form/PaymentSection.tsx`
- `src/components/ds/accounting/document-form/build-document-notices.tsx`
- `src/components/ds/accounting/document-form/use-currency-control.tsx`
- `src/components/ds/accounting/locked-account-value.tsx`
- `src/components/ds/accounting/partner-select.tsx`
- `src/components/ds/accounting/payment-order-account-field.tsx`
- `src/components/ds/accounting/unit-select.tsx`
- `src/components/ds/accounting/vat-code-select.tsx`
- `src/components/ds/accounting/vs-field.tsx`
- `src/components/ds/form/TagPicker.tsx`
- `src/components/ds/form/calendar-picker.tsx`
- `src/components/ds/form/category-select.tsx`
- `src/components/ds/form/chip-multi-select.tsx`
- `src/components/ds/form/country-select.tsx`
- `src/components/ds/form/date-field.tsx`
- `src/components/ds/form/date-range-field.tsx`
- `src/components/ds/form/entity-select.tsx`
- `src/components/ds/form/legal-form-field.tsx`
- `src/components/ds/form/multi-select.tsx`
- `src/components/ds/form/option-select.tsx`
- `src/components/ds/form/rate-field.tsx`
- `src/components/ds/form/searchable-option-select.tsx`
- `src/components/ds/form/segmented-field.tsx`
- `src/components/ds/layout/form-field-layout.tsx`
- `src/components/showcase/DocumentDatesShowcase.tsx`
- `src/components/showcase/FormDesignTwoShowcase.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/ds-texts/form-design-two-showcase.ts`
- `src/routes/workspace-settings.$page.tsx`
- `src/styles.css`
- `tests/e2e/document-amount-section.spec.ts`
- `tests/e2e/document-disabled-inputs.spec.ts`
- `tests/e2e/edit-document-twelve.spec.ts`
- `tests/unit/bank-account-options.test.tsx`
- `tests/unit/document-form-286.test.tsx`
- `tests/unit/edit-document-eleven.test.tsx`
- `tests/unit/edit-document-twelve.test.tsx`
- `tests/unit/disabled-controls.test.tsx`

## 2.97.0 – Edit dokladu 12f (nevydáno)

- Zakázaný vzhled platí v celé knihovně: Input, SelectTrigger, OptionSelect (běžná i hledatelná větev), Textarea, DecimalInput a interní LockedAccountValue; DocumentForm sjednocuje i pevnou měnu. Stávající podklad `muted/40`, rámeček `input`, text `foreground`. Průhlednost zvýšena z 0,5 na 1 kvůli čitelnosti. Naměřený kontrast v Chromiu: světlý 15,48 : 1; tmavý 12,32 : 1. Všechny tři prohlížeče ověřují minimum 4,5 : 1.
- E2E přepíná režim skutečným tlačítkem, nikoli změnou třídy. Referenční Datum DPH a VS, KS, SS, Způsob platby, pevná Měna, Popis i zamčený účet jsou ve stejném dokladu jen pro čtení. Pevná měna je v tomto stavu hodnotový rámeček, nikoli interaktivní výběr. Samostatný test KS/SS zachovává kontrolu návratu SS 99 po zapnutí příkazu.
- BankAccountField ověřuje řetězcový typ number, bankCode a iban při filtrování i tvorbě hledacího textu. Hledatelný OptionSelect ignoruje mezery v dotazu i hledaném zápisu. Unit ověřuje číselné number/iban a nepravidelné mezery dotazu.
- Měření datumů omezuje škálu na 0–1 a opravnou smyčku na čtyři průchody; nulový dělitel ošetřen. E2E bere stejnou šířku kontejneru jako kód: clientWidth minus rámeček.
- Oprava dokumentace: odstavec 12c přesunut do DocumentForm. DocumentActionBar a tisk je bajtově shodná s b27379e4. Historická tabulka i popis škálování 12b jsou označené jako nahrazené kolem 12c; neúplná dřívější tvrzení o markdownových blocích opravena. **BREAKING (typy): option.number / option.bankCode mohou být undefined**; před čtením ověřte hodnotu, identitu získávejte přes bankAccountOptionValue.
- Ověření: unit **613/613**, 58 souborů, 1 931 assertions; související E2E **24/24** (Chromium 8, Firefox 8, WebKit 8). První společný WebKit narazil na časový limit; následně tři úspěšné testy z původního běhu a zbývajících pět samostatně. Lint **0 chyb / 294 varování**; formát OK; automatický build OK. Samostatný typecheck ani ruční build nebyly spuštěny, protože je prostředí zakazuje.
- Důkaz: `python3 scripts/verify-edit-document-catalogs.py` porovnává syrové JSON objekty a všechny sekce `##` / `###` včetně opakovaných nadpisů, preambule a nových/odstraněných sekcí; bez normalizace. Katalogy **426 / 426 / 426 / 426**. Kumulativně změněné veřejné záznamy: **BankAccountField, DecimalInput, DocumentForm, Field, Input, OptionSelect, PaymentOrderAccountField, SelectTrigger, Textarea**. **417** ostatních JSON objektů je bajtově shodných; #enrichment zachován. Interní SearchableOptionSelect a LockedAccountValue nejsou nové veřejné exporty.
- Dokumentační sekce: `components.md` pouze `### DocumentForm 2.31.0` (37 sekcí); `.lovable/rules/components.md` pouze devět výše uvedených komponentních sekcí (426); `.lovable/rules/library-guidelines.md` původní `## Edit dokladu 12 (2.96.0)` a nové `## Edit dokladu 12b`, `12c`, `12f` (8 sekcí). Ostatní sekce jsou bajtově shodné.
- Verze zůstává **2.97.0**, nevydáno. Úplný kumulativní seznam souborů oproti b27379e4 je níže.

## 2.97.0 – Edit dokladu 12e (nevydáno)

- Kurzy, kurz DPH, Celkem a pevná i volitelná měna používají standardní výšku `var(--control-h)` místo zvýšené h-11. Tlačítko Σ má velikost odvozenou od stejné výšky a zůstává uvnitř pole.
- Celkem zůstává tučné, bez velkého text-xl. Velikost sdílí se standardním VS přes stávající typografii font-mono; desetinné vstupy nadále používají sans písmo, tabulkové číslice a zarovnání vpravo. Stejné platí pro „Sčítá se z rozpisu“.
- Interaktivní EUR ukázka má dva kurzy i oba režimy součtu. E2E při 100 / 150 / 200 % měří výšku všech polí proti VS (±0,5 px), mezeru popisku, shodnou velikost písma, tučnost ≥ 600, vnitřní tlačítko a nepřetékající částku 1 234 567,89. Screenshoty obou režimů jsou přílohami testu.
- Ověření: unit 612/612 (58 souborů, 1 929 assertions); související E2E 6/6 (2 Chromium, 2 Firefox, 2 WebKit); lint 0 chyb / 294 varování; formát OK a automatický build OK. Samostatný typecheck prostředí nepovoluje. Verze zůstává 2.97.0, nevydáno.
- Soubory kola 12e: `src/components/ds/accounting/document-form/AmountSection.tsx`, `src/components/ds/accounting/document-form/use-currency-control.tsx`, `src/components/showcase/FormDesignTwoShowcase.tsx`, `tests/e2e/document-amount-section.spec.ts`, `AGENTS.md`, `roadmap.md`, `CHANGELOG.md`, `components.md`, `.lovable/design-system.json`, `.lovable/rules/components.md`.
- Dotčená veřejná komponenta kola 12e: DocumentForm (interní Částka a ovládání měny); žádná změna API. Katalogy 426 / 426 / 426 / 426. Proti b27379e4 kumulativně změněny Field, BankAccountField, PaymentOrderAccountField, DocumentForm a Input; 421 ostatních JSON objektů bylo bajtově shodných; původní kontrola dokumentačních sekcí byla neúplná (opraveno v 12f).

## 2.97.0 – Edit dokladu 12d (nevydáno)

- Sdílený Input používá v zakázaném stavu stejný podklad `muted/40` jako zamčené datum. Rámeček `input`, zděděná barva textu a průhlednost 0,5 zůstávají společné; žádná nová barva. Změna platí i pro ostatní uživatele sdíleného Input, nikoli jen lokální napodobeninu v dokladu.
- Týká se KS/SS při vypnutém příkazu nebo důvodu nepoužitého účtu u FP/ZFP a FV/ZFV; dále VS v zaúčtovaném dokladu, ručního čísla účtu a kódu banky, IBAN, ruční protistrany, IČO/DIČ, externího čísla, předávající osoby, popisu s našeptáváním, kurzů a poznámek ke kurzu. Datumová pole a číselné vstupy postavené na Input dědí stejný stav. Samostatná Textarea, výběry a FieldValue se nemění; nejsou nativní Input.
- Prázdné zakázané KS/SS zachovávají přístupné jméno a tooltip důvodu; uložená data se nemažou. E2E porovnává computed background, border, text a opacity s vypnutým Datum DPH ve světlém i tmavém režimu a po zapnutí ověřuje návrat SS 99.
- Ověření: unit 612/612 (58 souborů, 1 929 assertions); související E2E 18/18 (6 Chromium, 6 Firefox, 6 WebKit). Společný běh skončil na časovém limitu po 13 úspěšných testech; zbývajících pět testů WebKitu prošlo samostatně. Lint 0 chyb / 294 varování; formát OK; automatický build OK. Samostatný typecheck a ruční build prostředí nepovoluje.
- Soubory kola 12d: `src/components/ui/input.tsx`, `tests/e2e/document-disabled-inputs.spec.ts`, `AGENTS.md`, `roadmap.md`, `CHANGELOG.md`, `components.md`, `.lovable/design-system.json`, `.lovable/rules/components.md`. Komponenty dotčené v tomto kole: Input (implementace), DocumentForm (dokumentace zděděného vzhledu). Verze 2.97.0 zůstává nevydaná.
- Skriptové porovnání s vydáním b27379e4: 426 / 426 / 426 / 426 položek; kumulativně změněny Field, BankAccountField, PaymentOrderAccountField, DocumentForm a Input. 421 ostatních JSON objektů bylo bajtově shodných; tvrzení o všech markdownových blocích bylo nesprávné: kontrola opomenula sekci DocumentActionBar a tisk (opraveno v 12f). Indexy veřejných komponent a původní #enrichment se nemění. Skript porovnává syrové JSON objekty (nikoli jen parsované hodnoty) a celé bloky mezi nadpisy komponent.

## 2.97.0 – Edit dokladu 12c (nevydáno)

- Šipka hledatelného účtu a text mají prostor vlevo od tlačítka „Platit příkazem“. E2E kontroluje jejich plochy při 100 % a 200 %; snímky jsou přílohami testu.
- BankAccountField zůstává hledatelný i pro malý počet možností: hledání IBAN je tak dostupné nezávisle na počtu účtů. Jde o změnu chování oproti původnímu Select: nabídka má vstup hledání a položky Command, tedy jiný DOM i ovládání z klávesnice. Veřejné value/onChange zůstávají stejné.
- Nové veřejné API: BankAccountOptionBase obsahuje společná nepovinná data účtu; bankAccountOptionValue vrací stabilní ID, jinak tuzemský zápis nebo neformátovaný IBAN. Čtenáři option.number a option.bankCode musí počítat s undefined; dosavadní úplné účty zůstávají platné.
- Neúplné účty bez dvojice číslo + kód banky a bez IBAN se vyřadí i za běhu. Hledání obsahuje kompaktní i formátovaný IBAN, například „CZ65 0800“.
- Datumové měření používá izomorfní efekt a stabilní klíč popisků a formátu; psaní do jiného pole nezakládá nový ResizeObserver. Každé příliš široké pole se zmenšuje podle vlastní skutečné šířky včetně delšího popisku; ostatní zachovají standardní písmo. Následná korekce měří i pevné odsazení popisku, nikoli pevný zmenšovací koeficient.
- Kontrola písma platí vždy, když se celé nezmenšené pole vejde, včetně pole zabírajícího nejméně 95 % kontejneru. Test 360 CSS px při 200 % pokrývá delší CS/SK popisky.
- Změna workspace-settings.$page.tsx v kole 12b pouze doplnila povinné titulky a metadata stránky; neměnila obsah ani chování. Byla mimo funkční zadání a zůstává kvůli povinné kontrole metadat všech obsahových stránek.

### Závěrečná kontrola 12c

- Unit: 612/612, 58 souborů, 1 929 assertions. Související E2E: 15/15, Chromium 5/5, Firefox 5/5, WebKit 5/5. První běh odhalil přesah dlouhého popisku a předčasné měření ve WebKitu; po opravách jsou finální běhy zelené.
- Lint: 0 chyb / 293 varování. Format:check OK. Automatický build OK. Samostatný typecheck ani ruční build nebyly spuštěny, protože je kontrolní prostředí nepovoluje.
- Katalogy proti vydání b27379e4: 426/426/426/426. Skript porovnal syrové JSON objekty a markdownové bloky: změněny Field, BankAccountField, PaymentOrderAccountField, DocumentForm; 422 ostatních JSON objektů je bajtově shodných. Původní kontrola components.md opomenula sekci DocumentActionBar a tisk s chybně vloženým odstavcem 12c; toto tvrzení o jediném změněném bloku bylo nesprávné a opraveno v 12f; rules/components.md uvedené čtyři bloky. #enrichment zůstal zachován.
- Verze zůstává 2.97.0; knihovna nebyla vydána.
- Soubory změněné v kole 12c proti a566b3f4: AGENTS.md, CHANGELOG.md, roadmap.md, components.md, .lovable/design-system.json, .lovable/rules/components.md, .lovable/rules/library-guidelines.md, src/components/ds/accounting/bank-account-field.tsx, src/components/ds/accounting/payment-order-account-field.tsx, src/components/ds/accounting/document-form/DatesSection.tsx, tests/e2e/edit-document-twelve.spec.ts, tests/unit/bank-account-options.test.tsx, tests/unit/edit-document-twelve.test.tsx. Úplný seznam vůči vydání je níže, doplněný o payment-order-account-field.tsx.

### Kolo 12b – historický stav nahrazený kolem 12c

- Následující popis zmenšování a tabulka měření 12b jsou nahrazené per-pole měřením kola 12c; nejde o aktuální měření.
- Písmo vstupu i popisku je standardní podle zoomu, pokud se do panelu vejde alespoň jedno plné pole. Teprve pod tímto prahem se skutečně naměřená šířka přepočítá na dostupnou šířku s rezervou rámečku; žádný pevný koeficient ani předčasné omezení pomocí cqi. Tabulka zachycuje zmenšení jen u 200 % / úzkého panelu.
- Vzorek šířky vychází z aktivního formátu dd.MM.yyyy, d.M.yyyy, yyyy-MM-dd nebo dd/MM/yyyy. Tři ikonové sloty mají společnou geometrii; text se nekříží s plochou tlačítka. Mez je 0,3em, ne vzdálenost k SVG. Dodatečná šířka delšího popisku je samostatně měřená.
- Delší popisky předávané přes texts v CS/SK zvětšují pouze příslušné pole. E2E testuje rozšíření účetního data a DUZP, ne předpoklad pěti stejných polí; ten zůstává pouze pro výchozí popisky. Dvojice DUZP + Datum DPH se testuje těsně nad a pod skutečným součtem šířek a mezery.
- Zamčené KS/SS mají přístupné jméno přes aria-labelledby na popisek Field a popis důvodu přes aria-describedby. Zachování hodnot a pořadí platební sekce se nemění.
- BankAccountOption nyní přijímá úplné number + bankCode nebo iban; number a bankCode jsou v základním typu volitelné a union zaručuje alespoň jeden úplný zápis. BREAKING (typy): option.number / option.bankCode mohou být undefined. Migrace: před čtením ověřte přítomnost řetězce; pro identitu použijte bankAccountOptionValue. Tuzemská dvojice má při zobrazení přednost, jinak se IBAN formátuje po čtyřech znacích. Hledání zahrnuje IBAN i u účtu s oběma zápisy.
- Datový tok účtů: BankAccountField; ReceivedAccountControl / useDocumentBankAccountField a DocumentForm; buildDocumentNotices sdílí bankAccountOptionValue. PaymentOrderAccountField obaluje výběr bez převodu hodnot. Veřejný ReceivedBankAccountField používá ManualBankAccountValue, nikoli BankAccountOption, a ruční IBAN beze změny podporuje. Firemní IssuedAccountControl má vlastní typ účtu; nebyl změněn.
- Katalogy byly upraveny cíleně proti b27379e4: 426 / 426 / 426 / 426. Změněné JSON komponenty: Field, BankAccountField, DocumentForm; 423 nedotčených objektů je bajtově shodných. Markdownové bloky: components.md pouze DocumentForm; rules/components.md uvedené tři. Zdrojový manifest obsahuje nové ukázky a testy; původní #enrichment zachován.
- Ověření: unit 609/609 (58 souborů, 1922 assertions); související E2E 9/9 (Chromium 3, Firefox 3, WebKit 3); lint 0 chyb / 293 varování. Automatický build OK. Samostatný typecheck a ruční build nebyly spuštěny, kontrolní prostředí je nepovoluje. Formát se kontroluje jen nad podporovanými zdrojovými příponami, nikoli binárními fonty.

### Změněné soubory oproti b27379e4

- `.lovable/design-system.json`
- `.lovable/rules/components.md`
- `.lovable/rules/library-guidelines.md`
- `.lovable/system.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `components.md`
- `package.json`
- `roadmap.md`
- `scripts/verify-edit-document-catalogs.py`
- `src/components/ds/accounting/AGENTS.md`
- `src/components/ds/accounting/bank-account-field.tsx`
- `src/components/ds/accounting/document-form/AmountSection.tsx`
- `src/components/ds/accounting/document-form/DatesSection.tsx`
- `src/components/ds/accounting/document-form/PaymentSection.tsx`
- `src/components/ds/accounting/document-form/build-document-notices.tsx`
- `src/components/ds/accounting/document-form/use-currency-control.tsx`
- `src/components/ds/accounting/locked-account-value.tsx`
- `src/components/ds/accounting/payment-order-account-field.tsx`
- `src/components/ds/form/searchable-option-select.tsx`
- `src/components/ds/layout/form-field-layout.tsx`
- `src/components/showcase/DocumentDatesShowcase.tsx`
- `src/components/showcase/FormDesignTwoShowcase.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/ds-texts/form-design-two-showcase.ts`
- `src/routes/workspace-settings.$page.tsx`
- `src/styles.css`
- `tests/e2e/document-amount-section.spec.ts`
- `tests/e2e/document-disabled-inputs.spec.ts`
- `tests/e2e/edit-document-twelve.spec.ts`
- `tests/unit/bank-account-options.test.tsx`
- `tests/unit/document-form-286.test.tsx`
- `tests/unit/edit-document-eleven.test.tsx`
- `tests/unit/edit-document-twelve.test.tsx`

Automaticky spravované soubory navíc: `.workspace/AGENTS.md`, `src/.generated/mockup-components.ts`, `src/tailwind.config.lov.json`, `tsconfig.tsbuildinfo`; nejsou autorskou změnou tohoto zadání. Kontrola nadpisů stránek doplnila chybějící metadata detailu nastavení prostoru.

### Historická tabulka měření 12b (Chromium, CS) – nahrazeno kolem 12c

Panel „360“ znamená vnější šířku 360 CSS px, nikoli počet panelů. Práh je součet pěti aktuálních šířek a **pěti** mezer, včetně mezery rozpěrky. Všechny hodnoty jsou měření, nikoli pevné rozměry UI. CS/SK a ostatní prohlížeče byly kontrolovány samostatně; jejich zlomové šířky se mohou lišit podle skutečné sazby.

| Zoom | Panely | Kontejner CSS px | Řádky | Práh 1 řádku CSS px (šířky + 5 mezer) | Písmo vstupu CSS px |
|---|---|---:|---:|---:|---:|
| 70 % | 1 | 1863.25 | 1 | 598.33 | 9.80 |
| 70 % | 2 | 896.66 | 1 | 598.33 | 9.80 |
| 70 % | 3 | 576.66 | 2 | 598.33 | 9.80 |
| 70 % | 360 | 303.25 | 3 | 598.33 | 9.80 |
| 100 % | 1 | 1844.00 | 1 | 824.84 | 14.00 |
| 100 % | 2 | 875.00 | 1 | 824.84 | 14.00 |
| 100 % | 3 | 555.00 | 2 | 824.84 | 14.00 |
| 100 % | 360 | 284.00 | 5 | 824.84 | 14.00 |
| 125 % | 1 | 1828.00 | 1 | 1068.59 | 17.50 |
| 125 % | 2 | 857.00 | 2 | 1068.59 | 17.50 |
| 125 % | 3 | 537.00 | 3 | 1068.59 | 17.50 |
| 125 % | 360 | 268.00 | 5 | 1068.59 | 17.50 |
| 150 % | 1 | 1812.00 | 1 | 1272.34 | 21.00 |
| 150 % | 2 | 839.00 | 2 | 1272.34 | 21.00 |
| 150 % | 3 | 519.00 | 3 | 1272.34 | 21.00 |
| 150 % | 360 | 252.00 | 5 | 1272.34 | 21.00 |
| 200 % | 1 | 1780.00 | 1 | 1689.77 | 28.00 |
| 200 % | 2 | 803.00 | 3 | 1689.77 | 28.00 |
| 200 % | 3 | 483.00 | 5 | 1689.77 | 28.00 |
| 200 % | 360 | 220.00 | 5 | 1189.61 | 18.92 |


## 2.96.0 – Edit dokladu 12 (nevydáno)

- Verze zůstává 2.96.0; nic nebylo vydáno.
- D1: datumová pole používají společnou geometrii ikon a šířku přímo odvozenou od vysázeného data. Delší popisek rozšíří pole. DUZP + Datum DPH zůstávají společně, pouze pokud se dvojice vejde; jinak se zalomí jednotlivě. Žádné vodorovné rolování ani ořezávání zvýraznění.
- Kompaktní geometrie platí pouze v DocumentForm, filtry a dialogy se nemění. Extrémně úzký kontejner omezuje velikost písma datumové skupiny; v měřené matici je všech pět polí stejně širokých.
- **BREAKING – D2:** KS/SS se již neskrývají. Při vypnutém příkazu nebo nepoužitém účtu jsou prázdné a zakázané; aplikace nesmí odvozovat použitelnost z přítomnosti pole v DOM. DS uložené hodnoty nemaže.
- **BREAKING:** existující volitelný `companyBankAccountDisabledReason` nově zamyká také KS/SS u FV/ZFV. Pro platbu na účet nepředávejte důvod. FP/ZFP respektují `receivedAccountDisabledReason`; DDPOZ jej nadále ignoruje.
- Zakázané symboly mají fokusovatelný obal s `role="group"`, `aria-disabled` a důvodem přes `aria-describedby`; vnitřní input nepřebírá myš. Tooltip ověřen hoverem i fokusem. Mrtvý renderer `text` a obal `contents` odstraněny.

### Ověření opravy b632d10b

- Unit: **600/600**; související E2E: **7/7** (Chromium 3, Firefox 2, WebKit 2). Lint: **0 chyb / 292 varování**. Samostatný tsgo/tsc nebyl spuštěn: kontrolní prostředí ruční typecheck nepovoluje; samostatný výsledek typechecku nelze potvrdit. Automatický build: OK.
- E2E ověřuje CS i SK, všech 20 kombinací v každém jazyce a prohlížeči: scrollWidth ≤ clientWidth kontejneru i vstupů, všech pět vstupů uvnitř kontejneru, datum bez překryvu ikon, popisek uvnitř pole a očekávaný počet řádků odvozený od šířek. Test obsahuje rovněž horní limit mezery u tří ikon s rezervou 3 CSS px pro zaokrouhlení a případné rozšíření podle popisku.
- Šířky vstupů (Chromium, široký panel) při 70/100/125/150/200 %: 112.20 / 154.30 / 200.38 / 238.44 / 316.59 CSS px. V úzkém panelu se rozměr odvozuje od menšího kontejneru; datum zůstává celé.
- Tabulka níže obsahuje skutečné měření Chromia. „Před“ je zaznamenané opakování chybného stavu b632d10b před opravami, nikoli odhad staršího vydání. Dřívější tvrzení o bázi 894508b a vodorovném rolování jako správném chování bylo nesprávné a je nahrazeno tímto záznamem. Počty řádků po opravě jsou stejné v CS/SK i ve všech třech prohlížečích.

| Zoom | Panely | Kontejner CSS px | Řádky před → po | Od šířky pro 1 řádek CSS px |
|---|---|---:|---:|---:|
| 70 % | 1 | 1863.25 | 1 → 1 | 594.62 |
| 70 % | 2 | 896.66 | 1 → 1 | 594.62 |
| 70 % | 3 | 576.66 | 2 → 2 | 594.62 |
| 70 % | 360 | 303.25 | 3 → 3 | 594.62 |
| 100 % | 1 | 1844.00 | 1 → 1 | 819.48 |
| 100 % | 2 | 875.00 | 2 → 1 | 819.48 |
| 100 % | 3 | 555.00 | 2 → 2 | 819.48 |
| 100 % | 360 | 284.00 | 4 → 5 | 819.48 |
| 125 % | 1 | 1828.00 | 1 → 1 | 1061.88 |
| 125 % | 2 | 857.00 | 2 → 2 | 1061.88 |
| 125 % | 3 | 537.00 | 3 → 3 | 1061.88 |
| 125 % | 360 | 268.00 | 4 → 5 | 1061.88 |
| 150 % | 1 | 1812.00 | 1 → 1 | 1264.19 |
| 150 % | 2 | 839.00 | 3 → 2 | 1264.19 |
| 150 % | 3 | 519.00 | 4 → 3 | 1264.19 |
| 150 % | 360 | 252.00 | 4 → 5 | 1121.22 |
| 200 % | 1 | 1780.00 | 2 → 1 | 1678.97 |
| 200 % | 2 | 803.00 | 3 → 3 | 1678.97 |
| 200 % | 3 | 483.00 | 4 → 5 | 1678.97 |
| 200 % | 360 | 220.00 | 4 → 5 | 1078.58 |

- Ve Firefoxu jsou prahy jednoho řádku při 70/100/125/150/200 %: 586.68 / 833.50 / 1039.50 / 1245.42 / 1667.17 CSS px; ve WebKitu: 581.41 / 833.62 / 1039.53 / 1250.36 / 1667.17 CSS px. Rozdíly jsou dány vykreslením písma a šířkou posuvníku.
- Katalogy: **426 / 426 / 426 / 426**. Proti **fbeae82315bb03ba31d7b57d327ee1e5b2d5c57c** se JSON záznamy a bloky rules/components.md liší jen u DocumentForm; všech 425 nedotčených záznamů i bloků je beze změny. Zachovány původní props, příklady a texty ostatních komponent, včetně lockedReason.
- `meta.source_manifest["#enrichment"]` je doslova vydaný **00dac7fbb8089fc34c810b0f110f87248c3106a1a8eba838bbfd475a1bcb35ee**. Skript přepočítává MD5 pouze změněných souborů; ostatní manifestové položky zůstávají z vydání.

**Změněné soubory proti fbeae823:**

- `.lovable/design-system.json`
- `.lovable/rules/components.md`
- `.lovable/rules/library-guidelines.md`
- `.lovable/system.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `components.md`
- `package.json`
- `roadmap.md`
- `src/components/ds/accounting/document-form/DatesSection.tsx`
- `src/components/ds/accounting/document-form/DocumentForm.tsx`
- `src/components/ds/accounting/document-form/PaymentSection.tsx`
- `src/components/ds/accounting/document-form/document-form-types.ts`
- `src/components/ds/accounting/document-form/use-document-field-renderers.tsx`
- `src/components/ds/form/date-field.tsx`
- `src/components/showcase/DocumentDatesShowcase.tsx`
- `src/components/showcase/FormDesignTwoShowcase.tsx`
- `src/ds-texts/form-design-two-showcase.ts`
- `src/routes/components.accounting-forms.tsx`
- `src/styles.css`
- `tests/e2e/edit-document-twelve.spec.ts`
- `tests/unit/document-form-286.test.tsx`
- `tests/unit/edit-document-eleven.test.tsx`
- `tests/unit/edit-document-twelve.test.tsx`

## 2.94.0 – Edit dokladu 11 (nevydáno)

- Ikony všech položek RecordActionBar mají jednotnou velikost size-4 a shrink-0.
- **BREAKING – změna pravidla:** RateField již nevykresluje jednotku ani zdroj pod polem; oba jsou v tooltipu pole dostupném myší, fokusem a čtečkou. Migrujte vlastní popisky pod kurzem do sourceLabel/suggestedInfo. Třída rate-field-hint je odstraněna.
- Nový volitelný RateField.sourceAttention; DocumentHeaderValue.rateSourceAttention a vatRateSourceAttention se automaticky předávají kurzům. Ruční i upozorněný kurz má ikonu vlevo; aktualizace a chyby zůstávají.
- **BREAKING:** zamčené účty přijatých i vydaných dokladů mají důvod uvnitř šedého pole s tooltipem, bez zámku. Odstraňte závislost na ikoně s aria-label důvodu; důvod je nyní text pole. Text paymentOrderDisabled se mění na „Nezahrnuje se do platebních příkazů“.
- DocumentForm.receivedAccountDisabledReason (FP/ZFP) má přednost před příkazem i protistranou; přepínač je vypnutý a zakázaný, KS/SS skryté. Hodnoty maže jen aplikace, DS je zachová.
- **BREAKING:** FP/ZFP/DDPOZ mají druhý řádek účet 14 + způsob platby 6 (DDPOZ bez způsobu), třetí Popis 14 + číslo 6. Pod 40rem vše pod sebou ve stejném DOM/Tab pořadí. Způsob platby již není v Platebních údajích přijatých dokladů.
- Opravy kontroly edb1cd4a: přepínač má stálý název Platit příkazem, aria-disabled a popis důvodu; DDPOZ důvod ignoruje. Zamčení vyčistí validační hlášení ručního účtu bez změny uložených hodnot. Zamčený účet a kurz jen ke čtení nemají nativní title; aktualizace kurzu má samostatný výlučný tooltip. Číslo kurzu má vždy standardní velikost písma i při ikoně zdroje a aktualizaci; nereálně dlouhá hodnota se ořízne, nezmenší.
- **BREAKING:** přístupný název přepínače ve vypnutém stavu se mění z „Nezahrnovat do platebních příkazů“ na „Platit příkazem“ s `aria-pressed="false"`.
- Opravy 2. kola (e161d02f): přepínač s aria-disabled (jen ke čtení i zamčený) má zakázaný vzhled bez hover efektu a zůstává fokusovatelný s tooltipem; popis má jen při důvodu (nový volitelný PaymentOrderAccountField.lockedReason). Ruční účet po znovupřipojení i při změně hodnot zvenku znovu ohlásí aktuální chyby. Tooltip zdroje kurzu otevírá komponenta Tooltip se standardním zpožděním. Otisky zdrojového seznamu přepočítány.
- Po Update jsou nové props volitelné; aplikace dodá receivedAccountDisabledReason pro platbu bez účtu a příznaky upozornění pro starší/vlastní kurzy. Dosavadní exporty zůstávají.

## 2.93.0 – Design formulářů 2 (vydáno)

Obsah níže uvedeného záznamu 2.92.0 byl vydán jako v2.93.0.

## 2.92.0 – Design formulářů 2 (nevydáno)

- Opravy po kontrole 4164ecdd: kurzy nemohou skončit vpravo od měny; nápovědy se zalamují pouze pod vlastním polem, mezery odpovídají zbytku formuláře a prázdný řádek důvodů se nevykresluje.
- Dialog má vlastní patičku s jediným zdrojem mezer, menší šířkou a zachovaným `intent`; návrat a uložení zůstávají oddělené od zahození.
- **BREAKING pro vlastní přepisy textů:** dialog již nečte `panes.unsavedTitle`, `saveAndContinue`, `continueWithoutSaving`, `backToRecord`. Přepisy přesuňte do `panes.unsavedActions[close|switch|logout|navigate]`.
- `DocumentForm.texts.totalHome` a `paymentMethod` platí také v rekapitulaci a horním platebním řádku. Rekapitulace má plný přístupný název i při zkráceném popisku; samostatný editor přijímá volitelný `recapTotalLabel`.
- Pravidlo zamčené měny v system.md bylo upřesněno na stejný rámeček a rozměry jako výběr (chování 2.90.0); toto znění zůstává zachované.
- Interní typy textů, hlavička rekapitulace a navigace záznamů jsou oddělené bez změny dosavadních exportů.

- **Změna chování:** kurzy vlevo, Celkem + Měna vpravo; Kurz DPH jen při odlišném kurzu. Důvody zůstávají níže; domácí celek přesunut do hlavičky rekapitulace.
- RateField bez ikony má standardní pravý padding; readonly má shodný sans font a zarovnání. Nové volitelné inputClassName.
- Přepočet v DS používá celkovou částku a kurz dokladu; chybějící kurz ukáže pomlčku. DocumentForm automaticky předá odvozený celek; samostatný JournalLinesEditor může použít recapTotalAmount pro externí celek.
- **Změna chování:** FV/ZFV mají způsob platby před účtem nahoře, bez duplicity v Platebních údajích.
- **Změna chování:** UnsavedChangesDialog.action (close/switch/logout/navigate) pojmenuje výsledek; zahodit outline-destructive, fokus Zpět, Esc = návrat. Výchozí navigate zachovává kompatibilitu props. Při neúspěšném uložení se neprovede navazující akce; aplikace nastaví chybu v onSaveTab.
- Aplikace: přímý dialog action="close"/"switch"/"logout"; poskytovatel záložek řeší close automaticky, přepnutí a odhlášení přes guardUnsaved(callback, "switch"/"logout"). Bez nových props se zobrazuje obecné Odejít.
- **BREAKING:** odstraněn nepoužívaný DocumentFormTexts.vatRateSameAsDocument; odstraňte ho z vlastních úplných objektů textů. Nové klíče DsTexts jsou volitelné, CS/SK katalogy poskytují výchozí texty.
- Poslední vydání v2.91.0 používalo package 2.90.0; toto kolo nastavuje package 2.92.0 a nic nevydává.

## 2.90.0 – Design formulářů (nevydáno)

- Pomocné funkce bankovních účtů jsou přímo exportované z hlavního vstupu; dosavadní export z komponent zůstává kompatibilní.
- **Změna chování:** přijatý doklad řadí účet pod Dodavatele, číslo dodavatele pod IČO + DIČ; DOM i Tab mají stejné pořadí i pod 40rem.
- **Změna chování:** `BankAccountField.disabledReason` v režimu výběru nahrazuje výzvu uvnitř pole. Odstavec pod polem a duplicitní tooltip jsou odstraněny. Ruční vstup zůstává prázdný.
- Nový `BankAccountField.placeholder?: string` pro výzvu výběru; bez něj zůstává `optionSelect.emptyValue`.
- Křížek/tužka mají oddělený pevný rem slot vlevo od šipky; šipka nemění místo při výběru ani vymazání. Doplňkový štítek předchází akcím.
- Pevná měna má stejný rámeček, výšku a šířku jako výběr, běžnou váhu a normální popisek.
- Nový `Input.formatPattern?: string` pro krátký vzor zápisu, nikoli příklad či nápovědu. Vysvětlení patří pod sekci; nápověda pole nesmí měnit výšku řádku.
- Ukázky a behavior testy pokrývají účet bez/s dodavatelem, křížek se šipkou, oba režimy měny a vzor formátu.
- Hlavní vstup nově exportuje `./lib/bank-account`.
- `FieldInlineActions` je `forwardRef` (ref míří na obal tlačítek); výchozí popisky bere z `DsTexts`.
- `OptionSelect` vykresluje výzvu prázdného výběru vlastním zkracovaným prvkem s plným textem v `title`; `placeholder` se nestává prázdnou položkou nabídky.
- `UnitSelect` v buňce zachovává kompaktní geometrii; tužka má vlastní kompaktní slot.
- Číslo dokladu přijatého dokladu je vpravo jen vedle Bankovního účtu; bez účtu zůstává vlevo.
- Texty ukázek nejsou součástí veřejného `DsTexts`.

## 2.89.0 – jen číslo metadat

- Číslo 2.89.0 se objevilo pouze v metadatech knihovny; nebylo vydáno a nemá vlastní změny. Následuje 2.90.0.

## 2.88.0 – Dodělávky Edit dokladu 10

- Přeplněná lišta upřednostní aktivní a naposledy použité rozepsané záložky; nabídka ukazuje rozepsané nahoře a tečku s počtem skrytých.
- `DocumentForm` podporuje řízenou spodní záložku přes `activeDetailTab` a `onActiveDetailTabChange`.
- `JournalLinesEditor` předává úpravu vybrané jednotky a zakázky přes `onEditUnit` a `onEditDimension`.
- Dialog neuložených změn může nabídnout aplikační `onOpenInNewTab`; pevná měna končí na pravém okraji sekce.
- `pane-context` je rozdělený na veřejné typy, kontexty, provider, efekty a chrome; veřejná importní cesta zůstává zachována.

## 2.86.0 – Edit dokladu 10

- **BREAKING:** přijaté doklady už nepoužívají samostatný checkbox „Nezahrnovat do platebních příkazů“. Aplikace předává `paymentOrderEnabled` a obsluhu `onPaymentOrderEnabledChange`; přepínač je přímo v poli účtu.
- **BREAKING:** bankovní účet přijatých dokladů je v Základních údajích vedle čísla dodavatele. U FV/ZFV je firemní účet prvním údajem nad Základními údaji; DDPZ jej ponechává v Platebních údajích.
- **BREAKING:** KS a způsob platby používají hledatelný `OptionSelect`; KS zobrazuje po výběru jen kód. Aplikace nadále předává stejné identifikátory hodnot.
- Protistrana podporuje řízený režim „Vybraný / Ručně“ s potvrzením před nahrazením ručních údajů; DS při přepnutí data samo nemaže.
- Ruční účet přijatého dokladu podporuje český účet s kontrolou modulo 11, IBAN modulo 97 a SWIFT/BIC o 8 nebo 11 znacích.
- Záložka Odběratel je editovatelná v obou režimech; zamčení, ručně upravená pole, aktualizaci z partnera a datum zmrazení řídí aplikace.
- DUZP a Datum DPH zůstávají společnou skupinou: na širokém formuláři vpravo, po zalomení vlevo. Platební údaje využijí celou šířku.
- VS je ve formuláři, editoru řádků, detailu i `vsColumn()` zarovnaný vlevo při zachování tabulkových číslic.
- `PartnerSelect`, `DimensionSelect` a `UnitSelect` podporují `onEditSelected`; stav DPH partnera umí datum nespolehlivosti.
- Holá tlačítka mimo záložky a vnitřní hrany segmentů používají jednotné zaoblení `0.25rem`.

- **BREAKING:** `CounterpartyField` ve formuláři dokladu nahradil `CounterpartyInputField` (režim partner/ručně, „Nový partner…“, tužka `onEditCounterparty`).
- **BREAKING:** `vsColumn(value, label, options)` – popisek předává aplikace (`useDsTexts().documentForm.vsColumn`).
- **BREAKING:** `validateManualBankAccount(value, isHomeCurrency, bankCodes, texts)` přijímá texty chyb; domácí měna vyžaduje kód banky vždy, cizí měna účet nebo IBAN (ne obojí) a u IBANu SWIFT.
- **BREAKING:** dialog neuložených změn v panelech: nadpis „{záložka} – neuložené změny“, tlačítka „Uložit a pokračovat“ / „Pokračovat bez uložení“ / „Zpět k dokladu“; texty z `DsTexts.panes`, klíče `PaneTabsTexts.unsaved*`, `save`, `discard` jsou zastaralé (odstraní se ve 3.0.0).
- **BREAKING:** položka menu rozepsanou záložku nenahradí – otevře novou záložku v témže panelu a ohlásí to přes `onNotice` (výchozí toast); dialog jen při limitu záložek.
- Oprava: akce dialogu neuložených změn se vždy vztahují k dotčené záložce, ne k aktivní záložce aktivního panelu (dříve při více panelech Uložit/Zahodit nereagovalo). Neúspěšné `onSaveTab` dialog zavře a nic nezahodí.
- Aktivní záložka aktivního panelu je výrazná, aktivní záložky ostatních panelů tlumené; neuložené změny = tečka před názvem; `guardUnsaved(action)` pro odhlášení; nový `UnsavedChangesDialog`.
- Oprava: bankovní doklad a vydaný doklad bez firemních účtů mají opět pole účtu v Platebních údajích; přepínač „Platit příkazem“ jen u druhů s příznakem platebních příkazů.
- `OptionSelect.searchable="auto"` (od 8 položek), hledání bez diakritiky; hodnota mimo číselník je vidět s označením. Křížek a tužka ve výběrech jsou samostatná tlačítka (`FieldInlineActions`).
- Výchozí zaoblení tlačítek je ve vrstvě base – nepřebije `rounded-full` ani spojené hrany segmentů.

Migrace: odstraňte `excludeFromPaymentOrders`, předejte řízené `paymentOrderEnabled`; `vsColumn` doplňte popiskem; `validateManualBankAccount` volejte s texty; vlastní texty dialogu neuložených změn přesuňte do `DsTextsProvider` (`panes`); kdo spoléhal na nahrazení rozepsané záložky z menu, obslouží `onNotice`. Přesuňte mapování účtů na `partnerBankAccountId`, `manualBankAccount` nebo `companyBankAccountId` podle druhu dokladu.

## 2.85.0 – Edit dokladu 9 a obecná pravidla

- **BREAKING:** kód a název se všude oddělují ` – `; migrace: ruční skládání nahraďte `formatCodeName`.
- **BREAKING:** prázdné vstupy nemají placeholder a všechna ovládání používají sjednocené zaoblení.
- **BREAKING:** `BankAccountField` přijatého dokladu je pouze výběr účtu partnera; aplikace předává stabilní id a obsluhu „Přidat účet…“.
- Formulář řadí Částku vždy jako poslední sekci, doplňuje způsob platby, KS z číselníku, firemní účet, stav DPH partnera a hotové záložky Odběratel / Tiskové údaje.
- Rekapitulace nepoužívá lištu nástrojů a účty zobrazuje v rozšířené formě.
- Opraven výběr účtu partnera bez položek, důvody zákazu, neplatné a chybějící účty, šířka data podle ikon, seskupení dat DPH a pružná šířka sloupce Ř.
- Checkboxy a přepínače se vystřeďují podle prvního řádku popisku; doplněny zbývající oddělovače, tlumené výzvy, read-only adresa a jednotné zaoblení filtrů.
- Poslední kontrola sjednotila pravidla 2.85.0, výpočet šířky a odsazení data, šířku sloupce Ř. v kaskádě, texty výběrů a společné DOM prostředí testů.

## 2.84.0

- Sjednocena výška formulářových ovládacích prvků a hodnot `FieldValue` tokenem `--control-h`.
- `RecordDialog` skrývá jedinou záložku, drží stálou výšku panelů a přidává velikosti, titulkové štítky a sjednocený doplňkový řádek.
- Přidány `FieldTable`, `MaskInput`, nápověda `FieldGrid`, doplněk `SectionHeading` a řádková velikost `GridSegmentedToggle`.
- Výběry používají jednotnou ikonu rozbalení a `CheckboxField` lze zarovnat na osu vstupu.

Verze seřazené od nejnovější. BREAKING změny obsahují návod na migraci.

## 2.83.0 – rozdělení editoru řádků, dialogy ve StrictMode, vnořený formulář

Pro APP: veřejné API beze změny (žádný prop ani export neubyl, importní cesty platí).

- Oprava: potvrzení vnořeného `RecordDialog` (např. nový bankovní účet v dialogu partnera) už neodešle vnější formulář.
- Oprava: návrat prohlížeče zavírající dialog snese dvojí připojení efektů ve `StrictMode` – žádný druhý záznam historie, dialog se sám nezavře.
- `JournalLinesEditor` rozdělen do menších souborů beze změny chování; texty editoru jsou v `DsTexts.journalEditor` (CS i SK). `DEFAULT_JOURNAL_LINES_TEXTS` je zastaralý alias (`@deprecated od 2.83.0`, náhrada `DS_TEXTS_CS.journalEditor`).
- Texty knihovny rozděleny na `ds-texts/cs.ts`, `sk.ts`, `types.ts`; import `ds-texts` beze změny.

- Gridy (5b): `DataGrid` a `TreeGrid` sdílí rám `GridFrame` (kontextový řádek, lišta, hledání, filtry, Sloupce, zoom/hustota, Obnovit, výběr), hook `useRowActions` (menu řádku a potvrzení) a typ `GridBaseProps`; logika rozdělena do souborů ≤ 500 řádků. Chování i props beze změny.
- Nové exporty: `DEFAULT_PINNED_COLUMNS` a `DEFAULT_COMPACT_COLUMNS` (dnešní doménové sady id sloupců) a volitelné props `DataGrid.pinnedColumnIds` / `compactColumnIds` s nimi jako výchozí hodnotou. Grid sám id sloupců natvrdo nezná.
- `DataGrid` s `paginated={false}` virtualizuje dlouhé seznamy (vykreslí jen viditelné řádky + rezervu); výška řádku, přilepená hlavička, výběr všech řádků a součty skupin počítají se všemi řádky, ne s oknem.
- `AppShell` (5d, 5e): rozdělen na horní lištu, menu a panely; klávesové zkratky (Ctrl+B, `/`, Esc, zoom) jdou přes jeden společný posluchač `keydown`, který se při odpojení odregistruje. Efekty mají úplné závislosti. Zastaralé props zůstávají do 3.0.0.

Pro APP po 5b/5d/5e: nic povinného; konstanty sloupců lze použít při vlastních gridech.

Co má APP udělat po Update:

1. V kořeni aplikace (vstupní soubor s `createRoot`/routerem) znovu obalit aplikaci `<React.StrictMode>`.
2. Smazat soubor `dialog-history-guard` (pojistka historie dialogů) a všechna jeho volání a importy – vyhledat `dialog-history-guard` v celém projektu, výsledek musí být prázdný.
3. Ověřit: otevřít dialog, stisknout Zpět (dialog se zavře, stránka zůstane), otevřít vnořený dialog a potvrdit jej (vnější zůstane otevřený a neuloží se).

## 2.82.0 – pojistky kvality a pravidla DS

- Skripty `test` (`bun test tests/unit`) a `typecheck` (`tsgo --noEmit`, nový dev balíček `@typescript/native-preview`).
- ESLint: zákaz `any`, `as unknown as` a `as never` (chyba); varování pro nepoužité proměnné, soubory nad 500 řádků a `fs` v testech.
- `GridExport.fileName` nahrazuje prop s překlepem `fijename`; `fijename` zůstává jako zastaralý alias (`@deprecated od 2.82.0`), `fileName` má přednost. Migrace: přejmenujte prop na `fileName`.
- Přehled změn přesunut z README do `CHANGELOG.md`; poznámky k vydání přesunuty ze `system.md`.
- Bez změny chování.

## 2.81.0

zavedení Prettieru a přeformátování zdrojů, bez změny chování a API.

## 2.80.0 – vydání

- Vydání (Release) změn připravených ve verzi 2.79.0; v historii projektu k této verzi nejsou samostatné změny kódu.

## 2.79.0 – nastavení nad úrovní firmy

- Nové: `StandaloneShell` (rám mimo `AppShell`: logo, nadpis, uživatelské menu, Zavřít, šedý sloupec), `StandaloneNav` (menu stránek, pod `md` výběr), `ContextSwitcher` (přepínač prostoru s hledáním od 6 položek a akcemi), `ConfirmByTypingDialog`, `DangerZone`.
- `NoticeBar` má tón `neutral` s akcí vpravo.
- Zoom aplikace je ve sdíleném hooku `useAppZoomShortcuts()`; `AppShell` se chová beze změny. `CompanySwitcher` má nové volitelné `actions`; bez nich vzhled i chování beze změny.
- Esc v `StandaloneShell` zavře rám jen bez otevřeného překryvu. **Zavření s neuloženými změnami neohlídá rám – ohlídejte ho v `onClose`.**
- `CompanySwitcher.actions?: { id, label, icon?, onSelect }[]` – akce pod oddělovačem pod „Nová firma“ (např. „Spravovat firmy…“ pro správce); bez nich vzhled i chování beze změny.
- Přepínání mobil / desktop ve `StandaloneShell` a `StandaloneNav` podle efektivní šířky (okno / zoom) jako `AppShell`; nadpis lišty není `h1`. `ContextSwitcher` ovladatelný šipkami a Enterem i bez hledání. Posluchače zoomu registruje jen první rám (dva rámy = jeden krok).
- Nové texty `standalone`, `contextSwitcher`, `confirmByTyping`, `dangerZone`, `noticeBar` v `DsTexts` (CS i SK, volitelné s výchozími). BREAKING: ne.

```tsx
<StandaloneShell brand={<Logo />} title="Nastavení prostoru" userMenu={<UserMenu … />} onClose={() => navigate({ to: "/" })}
  sidebar={<><ContextSwitcher label={space.name} description="3 firmy" items={spaces} value={space.id} onValueChange={setSpace} />
    <StandaloneNav groups={workspaceNav} /></>}>
  <DangerZone items={[{ title: "Odstranit prostor", description: "Nevratné.", action: <Button variant="destructive" onClick={() => setOpen(true)}>Odstranit</Button> }]} />
  <ConfirmByTypingDialog open={open} onOpenChange={setOpen} title="Odstranit prostor" description="Akci nelze vrátit." confirmText={space.name} confirmLabel="Odstranit prostor" onConfirm={removeSpace} />
</StandaloneShell>
```

## 2.78.0 – vydání

- Vydání (Release) změn připravených ve verzi 2.77.0; v historii projektu k této verzi nejsou samostatné změny kódu.

## 2.77.0 – drobnosti podmenu

- Klávesové zkratky panelů (Alt+W, Alt+Shift+W, Alt+Shift+T, Alt+M, Alt+T, Alt+1–3) ignorují opakování při držení klávesy – podržené T už nevyprázdní zásobník zavřených záložek ani nezavře víc záložek či panelů. Šipky (Alt+←/→/↑/↓) opakování záměrně ponechávají.
- Výchozí texty nabídky rozložení a nabídky záložky mají jediný zdroj: `DEFAULT_LAYOUT_MENU_TEXTS` a `DEFAULT_PANE_CHROME_TEXTS` berou hodnoty z `DS_TEXTS_CS` (`layoutMenu`, `paneChrome`), bez změny obsahu.

## 2.76.0 – vydání

- Vydání (Release) změn připravených ve verzi 2.75.0; v historii projektu k této verzi nejsou samostatné změny kódu.

## 2.75.0 – nabídky rozložení, záložek a uživatele

- `LayoutMenu` řadí uložení a správu nahoru, uložená rozložení zobrazuje bez ikon panelů a nabízí samostatné přepsání.
- Nabídka záložky obsahuje jen zavření, přesun, duplikování seznamu a zavření panelu; ostatní funkce zůstávají přes tlačítka a zkratky. Texty nabídky záložky i rozložení jsou v `DsTexts` (`paneChrome`, `layoutMenu`, CS i SK).
- `closePane` zavře všechny záložky panelu, respektuje neuložené změny a umožní jejich obnovení přes Alt+Shift+T; aktivní panel se mění jen při zavření aktivního. Přepínač počtu panelů při slučování zavře nejstarší nerozepsané neaktivní záložky nad limit s jedním upozorněním (obnovitelné Alt+Shift+T); nejde-li uvolnit místo, panel limit dočasně překročí. Automatické zúžení okna nikdy nic nezavírá.
- `UserMenu.workspaceAction` přidává klávesnicí dostupnou akci pracovních prostorů a nabídka má pevné pořadí.
- Řádek nadpisu otevřeného panelu už neopakuje ikonu z horní lišty.
- Tlačítko X na záložce má popisek „Zavřít záložku“. Upozornění `limitClosed` má nový text bez skloňování počtu a je součástí `DsTexts` (`panes.limitClosed`, CS i SK); `PaneTabsProvider` jej bere z `useDsTexts`, prop `texts` má přednost. Dlouhé názvy prostorů a vlastních položek v `UserMenu` se zkracují třemi tečkami s nápovědou.
- **BREAKING:** `SavedLayoutItem.isDefault` a související texty byly odstraněny. `LayoutMenu.onSave` přijímá `{ name, snapshot }` a `onUpdate` jen `{ name?, snapshot? }`.

## 2.74.0 – vydání

- Vydání (Release) změn připravených ve verzi 2.73.0; v historii projektu k této verzi nejsou samostatné změny kódu.

## 2.73.0 – Edit dokladu 8 a opravy panelů

- Měna je u všech dokladů bezprostředně za polem Celkem; uzamčená měna má stejně vysoký rámeček a identita pokladny či banky už měnu neobsahuje.
- Datumová pole jsou v jednom pružném řádku. Jejich varování označí pole a zobrazí se v pruhu upozornění ve stejném pořadí jako data.
- Přijaté doklady řadí sekce Základní údaje → Datumy → Platební údaje → Částka → Řádky. Bankovní účet je v základních údajích a podporuje nabídku i kontrolované volné zadání.
- `vsFromDocumentNumber()` navrhuje VS z nejvýše deseti číslic a nepřepisuje ručně upravený symbol.
- `AppShell` ve výchozím stavu nemění titulek stránky; opt-in `manageDocumentTitle` jej nastaví. Opraveny jsou také stabilní tooltip, jednorázová vývojová varování a kontrast odznaku aktivního menu.
- **BREAKING:** identita `cashBank` nezobrazuje měnu, popisek Celkem už neobsahuje měnu a `dateWarnings` se nevykreslují pod polem. Přijaté doklady mají nové pořadí sekcí a Bankovní účet se přesunul do Základních údajů.
- **BREAKING:** `AppShell` už bez `manageDocumentTitle` nenastavuje `document.title`; `DateField.warning` zvýrazní oranžovým rámečkem pole i při `warningDisplay="below"`.
- **BREAKING pro vlastní kompletní `DsTexts`:** `documentForm` vyžaduje nové klíče pro číslo dodavatele, automatický VS a bankovní účet. Nové props `bankAccountOptions` a `bankCodes` rozšiřují zadání účtu bez automatického předvyplnění.

## 2.72.0 – vydání

- Vydání (Release) změn připravených ve verzi 2.71.0; v historii projektu k této verzi nejsou samostatné změny kódu.

## 2.71.0 – panely AppShellu a rozsah platnosti

- Panelové menu vede od horní lišty až dolů; panelový řádek je pevně jen nad obsahem a respektuje nastavitelnou šířku menu.
- `AppShellPanel.views`, `activeView` a `onViewChange` přidávají řízené části panelu; aktivní část řídí titul, kontext, menu a stav skupin.
- Nový `AppShellScope` (`company` / `workspace` / `platform`) určuje platnost panelu. Mimo firmu zůstávají volby firmy a období na místě, ale jsou zakázané s nápovědou.
- Panely používají výchozí šedé menu přes `sidebarTone="panel"`; hlavní menu zůstává tmavě modré.
- Prázdná skupina se nesbaluje, hledání zahrnuje názvy sekcí a součet skupiny ignoruje nečíselné odznaky.
- **BREAKING:** žádná změna; dosavadní panely bez nových props zůstávají funkční.

## 2.70.0 – oprava zoomu aplikace

- Zkratky zoomu aplikace podle `event.key`, Ctrl/Cmd + kolečko podle polohy (grid × aplikace), automatický zoom gridů bez kompenzace zoomu aplikace a přepočet kaskády editoru řádků po změně zoomu aplikace.
- BREAKING: zkratky Ctrl+Alt (Ctrl+Option) + plus / minus / 0 byly zrušeny bez náhrady; `isAppZoomShortcut(event, mac?)` rozpoznává jen nové zkratky.
- Převzetí Cmd/Ctrl + plus / minus / 0 od prohlížeče bylo ověřeno v Chromiu (Playwright). Kdyby ho některý prohlížeč nepustil, zůstává ovladač „Velikost zobrazení“ v uživatelském menu.

## 2.68.0 – jednotný identifikační řádek dokladu

- **BREAKING:** `DocumentForm.identity.items` nahrazuje typovaný `DocumentIdentity` (`cashBank` / `invoice` / `internal`) s knihou, kódem období, volitelným účtem a číslem dokladu.
- Hlavní účet je jen v identifikačním řádku. Faktura může účet měnit přes `mainAccountOptions`; změna nastaví `mainAccountId` a řádky ani částky nepřepočítává.
- Měna faktur a interních dokladů stojí vedle Celkem. `currencyLocked` ji ponechá jako text a `currencyDisabledReason` vysvětlí zákaz změny.
- `mainAccountLocked` už není spínač skrytí pole, ale vždy skryje tužku účtu. `currencyLocked` už není spínač skrytí měny, ale mění výběr na text.
- Nové veřejné typy a API: `DocumentIdentityVariant`, `DocumentIdentity`, `DocumentForm.mainAccountOptions`, `DocumentForm.currencyDisabledReason`, `documentIdentityVariantForType()`; druhy dokladů doplněny o `DDPZ`, `DDPOZ`, `KR` a `ZAP`.

### Doplnění – poznámky z system.md

- BREAKING: volné `identity.items` nahradil `DocumentIdentity` s variantami `cashBank`, `invoice` a `internal`, knihou, kódem období a volitelným účtem a číslem.
- BREAKING: odstraněna komponenta `SideBadge` a klíče `DocumentFormTexts.mainAccount`, `mainSide`, `sideDebit`, `sideCredit` a `accountingSection`.
- Hlavní účet je pouze v identifikačním řádku; `mainAccountLocked` vždy skryje jeho změnu. Faktura mění účet přes `mainAccountOptions` a ukládá `mainAccountId` až s formulářem.
- Měna faktur a interních dokladů je vedle Celkem. `currencyLocked` ji ponechá jako text, `currencyDisabledReason` vysvětlí zákaz změny; pokladna a banka ji mají pouze v identitě.
- Nové druhy `DDPZ` a `DDPOZ` používají fakturační variantu, `KR` a `ZAP` interní variantu. Změna účtu ani měny nepřepočítává řádky v prohlížeči.

## 2.66.0

- BREAKING: `JournalLinesEditor.accountDisplay`, `JournalAccountDisplay` a volba účtu v `DocumentSettingsDialog` byly odstraněny.
- BREAKING: `formatJournalAccountDisplay(code, name, display, compact)` → `(code, name?, extended?)`; staré volání s `"number"` nyní vrací i název účtu.
- BREAKING: `resolveJournalColumnLayout` bez `accountDisplay`; nový výstup `compactAccountIds`.
- `JournalLinesEditor` má dvojice `MD` / `MD účet` a `DAL` / `DAL účet` (v režimu hlavního účtu `counterAccount` / `counterAccountName`); výchozí jsou krátké formy a alespoň jedna forma každé strany zůstává viditelná.
- Kaskáda šířek: Množství / MJ / Cena → Sazba DPH / Celkem s DPH → zkrácení účtů po stranách → stranová pole → Text.
- Nové: `accountColumnPair()`, `normalizeJournalAccountVisibility()`, `JournalLinesRecap.storageKey`, `GridColumn.disableToggleReason`, `DataGrid.defaultSort={null}`, `DataGrid.rowClassName`, `DsTexts.journalRecap`.
- Rekapitulace používá DataGrid se zachovaným pořadím řádků; pořadí sloupců `accountColumns()` je MD, MD účet, DAL, DAL účet.

### Doplnění – poznámky z system.md

- BREAKING: aplikace odstraní `JournalLinesEditor.accountDisplay`, typ
  `JournalAccountDisplay` a `DocumentSettingsValue.accountDisplay` včetně textů.
- BREAKING: `formatJournalAccountDisplay(code, name, display, compact)` má nyní
  signaturu `(code, name?, extended?)`. Pozor: staré volání s třetím argumentem
  `"number"` je pravdivá hodnota, a vrátí proto i název účtu.
- BREAKING: `resolveJournalColumnLayout` už nepřijímá `accountDisplay`; výsledek
  přidává `compactAccountIds` (zkrácené rozšířené formy po stranách).
- Nové exporty: `accountColumnPair()`, `normalizeJournalAccountVisibility()`,
  `JournalLinesRecap.storageKey`, `GridColumn.disableToggleReason`,
  `DataGrid.defaultSort={null}` (bez výchozího řazení) a `DataGrid.rowClassName`.
- Pořadí sloupců `accountColumns()` je nově MD, MD účet, DAL, DAL účet.
- Texty: `DsTexts.journalRecap` (krátké i rozšířené názvy účtů rekapitulace) a
  sdílené `DsTexts.columnPicker.accountFormRequired` / `compactAccountHeading`.
- Uložená rozložení editoru se kvůli klíči `${storageKey}:v4` jednorázově obnoví.

## 2.64.0 – zoom aplikace, automatický zoom gridů a šířka menu

- Opravy po kontrole: zoom aplikace se spočítá jednou při startu a mění ho jen uživatel; tažení posuvníků se ukončí i při zrušení ukazatele nebo ztrátě fokusu okna.
- Ruční zoom a hustota gridů se drží v paměti záložky (přežijí přepnutí záložek, ne zavření ani F5); „Auto“ se ukazuje jen u vypočtené hodnoty.
- Editor řádků používá jeden zoom pro písmo, šířky i kaskádu; formulářové gridy počítají potřebnou šířku ze šířek sloupců a reagují jen na změnu šířky.
- Posuvník menu má hodnoty pro čtečky, ovládání šipkami po 0,5 rem a stejný vzhled jako posuvník mezi panely.
- Nový zoom celé aplikace 70–200 % se ukládá pro zařízení a ovládá z uživatelské nabídky nebo zkratkami Cmd (Mac) / Ctrl + plus / minus / 0 (od 2.70.0; Ctrl/Cmd + kolečko mimo grid).
- Formulářové gridy automaticky volí 75–100 %, potom přesouvají sloupce do detailu a až nakonec zapínají vodorovné rolování.
- Šířky sloupců zůstávají v px při 100 %; vykreslení v rem respektuje zoom aplikace i gridu. Klíč uložených šířek se nemění.
- Menu je sbalitelné a nastavitelné tažením; preference zařízení jsou `app:menu-collapsed` a `app:menu-width`.
- BREAKING: odstraněny `FontSizeSetting`, `AppFontSizeControl`, `useAppFontSize`, `GridPreferencesProvider`, `AppShell.collapsed` a `AppShell.onCollapsedChange`.

### Doplnění

- Zoom aplikace používá `useAppZoom` a ovládání v `UserMenu`; staré ovládání velikosti písma bylo odstraněno.
- `AppShell` vlastní šířku i sbalení menu (`app:menu-width`, `app:menu-collapsed`); staré řízené props byly odstraněny.
- Šířky sloupců zůstávají v px při 100 %, ale vykreslují se relativně k zoomu aplikace a gridu.
- Formulářové gridy se automaticky přizpůsobují bez ukládání: zoom, kaskáda, rolování.

## 2.62.0 – sjednocení formulářů karty záznamu

- `Field` je společná definice pole pro karty záznamů i `DocumentForm`: popisek 12 px polotučně, jednotná mezera a společné hinty, chyby a hodnoty jen pro čtení.
- Nový `RecordActionBar` nabízí přilepené uložení, primární a další akce, stav práce a pevné pořadí chyba → upozornění; `DocumentForm` jej používá interně beze změny veřejného chování.
- `CheckboxField` zarovnává čtvereček na první řádek i u víceřádkového popisku a nápovědu odsazuje k textu.

## 2.61.0

- Nové exporty `DsTextsProvider`, `useDsTexts`, `DsTexts`, `DS_TEXTS_CS` a `DS_TEXTS_SK`; bez provideru zůstávají české výchozí texty.
- `SlivkaProvider` přijímá volitelné `locale` a `texts`. Lokální props komponent mají prioritu před providerem.
- `locale` sjednocuje kalendáře, `Intl`, tisk/export a slovní vyjádření částek.
- Slovenská aplikace nastaví v kořeni `<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">`.

## 2.60.0 – informační pruhy dokladu a skryté seskupení

- `DocumentForm.titleBadges` přidává další stejně vysoké nezalamované stavové štítky za stav dokladu.
- Nový `NoticeBar` se čtyřmi tóny, titulkem, obsahem, akcemi a volitelným zavřením; akce se na úzké ploše přesunou pod text.
- `DocumentForm.notices`, `readOnlyTitle` a `readOnlyActions` dodržují pořadí akce → chyba → upozornění → jen pro čtení.
- `DataGrid` v čipu i záhlaví seskupení používá popisek sloupce také při skrytém seskupovacím sloupci.
- Rozšířená ukázka Účetní formuláře a testy pořadí, tónů, akcí, zavření a skrytého seskupení.

## 2.58.0 – saldokonto a párování (DataGrid)

- `DataGrid.groupTotals?: "header" | "row"` – „row“ přidá za skupinu řádek součtů pod číselnými sloupci s popiskem „Celkem {skupina}“ (`texts.groupTotal`); výchozí „header“ beze změny.
- `paginated={false}` nyní zobrazuje a seskupuje všechny filtrované řádky (dříve se řezalo na první stránku).
- Řízený výběr: `selectedKeys`, `onSelectedKeysChange`; výběr skrytý filtrem zůstává a callbacky vracejí řádky z celé množiny `rows`; „Vybrat vše“ přepíná jen viditelné.
- `selectionSummary?: (rows) => ReactNode` – pruh pod tabulkou v režimu výběru.
- `DataGridColumn.total: "sumSelected"` (v exportu bez součtu) a `DataGridColumn.editor` (jen u vybraných řádků).
- Klik do interaktivního prvku v buňce (input, button, …) v režimu výběru řádek nepřepíná.
- Nová komponenta `GridAmountEditor` + `exceedsMax`; pomocné funkce `resolveSelectedRows`, `toggleVisibleSelection`, `isInteractiveTarget`, `nextEditorIndex`, `insertGroupTotalRows`.
- Ukázka Saldokonto a Párování (`/components/matching`).

## 2.57.1 – výchozí kód DPH nového řádku

- Nový řádek editoru (Enter na konci, ＋ Přidat řádek; duplikace kód kopíruje sama) přebírá kód DPH z předchozího řádku; teprve když předchozí řádek kód nemá (nebo žádný není), použije se výchozí kód knihy (`vat.defaultCodeId`). Počáteční prázdný řádek (`fillInitialVatCode`) beze změny. Bez změny API.

## 2.57.0 – opravy editoru řádků s DPH

- Samovyměření (RC-P21, EU-PS21, DOV-S21) v režimu „S DPH“: zadaná částka = základ, daň navrch (343/343 mimo celek), Celkem s DPH = základ; `resolveLineVat`, `baseFromGross`, `applyVatCalcMode`, náhled, součty i rekapitulace. Nové `isSelfAssessed`.
- „Nárok na odpočet“ v detailu řádku i u samovyměření (nárok mění jen řádek odpočtu).
- Výchozí kód DPH (`vat.defaultCodeId`) se doplní do počátečního prázdného řádku i opožděně (`fillInitialVatCode`).
- Přepínač Bez DPH | S DPH je při `vat.readOnly` neaktivní (`GridSegmentedToggle.disabled`).
- `DocumentForm.vatRateField`: hláška `texts.vatRateMissing`, když chybí kurz ČNB a kurz není ruční.
- Cizí měna s odlišným kurzem DPH: předběžný řádek „Kurzové zaokrouhlení – dopočítá se při uložení“ (`isFxRounding` + `isVatPreview`, bez účtů, neukládá se; `texts.fxRoundingPreview`); u editovatelného konceptu nahradí uložený řádek z DB v gridu i rekapitulaci (`mergeFxRoundingPreview`), jen ke čtení se ukazuje uložený.

## 2.56.0 – opravy po prokliku DPH

- „Celkem za doklad“ v režimu Sčítá se z rozpisu zahrnuje předběžnou daň (FV 1 000 → 1 210) a nezapočítá daň samovyměření; stejné číslo jako patička „Celkem s DPH“. Nová sdílená funkce `computeJournalTotals` (typy `JournalTotals`, `JournalTotalsOptions`), `JournalLinesEditor` ji používá a hlásí přes nový prop `onTotalsChange`.
- Odznak záložky „Řádky N“ počítá jen řádky zobrazené v gridu (bez řádků daně a prázdných).
- Buňka Kód DPH: Tab z Částky vede rovnou na Kód DPH (přepínač nedaňový je mimo pořadí Tab, zůstává Alt+N), psaní otevře výběr a filtruje.
- `DocumentForm.vatRateField` (`DocumentVatRateField`) – Kurz DPH pod kurzem dokladu, automatický / ruční s důvodem, nebo text „stejný jako kurz dokladu“.
- `DocumentSettingsDialog.showVatCalcMode` a `DocumentSettingsValue.vatCalcMode` – volba „Zadávat částky: Bez DPH / S DPH“.

## 2.55.0 – DPH v editoru řádků dokladu

- Samovyměření respektuje nárok stejně jako DB: `full` MD vstup / DAL výstup; `none` MD účet základu / DAL výstup (`non_deductible`, stačí účet výstupu); `partial` rozdělí na část s nárokem a zbytek na účet základu. `summarizeVat` počítá rozpad nároku i u samovyměření.

Minor verze bez breaking změn: bez propu `vat` (nebo s `vat.enabled = false`) se editor chová jako v 2.54.0.

- `JournalLinesEditor` prop `vat` (`JournalLinesVat`): sloupce Kód DPH · Sazba · DPH · Celkem s DPH hned za Částkou, přepínač „Bez DPH | S DPH“, detail (nárok na odpočet, předmět PDP, základ a DPH v domácí měně kurzem DPH), ruční daň (✎, akce „Vrátit vypočtenou daň“, odchylka > 1 chyba, ≤ 1 žluté varování), upozornění „Chybí účty kódu {kód} – daň se nezaúčtuje“.
- Předběžné řádky daně: dokud je doklad editovatelný, součet, „Zbývá rozepsat“, Zaokrouhlení i rekapitulace počítají vždy z `buildVatPreviewLines`; řádky `isVatLine` z DB se použijí jen u dokladu jen ke čtení. Řádky daně se v gridu nezobrazují.
- Režim „S DPH“: řádek drží v `amount` / `foreignAmount` předběžný základ, `toJournalRow` posílá `amount_gross` i základ.
- Duplikace řádku kopíruje kód, nárok i PDP, ruční daň ne.
- Výběr Kódu DPH v buňce gridu se otevírá hned při vstupu do editace a psaní rovnou filtruje podle kódu i názvu (nová komponenta `VatCodeSelect`).
- Rekapitulace: vestavěná záložka „DPH“ (`JournalLinesRecap.vatSummary`).
- Patička při zapnutém DPH odděluje součet základů, DPH a celkem s DPH; pokud je sloupec Celkem s DPH skrytý nebo v detailu, celek se značkou měny dokladu zůstává v liště vedle stavu rozepsání. Rekapitulace používá značky měn předané v datech.
- Nové exporty: typy `VatCodeOption`, `VatPdpSubject`, `VatCalcMode`, `VatDeduction`, `VatLineKind`, `JournalLinesVat`, `VatSummaryRow`, `ResolvedLineVat`, `VatPreviewConfig`, `VatPreviewResult`; funkce `toJournalRows`, `buildVatPreviewLines`, `resolveLineVat`, `summarizeVat`, `sumJournalTotal`, `applyVatCalcMode`, `baseFromGross`, `calculateVatFromBase`, `calculateVatFromGross`; komponenta `VatCodeSelect` (a `filterVatCodes`).

## 2.54.0 – grid řádků a nezalamování

- **BREAKING pro aplikace:** nadpisy a popisky jsou vždy jednořádkové; formuláře mají při nedostatku místa přesouvat celé pole, ne zalamovat text. Vlastní úzké mřížky nahraďte pružnými řádky s minimální šířkou pole v `rem`/`ch`.
- `JournalLinesEditor.onValidationChange(count, errors)` nahrazuje počet chyb v patičce a umožňuje zobrazit chybu přes `DocumentForm.error`; `texts.errors` je zastaralé.
- Sloupec Ř. bezpečně zobrazí trojciferná čísla, detail řádku skládá pole do jednoho řádku, pokud se vejdou, a cizoměnový sloupec se vždy jmenuje „Částka“.
- Aktivní editor nemá rámeček; klávesový fokus má jemné podbarvení a chybná needitovaná buňka červený rohový trojúhelník s vysvětlením.

## 2.53.0 – rolování menu a panelů

- `AppShell` drží výšku okna; menu, běžná stránka a každý panel rolují nezávisle. `PaneLayout` se ohlásí automaticky, takže aplikace nenastavuje odsazení ani overflow.
- Nové `PageLayout variant="list" | "form"` rozlišuje seznam s gridem vyplňujícím panel a formulář rolovaný jako celek.
- `DataGrid`, `TreeGrid`, `ZoomGrid` a `ZoomPane` přijímají `height="fill" | "auto"`; uvnitř listu je výchozí `fill`, jinde `auto`.
- Zoom formulářových gridů se počítá automaticky a neukládá se; hustota nového gridu zůstává normální.
- `PaneLayout` obnovuje pozici každé záložky i po obnovení stránky a exportuje `usePaneScrollElement`.
- `JournalLinesEditor` roste s formulářem bez vlastního svislého posuvníku; záhlaví se drží pod skutečnou výškou pruhu akcí.

### BREAKING pro aplikace – migrace na 2.53.0

- Grid v panelu **bez** `PageLayout variant="list"` má nově `height="auto"`: roste podle obsahu, nemá vlastní svislé rolování a jeho záhlaví se nepřilepuje (roluje celý panel). Virtualizace je v `auto` vypnutá.
- Seznamové stránky obalte `<PageLayout variant="list">` (PageHeader + lišta + grid) – grid pak vyplní panel (`fill`), roluje jen jeho tělo a záhlaví i součty jsou přilepené. Formuláře a karty obalte `<PageLayout variant="form">`.
- Odstraňte ruční `maxHeight`, `calc(100vh …)` a výšky odvozené z `window.innerHeight` ve stránkách i u gridů; výšku určuje rodič.
- Odstraňte `ListScrollRestore` a jiné vlastní obnovy pozice rolování – `PaneLayout` obnovuje pozici každé záložky (per krok historie) sám. Pro výjimečné potřeby je `usePaneScrollElement()`.
- Zoom gridu ani hustota se neukládají. Formulářový grid přepočítá zoom z dostupné šířky; při 75 % pokračuje kaskádou sloupců a nakonec rolováním.
- Událost `grid-zoom-change` byla zrušena – zoom a hustota platí jen pro instanci gridu v záložce.
- `PaneLayout` má být přímý obsah `AppShell`, ne vnořený v jiné rolovací stránce (ohlásí se sám, main pak nemá padding ani rolování). Ovládá main jen když je skutečně zobrazený – skrytý (`hidden`) PaneLayout main uvolní. Vložený PaneLayout (ukázky, náhledy ve stránce) = prop `embedded` + kontejner s pevnou výškou; neregistruje se a stránka kolem roluje normálně.
- Na stránce s `DocumentActionBar` (DocumentForm) se přilepuje jen pruh akcí; `PageHeader` odroluje, aby se oba přilepené pruhy nepřekryly. `--pane-sticky-top` = výška pruhu akcí.

### Nové API 2.53.0

- `PageLayout` – `variant?: "list" | "form"` (výchozí `"form"`), děti PageHeader + obsah; `usePageLayoutVariant()`.
- `height?: "fill" | "auto"` na `ZoomGrid`, `DataGrid`, `TreeGrid`, `ZoomPane` – bez prop podle nejbližšího `PageLayout` (list → fill, jinak auto).
- `ZoomGrid.stickyHeader?: "grid" | "pane" | "none"` – `grid` = záhlaví přilepené v rolovacím gridu (výchozí pro `fill`); `pane` = opt-in přilepení pod pruh akcí v rolovací oblasti panelu (`--pane-sticky-top`), používá jen `JournalLinesEditor`; `none` = nepřilepené (výchozí pro `auto`).
- `ZoomGrid.overflowFallback?: boolean` – nouzové vodorovné rolování gridu, který jinak sloupce přesouvá do detailu (když se nevejde ani minimum).
- `useGridVirtual(count, { height? })` – bez `height` bere režim ze stejného zdroje jako `ZoomGrid` (PageLayout); v `auto` nevirtualizuje.
- `usePaneScrollElement()` – rolovací prvek aktuální záložky.
- Formulářové gridy automaticky volí zoom 75–100 %; seznamové gridy ponechávají ruční zoom jen pro aktuální zobrazení.

### Doplnění – poznámky z system.md

### BREAKING pro aplikace – migrace na 2.53.0

- Grid v panelu **bez** `PageLayout variant="list"` má nově `height="auto"`: roste podle obsahu, nemá vlastní svislé rolování a jeho záhlaví se nepřilepuje (roluje celý panel). Virtualizace je v `auto` vypnutá.
- Seznamové stránky obalte `<PageLayout variant="list">` (PageHeader + lišta + grid) – grid pak vyplní panel (`fill`), roluje jen jeho tělo a záhlaví i součty jsou přilepené. Formuláře a karty obalte `<PageLayout variant="form">`.
- Odstraňte ruční `maxHeight`, `calc(100vh …)` a výšky odvozené z `window.innerHeight` ve stránkách i u gridů; výšku určuje rodič.
- Odstraňte `ListScrollRestore` a jiné vlastní obnovy pozice rolování – `PaneLayout` obnovuje pozici každé záložky (per krok historie) sám. Pro výjimečné potřeby je `usePaneScrollElement()`.
- Zoom gridu ani hustota se neukládají. Formulářový grid přepočítá zoom z dostupné šířky; při 75 % pokračuje kaskádou sloupců a nakonec rolováním.
- Událost `grid-zoom-change` byla zrušena – zoom a hustota platí jen pro instanci gridu v záložce.
- `PaneLayout` má být přímý obsah `AppShell`, ne vnořený v jiné rolovací stránce (ohlásí se sám, main pak nemá padding ani rolování). Ovládá main jen když je skutečně zobrazený – skrytý (`hidden`) PaneLayout main uvolní. Vložený PaneLayout (ukázky, náhledy ve stránce) = prop `embedded` + kontejner s pevnou výškou; neregistruje se a stránka kolem roluje normálně.
- Na stránce s `DocumentActionBar` (DocumentForm) se přilepuje jen pruh akcí; `PageHeader` odroluje, aby se oba přilepené pruhy nepřekryly. `--pane-sticky-top` = výška pruhu akcí.

### Nové API 2.53.0

- `PageLayout` – `variant?: "list" | "form"` (výchozí `"form"`), děti PageHeader + obsah; `usePageLayoutVariant()`.
- `height?: "fill" | "auto"` na `ZoomGrid`, `DataGrid`, `TreeGrid`, `ZoomPane` – bez prop podle nejbližšího `PageLayout` (list → fill, jinak auto).
- `ZoomGrid.stickyHeader?: "grid" | "pane" | "none"` – `grid` = záhlaví přilepené v rolovacím gridu (výchozí pro `fill`); `pane` = opt-in přilepení pod pruh akcí v rolovací oblasti panelu (`--pane-sticky-top`), používá jen `JournalLinesEditor`; `none` = nepřilepené (výchozí pro `auto`).
- `ZoomGrid.overflowFallback?: boolean` – nouzové vodorovné rolování gridu, který jinak sloupce přesouvá do detailu (když se nevejde ani minimum).
- `useGridVirtual(count, { height? })` – bez `height` bere režim ze stejného zdroje jako `ZoomGrid` (PageLayout); v `auto` nevirtualizuje.
- `usePaneScrollElement()` – rolovací prvek aktuální záložky.
- Formulářové gridy automaticky volí zoom 75–100 %; seznamové gridy ponechávají ruční zoom jen pro aktuální zobrazení.

## 2.52.0 – Partneři D, část B

- Nové `FieldValue` drží hodnotu jen ke čtení ve stejné výšce jako vstup a podporuje pravou doplňkovou akci přes `trailing`.
- Nové `SegmentedField` nabízí přístupnou volbu 2–3 typů záznamu s ovládáním šipkami.
- `FieldGrid` podporuje `cols={12}` a `Field` prop `span`; pod 40 rem skládá pole po dvojicích.
- `OptionSelect.placeholderValueLabel` nastaví vlastní text prázdné hodnoty.
- Ukázka partnera používá schválené rozvržení firmy, osoby, adresy, doplňujících údajů a kontaktu.

## 2.51.0 – tisk pokladního dokladu podle nastavení

- Pokladní doklad tiskne 1–5 kopií; při zapnutém skládání se kopie řadí po dvou na A4, jinak každá na vlastní stranu.
- `CashReceiptPdfInput.printNumber` (výchozí true) vypíná tisk čísla dokladu – pole zůstane prázdné.
- `CashReceiptPrintDialog` přijímá výchozí hodnoty z nastavení dokladu: `defaultCopies`, `defaultTwoPerPage`, `defaultPrintNumber`.

## 2.49.0 – doplnění editace dokladu 7

- `JournalLinesEditor.accountDisplay` volí číslo účtu nebo číslo s názvem; `showQuantityColumns` nastavuje výchozí Množství / MJ / Cenu za MJ a Zakázka je v režimu hlavního účtu výchozí.
- `DocumentSettingsDialog.value.accountDisplay` ukládá volbu Zkráceně / Celý; detail řádku se skládá do jednoho, nejvýše dvou řádků.
- `DocumentForm.error` přidává jednotný zavíratelný chybový pruh pod akcemi formuláře.
- Uživatelské popisky jsou sjednocené na „IČO“.

## 2.48.0 – editace dokladu 7, část B

- `DocumentForm.settings` přidává položku „Nastavení…“ do nabídky a identifikační řádek používá měnovou značku.
- `DocumentSettingsDialog` řídí nastavení zadávání a tisku přes `value` / `onSave`; pokladna může povolit návrhy protistrany.
- `JournalLinesEditor.initialEmptyLine`, `showAllErrors` a `JournalLine.isBlank` podporují prázdný počáteční řádek; Enter a Tab pokračují další buňkou a na konci přidají řádek.
- DUZP a Datum DPH jsou vedle sebe; nápovědy dat a kurzu zůstávají na jednom řádku, dokud nedosáhnou okraje formuláře.

## 2.46.0 – Partneři, část B

- Nové: `LookupField` (ikonová akce v poli, režimy search / refresh / auto); `IcoField` na něm postavený s `digitsOnly` (výchozí true, jen číslice, max. 8).
- Nové: `CheckboxField`, `CheckboxGroup`, `SwitchField`, `SettingsSection`; `FormSection` má svislou mezeru mezi potomky; `ColumnFilter` a `ColumnPicker` používají standardní `Checkbox`.
- `DocumentForm`: „Nezahrnovat do platebních příkazů“ jako `CheckboxField`.
- `AddressFieldGrid.mapAction` – tlačítko Mapa v posledním řádku.
- Nové pomocné funkce bankovních účtů: `parseCzAccount`, `isValidCzAccount`, `czIban`, `isValidIban`, `formatIban`.
- Nové: `VatStatusBadge`.
- Stav záznamu: `RecordDialog.status`, `lifecycleAction`, `dirty`, `cancelLabel`; grid `activeStatusColumn`, `filterInactiveRows`, `ShowInactiveToggle`, `GridRowMenu`, `activeToggleMenuItem`; `InactiveTag` a jednotné chování neaktivních položek v `OptionSelect` (`inactive`), `BookSelect`, `PartnerSelect`, `UnitSelect`, `DimensionSelect` (`active`) a `ContactSelect` (`active`).
- Pravidla zaškrtávátek, přepínačů a stavu záznamu v `system.md`.

## 2.44.0 – doplnění editace dokladu 6

- `DocumentForm.vat.periodLabel` zobrazuje popisek období pod Datem DPH; při podaném období má přednost `filedWarning`.
- `DocumentForm.dateWarnings` předává varování pod Datum vystavení, Datum účetního případu, DUZP, Splatnost nebo Datum DPH.
- `CashReceiptPdfInput` přijímá `currencySymbol` a `homeCurrencySymbol`; pokladní PDF používá značku a bez ní zachová kód měny.

## 2.43.0 – edit dokladu 6, část B

- Breaking: `DocumentHeaderValue.vatDate` nahrazuje `vatPeriod`; `vat.periodOptions`, `periodReadOnly`, `relevant` a `onRelevantChange` byly odstraněny. Stav přepínače je `value.vatRelevant`, období popisuje `vat.periodLabel` a Datum DPH řídí `vat.dateLink` / `dateLockReadOnly`.
- `JournalLinesEditor` začíná editaci jedním klikem i psaním, otevírá výběry, naviguje Tabem, má responzivní sloupce, připnuté Akce a přepínač ND v částce. `AccountOption` přidává `nonTaxDefault`.
- Stav dokladu je u titulku přes `PageHeader.titleBadge`; přepínač DPH je v pruhu akcí. Rekapitulace používá záložkový řádek bez nadpisu.
- Breaking: `LegalFormField.options` je povinné a hodnota je kód. `CurrencyOption.symbol`, `homeCurrencySymbol` a explicitní domácí měna nahrazují pevné CZK/Kč.
- `DateField` přidává `hint`, `warning` a `link.toggleDisabled`; záložky panelů mají stejné šířky 7,5–12,5 rem a tooltip celého názvu.

## 2.41.0 – Vstupuje do DPH

- Ve verzi 2.41 `DocumentForm.vat` přidalo řízený přepínač přes dnes již odstraněné props `relevant` a `onRelevantChange`.
- Vypnutý příznak skryje DUZP a Období DPH bez mazání hodnot; neplátce nevidí žádné prvky DPH.
- Tato konfigurace byla ve verzi 2.43 nahrazena hodnotou `value.vatRelevant`.

## 2.40.0 – kontext panelů a detail prostoru

- `AppShellPanel` přidává `badge` a `context`; Administrace provozovatele tak označí pohled přes všechny prostory a nastavení prostoru či firmy ukáže svůj objekt.
- `StatusBadge` přidává výrazný nealarmující tón `accent` se světlou i tmavou variantou.
- `RecordDialog` přidává `readOnly`, `closeLabel` a `tabs`; detail jen pro čtení nabízí pouze Zavřít a rovnocenné gridové záložky.
- Ukázka Navigace obsahuje tři panely, grid uživatelů s bezpečnostními stavy a detail prostoru se záložkami Členové, Pozvánky a Firmy.

## 2.38.0 – data a období DPH na dokladu

- `DateField` podporuje řízené svázané datum: zamčené pole nahrazuje kalendář zámkem, odemčené nabízí opětovné svázání.
- `DocumentForm` ve verzi 2.38 přidalo `accountingDateLink`, `vat` a dnes již nahrazené `vatPeriod`; od verze 2.43 používá Datum DPH (`vatDate`).

## 2.36.0 – limit haléřového vyrovnání

- `DocumentForm` přijímá `roundingLimit` (výchozí 1,00 Kč) a `roundingLabel`; oba přeposílá do editoru řádků jako limit a popisek haléřového vyrovnání. Aplikace tak může nastavit firemní limit i vlastní pojmenování vyrovnání.

## 2.35.0 – formulář dokladu a grid řádků (dříve 2.34.0)

- Formulář používá jedinou typografickou stupnici v `rem`; jedna sekce Řádky se zobrazuje bez lišty záložek a informace o změně jsou pod formulářem.
- Částka má výrazný přepínač Σ, samostatné rozvržení cizí měny a kurz s jednotkou i zdrojem pod vstupem.
- `JournalLinesEditor` rozlišuje hlavní protiúčet a interní doklad, podporuje množství, MJ, cenu, měnu dokladu a připnuté řádky vyrovnání či kurzového zaokrouhlení.
- Řádky lze řadit tažením nebo Alt+šipka; vyrovnání se navrhne z rozdílu a součty jsou výhradně v patě příslušných sloupců.
- `JournalLinesRecap` je řízená přes props, správně používá měny dokladu a domácí měnu a neukládá stav do `localStorage`.
- Nový `UnitSelect` hledá měrné jednotky podle kódu i názvu a volitelně umožní založit nový kód.

## 2.32.0 – edit dokladu 4 a jednotná lišta gridu

- Všechny akce v lištách gridů, řádků a platebního kalendáře používají stejný neutrální rámeček; aktivní filtry zůstávají oranžové a zapnuté režimy modré.
- `CounterpartyField` po otevření ukáže všechny aktivní partnery, podporuje `favoriteIds` a má šipku pro otevření seznamu. Nový `SuggestInput` nabízí hodnoty z předchozích dokladů.
- `DocumentForm` používá nadpis Základní údaje, našeptávání pro předávajícího a popis, editovatelné ruční Celkem se symbolem Σ a štítky MD/DAL v identitě.
- `JournalLinesEditor` má jednotnou horní lištu s přidáním, zaokrouhlením, hledáním, sloupci, obnovením rozložení a zoomem. Pata sjednocuje Rozpis, Zaokrouhlení, Celkem, Zadáno a Rozdíl.
- Nová sbalitelná rekapitulace nabízí Účtování, Zakázky a vlastní `recapTabs`; stav panelu a záložky se pamatuje podle `storageKey`.

## 2.31.0 – rozvržení údajů dokladu

- `DocumentForm` používá jednotnou dvacetisloupcovou mřížku: hlavní obsah zabírá 70 % a krátké údaje po 15 %; v úzkém panelu se pole skládají pod sebe, IČO a DIČ zůstávají vedle sebe.
- Partner má vždy samostatná pole IČO a DIČ. Propojený partner je vyplní a zamkne; u ruční protistrany je lze upravit. Neplatné osmimístné české IČO pouze zobrazí upozornění.
- `DocumentHeaderValue` přidává `counterpartyIco`, `counterpartyDic` a `handedOverBy`; pokladní doklad zobrazuje Přijato od / Vyplaceno komu a externí číslo v partnerské sekci.
- Sekce Data řadí Datum vystavení před Datum účetního případu. Sekce částky má kompaktní řádky a rozlišuje nadpisy Částka a Účtování a částka.
- Identifikační badge je nižší a celý řádek je svisle vystředěný. Přilepený pruh akcí už nemá spodní linku.
- Identifikační údaje jsou zvýrazněné 15px polotučným textem; badge směru a stavu mají shodnou výšku. `DocumentStatusBadge` přidává velikost `sm | md`, přičemž gridy zůstávají na `sm`.
- Zaokrouhlení se zadává v liště `JournalLinesEditor` vedle údaje Zbývá rozepsat přes nový nepovinný prop `rounding`; v sekci Částka už samostatné pole není.

## 2.30.0 – identita v těle formuláře (dříve 2.28.1)

- `PageHeader` vždy zobrazuje nadpis dokladu; identita jej už nenahrazuje.
- Identifikační řádek je první uvnitř formulářové karty: obsahuje směr, knihu, kód období, podle varianty měnu a účet a vpravo číslo dokladu nebo čekající text. V úzkém panelu se celé údaje zalomí, ale nezmizí.
- Přilepený pruh akcí má vlevo stav a Schváleno, vpravo Uložit, hlavní akci a nabídku dalších akcí. Směr se v něm již neopakuje.
- Veřejné API zůstává beze změny.

## 2.28.0 – identita dokladu, kurz a sekce

- Nový `SectionHeading` sjednocuje nadpisy sekcí formulářů, dialogů, karet a panelů; nadpisy stránek a gridů se nemění.
- `DocumentForm` přechází na jedno široké rozvržení se sekcemi Partner, Data, Účtování a částka a Platební údaje. Nové `identity` doplňuje identifikační řádek a `directionBadge` tónovaný směr Příjem/Výdej.
- Nový `RateField` podporuje doporučený a ruční kurz včetně povinného důvodu; `DocumentHeaderValue` přidává `rateManual`, `rateNote`, `suggestedRate` a `suggestedRateInfo`.
- `IcoLink` ověřuje české IČO a volí obchodní rejstřík nebo ARES. `DataGridColumn.format="ico"` zpřístupňuje stejné zobrazení tabulkám.
- `CounterpartyField` drží „Nový partner…“ vždy na konci a předává seed `{ name, ico, dic }`. Záložky mají vždy viditelný křížek, dirty tečku s přepnutím při najetí a zavření prostředním tlačítkem.

## 2.27.0 – tisk gridu do PDF

- DataGrid a TreeGrid: nové props `printContext`, `printTitle`, `printParams`; v menu Stáhnout položka „Tisk (PDF)…“ (jen s `printContext`).
- Data jako Excel export: viditelné sloupce v pořadí, filtr, řazení, seskupení; tisk jen rozbalených skupin a uzlů, skupiny/uzly tučně s odsazením 2 mm na úroveň a mezisoučty, řádek součtů.
- Parametry záhlaví z kontextového řádku (kniha / Všechny knihy, období s rozsahem, hledání, filtry, Stav k datu) + `printParams`.
- Orientace automaticky (> 7 sloupců nebo > 180 mm → na šířku), v náhledu přepínač Na výšku / Na šířku.
- Nad 5 000 řádků potvrzení s odhadem stran. Nové veřejné nástroje: `gridPrintParams`, `gridPrintOrientation`, `gridPrintColumnWidths`, `buildGridPrintSection`, `buildGridPrintPdf`, `useGridPrint`; `GridExport` props `print`, `getPrintData`; `PrintSection.table.rowStyles`, formát `code`, záhlaví částek vpravo.

## 2.26.1 – opravy tisku a akcí dokladu

- Částky slovy správně skloňují koruny a haléře podle celé částky, zaokrouhlují na haléře, podporují miliardy a cizí měny.
- Pokladní doklad zalamuje dlouhou částku slovy, zachovává všechny řádky, umí přejít na celou A4 a má zápatí u každé kopie.
- Sestava doplňuje konečný počet stran až po vykreslení, používá logo v první hlavičce nezávisle na zápatí a hlídá vlastní sekce u konce stránky.
- Pruh akcí měří skutečnou šířku, důvod zakázané akce zobrazuje přímo v nabídce a stav se již neopakuje v pravém panelu.
- Firemní monogram ignoruje právní formy názvu.

## 2.26.0 – akce dokladu a tiskové PDF

- `DocumentForm` má pod nadpisem přilepený pruh se stavem, schválením, akcí Uložit, hlavní stavovou akcí a nabídkou dalších akcí. Nové props jsou `saveAction`, `primaryAction` a `moreActions`; původní volné `actions` bylo odstraněno.
- Uložit podporuje stav změn, průběh ukládání a zkratku Ctrl/Cmd+S uvnitř formuláře; v úzkém panelu zůstávají hlavní akce jako ikony s nápovědou.
- Akční sloupec `DataGrid` a `TreeGrid` má viditelné přeložitelné záhlaví „Akce“.
- Nové tiskové jádro `buildReportPdf`, `PrintPreviewDialog`, `companyMonogramSvg` a `amountInWordsCs` vytváří firemní A4 sestavy s českými fonty, opakovaným záhlavím, součty a číslováním vícestránkových výstupů.
- Nové `buildCashReceiptPdf` a `CashReceiptPrintDialog` tisknou příjmové i výdajové pokladní doklady, jednu nebo dvě kopie na A4, koncept s vodoznakem a cizí měnu.

## 2.25.0 – protistrana, měna a období v DocumentForm

- Nová komponenta `CounterpartyField`: volný text protistrany s našeptáváním partnerů (název, IČO); výběr vyplní název i `partnerId`, ruční přepis vazbu zruší, ✕ „Zrušit propojení“ nechá text; `disabled` = text.
- `DocumentHeaderValue.counterpartyName` (edituje se spolu s `partnerId`); DocumentForm místo PartnerSelect používá CounterpartyField, nový prop `onCreatePartner`.
- Protistrana u všech druhů dokladů včetně ID (ne UZ). IČO a DIČ jen u propojeného partnera.
- Nové props `homeCurrency` (výchozí CZK) a `currencyLocked`; kurz se ukazuje jen u cizí měny, jinak se podsekce jmenuje „Měna“.
- Období v pravém panelu šedě s nápovědou „Období se řídí datem účetního případu“.

## 2.24.2 – oprava měření řádku akcí

- Měřicí kopie řádku akcí se vkládá do kontejneru gridu v obalu s `container-type: inline-size` a skutečnou šířkou, takže texty typu „Nový doklad“ se změří správně a Obnovit se neořízne.
- Pod 640 px se otevřené hledání s textem v úrovni 3 zúží (min. 6em) místo vytlačení ostatních prvků.
- Nová komponenta `GridToolbarCollapsible`: doplňky levé části se v úrovni 3 v řádku nevykreslí (jsou jen v ⋯) – žádná duplicitní id; kopie navíc id odstraňuje.
- Kopie se přeměřuje jen při změně sady nástrojů/stavů, zoomu, hustoty nebo velikosti, ne při psaní.

## 2.24.1 – bezeztrátová adaptivní lišta

- Krajně úzká lišta přesouvá hlavní parametry, režim zobrazení, rozbalení a Stav k datu do jediné nabídky `⋯`; žádný ovladač už nezmizí.
- Přidat se zkrátí na `+`, hledání na ikonu a Obnovit zůstává samostatně vpravo i při šířce 360 px.
- Přirozené šířky všech skupin se měří skrytou kopií při každé změně obsahu; mezery vycházejí ze skutečného vykresleného stylu a respektují zoom.
- `AsOfDateToggle` znovu sdílí výšku a mezery skupiny řádku akcí. API zůstává beze změny.

## 2.24.0 – rozvržení DocumentForm podle Money

- Hlavička dokladu má základní a platební údaje vlevo a panel vlastností, kurzu a částky vpravo; v úzkém panelu se části skládají pod sebe.
- Hlavní účet je první a jeho popisek se řídí druhem dokladu. Zamčený účet je prostý text a strana MD/DAL je uvnitř hodnoty.
- Partner používá popisek podle druhu a směru dokladu a zobrazuje IČO i DIČ.
- Pole jen pro čtení (hlavní účet, IČO, DIČ, Celkem za doklad při sčítání z rozpisu, Zaokrouhlení) jsou čistý text bez rámečku a plochy; částky jsou vpravo a v mono písmu.
- Přibyly props `documentType`, `vat.periodLabel`, `rateAmount`, `PartnerOption.dic`, `AccountSelect.suffix`; `totalMode` lze řídit přes `editableFields`.
- Jde o minor verzi bez zachování zpětné kompatibility rozvržení; význam stávajících props zůstává zachován.

## 2.23.2 – dokončení adaptivního řádku akcí

- Úroveň lišty se určuje z přirozených šířek levé části a pravých skupin; obsah se už neořezává ani neposouvá vodorovně.
- Přesunuté nástroje sdílí právě jednu nabídku `⋯`, zatímco Obnovit zůstává vždy vpravo; návrat na širší variantu má 16px hysterézi.
- Neaktivní Filtr je čtvercové ikonové tlačítko, záložky stránky i formuláře mají shodnou výšku 40 px a YTD používá zkrácené počáteční datum ve stejném roce.
- `@tailwindcss/vite` byl povýšen z 4.2.1 na 4.3.3; míchání gridových ploch zůstává v `oklab`, aby se nezměnily tmavé odstíny záhlaví a součtů.
- API zůstává beze změny.

## 2.23.1 – opravy adaptivní lišty a kontextu

- DataGrid i TreeGrid používají jedinou nabídku ⋯, která obsahuje další akce a právě přesunuté nástroje; Obnovit zůstává vždy samostatně úplně vpravo.
- Lišta měří celý svůj obsah. Při kritické šířce zkrátí Přidat na ikonu a zavřené hledání ponechá jako ikonu bez ořezu obsahu.
- Otevřený Filtr je opět viditelně stisknutý a segmentový přepínač zachovává dělicí linky i modré/oranžové vybrání ve světlém a tmavém režimu.
- Firma a období mají od tabletové šířky stálou mezeru kolem oddělovače; centrování se řídí pouze skutečně dostupným místem.
- Nový větší vzhled používají jen `PageTabs` a záložky formulářů; aktivní záložka je tučná. Ostatní záložky zůstávají beze změny.
- YTD se zobrazuje a exportuje jako skutečný rozsah od začátku účetního období, například „1. 7. 2026 – 24. 9. 2026“.
- Bez změny veřejného API.

## 2.23.0 – stabilní kontext a jednořádkové ovládání gridu

- Firma má od šířky tabletu minimálně šířku období; mezi oběma štítky je skutečný svislý oddělovač.
- Kniha a období jsou zarovnané vlevo. Běžná období drží krátkou stálou šířku, dlouhé volby se rozšíří nejvýše do 20 em.
- Panel filtrů se otevírá přímo pod řádkem akcí, zachovává přirozené šířky polí a sdílí zoom i hustotu gridu.
- Řádek akcí je jednořádkový a podle změřené šířky přesouvá skupiny Zobrazení a Data do nabídky ⋯; Obnovit zůstává vpravo.
- Primární Přidat je vždy modré, tlačítko Filtr má stabilní šířku a křížek hledání se ukáže pouze při zadaném textu.
- Kontextové popisky a ovládání mají jednotnou výšku i písmo. `GridSegmentedToggle` má lehký obrys a jasně odlišenou vybranou hodnotu.
- Nové `PageTabs` a záložky ve formulářích používají větší text, aktivní podtržení a jasnější hierarchii.
- Bez breaking změn.

## 2.22.0 – vyvážený kontext firmy a období

- `CompanySwitcher` zobrazuje neutrální obrysový štítek s ikonou budovy, názvem firmy a šipkou; v kompaktní šířce název zkrátí a celý název s IČO ponechá v nápovědě.
- Nabídka firmy obsahuje jen hledání a jeden seznam všech firem bez skupin „Poslední“ a „Všechny firmy“. Odstraněny byly veřejné props `recentIds`, `recentLabel` a `allLabel` (breaking změna; ukázky je nepoužívají).
- `CompanySwitcher`, `PeriodSwitcher` a `ContextPill` podporují řízené `open` / `onOpenChange`; výběr i `onCreate` nabídku zavřou bez obcházení změnou klíče.
- `PeriodSwitcher` zachovává stavové barvy a přidává odpovídající obrys pro otevřené, uzávěrkové, uzavřené i oba prázdné stavy. Firma bez období je šedá a bez stavové tečky.
- `WorkspaceCompanySwitcher` používá pro firemní výběr stejnou neutrální geometrii, ikonu a IČO v seznamu.

## 2.21.2 – skupiny pravé části lišty gridu

- DataGrid i TreeGrid řadí pravou stranu do skupin Najít, Zobrazení, Data a Obnovit s oddělovači pouze mezi neprázdnými skupinami.
- Stáhnout obsahuje pouze exporty; importy a vedlejší akce zůstávají v nabídce ⋯.
- Úzká lišta zůstává beze změny a její jediná nabídka ⋯ řadí nástroje jako Zobrazení, Data a Obnovit.
- Bez breaking changes.

## 2.21.1 – opravy lišty a stínu gridu

- DataGrid i TreeGrid mají na široké ploše nejvýše jednu nabídku ⋯ a na úzké ploše právě jednu společnou nabídku nástrojů a dalších akcí.
- `asOf` a `toolbarLeft` zůstávají dostupné i pod 640 px; lišta se podle potřeby zalomí.
- Široká lišta řadí další akce před hustotu a zoom a ponechává Obnovit úplně vpravo.
- Stín ukotveného sloupce akcí se zobrazuje, dokud vpravo zbývá odrolovaný obsah, a přepočítává se při změně velikosti i zoomu.

## 2.21.0 – nové pořadí akcí gridu a akce ve stromu

- `addAction` je vizuálně vlevo; Obnovit je vždy úplně vpravo. Veřejné API `addAction` se nemění a aplikace nemusí nic upravovat.
- Pod šířkou gridu 640 px zůstává základní ovládání a nabídka ⋯; export, sloupce, seskupení, hustota, zoom a obnovení jsou ve skupině Nástroje.
- `DataGrid` přidává `editDisabledReason` a `deleteDisabledReason`; zakázaná akce může zůstat viditelná s vysvětlením.
- `TreeGrid` přidává `onEditRow`, `onDeleteRow`, `deleteConfirm`, `rowActions`, `canEditRow`, `canDeleteRow`, oba `disabledReason`, `actionsLabel` a `hideDefaultActions`.
- Bez breaking changes.

## 2.20.3 – popisky a oddělený kontextový řádek

- `GridContextBar` má české výchozí popisky „Kniha:“ a „Období:“; lze je změnit přes `texts.bookLabel` a `texts.periodLabel` a jsou přístupnostně svázané s hodnotou nebo výběrem.
- Kontextový řádek používá tokenový podklad záhlaví, spodní linku a nižší výšku. Výběry zůstávají bílé a řádek akcí zůstává bílý.
- Kontext, akce, hlavička, řádky a součet tvoří jeden blok s jediným vnějším okrajem a stínem. Stejná logika platí v tmavém režimu.
- Výběr knihy i období drží stálou šířku podle nejdelšího popisku bez měření v JavaScriptu; dlouhé hodnoty se zkracují s dostupným celým názvem.
- `GridContextBar`, `DataGrid` a `TreeGrid` přijímají `contextRight`. Nový `GridSegmentedToggle` nabízí přístupný segmentový filtr; `GRID_DIRECTION_OPTIONS` a `filterByDirection` pokrývají pokladní a bankovní směr Vše / Příjmy / Výdaje.
- Bez breaking changes.

## 2.20.2 – kniha vlevo a jednohodnotové výběry

- `GridContextBar` zobrazuje vlevo knihu, oddělovač podle hustoty a následně období; pravá část zůstává prázdná.
- `GridBookDisplayConfig` má volitelný `readOnly` a `onChange`. Jediná nebo needitovatelná kniha se zobrazuje jako tučný text, nikdy jako zakázaný výběr.
- `BookSelect` má nový volitelný prop `displayWhenSingle` (výchozí `true`). Jedinou aktivní knihu zobrazí jako hodnotu jen pro čtení a doplní její id přes `onChange`.
- Bez breaking changes.

## 2.20.1 – zoom a hustota kontextového řádku

- `GridContextBar` přijímá volitelné `zoom` a `density`; bez nich hodnoty převezme z `GridZoomContext`.
- Období, posun, vymazání a výběr knihy se škálují stejně jako ovládací prvky v `GridToolbar`, včetně kompaktní hustoty.
- `DataGrid` a `TreeGrid` předávají oběma řádkům stejné hodnoty. Ctrl/Cmd + kolečko nad kontextovým řádkem mění zoom celého gridu.
- Bez breaking changes.

## 2.20.0 – kontextový řádek gridu a hlavičky bez podtitulků

- `DataGrid` a `TreeGrid` mají volitelné props `period` a `book`. Nad řádkem akcí zobrazí společný `GridContextBar` s knihou vlevo, oddělovačem a obdobím.
- Nové veřejné `GridPeriodFilter`, `GridBookSelect`, `useGridPeriod`, `gridPeriodRange`, `gridPeriodLabel` a `filterByGridPeriod` podporují i nekalendářní účetní období.
- Při výběru „Všechny knihy“ se automaticky zobrazí první povinný sloupec Kniha; zůstává mimo uložené pořadí, viditelnost a šířky sloupců.
- `PageHeader.description`, `DocumentForm.description` a `RecordDialog.description` jsou zastaralé. Odstraňte je; popis dialogu zůstává pouze pro čtečky obrazovky. Pod nadpisem stránky ani formuláře není doplňkový text.
- Přechod: období a knihu odeberte z `toolbarLeft` a předejte přes `period` a `book`. Ostatní stávající props fungují beze změny; bez breaking změn veřejného API.

## 2.19.0 – bloky sekcí v levém menu

- `NavGroup` má nový volitelný prop `section`. Po sobě jdoucí skupiny se stejnou hodnotou tvoří vizuální blok s nesbalitelným nadpisem.
- Bloky fungují shodně v rozbaleném, ikonovém a mobilním menu i v panelech Nastavení firmy / Administrace. Při hledání se prázdný blok skryje a název sekce se neprohledává.
- Stávající skupiny bez `section`, záložky, panely a chování hledání zůstávají beze změny. Bez breaking changes.

## 2.18.1 – společný zoom tabulky a stromu

- `DataGrid` a `TreeGrid` při zadaném `viewMode` sdílejí zoom i hustotu přes společný klíč `view:<exportName>` (nebo prop `viewZoomKey`); po aktualizaci začne zoom jednou od 100 %. Bez breaking changes.
- Přepnutí do tabulkového zobrazení používá jednoznačnou ikonu tabulky.

## 2.18.0 – vydání katalogu

- Vydání katalogu design systému bez nových funkcí; obsah odpovídá changelogu 2.17.0 (jednotný řádek akcí gridu, rovnocenné záložky, `PageHeader.menuActions`, `AppShell.navSearchMenu`, `LayoutMenu trigger="icon"`).

## 2.17.1 – veřejné pomocné nástroje

- Veřejný vstup nově zpřístupňuje nastavení gridů, výpočty období, validaci formulářů a bezpečné opakování síťových požadavků.
- Interní zachytávání chyb a nouzová serverová stránka zůstávají záměrně neveřejné, protože nejsou součástí uživatelského rozhraní a zachytávání mění globální chování chyb.

## 2.17.0 – jednotný řádek akcí gridu a rovnocenné záložky

Nové:
- Veřejné `GridToolbar`, `GridToolbarSeparator`, `AsOfDateToggle`, `GridToggleButton`, `GridExpandControls` a typy akcí/exportů.
- `DataGrid`: `viewMode`, `onViewModeChange`, `asOf`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`.
- `TreeGrid`: `viewMode`, `onViewModeChange`, `asOf`, `toolbarLeft`, `filters`, `filterChips`, `onClearFilters`, `defaultFilters`, `addAction`, `moreActions`, `pdfExport`, `extraExports`, `loading`.
- Ctrl/Cmd+kolečko používá stejný plynulý výpočet nad celým blokem DataGridu, TreeGridu i ZoomPane.
- `PageHeader.menuActions`, `AppShell.navSearchMenu` a `LayoutMenu trigger="icon"` přesouvají akce stránky do ⋯ a uložená rozložení vedle hledání v menu.
- Lišta záložek je vždy viditelná. Všechny záložky jsou rovnocenné a `openerTabId` dál váže detail k seznamu.

Změny chování a přechod:
- **Breaking:** TreeGrid už nemá textová tlačítka ani segment úrovní; rozbalení/sbalení je ikonové a více úrovní je v nabídce.
- **Breaking:** TreeGrid používá společný ikonový `GridExport` místo `ExcelExportButton`; Excel zachovává osnovu a SUBTOTAL, stejné menu nabízí PDF, HTML a vlastní exporty.
- **Breaking:** `PageHeader` už nemá spodní linku ani spodní vnitřní odsazení.
- **Breaking:** aktivní `GroupControl`, včetně skrytého seskupení, je oranžový místo modrého nebo červeného.
- Stávající `actions` zůstává funkční, ale nové primární akce přesuňte do `addAction` a vedlejší do `moreActions`.
- `AsOfDateField` je zastaralý; v řádku akcí použijte `AsOfDateToggle`.
- **Breaking:** odstraňte `PaneTab.pinned`, target `preview`, `keepTab`, `releaseTab` a `PaneLayout.tabBarMode`. Běžný klik používá `target: 'replace'`; staré uložené `pinned` se bezpečně ignoruje.
- **Breaking:** `PaneLayout` už nepřijímá panelové `isPinned` / `onTogglePin`; samostatný `PinnedBar` zůstává beze změny.
- **Breaking:** `PageHeader.actions` se uvnitř panelu nevykreslí; akce celé stránky přesuňte do `menuActions`, „Nový“ do gridového `addAction`.
- `PageHeader` má v panelu vpravo pouze ↑/↓, ←/→, maximalizaci a ⋯. Alt+↑/↓ listuje záznamy, Alt+←/→ historií a Alt+M maximalizuje.
- `LayoutMenu` přesuňte z horní lišty do `AppShell.navSearchMenu` a použijte `trigger="icon"`.

## 2.16.0 – nahrazeno ve 2.17.0

Koncepty, historie, maximalizace, listování záznamy a uložená rozložení zůstávají. Dočasné/ponechané záložky, `pinned`, `preview`, `keepTab`, `releaseTab` a `tabBarMode` byly ve 2.17.0 odstraněny; postup přechodu je v changelogu 2.17.0 výše.

## 2.15.0 – skupiny a hledání v menu

- AppShell odděluje skupiny menu, pamatuje jejich sbalení a ve sbaleném záhlaví zachová součet odznaků i označení aktivní stránky.
- Nové hledání v menu ignoruje diakritiku, podporuje více slov, šipky, Enter, Esc a zkratku `/`; ve sbaleném menu se otevře dočasný překryv.
- Nové volitelné props: `navStateKey`, `navSearch`, `navSearchPlaceholder`, `navSearchEmptyText`. Stav skupiny používá klíč `ds:nav-groups:<navStateKey>:<group.id>`.
- Firma je jednořádková a výraznější; období používá stavový štítek s rozsahem na široké obrazovce. Stávající props zůstávají kompatibilní.

## 2.13.0 – bílý vzhled a IBM Plex

- Všechny plochy světlého režimu jsou bílé; hover, záhlaví a součty gridu v neutrální šedé, linky #DFE3E8, okraj gridu a karet #C9D0D8.
- Levé menu tmavě modré (tokeny `--sidebar`, nové `--sidebar-muted` a `--sidebar-indicator`), aktivní položka se světle modrým levým pruhem.
- Písmo IBM Plex Sans (text, nadpisy, částky s tabulkovými číslicemi) a IBM Plex Mono (kódy, 0.95em); Work Sans a JetBrains Mono odstraněny. Aktualizujte odkaz na písma v hlavičce aplikace.
- Chování komponent se nemění; PDF a Excel beze změny.

## 2.12.0 – záložky v panelech

Každý panel obsahuje seznam záložek. **Breaking changes** a přechod:

- `usePaneDirty(isDirty)` → `useTabDirty(isDirty, key?)`. Příznak se drží podle záložky i po jejím odpojení.
- `usePaneManager().openInPane(route, params, { target: 'active' | 'new' | paneId, uniqueKey })` → `usePaneTabs().openTab(route, params, { target: 'replace' | 'newTab' | 'adjacentPane', kind: 'list' | 'record', recordKey, title, shortTitle, icon })`. `uniqueKey: true` = `kind: 'record'`. `confirmAllPanesClean` a `registerDirty` odstraněny.
- Stav: `PaneState` / `PaneLayoutState` (v1) → `PaneTabsState` (`version: 2`). Uložené hodnoty převede `parsePaneTabs` automaticky, objekty v1 `migratePaneStateV1`. `serializePanes` / `parsePanes` → `serializePaneTabs` / `parsePaneTabs` (DB) a `serializeActiveTabUrl` / `parseActiveTabUrl` (URL, jen aktivní záložka).
- `PaneLayout` je řízený přes `PaneTabsProvider` (props `state`, `onChange`, `onSaveTab`, `onNewTabRequest`); props `panes`, `activePaneId`, `layout`, `widths`, `onChange`, `renderPane`, `defaultRoute` nahrazuje `renderTab(tab, pane)` a `getTabIcon`. Samostatný křížek panelu nahradilo menu ⋯.
- `usePane()` navíc vrací `tabId`; `close()` zavírá záložku.
- Zkratky: Ctrl+1/2/3 a Ctrl+Shift+W zrušeny → Alt(Option)+1/2/3, Alt+←/→, Alt+W, Alt+Shift+W, Alt+T.
- Nové: `PaneTabBar`, `PaneLink`, `getOpenTarget`, `handlePaneLinkEvent`, `useTabDraft`, `useTabScrollRestore`, `clearTabState`, `MAX_TABS_PER_PANE`. Navigace AppShellu uvnitř `PaneTabsProvider` otevírá záložky.

## 2.11.0

- Jemně modré pozadí pracovní plochy, bílé oddělené navigační plochy a výraznější okraje karet a mřížek.
- Aktivní hledání, filtry, jejich počet a štítky používají oranžový stav; vybraný řádek má modrý levý pruh.
- Nadpisy, popisky, záhlaví, součty a částky používají Work Sans bez verzálek; JetBrains Mono zůstává pro kódy a identifikátory.
- Záporné částky používají typografický znak minus pro přesné zarovnání.

## 2.10.1

- **DataGrid, TreeGrid**: nadpis je nově ve výchozím stavu skrytý. Nový prop `showTitle` ho zobrazí pouze na vyžádání; `title` zůstává dostupný pro export a uložená nastavení.

## 2.10.0

- **PaneLayout**: `setLayout(2 | 3)` doplní chybějící prázdné panely a aktivuje první nový. Prop `renderEmpty` upraví prázdný obsah; lišta záložek zůstává vždy viditelná.
- **PinnedBar**: nová lišta trvalých záložek s props `items`, `onOpen(id, { newPane })`, `onUnpin`, `onReorder`, `texts` a `className`.
- **AppShell**: nový slot `subHeader`, který se vykreslí pod horní lištou a skryje při aktivním panelu Nastavení/Administrace.
- **DataGrid**: nové props `onRefresh` a `refreshing`; výběr více používá `GridSelectionToggle` s počtem vybraných řádků.
- **TreeGrid**: nové props `onRefresh`, `refreshing`, `selectable`, `selectionActions`, `onSelectedRowsChange` a `gridTexts`; lišta používá stejné ovladače obnovení a výběru jako DataGrid.
- **LayoutSwitcher**: výchozí nápovědy voleb jsou „1 panel“, „2 panely“ a „3 panely“; nedostupné volby dál zobrazují potřebnou šířku.

## 2.8.1

- Volby firmy a účetního období jsou na široké obrazovce vystředěné; při nedostatku místa se automaticky přesunou vlevo před ovládací prvky.
- Volba firmy už v horní liště nezobrazuje ikonu budovy.
- Hlavní vstup knihovny nově zpřístupňuje sdílené nástroje pro velikost písma, mřížky, účetní převody, jména osob, PSČ, kraje a právní formy.

**Přechod z 2.7.x (TreeGrid)**
- Export stromu má nově rodiče **pod** dětmi – pokud jste soubor dál zpracovávali podle pořadí řádků, upravte to.
- První sloupec nelze skrýt; `width` se přepočítává podle zoomu.
- Tlačítko u uzlu má popisek z `texts.expandNode` / `texts.collapseNode` (dříve `expandAll` / `collapseAll`).
- Vlastní akce předávejte v `actions` – zobrazí se vpravo od zoomu.

## 2.8.0

Doplnění pro výkazy účetnictví.
- **TreeGrid**: `expandLevels` + řízené `expandDepth` / `onExpandDepthChange` (segmentovaný přepínač v liště), `highlightedRowId` (výchozí naposledy rozbalený / vybraný uzel), `onRowClick`, `storageKey`, výběr sloupců (`hiddenByDefault` u sloupce, uložení přes `useGridColumns`), zoom a hustota (`useGridZoom`), akce `actions` vpravo od zoomu. Export do Excelu: souhrnný řádek pod dětmi (outline `summaryBelow`) a součty uzlů jako `SUBTOTAL(9, …)`.
- **AccountSelect**: `allowLevels` (`class` | `group` | `synthetic` | `analytic`) a `catalog` (názvy tříd a skupin); při třídě / skupině vrací prefix („5“, „51“). Nové `accountLevelOf`, `AccountLevel`, `AccountCatalogItem`.
- **Nové**: `BarBreakdownChart` (vodorovné pruhy, hodnota + podíl %, výběr klikem, záporné červeně, bez externí knihovny), `FilterChips` (štítky filtrů + „Zrušit vše“).
- **Excel**: `GridExportData.outlineSummaryBelow` a `subtotalRows`.

## 2.7.1

Úklid API řádků zápisu (bez zpětné kompatibility):
- Odstraněno: `toDbLines`, `fromDbLines`, typ `JournalDbLine`, pole `JournalLine.pairNo`, typ `JournalMainAccount`. Náhrada: `toJournalRow` / `fromJournalRow`.
- JournalLinesEditor má nové veřejné props `mode` ('internal' | 'mainAccount', výchozí 'internal'), `mainSide` ('MD' | 'D'), `sideFieldRules` (výchozí `sideFieldRules`). Prop `mainAccount` je nově číslo účtu (string), ne objekt `{ accountId, side }`.
- Přechod: `mainAccount={{ accountId: "321001", side: "D" }}` → `mode="mainAccount" mainSide="D" mainAccount="321001"`.
- DocumentForm předává `mode`, `mainSide` a `mainAccount` editoru přímo; v `linesEditorProps` je už nelze přepsat.
- Nové typy: `JournalLinesMode`, `JournalMainSide`, `SideFieldRules`, `SideFieldRulesFn`.

## 2.7.0

- **DocumentForm přepracován pro skutečné doklady.** Nová hlavička `DocumentHeaderValue` (bookId, number, direction, accountingDate, issueDate, taxDate, dueDate, externalNumber, partnerId, variableSymbol, constantSymbol, specificSymbol, bankAccount, description, currency, rate, rateInfo, amountTotal, totalMode, roundingAmount, mainAccountId, excludeFromPaymentOrders).
- Kniha (po založení), číslo („přidělí se při zařazení“), kurz (s `rateInfo`) a směr jsou vždy jen ke čtení. Formulář nic neukládá ani nečísluje.
- Nové props `fields` + `documentFieldsForType(code)` (ID, FV, FP, PO, BA, ZFV, ZFP, UZ), `editableFields`, `isNew`, `mainSide`, `mainAccountLocked`, `linesEditorProps`, `tabs` (Řádky vždy první).
- **Nový PaymentScheduleEditor** (splátky a pozastávky, Doplnit zbytek, Rozložit…, Uvolnit / Zrušit uvolnění) a čistá funkce `generatePaymentSchedule(total, params)`.

### Přechod z 2.6 (bez zpětné kompatibility)

| Dříve | Nyní |
|---|---|
| `value.vs` | `value.variableSymbol` |
| `value.amount` | `value.amountTotal` + `value.totalMode` (`'entered'` / `'sum'`) |
| `value.number` editovatelné | jen zobrazení, přiděluje databáze |
| `value.rate` editovatelný (`onRateChange`) | jen zobrazení + `rateInfo` |
| prop `sideFields` | `linesEditorProps={{ sideFields }}` |
| hlavní účet v řádcích ručně | `value.mainAccountId` + prop `mainSide` → `mainAccount` editoru |
| — | povinné nové pole `totalMode`, doporučené `accountingDate` |

## 2.6.1

- Nedostupné položky menu používají decentní stavovou tečku; celý text „Připravujeme“ zůstává v nápovědě a nepřekrývá název položky.
- Hlavní akce gridu, například „Nový doklad“, je vždy bezprostředně vpravo od ovládání zoomu.

## 2.6.0

- **JournalLinesEditor má dva režimy v jedné komponentě** – bez `mainAccount` jde o interní doklad (na řádku MD i DAL účet, `sideFields="split"` je nově výchozí); s `mainAccount` je hlavní strana jen ke čtení (šedě) a zadává se pouze protiúčet.
- `mainAccount.side` používá hodnoty `'MD' | 'D'` shodné s `documents.main_account_side`; `AccountSelect` protiúčtu nenabídne účty se stejnou `category` jako hlavní účet.
- Povinná stranová pole podle osnovy: `sideFieldRules(account, { dimensionRequired })` – VS u kategorií `pohledavky`, `zavazky`, `poskytnute_zalohy`, `prijate_zalohy`, `saldokonto`; zakázka u `bilance` při `dimensionRequired`; partner se nabízí u saldokontních účtů. Validace je jen nápověda s uvedením strany („Chybí zakázka na straně DAL"), rozhoduje databáze.
- Rozbalitelný detail řádku (Alt+↓) se stranovými poli a zaškrtávátkem Nedaňový; chybějící povinná pole se v řádku ukazují jako kompaktní štítky.
- Nedaňový už nemá vlastní sloupec – je to malá přepínací značka u částky (jen u nákladových / výnosových účtů), zkratka Alt+N.
- Řádek haléřového vyrovnání (`isRounding`) je šedý, bez akcí a vždy poslední, s nápovědou „Zaokrouhlení měňte v hlavičce dokladu"; u dokladu s hlavním účtem přibyl ukazatel „Zbývá rozepsat" (`totalAmount`, `totalMode="entered"`) a tlačítko „Dorovnat zaokrouhlením" (`onRoundingFill`, `roundingLimit`).
- `editableFields` nahrazuje `editableColumns` i `readOnly`; `AccountOption` má nová pole `category` a `accountType`; `DocumentForm` přijímá `sideFields`.

## 2.5.0

- **Režim více oken (panely 1 / 2 / 3)** – `PaneLayout` uvnitř `AppShell` místo `children`, `LayoutSwitcher` do horní lišty vedle `SearchButton`.
- Panely mají vlastní historii (`usePane()` → `navigate`, `back`, `forward`, `setTitle`, `close`), `usePaneManager().openInPane(route, params, { target })` a hlídání neuložených změn (`usePaneDirty`, `confirmAllPanesClean`).
- Stejný záznam se neotevře dvakrát (`uniqueKey`), minimální šířka panelu 560 px při 100 %, při zmenšení okna se panely dočasně skryjí s upozorněním a vrátí se po zvětšení.
- Dělicí čáry lze táhnout, dvojklik rozdělí šířky rovnoměrně; zkratky Ctrl+1/2/3 (přepnout panel) a Ctrl+Shift+W (zavřít panel), Ctrl+K a Ctrl+B zůstávají globální.
- Zkratky mřížek a editorů reagují jen v aktivním panelu; `RecordDialog` uvnitř panelu překrývá jen svůj panel; tisk vytiskne jen panel, ze kterého byl spuštěn.
- `DataGrid`, `PageHeader`, `RecordDialog`, `DocumentForm` a `JournalLinesEditor` jsou kontejnery (`@container`) – v úzkém panelu se chovají jako na úzké obrazovce. Mimo `PaneLayout` je vzhled beze změny.
- Serializace stavu panelů: `serializePanes` / `parsePanes` (URL `?panes=…&active=…` nebo JSON v databázi).

## 2.4.0

- Řádky zápisu odpovídají databázi 1:1 – nové mapování `toJournalRow` / `fromJournalRow`; `toDbLines`, `fromDbLines` a `pairNo` jsou deprecated.
- Nové props `sideFields` ("shared" | "split") a `sharedSide` pro oddělený VS, partnera a zakázku na straně MD a DAL.
- Nový prop `mainAccount` pro knihy s pevným hlavním účtem – zadává se jen protiúčet.
- Nový sloupec Nedaňový (`isNonTaxAllowed`) a jen pro čtení řádek zaokrouhlení (`isRounding`) vždy na konci.
- Ukázka Účetní formuláře obsahuje interní doklad s oddělenými stranami a pokladní doklad s hlavním účtem 211.

## 2.3.1

- Kompaktní a mobilní zobrazení přepínače období ukazuje kód období (např. 2026) místo technického identifikátoru.
- Kód období má na úzkých obrazovkách dostatek místa, aby zůstal čitelný.
- Přepínač firmy v kompaktním režimu zkrácený název firmy potvrzen; identifikátory se nikdy nezobrazují.

## 2.3.0

- Přepínač období rozlišuje stav bez výběru a firmu bez období; volitelně nabídne založení období.
- Kontext firmy a období se pod 1 280 px automaticky zkrátí, mobilní lišta zůstává jednořádková bez vodorovného posuvu.
- Boční menu se pod 1 280 px automaticky sbalí a lze je kdykoli přepnout tlačítkem dole nebo zkratkou Ctrl+B.
- Ukázka Navigace obsahuje náhled šířek 1 440, 1 100 a 390 px i oba prázdné stavy období.

## 2.2.0

- Horní lišta standardně začíná přepínačem firmy; původní blok značky lze zapnout přes `showBrand`.
- Pravá část má pevné pořadí hledání, panely, oznámení, motiv a uživatel.
- Přibyly `NotificationBell` a `ThemeToggleButton`; motiv se okamžitě synchronizuje s `ThemeSetting`.
- Staré vlastnosti AppShellu zůstávají dočasně funkční a jsou označené jako zastaralé.

## 2.1.0

- AppShell už neobsahuje staré administrativní aliasy, plochý seznam navigace
  ani dočasné ovladače vzhledu v horní liště.
- `JournalLinesEditor` je samostatný in-place grid se zoomem, hustotou, uloženými šířkami a sticky součtem.
- Přibylo řízení sloupců přes `editableColumns`, měnové sloupce, výchozí hodnoty a validace jednotlivých buněk.
- Klávesnice podporuje přímé přepsání znakem, F2, Enter/Tab, Esc, Ctrl+D a Ctrl+Delete s akcí Zpět.
- `toJournalRow` a `fromJournalRow` převádějí předkontaci na jeden databázový řádek a zpět.
- `readOnly` zůstává zpětně kompatibilní zkratkou pro prázdné `editableColumns`.

## 2.0.0

- Horní lišta nyní vede přes celou šířku a značka aplikace je její první částí.
- Přibyly řízené panely, sbalitelné menu, nové přepínače firmy a období, hledání a uživatelská nabídka.
- Nastavení písma a motivu jsou samostatné komponenty pro stránku Předvolby.
- AppShell používá jediné rozhraní přes `navGroups`, `panels`, `activePanel`,
  `onActivePanelChange`, `contextLeft`, `actions` a `userMenu`.
