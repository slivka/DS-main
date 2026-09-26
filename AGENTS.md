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
- Data DPH (`DUZP`, `Období DPH`) jsou v `DocumentForm` vždy vpravo; svázané datum ukazuje zámek místo kalendáře, aby byl vztah ke zdrojovému datu zřejmý.
- Formulář dokladu používá jedinou typografickou stupnici v `rem`; jednotky a zdroje zobrazuj pod polem a obsah pole se nesmí oříznout.
- Haléřové vyrovnání je připnutý poslední řádek `JournalLinesEditor`; lišta obsahuje jen akci pro jeho návrh a stav rozepsání.
- Gridové a editorové lišty sdílejí `grid-toolbar-control`, protože všechny neaktivní akce musí mít stejný tokenový rámeček.
- Obnovit znamená pouze znovu načíst serverová data a stojí úplně vpravo za oddělovačem; rozložení se obnovuje pouze v nabídce Sloupce.
- Sbalitelné panely mají šipku vpravo a jejich stav řídí aplikace přes props, nikdy `localStorage`.
