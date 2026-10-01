# Changelog – Slivka Design System

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
