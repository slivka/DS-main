# DS 2.105.0 – jednotná výška polí, chyby a nápovědy bez změny výšky

Pravidlo: „Pod ovládacím prvkem se nikdy nic nevykresluje. Chyba ani varování nemění výšku ani zarovnání řádku. Všechny prvky v jednom řádku mají přesně výšku --control-h svého prostředí.“

Stav ověřený před plánem: `package.json` i `meta.version` už jsou 2.104.0 (oprava není potřeba, jen kontrola); CHANGELOG má 2.105.0 (nevydáno) z Edit 14 – nové body se připíší do něj; u 2.104.0 se odstraní případné „nevydáno“. Existuje `field-feedback.tsx` (FieldFeedbackIndicator, kontext) z Edit 14 – stane se základem `FieldStatus`, nevznikne druhá implementace. `JournalRowDetail` dnes vykresluje chybu jako `role="alert"` text pod polem a chyby předává jen DPH polím (řádky 52–54, 125, 143). `styles.css:1264` přepisuje výšku v `.journal-line-detail-grid`.

## 1) Výška z --control-h
- `styles.css`: `.journal-line-detail-grid` a buňky mřížky nastaví `--control-h: 2.25em`; přepis `!important` pro input/combobox se odstraní. Pravidlo tlačítek v buňce (`height:auto`) se zúží tak, aby nezasahovalo do `[data-slot=segmented]`, ToggleGroup a FieldToggleButton.
- Nová utilita `h-control` (`height: var(--control-h)`, border-box) a `min-w-control`.
- Převedou se na `h-control` (místo h-9/h-8/min-h-9): `ui/input`, `ui/select` (SelectTrigger), `ui/toggle` + `toggle-group`, `ui/button` (size default/icon jen přes variantu `size="control"` – ostatní použití tlačítek se nemění), DecimalInput, OptionSelect, SearchableOptionSelect, PartnerSelect, DimensionSelect, AccountSelect, UnitSelect (+ výška mimo mřížku, `rounded-sm` → společné zaoblení), VsField, DateField, `date-range-field`, RateField, `counterparty-field`, SegmentedField (kontejner i vnitřní tlačítka `h-full`), FieldToggleButton (relativně k výšce pole), `address-fields` tlačítko Mapa (mezerník h-5 mb-1 zrušen), `PaymentSection` SS, `BasicSection`, `use-external-number-field`, `document-identity-line` (prvky v řádku polí), CheckboxField `align="input"`.
- Mimo rozsah (nejsou v řádku polí, ponechat): navigace, panely, záložky, kalendář, paginace, lišty gridu (`grid-toolbar-control` má vlastní token).

## 2) FieldStatus – chyba a varování v poli
- `form/field-feedback.tsx` rozšířit na `FieldStatus` (komponenta) + `useFieldStatus(id, {error, warning})` → `{ invalid, describedById, srText, indicator, tone }`. Stávající export `FieldFeedbackIndicator` zůstává jako alias (@deprecated 2.105.0).
- Vzhled: `border-destructive ring-1 ring-destructive` / `border-warning-strong ring-warning-strong`; ikona AlertCircle / AlertTriangle velikosti `1em`; strana `iconSide: "start" | "end"` – start pro číslo zarovnané vpravo (DecimalInput, AmountInput, RateField, Poměr %), jinak end; ve výběrech před šipkou ve vyhrazeném slotu. Rezerva odsazení přes `ps-`/`pe-` v em.
- Text: Tooltip (DisabledReasonTooltip) na hover pole, focus pole a klepnutí na ikonu (dotyk ~3 s / do dalšího klepnutí); `aria-invalid`, `aria-describedby` na sr-only text; popisek červeně (`Label` dostane stav z kontextu, truncate zůstává).
- Prvky bez místa uvnitř (SegmentedField, ToggleGroup, CheckboxField, SwitchField, Textarea): rámeček kolem prvku + ikona za textem popisku.
- Buňka mřížky: roh zůstává, nativní `title` → stejný Tooltip (`DataGrid` editory, `JournalLinesEditor` buňky).
- Jednotné props `error?: string`, `warning?: string` na všech polích výše.

## 3) Nápověda
- `Field.hint`, `CheckboxField.hint`, `SwitchField.hint`, `DateField.hint`: API zůstává, vykreslí se jako ikona Info v řádku popisku s bublinou. Výjimky: `formatPattern` uvnitř pole, `FieldGrid.hint` pod sekcí.

## 4) Souhrn chyb
- Nový typ `FieldErrorLink { fieldId; label; message; rowId?; columnId? }`.
- `RecordActionBar.error` a `DocumentForm.error` přijmou `fieldErrors?: FieldErrorLink[]`; odkazy „Popisek: zpráva“, max 5 + „a další N“ (texty v DsTexts CS/SK). Klik: `focusField(link)` – scrollIntoView + focus; u řádku mřížky přes `JournalLinesEditor` handle vybere řádek, rozbalí detail, fokusuje pole.
- `RecordDialog`: stejný souhrn sticky nad patičkou.
- `JournalLinesEditor.onValidationChange(count, errors)` – položky doplní `fieldId`, `rowId`, `columnId` (aditivně).
- `lib/form-errors.ts`: české komentáře, `useFormErrors` vrací i `fieldErrors` ve tvaru `FieldErrorLink`.

## 5) JournalRowDetail
- `DetailField` bez textu pod polem: popisek + prvek, chyba/varování přes FieldStatus. Každé pole (VS, zakázka, partner, množství, MJ, cena, sazba, nárok, poměr, PDP, ruční daň) dostane `error`/`warning` z `journal-lines-validation` podle sloupce; validace doplní kanál varování (ruční daň).
- Kompaktní štítek chybějícího pole v řádku se nahradí rohem buňky (pravidlo „kompaktní štítek v řádku“ se ruší).

## 6) BankAccountField – ruční režim
- Nový prop `entryMode: "selected" | "manual"` + `onEntryModeChange` (řízeně), FieldToggleButton uvnitř pole jako u protistrany; v režimu ručně Input s `formatPattern` „předčíslí-číslo/kód“. Dosavadní ruční Input pod výběrem se odstraní; `manualValue`/`onManualChange` zůstávají.

## Seznam míst s obsahem pod polem a převod
| Místo | Dnes | Převod |
|---|---|---|
| Field | error, hint text | FieldStatus, Info ikona |
| ui/form FormMessage, FormDescription | text | FormMessage napojí FieldStatus (vrací null), FormDescription → Info ikona v FormLabel |
| DateField | hint, warning „below“ | Info ikona; `warningDisplay` @deprecated, ignorován |
| RateField | chyba důvodu | indikátor v poli kurzu |
| DocumentAmountSection | rateNoteRequired, vatRateMissing | indikátor na Kurz / Kurz DPH |
| BankAccountField | chyba + ruční Input | indikátor + režim v poli |
| CheckboxField, SwitchField | hint | Info ikona |
| JournalRowDetail | chyba DPH | FieldStatus na všech polích |
| address-fields Mapa | mezerník h-5 mb-1 | odstranit |
| Navíc k ověření při realizaci (grep `text-destructive`, `text-xs text-muted` pod vstupem): `period-filter`, `chip-multi-select`, `TagPicker`, `amount-difference`, `use-external-number-field`, `ColumnFilter` – převést, pokud jde o text pod polem formuláře |

## 7) Ukázky a testy
- Showcase „Chyby a varování v polích“ (routa komponent): řádek všech typů ve stavech ok / varování / chyba, ve formuláři i v detailu řádku mřížky, přepínač zoomu mřížky 60–140 % a hustoty.
- Unit: třída/proměnná výšky na všech prvcích; výška detailu shodná s chybou i bez; aria-invalid + describedby; bublina na focus a klepnutí; klik v souhrnu fokusuje pole (i v detailu řádku); `useFormErrors`.
- Chromium E2E: měření výšek v řádku (rozdíl < 1 px) při 1280 / 560 px, světlý/tmavý, zoom aplikace 90/100/125 %, zoom mřížky 60/100/140 %; screenshoty.
- Lint 0 chyb, unit, Chromium E2E; tsgo prostředí nepovoluje.

## 8) Dokumentace, verze, changelog
- Pravidlo zapsat do `.lovable/system.md`, `src/components/ds/AGENTS.md`, `.lovable/rules/components.md` a na stránku Pravidla; nahradit formulace o hint/error pod polem, „pod polem kurzu je jen chyba“, „kompaktní štítek v řádku“.
- Verze package/meta 2.104.0, CHANGELOG 2.105.0 (nevydáno), sekce „Breaking / migrace pro aplikace“: hint → ikona (žádný text pod polem), `DateField.warningDisplay` ignorován, `BankAccountField` ruční režim řízený `entryMode`, `RecordActionBar.error`/`DocumentForm.error` s `fieldErrors`, `onValidationChange` nové klíče, `Button size="control"`.
- Katalog: aditivně nové props/komponenty (FieldStatus, FieldErrorLink), všech 432 názvů zachovat; manifest aktualizovat.

## Technické poznámky
- Soubory nad 300 řádků (JournalRowDetail, DocumentForm, record-action-bar) – logiku souhrnu chyb do samostatného `field-error-summary.tsx`, focus do `use-focus-field.ts`.
- Texty pouze přes DsTexts CS/SK.
