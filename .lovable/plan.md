# DS 2.56.0 – opravy po prokliku DPH (minor, bez breaking změn)

Bez DPH a bez nových propů se vše chová jako v 2.55.0.

## 1. Celkem za doklad = celek z editoru (jeden výpočet)
- Nová sdílená čistá funkce v `journal-vat.ts`: `computeJournalTotals(lines, { vat, mainAccount, mainSide, foreign, rate, rateAmount })` → `{ base, baseHome, vat, gross, grossHome, visibleLineCount }`. Editovatelný doklad: řádky základu + `buildVatPreviewLines`, uložené řádky daně se ignorují; jen ke čtení: řádky z DB, řádky mimo hlavní účet (samovyměření 343/343) se nepočítají.
- `JournalLinesEditor` ji použije pro patičku („Celkem s DPH“) i lištu („Celkem …“) a nový volitelný prop `onTotalsChange?(totals)` (volá se jen při změně hodnot).
- `DocumentForm` v režimu „Sčítá se z rozpisu“: je-li u editoru zapnuté DPH, bere celek z téže funkce (počítá ji sám se stejnými vstupy, aby byl správný i při prvním vykreslení); bez DPH dnešní `linesSum` / `documentLinesSum` beze změny.
- Výsledek: FV 1 000 + 21 % → Celkem za doklad 1 210; RC-P21 1 000 → 1 000 před i po uložení.

## 2. Odznak „Řádky N“
- Počítá jen řádky zobrazené v gridu: bez `isVatLine`, `isVatPreview`, `isBlank`. Zaokrouhlení / Kurzové zaokrouhlení se započítají jen pokud jsou v gridu vidět (jako dnes – jsou to viditelné řádky). Hodnota = `visibleLineCount` z funkce výše.

## 3. Buňka Kód DPH – psaní po Tab
- Příčina zatím nepotvrzená: větev „psaní spustí úpravu“ `vatCodeId` už zahrnuje a předává první znak do výběru. První krok: reprodukovat v náhledu (Tab do buňky, napsat „2“) a najít, kde se znak ztrácí (fokus vyhledávání / `initialSearch` / Radix při otevření). Oprava tak, aby se výběr otevřel jako u účtu a psaní filtrovalo kód i název.
- Test: stisk znaku v buňce Kód DPH → editace s výběrem otevřeným a hledáním „2“; e2e v náhledu Tab + „21V“ + Enter vybere 21V.

## 4. Kurz DPH v sekci Částka
- Nový volitelný prop `DocumentForm.vatRateField?: { value: RateFieldValue; onChange; readOnly?; sameAsDocument?: boolean }` – stejný prvek jako kurz dokladu (automatický / ruční s důvodem), popisek „Kurz DPH“, při `sameAsDocument` jen text „stejný jako kurz dokladu“. Pod kurzem dokladu, jen když ho aplikace předá a doklad je v cizí měně. Nové texty `vatRate`, `vatRateSameAsDocument`, `vatRateNote`.

## 5. Nastavení dokladu – Zadávat částky
- `DocumentSettingsValue.vatCalcMode?: "net" | "gross"`; nový prop `showVatCalcMode?: boolean`. Volba „Zadávat částky: Bez DPH / S DPH“ přes `SegmentedField` v sekci Zadávání dokladu, jen při `showVatCalcMode`. Texty `vatCalcMode`, `vatCalcNet`, `vatCalcGross`.

## Soubory
`journal-vat.ts`, `journal-lines-editor.tsx`, `document-form.tsx`, `document-settings-dialog.tsx`, `vat-code-select.tsx` (dle bodu 3), barely `index.ts`, ukázky (FV s DPH v celém formuláři, kurz DPH, nastavení), `.lovable/system.md`, `design-system.json`, `README.md` (2.56.0), `roadmap.md`, `package.json` → 2.56.0.

## Testy
`computeJournalTotals` (FV 1 210, dvě sazby 1 770, RC-P21 1 000 editovatelné i jen ke čtení, S DPH, cizí měna); DocumentForm celek a odznak; buňka Kód DPH psaním; Kurz DPH jen při propu; volba Bez/S DPH jen při `showVatCalcMode`. Plus produkční build a kontrola v náhledu.

## Nové exporty
`computeJournalTotals`, typ `JournalTotals`, `DocumentVatRateField`; rozšířené `JournalLinesEditor` (`onTotalsChange`), `DocumentForm` (`vatRateField`), `DocumentSettingsDialog` (`showVatCalcMode`, `vatCalcMode`).
