<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- `DocumentForm`: nadpis v `PageHeader`; pruhy akce → error → notices → jen pro čtení; identita v kartě.
- `DocumentForm` má běžná pole v mřížce 14/3/3, ale Datumy ve flex řádku s DPH vpravo, aby se přesouvala celá pole.
- Data DPH jsou vpravo; „Vstupuje do DPH“ je vlevo v pruhu akcí, vypnutí údaje jen skryje a svázané datum ukazuje zámek.
- Značky měn v částkách a kurzech pocházejí vždy z dat; nepoužívejte pevné `Kč` ani `CZK`.
- Formulář dokladu používá `rem`; nadpisy/popisky se nezalamují, přesouvá se pole a zkrácení má tooltip.
- Zaokrouhlení je připnutý poslední řádek `JournalLinesEditor`; lišta obsahuje jen akci pro jeho návrh a stav rozepsání.
- Gridové a editorové lišty sdílejí `grid-toolbar-control` pro jednotný rámeček.
- Obnovit znamená pouze znovu načíst serverová data a stojí úplně vpravo za oddělovačem; rozložení se obnovuje pouze v nabídce Sloupce.
- Sbalitelné panely mají šipku vpravo a jejich stav řídí aplikace přes props, nikdy `localStorage`.
- Pohled provozovatele má accent štítek; panely nastavení pojmenují objekt přes `context`.
- `JournalLinesEditor` vychází z měřené šířky; Zakázka, VS a Partner se sbalí do detailu, ručně zapnuté sloupce zůstávají.
- Varování k datům dokladu předávej přes `DocumentForm.dateWarnings`; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Neaktivní položky filtruje každý výběr sám přes sdílené `InactiveTag` / `selectableItems`, aby se chování nelišilo mezi výběry.
- Hodnota jen ke čtení v řádku formuláře patří do `FieldValue` uvnitř `Field`, aby měla popisek a správné zarovnání.
- Volbu 2–3 vzájemně výlučných typů řeší `SegmentedField`; `GridSegmentedToggle` zůstává jen pro gridy.

- Řádky DPH vytváří jen DB; DS je zobrazuje a počítá předběžně (`journal-vat.ts`).
