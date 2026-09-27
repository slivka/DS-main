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

- `DocumentForm` vždy drží nadpis v `PageHeader`; identita a směr patří do prvního řádku karty, aby panelové ovládání zůstalo oddělené od údajů dokladu.
- `DocumentForm` skládá hlavičkové údaje do dvacetisloupcové mřížky 14/3/3; sjednocuje tak široká a krátká účetní pole.
- Data DPH (`DUZP`, `Datum DPH`) jsou v `DocumentForm` vždy vpravo; řízený přepínač „Vstupuje do DPH“ patří vlevo do pruhu akcí a vypnutí údaje pouze skryje; svázané datum ukazuje zámek místo kalendáře.
- Značky měn v částkách a kurzech pocházejí vždy z dat; nepoužívejte pevné `Kč` ani `CZK`.
- Formulář dokladu používá jedinou typografickou stupnici v `rem`; jednotky a zdroje zobrazuj pod polem a obsah pole se nesmí oříznout.
- Zaokrouhlení je připnutý poslední řádek `JournalLinesEditor`; lišta obsahuje jen akci pro jeho návrh a stav rozepsání.
- Gridové a editorové lišty sdílejí `grid-toolbar-control`, protože všechny neaktivní akce musí mít stejný tokenový rámeček.
- Obnovit znamená pouze znovu načíst serverová data a stojí úplně vpravo za oddělovačem; rozložení se obnovuje pouze v nabídce Sloupce.
- Sbalitelné panely mají šipku vpravo a jejich stav řídí aplikace přes props, nikdy `localStorage`.
- Pohled provozovatele napříč pracovními prostory vždy označte accent štítkem; panely nastavení prostoru a firmy vždy pojmenují upravovaný objekt přes `context`.
- Adaptivní sloupce `JournalLinesEditor` vycházejí z měřené šířky; režim `shared` drží společnou Zakázku, VS a Partner v gridu a validuje je podle účtů.
- Varování k datům dokladu předávej přes `DocumentForm.dateWarnings`; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Neaktivní položky filtruje každý výběr sám přes sdílené `InactiveTag` / `selectableItems`, aby se chování nelišilo mezi výběry.
