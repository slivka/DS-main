# DS 2.83.0 – rozdělení JournalLinesEditor, StrictMode u dialogů, vnořený formulář v RecordDialog

Veřejné API beze změny (žádný prop neubývá, importní cesty zůstávají). Release nedělám, `meta.yaml` nedotčeno.

## Zjištěný stav
- `journal-lines-editor.tsx` má po Prettieru **2 706 řádků**; samotná komponenta (`forwardRef`) je ř. 709–2706, props má 41 (nad limitem 30 – dělení props je API změna, patří do 3.0.0, zůstává).
- Texty editoru jsou dnes v souboru (`JournalLinesEditorTexts`, `DEFAULT_JOURNAL_LINES_TEXTS`, ř. 147–300), ne v `DsTexts`.
- Chyby řádků jdou ven přes `onValidationChange([{ line, field, message }])` – „radek=N“ v kódu není; test ověří správné číslo řádku v tomto výstupu.

## 1. Testy nejdřív (proti dnešnímu kódu, musí projít před i po)
`tests/unit/journal-editor-behavior.test.tsx` (render + Testing Library):
- přidání řádku, duplikace, smazání a vrácení (Zpět);
- posun řádku (`moveRow` přes klávesovou zkratku / `reorderJournalLines`);
- klávesnice: Tab na další buňku, Enter potvrdí a skočí dolů, Esc vrátí hodnotu, F2 editace;
- součty MD / Dal a rozdíl, `onTotalsChange`;
- režim `mainAccount` (jen protiúčet, hlavní účet jen ke čtení) vs. `internal` (MD i Dal);
- chyba řádku: `onValidationChange` hlásí `line: N` u správného řádku.

`tests/unit/journal-lines-model.test.ts` (čisté vstup → výstup): součty, platnost řádku, pořadí/přečíslování, návrh zaokrouhlení, layout sloupců.

Stávajících 6 journal testů + e2e `journal-editor.spec.ts` beze změny.

## 2. Mapa souborů 5a (před → po)

| Soubor (po) | Odpovědnost | Z dnešních řádků | Odhad |
|---|---|---|---|
| `journal-lines-editor.tsx` | jen re-export (zachová importní cesty a `index.ts`) | – | ~25 |
| `JournalLinesEditor.tsx` | skládání: props → hooky → tabulka, lišta, patička | 709–815, 2215–2260 | ≤ 300 |
| `journal-editor-types.ts` | veřejné typy a props (`JournalLinesEditorProps`, `JournalLinesVat`, …) | 97–146, 628–674 | ~150 |
| `journal-lines-model.ts` | čisté: zaokrouhlení, `calculateLineAmount`, `orderJournalLines`, `reorderJournalLines`, `roundingSuggestion`, `journalAmountLabels`, platnost řádku (`sideIssues`, `vatIssues`), přečíslování, `displayValue` | 302–427, 1381–1530 | ~380 |
| `journal-column-layout.ts` | šířky, `resolveJournalColumnLayout`, `resolveJournalZoomLayout`, `normalizeJournalAccountVisibility` | 428–627 | ~230 |
| `journal-columns.ts` | definice sloupců podle režimu, popisky účtů | 881–990 | ~180 |
| `useJournalEditorState.ts` | stav řádků (add/duplicate/remove/move/patch, VAT patch), editace buňky, dirty/touched, validace a hlášení rodiči | 1076–1475 (bez čistých funkcí) | ~450 |
| `useJournalKeyboard.ts` | Tab/Enter/Esc/F2, šipky, Ctrl+D, Ctrl+Delete, `focusRelative` | 1529–1545, 2220–2300 | ~250 |
| `useJournalLayout.ts` | měření šířky, auto zoom (kaskáda do 0,75), viditelné sloupce | 773–813, 988–1075 | ~220 |
| `JournalCell.tsx` | zobrazení jedné buňky podle typu sloupce | 1474–1528, 2400–2600 | ~300 |
| `JournalCellEditor.tsx` | editor buňky podle typu (účet, částka, DPH, výběry, text) | 1546–1910 | ~400 |
| `JournalRow.tsx` | řádek (`SortableRow`), akce řádku, rozbalený detail | 675–708, 1912–2110, 2600–2706 | ~350 |
| `JournalFooter.tsx` | součtový řádek MD/Dal, rozdíl, zaokrouhlení, návrh vyrovnání | 1141–1192, 2109–2214 | ~250 |

Proti zadání navíc: `useJournalKeyboard.ts`, `useJournalLayout.ts`, `journal-column-layout.ts`, `journal-columns.ts`, `JournalCellEditor.tsx`, `journal-editor-types.ts` – jinak by stav nebo buňka přesáhly 500 řádků. Každý soubor: hlavička (co · vlastní · nesmí), JSDoc česky, bez `any`/`as never`.

**Texty:** nový klíč `DsTexts.journalEditor` (CS + SK překlad). `DEFAULT_JOURNAL_LINES_TEXTS` zůstane exportovaný jako `DS_TEXTS_CS.journalEditor`; priorita prop `texts` → provider → CS. `ds-texts.tsx` je už dnes nad 500 řádků (existující soubor, roste o ~3×75 ř.); jeho dělení je samostatný úkol.

## 3. 5c `useDialogBackClose` a StrictMode
Předpokládaná příčina (potvrdí nejdřív test s `<StrictMode>`): při simulovaném odpojení úklid zavolá `history.back()`, znovupřipojení vloží nový záznam a opožděný `popstate` pak dialog zavře.
Oprava: úklid při odpojení odloží `history.back()` (mikroúloha) a zruší jej, pokud se komponenta hned znovu připojí; vložení záznamu je idempotentní (jeden marker na otevření).
Test `tests/unit/dialog-back-close-strict.test.tsx`: StrictMode → jeden záznam historie, dialog zůstane otevřený; Zpět jej zavře; zavření tlačítkem záznam odebere; vnořené dialogy dál fungují.

**Pro APP po vydání:** vrátit `<StrictMode>` v kořeni a smazat `dialog-history-guard` (soubor, jeho import a obal/volání v kořeni či dialozích). Bezpečnost potvrdím až po zeleném testu.

## 4. Chyba z APP: vnořený RecordDialog odešle vnější formulář
Příčina: dialog je sice v portálu (DOM mimo vnější `<form>`), ale React události bublají podle stromu komponent, takže `submit` vnitřního formuláře dojde k `onSubmit` vnějšího.
Oprava: `onSubmit` formuláře v `RecordDialog` volá `event.stopPropagation()` (oba způsoby vykreslení – Dialog i portál panelu).
Test `tests/unit/record-dialog-nested.test.tsx`: dva vnořené `RecordDialog`, Uložit vnitřního zavolá jen vnitřní `onSubmit`; Uložit vnějšího funguje dál.

## 5. Závěr
`format`, `typecheck`, `lint` (0 chyb v nových/změněných), `test`, `build` s počty; `CHANGELOG.md` 2.83.0 (API beze změny, oprava vnořeného formuláře, StrictMode, rozdělení editoru); `package.json` 2.83.0; `roadmap.md`; tabulka souborů se skutečnými řádky; co nezměněno a proč (41 props editoru → 3.0.0, `ds-texts.tsx` délka). Nevydávám.
