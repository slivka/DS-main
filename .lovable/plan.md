# DS 2.66.0 – sloupce účtů MD / DAL (pravidlo 23)

## Cíl a ověřený výchozí stav

Sjednotit všechny gridy se zaúčtováním tak, aby nabízely krátkou i rozšířenou formu účtu ve **Sloupce**. Všude bude výchozí rozšířená forma; pouze `JournalLinesEditor` bude výchozí krátký a nedovolí skrýt obě formy jedné strany.

Ověřený stav projektu:
- `accountColumns()` už vrací krátké „MD“ / „DAL“ skryté a rozšířené „MD účet“ / „DAL účet“ viditelné, s textovým exportem a číselným řazením.
- `JournalLinesEditor` má nyní jen jeden zamčený účetní sloupec na stranu, jeho obsah řídí `accountDisplay`, a používá klíč `${storageKey}:v3`.
- `ColumnPicker` umí pouze statické `locked`; zatím neumí dynamicky zakázat poslední volbu a ukázat důvod.
- `JournalLinesRecap` nyní vykresluje ruční tabulky. Stav otevření a záložky už přijímá řízeně přes `recap` z editoru.
- `DocumentSettingsDialog` stále obsahuje `accountDisplay` i příslušné texty; ukázka je stále předává.
- `package.json` a katalog v projektu aktuálně uvádějí 2.64.0. Podle zadání je poslední vydání 2.65.0; nové změny nastaví 2.66.0.

## Implementace

### 1. Pravidlo 23 a dokumentace

- V `.lovable/system.md` nahradit dosavadní účetní pravidlo úplným zněním pravidla 23, včetně jediné výjimky editoru řádků a výslovného vymezení, na které gridy se výjimka nevztahuje.
- Do části o řádcích účetního zápisu doplnit dvojice účetních sloupců, výchozí krátkou formu, ochranu alespoň jedné formy, nadpis podle právě zobrazené formy a chování `compactAccounts`.
- Přidat sekci **DS 2.66.0** s migrací aplikací a BREAKING odstraněním `accountDisplay`.
- Stejné pravidlo promítnout do komentáře `account-columns.tsx`, changelogu v `README.md`, uživatelské dokumentace `components.md`, katalogu a nové položky roadmapy.
- `.lovable/meta.yaml` ponechat bez změny a bez neprázdného `upstream_versions`.

### 2. Obecné účetní sloupce

- Zachovat chování `accountColumns()`: rozšířené sloupce viditelné, krátké skryté, tečka v hodnotě/filtru/exportu, textový export a číselné řazení.
- Přidat veřejný typovaný helper `accountColumnPair<Row>({ id, label, shortLabel, getCode, accountName, section? })`, který vrátí:
  - `${id}Name`: rozšířený, výchozí viditelný sloupec `číslo - název`;
  - `${id}`: krátký, výchozí skrytý sloupec s číslem a tečkou.
- Helper exportovat přes veřejný vstup design systému a doplnit jeho ukázku.

### 3. JournalLinesEditor

- Nahradit každý účetní sloupec dvojicí krátká/rozšířená:
  - interní režim: `debitAccount` + `debitAccountName`, `creditAccount` + `creditAccountName`;
  - režim hlavního účtu: dvojice odpovídající skutečné straně protiúčtu, se správnými nadpisy MD nebo DAL.
- Krátké sloupce budou výchozí viditelné (~6 rem), rozšířené výchozí skryté (~13 rem); obě formy budou přes společné mapování číst a měnit stejnou hodnotu řádku.
- Oddělit prezentační ID sloupce od ukládaného pole řádku, aby se `JournalLine`, `toJournalRow(s)` ani datový model neměnily.
- Zapojit obě formy do stejného `AccountSelect`, hledání číselným prefixem, navigace Tab / Shift+Tab / Enter, editace, tooltipu názvu a validace; chyba základního účtu se zobrazí na každé právě viditelné formě dané strany.
- Rozšířit `ColumnPicker` o obecný dynamický zákaz vypnutí s vysvětlením. V editoru zakázat vypnutí poslední viditelné formy MD nebo DAL a zobrazit lokalizovaný tooltip „Aspoň jedna forma účtu musí zůstat zobrazená“.
- `compactAccounts` aplikovat jen na osamocený rozšířený sloupec: hodnota se zkrátí na číslo, nadpis na „MD“ / „DAL“, nadpis dostane tooltip „MD účet – zkráceno kvůli šířce“ / „DAL účet – zkráceno kvůli šířce“ a buňka zachová tooltip názvu účtu. Pokud je viditelná krátká forma, její nadpis i obsah už jsou krátké bez přeznačení jiné formy.
- Kaskádu šířek rozšířit pouze o nové účetní dvojice; ostatní pořadí zoom → kaskáda → rolování, DPH, ND, zaokrouhlení a detail řádku ponechat beze změny.
- Změnit klíč nastavení sloupců na `${storageKey}:v4`, aby stará rozložení nepřepsala nové výchozí hodnoty.

### 4. Odstranění staré volby účtu – BREAKING

- Odstranit `JournalLinesEditor.accountDisplay`, veřejný typ `JournalAccountDisplay` a závislost formátování na této volbě.
- `formatJournalAccountDisplay` upravit na formátování určené konkrétní krátkou/rozšířenou formou sloupce; změnu signatury uvést jako BREAKING.
- Z `DocumentSettingsValue`, `DocumentSettingsDialogTexts`, výchozích textů a dialogu odstranit volbu „Účet v gridu řádků“.
- Odstranit související hodnoty a předávání z ukázek a testovacích dat. Centrální české a slovenské texty doplnit pouze o nové tooltipy ochrany a zkráceného nadpisu; staré texty volby účtu nesmí zůstat v žádném veřejném textovém typu ani katalogu.

### 5. JournalLinesRecap jako DataGrid

- Převést vestavěné záložky rekapitulace z ručních tabulek na `DataGrid` při zachování záložek Účtování, Zakázky, volitelné DPH, vlastních záložek a rozbalovače vpravo.
- Účtování sestavit přes `accountColumns()` s výchozí rozšířenou formou a dostupnými krátkými sloupci ve **Sloupce**.
- Zakázky a DPH převést na stejné gridové chování se součtovým řádkem; pokud Zakázky obsahují účty, použít pro ně rovněž účetní helper, nikoli vlastní formátování.
- Zapnout běžný výběr sloupců a export; použít automatický zoom formulářového gridu. Stávající `zoom` zachovat pro obal záložek, aby se nezaváděla další nepožadovaná změna API.
- Přidat `JournalLinesRecap.storageKey?: string` s výchozím `journal-recap` a odvodit z něj oddělené stabilní klíče jednotlivých záložek.
- Editor předá rekapitulaci klíč odvozený od svého `storageKey`; řízené `open`, `tab` a callbacky zůstanou beze změny, takže aplikace dál ukládá `ui_panel_state.journalRecap` mimo design systém.

## Změny veřejného API

### Přibývá
- `accountColumnPair<Row>()` a jeho veřejný options typ.
- `JournalLinesRecapProps.storageKey?: string` s výchozí hodnotou `journal-recap`.
- Obecná možnost `ColumnPicker` označit konkrétní volbu jako právě nevypnutelnou a předat důvod; použije se pro ochranu účetních dvojic.
- Nové lokalizované texty pro zákaz skrytí poslední formy a pro nadpis zkrácený kvůli šířce.

### Mizí / mění se – BREAKING
- Mizí `JournalLinesEditorProps.accountDisplay`.
- Mizí typ `JournalAccountDisplay`.
- Mění se signatura `formatJournalAccountDisplay`, protože formu určuje sloupec, ne globální prop.
- Mizí `DocumentSettingsValue.accountDisplay` a texty `accountDisplay`, `accountDisplayNumber`, `accountDisplayNumberName` z `DocumentSettingsDialogTexts` i katalogu.
- Persistenční prostor sloupců editoru přechází z `:v3` na `:v4`; staré uživatelské rozložení se záměrně nepřenese.

## Dotčené soubory

### Knihovna
- `src/components/ds/accounting/account-columns.tsx`
- `src/components/ds/accounting/journal-lines-editor.tsx`
- `src/components/ds/accounting/journal-lines-recap.tsx`
- `src/components/ds/accounting/document-settings-dialog.tsx`
- `src/components/ds/grid/column-picker.tsx`
- `src/components/ds/grid/grid-columns.tsx` pouze pokud bude nutné bezpečně prosadit omezení i při resetu/pohledu, ne jen v nabídce
- `src/ds-texts.tsx`
- `src/components/ds/index.ts` a `src/index.ts` pro ověření veřejného exportu

### Ukázky
- `src/components/showcase/DocumentFormShowcase.tsx`
- `src/routes/components.accounting-forms.tsx`
- `src/routes/components.grid.tsx` pro potvrzení nezměněného účetního deníku a ukázku `accountColumnPair`
- případně `src/routes/components.excel-export.tsx` pouze pro regresní potvrzení obou forem v exportu

### Verze a dokumentace
- `package.json`
- `.lovable/design-system.json` (verze 2.66.0, odebrané/přidané API a aktualizované usage/examples/antipatterns)
- `.lovable/system.md`
- `README.md`
- `components.md`
- `roadmap.md`
- `AGENTS.md` pouze pokud vznikne nové trvalé technické pravidlo

### Testy
- upravit stávající testy editoru, dokumentového dialogu a DPH, které dnes používají `accountDisplay`;
- doplnit cílené unit/DOM testy pro účetní helpery, viditelnost, zákaz vypnutí, kompaktní nadpis a rekapitulaci;
- rozšířit Playwright test editoru o skutečnou editaci obou forem a klávesovou navigaci.

## Ověření

1. `accountColumns()`:
   - rozšířené sloupce jsou výchozí, krátké skryté;
   - filtr krátkého sloupce nabízí přesně `321.100`;
   - export krátké i rozšířené formy je text a řazení používá normalizovaný kód.
2. `accountColumnPair()`:
   - správná ID, nadpisy, výchozí viditelnost, hodnoty, tooltip, export a řazení.
3. `JournalLinesEditor`:
   - interní i hlavní účet mají správné dvojice a výchozí krátkou formu;
   - nelze vypnout poslední formu žádné zobrazené strany, včetně resetu nebo uloženého pohledu;
   - `compactAccounts` mění zároveň obsah, nadpis a tooltip podle zadání;
   - krátká i rozšířená buňka upraví stejný účet; funguje prefixové hledání, Tab, Shift+Tab, Enter a červený roh validace;
   - zapnutí obou forem nezduplikuje data a `toJournalRow(s)` zůstane beze změny;
   - zoom, kaskáda, DPH, ND, zaokrouhlení a detail projdou regresními testy.
4. `JournalLinesRecap`:
   - vykresluje DataGrid, nabízí Sloupce a export, má rozšířené účty jako výchozí a správný součtový řádek;
   - zachová záložky, rozbalovač, řízený stav a automatický zoom;
   - účetní, zakázkové i DPH součty a měnové značky zůstanou stejné.
5. `DocumentSettingsDialog`:
   - veřejný typ, česká i slovenská sada a vykreslený dialog neobsahují volbu účtu.
6. Vizuálně ověřit stránku Účetní formuláře a Účetní deník na široké i úzké ploše, včetně nabídky Sloupce a zkráceného nadpisu.
7. Spustit všechny unit testy, cílené prohlížečové testy, kontrolu typů a sestavení. Verze bude 2.66.0; Release se neprovede.
