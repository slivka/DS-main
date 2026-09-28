# DS 2.55.0 – editor řádků dokladu s DPH (DPH krok 2, část B)

Minor verze bez breaking změn: bez propu `vat` se editor, převodní funkce i rekapitulace chovají přesně jako v 2.54.0 (hlídají to stávající testy beze změn).

## Co uvidíte
- V ukázce Účetní doklady nové příklady: FV se dvěma sazbami (1 770), FP s ruční daní 210,40 (žluté varování) a poměrným nárokem 60 %, FP s přenesením daně (celek 1 000), PO v režimu „S DPH“ (121 → 100 + 21), FP v EUR s kurzem DPH a doklad s vypnutým „Vstupuje do DPH“ (žádné DPH vidět není).
- V gridu sloupce Kód DPH · Sazba · DPH · Celkem s DPH, přepínač „Bez DPH | S DPH“ v liště, nová záložka „DPH“ v rekapitulaci.

## 1. Datový model – `journal-lines.ts`
Nové typy (exportované z barelu):
```ts
type VatDeduction = "full" | "none" | "partial";
type VatLineKind = "deductible" | "non_deductible";
type VatCalcMode = "net" | "gross";
type VatCodeOption = { id: string; code: string; name: string; direction: "out" | "in";
  hasTax: boolean; rate: number | null; selfAssessment: boolean; requiresPdpSubject: boolean;
  taxOutAccount?: string | null; taxInAccount?: string | null; inactive?: boolean };
type VatPdpSubject = { code: string; name: string };
```
`JournalLine` dostane volitelné: `vatCodeId, vatRate, vatAmount, vatAmountHome, vatBaseHome, vatManual, vatDeduction, vatDeductionShare, pdpSubjectCode, grossAmount, isVatLine, vatParentLineId, vatLineKind, isVatPreview`.
`JournalRow` dostane volitelné DPH sloupce z DB (`vat_code_id`, `vat_rate`, `vat_amount_foreign`, `vat_amount`, `vat_base_dom`, `vat_manual`, `vat_deduction`, `vat_deduction_share`, `pdp_subject_code`, `vat_gross_foreign`, `is_vat_line`, `vat_parent_line_id`, `vat_line_kind`, `amount_gross`) – volitelné, aby starý kód dál typově prošel.

Funkce:
- `toJournalRow(line, { ...options, vat?: { calcMode } })` – bez `vat` výstup identický s dneškem. S `vat`: `vat_code_id`, `vat_manual`, `vat_amount_foreign` jen při ruční dani, `vat_deduction`, `vat_deduction_share` jen u `partial`, `pdp_subject_code`; v režimu `gross` klíč `amount_gross` místo `amount`. Nikdy `vat_rate`, `vat_amount`, `vat_base_dom`, `is_vat_line`, `vat_parent_line_id`.
- `toJournalRows(lines, options)` – nová; vynechá `isVatLine`, `isVatPreview` a `isBlank` řádky.
- `fromJournalRow` – načte všechny DPH sloupce, `vat_gross_foreign` → `grossAmount`.
- Nový modul `journal-vat.ts` (čisté funkce, export z barelu): `calculateVat(line, code, calcMode)`, `vatDeviation(line, code, calcMode)`, `buildVatPreviewLines(lines, vat, { mainAccount, mainSide })`, `summarizeVat(lines, codes)` pro rekapitulaci.

Pravidla předběžného zaúčtování (shodná s DB): výstup MD účet základu / DAL `taxOutAccount`; vstup plný MD `taxInAccount` / DAL účet základu; bez nároku na účet základu; poměrný dva řádky (s nárokem / bez nároku); samovyměření MD odpočet / DAL výstup – řádek mimo hlavní účet se do celku nepočítá. Kód bez účtů → daň se spočte, řádek daně nevznikne, upozornění „Chybí účty kódu {kód} – daň se nezaúčtuje“.

## 2. Editor – `JournalLinesEditor`, nový prop `vat`
```ts
vat?: { enabled: boolean; codes: VatCodeOption[]; calcMode: VatCalcMode;
  onCalcModeChange?: (mode: VatCalcMode) => void; defaultCodeId?: string | null;
  pdpSubjects?: VatPdpSubject[]; vatRate?: number | null; vatRateAmount?: number;
  readOnly?: boolean; isCodeRequired?: (line: JournalLine) => boolean }
```
- `enabled: false` nebo chybějící prop → nic z DPH se nezobrazí.
- Řádky daně (`isVatLine`) se v gridu nezobrazují; `orderJournalLines` je vyřadí z pořadí (řazení, přesun, duplikace, mazání jen nad řádky základu), Kurzové zaokrouhlení a Zaokrouhlení zůstávají poslední.
- Nové sloupce `vatCodeId` (výběr „kód – název“ přes sdílený výběr, neaktivní přes `InactiveTag`), `vatRate` (jen čtení „21 %“ / „—“, lze skrýt), `vatAmount` (přepsání = ruční daň, ikona ✎, akce řádku „Vrátit vypočtenou daň“), `grossAmount` (Celkem s DPH). Změna kódu ruší ruční daň; nový řádek dostane `defaultCodeId`, jinak kód z předchozího řádku.
- Režim „S DPH“: editovatelné jen Celkem s DPH, Částka jen ke čtení; přepnutí nemění celek dokladu.
- Přepínač „Bez DPH | S DPH“ v liště přes `GridSegmentedToggle` (lišta gridu), jen při `vat.enabled`.
- Rozložení: Sazba a Celkem s DPH mají nižší prioritu a při nedostatku místa jdou do detailu (stávající `resolveJournalColumnLayout`, nové šířky v rem); Kód DPH a DPH zůstávají v gridu.
- Detail řádku: Nárok na odpočet (`SegmentedField` Plný / Bez nároku / Poměrný + `DecimalInput` %) jen u vstupního kódu s daní; Předmět plnění PDP jen u `requiresPdpSubject`; u cizí měny „Základ pro DPH ({značka})“ a „DPH ({značka})“ jen ke čtení.
- Součet, „Zbývá rozepsat“, návrh Zaokrouhlení a rekapitulace počítají řádky základu + předběžné řádky daně; jakmile APP předá řádky z DB (`isVatLine`), předběžné se nepoužijí.
- Kontroly (česky, značky měn z dat): kód povinný (výjimky `isCodeRequired`), ruční daň odchylka > 1 chyba / ≤ 1 varování (žlutý roh + tooltip „Ruční daň se liší od vypočtené o …“), PDP povinný, poměrný nárok 1–99 %. Varování nejsou započtena v `onValidationChange`.
- `vat.readOnly`: DPH sloupce i detail jen ke čtení.
- Nové texty v `JournalLinesEditorTexts` (vše přes `t.*`, s českými výchozími).

## 3. Rekapitulace – záložka „DPH“
`JournalLinesRecap` dostane volitelný `vat` (stejný tvar) a vestavěnou záložku „DPH“ jen při `enabled`: Kód · Sazba · Základ · DPH · Celkem, u cizí měny navíc Základ a DPH v domácí měně kurzem DPH, řádek součtu, poznámka u samovyměření, rozpad s nárokem / bez nároku. Nadpisy nezalamovat.

## 4. Soubory
- `src/components/ds/accounting/journal-lines.ts` – typy, `toJournalRow(s)`, `fromJournalRow`
- `src/components/ds/accounting/journal-vat.ts` – nový, čisté výpočty
- `src/components/ds/accounting/journal-lines-editor.tsx` – prop `vat`, sloupce, lišta, detail, kontroly
- `src/components/ds/accounting/journal-lines-recap.tsx` – záložka DPH
- `src/components/ds/index.ts`, `src/index.ts` – exporty
- `src/styles.css` – varovný roh buňky (token warning)
- `src/lib/mock/accounting.ts` – vzorové kódy DPH a PDP předměty
- `src/components/showcase/DocumentFormShowcase.tsx` – šest ukázek výše
- `.lovable/system.md`, `components.md`, `README.md` (changelog 2.55.0), `roadmap.md`, `AGENTS.md` („řádky daně vytváří jen DB, DS je jen zobrazuje a počítá předběžně“), `.lovable/design-system.json` (usage/examples/antipatterns)
- `package.json` → 2.55.0

## 5. Testy (`tests/unit/journal-vat-255.test.tsx`)
- `toJournalRows`: nic zakázaného se neposílá, řádky daně a předběžné vynechány, `amount_gross` v režimu S DPH, bez `vat` shodné s 2.54.0.
- `fromJournalRow`: všechny DPH sloupce, `grossAmount`.
- `buildVatPreviewLines`: 21V 1 000 → 1 210; 21V 1 000 + 12V 500 → 1 770; ruční 210,40; RC-P21 → celek 1 000 (343/343); bez nároku 210 na účet základu; poměrný 60 % → 126 + 84; S DPH 121 → 100 + 21; kód bez účtů → bez řádku + upozornění.
- Editor: součet a „Zbývá rozepsat“ s předběžnou daní, přepnutí režimu nemění celek, ruční daň chyba / varování, řádky daně skryté, Zaokrouhlení poslední, bez `vat` žádné nové sloupce.
- Ověření v náhledu: produkční build, ukázky Účetní doklady v 1 panelu a úzkém panelu, zoom 60/140 %.

## Předpoklady k potvrzení
- Přepínač v liště řeším `GridSegmentedToggle` (jsme v gridu), ne `SegmentedField`.
- Ruční daň se ukládá v měně dokladu (`vat_amount_foreign`), u domácí měny stejně.
- Varování ruční daně neblokuje uložení a nezvyšuje počet chyb.
