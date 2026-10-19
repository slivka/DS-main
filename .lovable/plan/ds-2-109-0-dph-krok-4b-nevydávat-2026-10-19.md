# DS 2.109.0 – DPH krok 4B (nevydávat)

## 0. Výchozí stav a verze
- Zjištěno: `package.json` = 2.107.0 a **`meta.version` v design-system.json je také 2.107.0** (ne 2.108.0). Obojí srovnám na vydanou 2.108.0.
- CHANGELOG: sekci „2.108.0 (nevydáno)“ přejmenuji na „2.108.0“, nad ni nová „2.109.0 (nevydáno) – DPH krok 4B“; totéž v roadmap.md.
- Před prací uložím snímek katalogu (počet komponent / props) jako výchozí stav „před“; navíc porovnání proti 8db33914.

## 1. Co uvidí uživatel
- Řádky dokladu se zadávají vždy bez DPH; přepínač Bez / S DPH a ruční daň na řádku zmizí.
- U Částky a Jedn. ceny (v mřížce i v detailu řádku) ikona „Cena s DPH“ → malé okno, zadá se částka s DPH, do pole se vyplní základ.
- Pod mřížkou rekapitulace DPH po skupinách kód × sazba se třemi úpravami „dle dokladu“ a „Vrátit vypočtenou daň“.
- Patička: Součet · Zaokrouhlení · Rozdíl s nabídkou dorovnání.
- Pevná systémová daň (odpočet zálohy, import) se jen zobrazí se zámkem a bublinou.

## 2. Pořadí prací
1. Verze + CHANGELOG/roadmap kostra.
2. Čistá logika `computeVatGroups` + unit testy (DB scénáře).
3. Logika patičky (Rozdíl, výchozí volba, limity) + unit testy.
4. Odstranění režimu s DPH a ruční daně (deprecace, ignorování).
5. Pomocník „Cena s DPH“ (mřížka + detail řádku).
6. Rekapitulace DPH se skupinami a úpravami a/b/c, cizí měna, jen ke čtení.
7. Nová patička a nabídka Rozdílu; zrušení automatického návrhu zaokrouhlení.
8. Issues skupin do pruhu (2.108), onFieldChange, kontrola výšky (2.107).
9. Texty CS/SK, showcase, E2E.
10. Katalog, system.md, AGENTS.md, CHANGELOG s migrací; unit, lint, E2E Chromium, build.

## 3. Props `JournalLinesEditor`
Nové:
- `vatOverrides?: JournalVatOverride[]` – `{ vatCodeId, vatRate, taxAmount }` (mapuje se na `_vat_overrides`; `[]` = smazat).
- `onVatOverridesChange?: (overrides) => void`.
- `vatExchangeRate?: number | null` + `vatExchangeRateAmount?` – kurz DPH pro toleranci a sloupce v Kč (výchozí: stávající `vat.vatRate`/`vatRateAmount`, pak kurz dokladu).
- `roundingLimit?: number` – limit zaokrouhlení firmy; bez něj volba Zaokrouhlení není nabídnuta.
- `onRoundingChange?: (value: number) => void` – zápis zaokrouhlení z nabídky Rozdílu (kompatibilní alias na `rounding.onChange`, má přednost).
- `vatOverrideSeverity?: "warning" | "error"` – výchozí `"warning"`.
- `onVatGroupIssuesChange?` není potřeba: skupinové položky jdou přes stávající `onValidationChange` / issues s `fieldId = "journal-vat-group-{kod}-{sazba}"`.
- Sazba: **použiji existující `VatCodeOption.rate`** (sazba k Datu DPH už je ve volbě kódu) – nový prop `vatRateByCode` nezavádím.

Zastaralé (@deprecated, odstranění 3.0.0, ignorováno):
- `JournalLinesVat.calcMode`, `JournalLinesVat.onCalcModeChange`, typ `VatCalcMode` (export zůstává).
- `JournalLine.vatManual` / `vatAmount` od klienta: `toJournalRow` už `vat_manual` neposílá; řádek s `vatManual` z DB = pevná systémová daň (jen zobrazení).
- `applyVatCalcMode`, `calculateVatFromGross` zůstávají exportované, @deprecated.
- Texty `vatManual`, `vatModeNet/Gross` (příp. dle skutečných klíčů) @deprecated.
- `rounding.suggestion`/automatický návrh v liště – chování zrušeno, typy zachovány.

Nové exporty: `computeVatGroups`, `baseFromGrossAmount` (pomocník), `resolveDifferenceActions`, typy `JournalVatOverride`, `VatGroup`, `VatGroupLineShare`, `JournalDifferenceAction`.

## 4. Pravidla výpočtu (shodná s DB)
- Skupina = kód s daní × sazba, bez samovyměření a bez řádků `vatManual` (ty se přičtou jako pevné daně).
- T = přepis skupiny nebo round(Σ základů × sazba / 100, 2); rozpočet poměrem základů, zbytek řádku s největším |základem|, při shodě nižší pořadí.
- Tolerance |přepis − vypočtená| × kurz DPH ≤ 1,00 → v pořádku; jinak položka pruhu se severity z `vatOverrideSeverity`.
- b) Celkem dle dokladu: daň = round(C × s / (100 + s), 2) jako přepis; základ = C − daň, rozdíl jednorázově do řádku s největším základem (onChange řádků).
- c) Základ dle dokladu: jen jednorázové dorovnání řádku.
- Rozdíl: jen při `totalMode="entered"` a ≠ 0. Výchozí volba: jedna skupina s daní a |rozdíl| ≤ 0,01 × počet řádků → Dorovnat DPH; jinak Zaokrouhlení, je-li |rozdíl| ≤ roundingLimit; jinak nic zvýrazněno.

## 5. Unit testy `computeVatGroups`
82,64 / 21 % + přepis 17,36 → celkem 100,00; 3 × 12,50 / 21 % → 7,88 rozpočet 2,62 / 2,63 / 2,63 (pořadí dle pravidla shody); EUR kurz 24,50 přepis +0,03 OK, +0,05 položka; +500 / −500 → daň 0; dvě skupiny 21 / 12; samovyměření a pevná daň mimo skupinu. Dále: výchozí volba Rozdílu, pomocník s DPH (přesnost sloupce), ignorování `calcMode`, `toJournalRow` bez `vat_manual`.

## 6. Showcase a E2E
Stránka účetních formulářů, nová sekce (modul v showcase, vyloučený .dsignore): FP s pomocníkem a haléřovým rozdílem, FV dvě sazby, EUR s kurzem DPH, samovyměření, bez DPH, zaúčtovaný jen ke čtení.
Chromium E2E (`tests/e2e/vat-groups-2109.spec.ts`): výška řádku rekapitulace s chybou i bez stejná (<1 px), pomocník vyplní základ, Dorovnat DPH / základ změní řádek v mřížce, položka pruhu nad tolerancí. Plus regresní dávka 2.108 (document-controls, edit-document-thirteen/fifteen, control-height(-2107), journal-control-height, bank-statement-form, vs-lock, document-field-ids, journal-editor).

## 7. Technické detaily – soubory
Nové:
- `src/components/ds/accounting/journal-vat-groups.ts` – computeVatGroups, tolerance, akce a/b/c.
- `src/components/ds/accounting/journal-difference.ts` – resolveDifferenceActions.
- `src/components/ds/accounting/journal-gross-helper.tsx` – ikona + popover „Cena s DPH“.
- `src/components/ds/accounting/journal-vat-recap.tsx` – tabulka skupin, úpravy, sbalitelné Kč sloupce (šipka vpravo, řízený stav props).
- `src/components/ds/accounting/journal-difference-menu.tsx`.
- `src/components/showcase/VatGroupsShowcase.tsx`; testy `tests/unit/vat-groups-2109.test.ts(x)`, `tests/e2e/vat-groups-2109.spec.ts`.
Změněné:
- `journal-editor-types.ts`, `journal-lines.ts` (toJournalRow), `journal-vat.ts` (náhled přes computeVatGroups, deprecace), `useJournalTotals.ts`, `useJournalEditorState.ts`, `JournalToolbar.tsx` (bez přepínače a návrhu), `JournalFooter.tsx` (Součet · Zaokrouhlení · Rozdíl), `JournalCell.tsx`, `JournalCellEditor.tsx`, `JournalRow.tsx`, `JournalRowDetail.tsx` (pomocník, zámek pevné daně), `JournalLinesEditor.tsx`, `journal-lines-recap.tsx` (napojení rekapitulace), `journal-lines-editor.tsx` (exporty), `src/index.ts`, `src/components/ds/index.ts`.
- `src/ds-texts/` typy, CS, SK (nové klíče, žádné pevné texty, měna z dat).
- `src/routes/components.accounting-forms.tsx`, `.dsignore` dle potřeby.
- `package.json`, `.lovable/design-system.json` (verze, nové props/exporty, usage/examples/antipatterns, nic neubude), `components.md`, `CHANGELOG.md` (BREAKING + migrace: vatCalcMode, ruční daň, `_vat_overrides`, nové props, patička), `roadmap.md`, `.lovable/system.md`, `src/components/ds/accounting/AGENTS.md`.
- Existující testy závislé na režimu s DPH / ruční dani / automatickém návrhu zaokrouhlení: upravit jako zrušené chování (vyjmenuji v závěru); ostatní selhání = regrese → oprava kódu.

## 8. Závěrečný výstup
Počty katalogu před / po (komponenty / props) a proti 8db33914, unit, lint 0 chyb, E2E po souborech, build. Verze zůstane 2.108.0, 2.109.0 nevydaná.
