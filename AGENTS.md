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

- `DocumentForm`: typovaná identita; účet jen v ní, měna vždy vedle Celkem; přijaté doklady řadí Základní údaje → Datumy → Platební údaje → Částka → Řádky.
- Běžná pole dokladu mají mřížku 14/3/3; data jsou ve flex řádku. DPH je vpravo, „Vstupuje do DPH“ vlevo; skrytí nemaže data a vazba ukazuje zámek.
- Značky měn pocházejí z dat; nikdy nevkládej pevné `Kč` ani `CZK`.
- Varování dat jdou přes `dateWarnings` do NoticeBar; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Řádky DPH vytváří DB; DS je jen zobrazuje a předběžně počítá v `journal-vat.ts`.
- Zaokrouhlení je poslední připnutý řádek `JournalLinesEditor`; lišta nabízí jen návrh a stav rozepsání.
- `JournalLinesEditor` měří vnitřní šířku; po kaskádě sníží auto zoom nejvýš na 0,75 a až pak roluje.
- Zoom aplikace ukládá zařízení; Ctrl/Cmd+kolečko rozlišuje grid a aplikaci; automat gridů počítá z px při kořeni 16 px.
- Sbalitelné panely mají šipku vpravo a řízený stav přes props, nikdy `localStorage`.
- AppShell: aplikace má tmavé menu, panely šedé; view řídí titul, nav, scope a `context` pojmenuje objekt; provozovatel = `badge` + warning accent.
- LayoutMenu, nabídka záložky a UserMenu mají pevné pořadí; další položku přidej jen na výslovný požadavek. Nadpis panelu nemá ikonu.
- Neaktivní volby filtruj přes sdílené `InactiveTag` / `selectableItems`.
- Hodnota jen ke čtení patří do `FieldValue` uvnitř `Field`.
- Karta: stav v `PageHeader.titleBadge`; checkboxy v `CheckboxGroup` nebo `FieldGrid align="input"`; akce v `RecordActionBar`.
- Karta: Uložit a akce vždy v `RecordActionBar`, nikdy volně pod poli.

## Jazyk knihovny (2.61.0)

Aplikace nastaví jazyk jednou v kořeni:

```tsx
<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
  <App />
</DsTextsProvider>
```

Bez provideru zůstává knihovna česky. Priorita textu je prop komponenty → `DsTextsProvider` → `DS_TEXTS_CS`. Nový text komponenty musí mít nový klíč v `DsTexts`, český výchozí text v `DS_TEXTS_CS` a slovenský překlad v `DS_TEXTS_SK`; uživatelsky viditelný text se nesmí vložit natvrdo.
- Nastavení nad úrovní firmy: vlastní rám StandaloneShell mimo AppShell, ne panel – prostory nemají firmu ani období.
