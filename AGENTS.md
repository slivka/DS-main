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

- `DocumentForm`: typovaná identita; účet jen v ní, měna faktur vedle Celkem.
- `DocumentForm` má běžná pole v mřížce 14/3/3, ale Datumy ve flex řádku s DPH vpravo, aby se přesouvala celá pole.
- Data DPH jsou vpravo; „Vstupuje do DPH“ je vlevo v pruhu akcí, vypnutí údaje jen skryje a svázané datum ukazuje zámek.
- Značky měn v částkách a kurzech pocházejí vždy z dat; nepoužívejte pevné `Kč` ani `CZK`.
- Zaokrouhlení je připnutý poslední řádek `JournalLinesEditor`; lišta obsahuje jen akci pro jeho návrh a stav rozepsání.
- Sbalitelné panely mají šipku vpravo a jejich stav řídí aplikace přes props, nikdy `localStorage`.
- Pohled provozovatele má accent štítek; panely nastavení pojmenují objekt přes `context`.
- `JournalLinesEditor` vychází z měřené šířky; Zakázka, VS a Partner se sbalí do detailu, ručně zapnuté sloupce zůstávají.
- Varování k datům dokladu předávej přes `DocumentForm.dateWarnings`; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Neaktivní položky filtruje každý výběr sám přes sdílené `InactiveTag` / `selectableItems`, aby se chování nelišilo mezi výběry.
- Hodnota jen ke čtení v řádku formuláře patří do `FieldValue` uvnitř `Field`, aby měla popisek a správné zarovnání.
- Karta: stav vždy v `PageHeader.titleBadge`; checkboxy jen v `CheckboxGroup` nebo `FieldGrid` s `align="input"`; Uložit a akce vždy v `RecordActionBar`, nikdy volně pod poli.

- Řádky DPH vytváří jen DB; DS je zobrazuje a počítá předběžně (`journal-vat.ts`).

## Jazyk knihovny (2.61.0)

Aplikace nastaví jazyk jednou v kořeni:

```tsx
<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
  <App />
</DsTextsProvider>
```

Bez provideru zůstává knihovna česky. Priorita textu je prop komponenty → `DsTextsProvider` → `DS_TEXTS_CS`. Nový text komponenty musí mít nový klíč v `DsTexts`, český výchozí text v `DS_TEXTS_CS` a slovenský překlad v `DS_TEXTS_SK`; uživatelsky viditelný text se nesmí vložit natvrdo.

- DS 2.70.0: zoom aplikace ukládá zařízení; Ctrl/Cmd+kolečko podle polohy (grid × aplikace); automat gridů počítá z px při kořeni 16 px bez kompenzace zoomu aplikace – aby se zvětšení aplikace vždy projevilo.
