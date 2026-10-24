# Banka – komponenty DS pro rozpoznání pohybů (I3), napojení na Fio (I4), pravidla (I5) a platby (I7)

Zdroj: analytický návrh „Import bankovních výpisů“ (Claude, 19. 10. 2026, rozhodnutí Petra O1–O19) a náčrt obrazovek 1–7. Import souborů (I1, I2) je hotový a vydaný (FileDropZone, FileChipBar, PaneDropOverlay, CheckList, SelectableGroupList, `BankStatementForm.menuActions`). **Tento dokument pokrývá jen DS:** komponenty bez domény, data a akce jen přes props, texty CS/SK v DsTexts, zpětně kompatibilní. DB a APP přijdou v APP projektu.

## Principy z návrhu, které DS musí respektovat
- Pohyb z banky je **neměnný** (částka, směr, datum pohybu, měna, protiúčet, symboly jsou převzaté a zamčené – `lockedReason` z D2). Uživatel doplňuje účet, partnera, zakázku / kategorii a popis.
- Rozpoznání vrací pro pohyb stav **jisté / návrh / nerozpoznáno** a zdroj (otevřená položka, vlastní účet, účet partnera, pravidlo). **Jisté pohyby se samy nezařazují** – tlačítko „Zařadit vše jisté“ (O3).
- Párování dělá DB při zařazení. DS jen zobrazuje kandidáty, které APP předá.
- Token banky se v UI **nikdy nezobrazuje** – jen „uložen dne · kdo“.

## 1. I3 – Rozpis výpisu (`BankStatementReconcileView`)
Grid pohybů výpisu nad DataGrid (standard DS: řazení, filtry, výběr sloupců, export do Excelu):
- **Sloupce:** pořadí, datum pohybu, směr (ikona), částka (barevně ±), protiúčet + název protistrany, VS / KS / SS, zpráva, **Účet** (AccountSelect v buňce, v režimu DE položka – `bookkeepingMode`), **Partner** (výběr v buňce), **Kategorie**, **Dimenze** (volitelně, MultiValueCell), **Popis**, stav (štítek Jisté / Návrh / Nerozpoznáno / Zařazeno), zdroj rozpoznání (ikona s bublinou).
- **Řádek návrhu pod pohybem** (rozbalovací, světle): navržený účet / partner / doklad k úhradě („Úhrada FV20260012 · zbývá 12 100 Kč“), akce **Přijmout**, **Odmítnout**, při více kandidátech výběr kandidáta (`candidates: {id,label,amount,remaining,dueDate}[]`).
- **Filtr stavu** nahoře: Vše / Jisté / Návrhy / Nerozpoznané / Zařazené s počty.
- **Akce lišty:** Zařadit vše jisté (n), Přijmout návrhy vybraných, Zařadit vybrané, Znovu rozpoznat, Vytvořit pravidlo z pohybu (z vybraného řádku), Otevřít doklad.
- **Pruh importu** nad gridem: „Importováno {datum} · {soubor} · Stáhnout originál · Zrušit import“ (Zrušit přes potvrzení s důvodem) – nebo u API „Fio API · staženo {datum čas} · {n} nových pohybů“.
- **Souhrn ve spodní liště:** počáteční zůstatek, příjmy, výdaje, konečný zůstatek, Zůstatek na výpise, Rozdíl (červeně ≠ 0).
- **Klávesnice:** navigace Enterem jako v gridu řádků dokladu; Ctrl+Enter = přijmout návrh řádku; mezerník = výběr.
- Props: `rows`, `onPatch(rowId, patch)`, `onAcceptSuggestion(rowId, candidateId?)`, `onRejectSuggestion(rowId)`, `onFileCertain()`, `onFileSelected(ids)`, `onRecognize()`, `onCreateRule(rowId)`, `onOpenDocument(id)`, `importInfo`, `summary`, `bookkeepingMode`, `categoriesEnabled`, `dimensionTypes`, `busy`, `readOnly`.
- Řádek zařazeného pohybu je jen pro čtení s možností otevřít doklad.

## 2. I4 – Napojení knihy na banku
1. **`BankConnectionSettings`** (sekce ve vlastnostech knihy BA):
   - Způsob: Jen ruční import · Fio API · Jiná banka (připravujeme, zakázané).
   - Token: jen stav „uložen {datum} · {kdo}“ + **Změnit token…** (dialog s polem pro vložení tokenu, typ password, nikdy se nevrací zpět do UI), druh tokenu (Jen sledování / Sledování a příkazy), **Token platí do** (datum, upozornění 14 dní předem).
   - Stahovat: denně v (čas, výchozí 6:00), volitelně častěji v pracovní dny; Stahovat od (nejvýš 90 dní zpět – validace přes props `minFetchFrom`).
   - Výpisy: kopírují periodicitu Fio (jen text).
   - Stav spojení (Aktivní / Chyba – token / Chyba / Pozastaveno / Odpojeno) s poslední chybou a časem posledního úspěchu.
   - Akce: Otestovat spojení, Stáhnout teď (blokace s odpočtem „Další dotaz na Fio za 23 s“ – `nextAvailableAt`), Pozastavit / Obnovit, Odpojit (potvrzení).
2. **`BankConnectionBanner`** (pruh na stránce Banka a ve výpisu): zelený „Napojeno na Fio API · staženo dnes 06:02 (4 nové pohyby) · Stáhnout teď“, žlutý „Token vyprší za 9 dní“, červený s důvodem chyby a akcí „Změnit token…“.
3. **Štítek „Průběžný“** u výpisu v seznamu i v hlavičce výpisu (průběžný výpis z API, uzavře se oficiálním výpisem).
4. **Odznak** počtu pohybů k vyřízení u položky menu (API navigace – `badge` u položky menu, je-li to nové).

## 3. I5 – Pravidla účtování banky
1. **`BankRuleList`**: grid pravidel v pořadí (přetažení mění pořadí, `onReorder(ids)`), sloupce: pořadí, název, podmínky (zkrácený text), výsledek (účet / partner / popis), jistota (Jisté / Návrh), knihy, stav (aktivní / neaktivní). Akce Nové, Upravit, Duplikovat, Deaktivovat / Aktivovat.
2. **`BankRuleDialog`** (RecordDialog):
   - **Podmínky** (vyplněné se kombinují A ZÁROVEŇ): směr; protiúčet nebo IBAN; VS / KS / SS; text zprávy nebo názvu obsahuje; druh pohybu (běžný / poplatek / úrok / karta / storno); částka od–do; knihy (výběr, prázdné = všechny).
   - **Výsledek:** účet (číslem – AccountSelect), partner, kategorie, dimenze, popis se zástupnými značkami (`{měsíc}`, `{rok}`, `{protistrana}` – nápověda), Nedaňový, jistota.
   - **Náhled:** „Pravidlo by se použilo u {n} pohybů za posledních 90 dní“ (data od APP, `previewCount`).
   - Předvyplnění z pohybu (`initial` z „Vytvořit pravidlo z pohybu“).

## 4. I7 – Platby
1. **`PaymentOrderBatchView`** (výběr úhrad do dávky, nad Platebním kalendářem):
   - grid závazků k úhradě: partner, doklad, splatnost (zvýraznění po splatnosti), částka, zbývá, měna, účet partnera (výběr z účtů partnera v číselníku – ručně psaný účet nelze), VS / KS / SS, zpráva pro příjemce, datum úhrady (výchozí splatnost, nejdříve dnes);
   - výběr řádků, součet vybraných po měnách, filtr podle splatnosti a knihy;
   - kontroly řádku (CheckList / FormIssue): chybí účet partnera, nezveřejněný účet u plátce DPH (§ 109), nespolehlivý plátce, cizí měna vs. účet, částka vyšší než zbývá – blokující a upozornění od APP;
   - akce: **Vytvořit soubor příkazu** (volba formátu ABO / ČBA XML / pain.001 podle banky – `formats`), **Odeslat do Fio** (jen když APP povolí – `canSendFio`, s limity), Uložit dávku.
2. **`PaymentOrderSendDialog`**: souhrn dávky (počet, částka po měnách, účet plátce), upozornění „Platby se odešlou přímo do banky“, potvrzení napsáním textu (`ConfirmByTypingDialog`) a volitelně druhá osoba (zobrazí stav schválení z props), limit dávky / dne z props.
3. **`PaymentOrderBatchList`**: seznam dávek – datum, kdo, banka / soubor, počet, částka, stav (Vytvořeno · Staženo · Odesláno do banky · Částečně uhrazeno · Uhrazeno · Zrušeno), akce Stáhnout soubor znovu, Zrušit dávku (s důvodem), Otevřít.
4. Štítek **„Odesláno do banky“** u dokladu (badge v seznamech a hlavičce dokladu) – úhrada se potvrdí až pohybem z výpisu.

## 5. Ukázky a testy
- Ukázky v katalogu: rozpis výpisu se všemi stavy (jisté, návrh s více kandidáty, nerozpoznáno, zařazeno, cizí měna, poplatek, storno), napojení ve všech stavech, pravidla, dávka plateb s chybami a odeslání.
- Unit testy na každou komponentu (zejména: token se nikdy nezobrazí, „Stáhnout teď“ blokace, přijetí návrhu, Zařadit vše jisté, ručně psaný účet v dávce nelze).
- Jeden E2E spec: rozpis výpisu (filtr, přijetí návrhu klávesou, zařazení vybraných) a dávka plateb (výběr, kontroly, vytvoření souboru).
