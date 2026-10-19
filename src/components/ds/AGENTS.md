# Pravidla kvality DS

- Tlačítko nikdy nemění tvar podle stavu; samostatné zakázané tlačítko = tlumený text a slabší rámeček, bez výplně. Ovládání uvnitř pole přebírá šedou výplň zakázaného pole; v liště gridu zůstává rámeček ostatních ovládacích prvků.
- Navigace kalendáře patří do sdíleného Calendar a jeho vnitřních pohledů. Proč: všechny datumové prvky sdílejí meze, klávesnici a stabilní rozměry.
- Identita rezervuje control-h a stejný rámeček účtu při čtení i úpravě. Proč: otevření výběru nesmí posunout následující pole.

**Kontrola výšky:** Pod ovládacím prvkem se nikdy nic nevykresluje. Chyba ani varování nemění výšku ani zarovnání řádku. Všechny prvky v jednom řádku mají přesně výšku --control-h svého prostředí. Proč: řádek formuláře ani detail řádku mřížky se nesmí posunout chybou ani nápovědou.

## Dialogy záznamů

Všechny ovládací prvky a hodnoty jen ke čtení mají výšku `--control-h`. Řádky jednoho dialogu sdílejí svislé linky 12sloupcové mřížky. Vysvětlení patří pod sekci (`FieldGrid.hint`), `Field.hint` jen výjimečně a nesmí měnit výšku řádku. Vzor formátu patří do `Input.formatPattern`, vysvětlení pod sekci do `FieldGrid.hint`. Záložky jen pro rovnocenné a obsáhlé části; méně než ~8 řádků polí = sekce pod sebou. Dialog s jedinou záložkou lištu nemá. Co po založení nejde měnit, je `FieldValue` (s `lockedReason`), ne zakázané pole. Okamžitě ukládané ovládání (matice oprávnění) do dialogu s Uložit nepatří. Malé editovatelné tabulky v dialogu = `FieldTable`, ne vlastní `<table>`.

- Dialog číselníku = `RecordDialog size="md"`; obsah jen ve `FieldGrid cols={12}` + `Field span` (více mřížek pod `SectionHeading`), vysvětlení `FieldGrid.hint`. Proč: všechny dialogy sdílejí šířku a svislé linky.
- Chyba uložení = `error`, odstranění = `deleteAction`, žádný `Alert` v obsahu. Proč: chyby jsou v jednom pruhu nad tlačítky.
- `dirty` i u nového záznamu; bez práva `readOnly`, nikdy zakázané vstupy. Proč: ochrana zavření a režim čtení řeší DS centrálně.
- V `readOnly` se jako hodnota vykreslí jen textové `Input` (bez `type`, text, email, tel, url, number; password jako „••••“); `search`, `hidden`, `file`, `checkbox` aj. zůstávají ovládáním. Část dialogu, která má zůstat ovladatelná (filtr, vyhledání v seznamu), obal `<RecordReadOnlyProvider value={false}>`. Proč: filtr ani skryté pole nejsou hodnotou záznamu.
- Dialog v panelu drží fokus uvnitř (Tab/Shift+Tab cyklí); vnořené potvrzení má vlastní past. Proč: fokus nesmí utéct za překryv.

- Před implementací vyhledej existující komponenty, hooky, typy a pomocné funkce a použij je; druhou implementaci stejného pravidla nevytvářej. Proč: jedno místo pravidla.
- Zachovávej existující chování mimo rozsah zadání; závažný problém ohlas a navrhni řešení, nevyžádaný refaktoring nedělej. Proč: každá zpráva má jedno téma a kontroluje se diffem.
- Soubor nad 300 řádků posuď a v plánu napiš, proč zůstává pohromadě; nad 500 řádků lint varuje a nový soubor nad 500 se nepřijme; komponenta ≤ 300, funkce ≤ 60 řádků; řádek ≤ 100 znaků (Prettier). Proč: soubor, který nejde přečíst za 10 minut, nejde zkontrolovat.
- Komponenta nad 30 props se dělí (konfigurační objekt, podkomponenty, slot). Proč: DataGrid se 77 props nejde zkontrolovat.
- Texty jen přes DsTexts (CS i SK), žádné české výchozí řetězce v komponentách. Proč: knihovna bude i slovensky (system.md pravidlo 9).
- Obecné komponenty neznají doménu: žádné natvrdo id sloupců („md“, „vs“, „status“) ani kódy druhů dokladů („FP“, „DDPOZ“); doména jde props nebo document-fields.ts. Proč: DataGrid a DocumentForm musí sloužit i jiným aplikacím.
- Identifikátory anglicky (PascalCase komponenty a typy, camelCase funkce, useXxx hooky, kebab-case ostatní soubory), texty a komentáře česky s diakritikou – nikdy slovensky ani anglicky. Proč: jeden styl v celé knihovně.
- Žádné any, as unknown as, as never, @ts-ignore; ! jen s komentářem proč. Proč: přetypování vypíná kontrolu, která má chytit chybu.
- useEffect jen pro synchronizaci s vnějškem; ne kopírování props do stavu, ne odvozování (useMemo), ne volání callbacku rodiče po změně stavu; eslint-disable pro exhaustive-deps jen s komentářem proč na témže řádku; efekt bez pole závislostí zakázán; globální posluchače (window) v jednom hooku na účel s úklidem. Proč: efekty synchronizující stav jsou zdroj smyček.
- Každý soubor v components/ds a lib začíná hlavičkou (co · vlastní · nesmí); každý export a každý prop má JSDoc; @deprecated s verzí a náhradou, maže se v nejbližší major verzi; workaround má důvod a podmínku odstranění. Proč: čtenář potřebuje důvod, ne popis.
- Testy ověřují chování (render + interakce přes Testing Library, nebo čistá funkce vstup → výstup); readFileSync na src/** v testu je zakázán; Tailwind třídy se netestují řetězcem; názvy testů podle komponenty, ne podle verze. Proč: test nad textem spadne při formátování a nic nedokazuje.
- BREAKING změna vždy s návodem na migraci v CHANGELOG.md; system.md obsahuje jen pravidla, ne poznámky k vydání. Proč: APP se aktualizuje podle CHANGELOG.
- Kontroly mají dvě úrovně. **Průběžná** (každá zpráva, pokud zadání neřekne jinak): `bun run check:quick` = typecheck celku, eslint (cache) a prettier --check jen na změněných a nových souborech, unit testy jen souborů testujících měněné moduly (ve shrnutí je vyjmenuj); build ne; E2E nejvýš jeden přímo zasažený spec, jen chromium, jen u změny interakce nebo rozvržení. **Úplná** jen na „uzavři kolo“ nebo „připrav k vydání“: `bun run check:full` = typecheck, lint celku (cache), všechny unit testy, format:check, build, `check:catalog`; plná E2E sada běží v GitHub Actions, ne v Lovable. Měření výkonu proti minulé verzi jen na výslovný požadavek. Shrnutí uvádí, co běželo (s počty) a co neběželo; netvrď, že kontrola prošla, pokud neběžela. Proč: Claude kontroluje každý krok.

## Shared field and grid contracts

- Input owns `formatPattern`; never pass a bare placeholder for a format hint. Why: one shared input contract preserves empty values and separates format from help.
- Selection actions reserve fixed rem slots beside a fixed chevron; trailing labels precede actions. Why: shared geometry prevents overlaps at every application zoom.
- Field hints are an Info icon in the label row (FieldHintIcon), never text below; use formatPattern inside the input and FieldGrid.hint below a section. Why: adjacent control edges remain aligned.
- Locked payment-order toggles remain focusable with aria-disabled and a stable action name; the reason is an accessible description. Why: keyboard users can discover why the action is unavailable.
- Field label IDs derive from htmlFor. Why: locked groups need separate accessible names and reasons.
- Disabled fields use ds-disabled-control plus disabled token utilities; state borders win. Why: readable muted text, one surface and consumer overrides.
- Use FieldToggleButton for in-field icon toggles; only NonTaxToggle cells and DateField links retain their geometry. Why: one interaction and accessibility contract.
- Share compact date measurement between forms; keep Field labels truncated with their full title, never dynamically shrink them. Why: text zoom remains readable and label behavior stays stable.
- Resolve pane-sticky headers centrally in ZoomGrid; overflow fallback disables pane stickiness. Why: an inner scroll container must not offset its first row by the outer action bar.
- Two or more grid primary actions collapse full label → shortLabel → one "+ ▾" menu (level 3) inside GridAddActions; never identical icon-only buttons. Why: actions stay distinguishable in narrow panes.
- BankStatement/cash BA shows DUZP like PO when VAT fields are visible; date lock/link and defaults stay app-controlled via vat.dateLink. Why: the DS must not render a VAT date bound to a missing DUZP.

- Errors and warnings use shared in-control indicators with borders and full tooltips, never text below fields; DocumentForm repeats messages above the form. Why: validation must not change row height.

- Field status (error/warning) goes through useFieldStatus/FieldStatusIndicator; grid cells use the lazy useCellStatusTooltip, never title or eager Tooltips. Why: one contract and no cost for thousands of rows.
- A field with its own tooltip shows one bubble: the status message on top, the original information below. Why: two overlapping bubbles are unreadable.
