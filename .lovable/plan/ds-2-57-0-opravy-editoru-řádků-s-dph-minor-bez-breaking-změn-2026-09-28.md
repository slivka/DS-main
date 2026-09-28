# DS 2.57.0 – opravy editoru řádků s DPH (minor, bez breaking změn)

Bez DPH a bez nových propů se vše chová jako v 2.56.0.

## 1. Samovyměření v režimu „S DPH“
- Nová pomocná `isSelfAssessed(code)`. V `resolveLineVat` při `calcMode: "gross"` a `code.selfAssessment`: základ = `grossAmount`, daň = `calculateVatFromBase(základ, sazba)` (ruční daň dál platí), `gross` = základ (daň celek nemění).
- `baseFromGross`: u samovyměření základ = celkem s DPH (1 000 → 1 000).
- `applyVatCalcMode("gross")`: u samovyměření `grossAmount` = základ, takže přepnutí nemění celek.
- `buildVatPreviewLines`, `computeJournalTotals`, `summarizeVat` a patička gridu tím převezmou správné hodnoty (daň 210 na 343/343 mimo celek); sloupec Celkem s DPH u samovyměření ukazuje základ.
- Výsledek RC-P21 1 000 S DPH: Částka 1 000, DPH 210, Celkem s DPH 1 000, celek dokladu 1 000.

## 2. Nárok na odpočet u samovyměření
- Detail řádku ukáže „Nárok na odpočet“ (a Poměr %) u každého kódu s daní, který je vstupní nebo samovyměření. Totéž v `changeVatCode` (zachová/nastaví `full`) a ve validaci poměru 1–99.
- Zaúčtování už odpovídá DB (2.55.0): nárok mění jen řádek odpočtu, výstup zůstává celý.

## 3. Výchozí kód na počátečním prázdném řádku
- Efekt: když `vat.defaultCodeId` přijde později a počáteční řádek je stále `isBlank`, bez `vatCodeId` a neupravený uživatelem, doplní se kód (a sazba). Upravený řádek se nemění. Jednorázově (ref).

## 4. Přepínač Bez DPH | S DPH při `vat.readOnly`
- Segment v pruhu gridu `disabled` při `vat.readOnly` (i při readOnly editoru).

## 5. Chybějící kurz DPH
- `DocumentForm`: když `vatRateField` není `sameAsDocument`, není ruční a `suggestedRate == null`, pod polem se zobrazí text `vatRateMissing`: „Kurz ČNB k DUZP není k dispozici – zadejte ruční kurz s důvodem.“ (přes texts).

## 6. Předběžné Kurzové zaokrouhlení (cizí měna)
- `buildVatPreviewLines` / `computeJournalTotals`: pokud kurz DPH ≠ kurz dokladu, přidá předběžný řádek `isFxRounding` + `isVatPreview`, bez účtů, `amount` = celek v měně dokladu × kurz dokladu − součet řádků v domácí měně, `foreignAmount` 0, `excludeFromTotal` v měně dokladu. Text „Kurzové zaokrouhlení – dopočítá se při uložení“ (texts editoru).
- Editor jej zobrazí jako připnutý řádek jen ke čtení; rekapitulace i součty v domácí měně pak sedí. `toJournalRows` jej vynechá (už filtruje `isVatPreview`). Po uložení se použije řádek z DB.
- Příklad: EUR 121 S DPH, kurz dokladu 24,35, kurz DPH 24,40 → rozdíl −1,05.

## Soubory
`journal-vat.ts`, `journal-lines-editor.tsx`, `journal-lines-recap.tsx` (jen kontrola/zobrazení samovyměření), `document-form.tsx`, `journal-lines.ts` (jen kontrola vynechání), ukázka `VatJournalShowcase.tsx` (FP s RC-P21 v režimu S DPH, EUR s rozdílnými kurzy), `README.md` (changelog 2.57.0), `roadmap.md`, `components.md`, `.lovable/system.md` (pravidlo samovyměření S DPH), `design-system.json`, `package.json` → 2.57.0.

## Změny API (jen přidané)
- `JournalLinesEditorTexts.fxRoundingPreview`, `DocumentFormTexts.vatRateMissing`.
- Export `isSelfAssessed`.
- `JournalLine` beze změny tvaru (předběžný řádek využívá `isFxRounding` + `isVatPreview`).

## Testy (nový `tests/unit/journal-vat-257.test.tsx`)
- RC-P21 1 000 S DPH → základ 1 000, daň 210, celek 1 000; `baseFromGross`; přepnutí Bez→S DPH nemění celek; poměrný nárok 60 % u RC-P21 (126 odpočet + 84 bez nároku, výstup 210).
- Detail řádku ukazuje Nárok u RC-P21.
- Výchozí kód na počátečním řádku, i když přijde až po prvním vykreslení; upravený řádek se nepřepíše.
- Přepínač Bez/S DPH neaktivní při `vat.readOnly`.
- Hláška chybějícího kurzu DPH (a nezobrazí se při ručním / sameAsDocument).
- Předběžné Kurzové zaokrouhlení −1,05 a `toJournalRows` jej neposílá.
- Plus celá sada `bun test`, typy, build; na konci verze a počet testů.
