# DS 2.107.0 – jednotná výška polí, chyby a nápovědy bez změny výšky, dokončení A9

Nic se nevydává. Nový plán, předchozí plán z 18. 10. 08:46 se nepoužívá.

## 0. Verze a výchozí stav

- Dnes je v package.json i v `meta.version` uvedeno **2.104.0** a CHANGELOG končí sekcí „2.105.0 (nevydáno)“. Podle zadání jsou 2.105.0 i 2.106.0 už vydané, takže obě hodnoty nastavím na **2.106.0**. Sekci 2.105.0 v CHANGELOG přejmenuji na vydanou; když sekce 2.106.0 chybí, doplním krátký záznam „vydáno (bez samostatných poznámek)“. Novou sekci založím jako **2.107.0 (nevydáno)**.
- Výchozí commit pro porovnání katalogů je stav před prvním krokem tohoto kola. Porovnávají se 4 soubory: `.lovable/design-system.json`, `components.md`, `.lovable/rules/components.md` a `.lovable/sources.yaml`/manifest. Podmínky: počet komponent je alespoň 432, žádný dnešní název ani prop nezmizí a popisy se jen rozšiřují.

## 1. Co se po 2.106.0 ještě kreslí pod polem (ověřeno v kódu)

| Místo | Co kreslí |
|---|---|
| `layout/form-field-layout.tsx` (Field) | `hint` jako `<p data-slot="field-hint">` pod prvkem |
| `form/date-field.tsx` ř. ~406 | `hint` jako `field-overflow-hint` pod polem |
| `form/checkbox-field.tsx` (CheckboxField ř. 77, SwitchField ř. 175) | `hint` jako `<p>` pod popiskem nebo přepínačem |
| `ui/form.tsx` | `FormDescription` a `FormMessage` (text v toku) |
| `accounting/bank-account-field.tsx` ř. ~249–266 | ruční `Input` s `mt-2` pod výběrem účtu |
| `accounting/JournalRowDetail.tsx` | DetailField už má ikonu uvnitř (S1). Chyby ale dostává jen blok DPH; VS, zakázka, partner, MJ, množství, cena a ruční daň chybu ani varování nedostanou |
| `received-bank-account-field.tsx` | mřížka s 2–3 poli (IBAN/SWIFT) pod sebou; jde o rozložení, ne o zprávu. Zůstává, ale každé pole má výšku `--control-h` |

Rate-field a AmountSection už po S1 zobrazují chybu jako ikonu uvnitř pole. Během implementace to znovu ověřím testem „nic pod prvkem“ (bod 7).

Napevno nastavené výšky v řádcích polí: `ui/toggle.tsx` (h-9/h-8), `form/date-range-field.tsx`, `counterparty-field.tsx`, `document-form/PaymentSection.tsx` (SS), `BasicSection.tsx` (tlačítko Mapa a mezerník h-5 mb-1), `use-external-number-field.tsx`, `document-identity-line.tsx`, `form/TagPicker.tsx`, `form/address-fields.tsx`. Výšky v lištách, menu a panelech zůstávají beze změny.

## 2. Pravidlo

> Pod ovládacím prvkem se nikdy nic nevykresluje. Chyba ani varování nemění výšku ani zarovnání řádku. Všechny prvky v jednom řádku mají přesně výšku --control-h svého prostředí.

Pravidlo zapíšu do `.lovable/system.md`, `components.md`, `src/components/ds/AGENTS.md` (kontroly) a na stránku Pravidla (`routes/guidelines.tsx`). Nahradí staré formulace „hint pod polem“, „pod polem kurzu je jen chyba“ a „kompaktní štítek v řádku“.

## 3. Výška

- `styles.css`: v `.journal-line-detail-grid` a v buňkách mřížky nahradím přepis `height: var(--f-h) !important` lokálním `--control-h: 2.25em`. Formulář má dál 2.25rem.
- Výšku `h-[var(--control-h)]` (border-box) dostanou: Input, DecimalInput, SelectTrigger, OptionSelect, SearchableOptionSelect, PartnerSelect, DimensionSelect, AccountSelect, UnitSelect (i mimo mřížku, `rounded-md` jako ostatní), VsField, DateField, DateRangeField, RateField, CounterpartyField, SegmentedField a jeho vnitřní tlačítka, Toggle/ToggleGroup, SS, tlačítko Mapa (bez mezerníku) a CheckboxField `align="input"`.
- SegmentedField dostane `data-slot="segmented"` a pravidlo tlačítek v buňce (`height:auto`) ho vynechá přes `:not([data-slot=segmented] *)`.
- `ui/button.tsx`: nová velikost `size="control"` (`h-[var(--control-h)] px-[0.75em]`). Ostatní velikosti zůstávají.
- FieldToggleButton se dál odvozuje relativně od `--control-h`.

## 4. Stav pole: rozšíření field-feedback

V `form/field-feedback.tsx` přibude:
- `FieldStatus` (`{ error?: string; warning?: string }`, error má přednost),
- `useFieldStatus(props)`, který vrátí `{ tone, message, describedById, controlProps: { "aria-invalid", "aria-describedby" }, className }`. Rámeček je `border-destructive|border-warning-strong ring-1`.
- `FieldStatusIndicator` s prop `side: "start" | "end"` a `placement: "inside" | "label"`. `FieldFeedbackIndicator` zůstane jako alias. FieldFeedbackContext zůstane a nové API na něm stojí.

Chování:
- Ikona je vlevo u čísel zarovnaných doprava (DecimalInput, AmountInput, RateField, Poměr %), jinak vpravo. U výběrů je před šipkou. Odsazení textu je v em.
- Bublina se ukáže při najetí na pole, při focusu pole a po klepnutí na ikonu (DisabledReasonTooltip, dotyk asi 3 s). Text je i v sr-only prvku napojeném přes `aria-describedby`. Popisek pole při chybě zčervená a nezalamuje se.
- `placement="label"` pro SegmentedField, ToggleGroup, CheckboxField, SwitchField a Textarea: rámeček kolem prvku, ikona za popiskem, popisek se zkrátí s … a celý text je v bublině.
- V buňce mřížky zůstává roh. Nativní `title` nahradí stejný Tooltip.

## 5. Nápověda

`Field.hint`, `CheckboxField.hint`, `SwitchField.hint`, `DateField.hint` a `FormDescription` se zobrazí jako ikona Info v řádku popisku s bublinou (sdílená `FieldHintIcon` v field-feedback). API se nemění. `FormMessage` použije FieldStatus místo textu. Výjimky zůstávají: `formatPattern` uvnitř pole a `FieldGrid.hint` pod sekcí. `DateField.warningDisplay` je už bez účinku a přibude u něj `@deprecated` (odstranění v 3.0).

## 6. Souhrn chyb

- Nový typ `FieldErrorLink { fieldId; label; message; rowId?; columnId? }`.
- `RecordActionBar.error` a `DocumentForm.error` přijmou i `fieldErrors?: FieldErrorLink[]`. Zobrazí se odkazy „Popisek: zpráva“, nejvýš 5 a za nimi „a další N“ (DsTexts `fieldErrors.more`, CS/SK).
- Klik na odkaz: `scrollIntoView` a focus. U řádku mřížky přes `JournalLinesEditor` handle `focusField(rowId, columnId)`: vybere řádek, rozbalí detail a fokusuje pole.
- `RecordDialog`: stejný souhrn sticky nad patičkou.
- `JournalLinesEditor.onValidationChange`: položky dostanou navíc `fieldId`, `rowId` a `columnId` (aditivní změna).
- `lib/form-errors.ts`: komentáře česky a `useFormErrors` vrací i `fieldErrors(labels)`.

## 7. JournalRowDetail

Každé pole (VS, zakázka, partner, množství, MJ, cena, sazba, nárok, poměr, PDP, ruční daň) dostane `error` a `warning` z `journal-lines-validation` podle sloupce. Ruční daň dostane warning. DetailField má jen popisek a prvek, kontejner je `items-start` bez zalamování zpráv. Zoom mřížky 60–140 % a kompaktní hustota mají stejnou výšku řádku.

## 8. BankAccountField

Nové props `entryMode?: "selected" | "manual"` a `onEntryModeChange?`. Uvnitř pole bude FieldToggleButton (vzor partner / ručně). V režimu ručně je Input s `formatPattern` „předčíslí-číslo/kód“ (DsTexts). Bez řízení se zachová dnešní automatika podle hodnoty, ale bez druhého pole pod výběrem.

## 9. A9 (beze změny vzhledu)

- `JournalLinesEditorProps.onCreateDimension?: (searchText: string) => void` se předá jako `DimensionSelect.onCreate` v JournalCellEditor i v JournalRowDetail.
- BasicSection pro `code === "ID"`: PartnerSelect dostane `onCreate` (`counterpartyCreateSeed(query)` → `onCreatePartner`) a `onEditSelected` (→ `onEditCounterparty`).

## 10. Ukázky, testy, dokumentace

- Ukázka „Chyby a varování v polích“ (preview-only, vyloučená přes .dsignore): všechny typy polí ve stavech ok, varování a chyba, ve formuláři i v detailu řádku. Přepínač zoomu mřížky a hustoty.
- Unit testy:
  - výška z `--control-h`,
  - stejná výška detailu s chybou i bez,
  - aria-invalid a describedby,
  - bublina při focusu a po klepnutí,
  - hint jako ikona a nic pod prvkem,
  - klik v souhrnu fokusuje pole i v detailu řádku,
  - limit 5 a „a další N“,
  - entryMode,
  - A9: ＋ zakázky v buňce i v detailu předá hledaný text; u ID ＋ Nový partner a tužka.
- Chromium E2E `control-height-2107.spec.ts`: rozdíl výšek v řádku pod 1 px při šířce 1280 a 560 px, ve světlém i tmavém vzhledu, při zoomu aplikace 90/100/125 % a zoomu mřížky 60/100/140 %. Spustí se znovu i document-controls a edit-document-thirteen.
- CHANGELOG 2.107.0, sekce „Breaking / migrace pro aplikace“: hint jako ikona, `DateField.warningDisplay` deprecated, `BankAccountField.entryMode`, `fieldErrors`, nové klíče v `onValidationChange`, `Button size="control"`, `onCreateDimension`, nové klíče DsTexts.
- Katalogy: nové props a komponenty FieldStatusIndicator, FieldHintIcon a FieldErrorSummary doplním s usage, examples a antipatterns. Ověření porovnávacím skriptem proti výchozímu commitu.

## Nové a změněné props (souhrn)

- Nové API: `useFieldStatus`, `FieldStatus`, `FieldStatusIndicator` (alias FieldFeedbackIndicator), `FieldHintIcon`, `FieldErrorSummary`, `FieldErrorLink`.
- Button: `size="control"`.
- RecordActionBar, DocumentForm a RecordDialog: `fieldErrors`.
- JournalLinesEditor: `onCreateDimension`, handle `focusField`, rozšířené `onValidationChange`.
- BankAccountField: `entryMode`, `onEntryModeChange`, `manualFormatPattern`.
- `error`/`warning` jednotně na všech polích, nově na SegmentedField, ToggleGroup, CheckboxField, SwitchField, Textarea, UnitSelect, DimensionSelect a PartnerSelect.
- DateField: `warningDisplay` deprecated.

## Velikost souborů

`field-feedback.tsx` vzroste na zhruba 200 řádků. JournalRowDetail (asi 300 řádků) rozdělím: mapování chyb na sloupce přesunu do `journal-row-detail-status.ts`. Souhrn chyb bude v samostatném souboru.

## Na konci

Výsledky unit testů, Chromium E2E (rozdíl výšek pod 1 px) a lintu, počty v katalozích s porovnáním 4 souborů a seznam nových a změněných props.
