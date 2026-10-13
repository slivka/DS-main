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

- Pravidla dokladů, DPH a editoru řádků: `src/components/ds/accounting/AGENTS.md`.
- Pravidla kvality, formulářů a gridů DS: `src/components/ds/AGENTS.md`; před změnami této části je přečti.
- Značky měn pocházejí z dat; nikdy nevkládej pevné `Kč` ani `CZK`.
- Zoom aplikace ukládá zařízení; Ctrl/Cmd+kolečko rozlišuje grid a aplikaci; automat gridů počítá z px při kořeni 16 px.
- Sbalitelné panely mají šipku vpravo a řízený stav přes props, nikdy `localStorage`.
- AppShell: aplikace má tmavé menu, panely šedé; view řídí titul, nav, scope a `context` pojmenuje objekt; provozovatel = `badge` + warning accent.
- LayoutMenu, nabídka záložky a UserMenu mají pevné pořadí; další položku přidej jen na výslovný požadavek. Nadpis panelu nemá ikonu.
- Gridy skládají lištu přes `GridFrame` a menu řádku přes `useRowActions`; globální klávesy přes `useGlobalShortcuts` (jeden posluchač). Proč: jedno místo chování pro všechny gridy a rámy.
- Neaktivní volby filtruj přes sdílené `InactiveTag` / `selectableItems`.
- Hodnota jen ke čtení patří do `FieldValue` uvnitř `Field`.
- Karta: stav v `PageHeader.titleBadge`; checkboxy v `CheckboxGroup` nebo `FieldGrid align="input"`; akce v `RecordActionBar`.
- Karta: Uložit a akce vždy v `RecordActionBar`, nikdy volně pod poli.
- Kód a název formátujte pouze přes `formatCodeName`; proč: UI, gridy a exporty musí mít jeden typografický standard.

## Jazyk knihovny (2.61.0)

Aplikace nastaví jazyk jednou v kořeni:

```tsx
<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
  <App />
</DsTextsProvider>
```

Bez provideru zůstává knihovna česky. Priorita textu je prop komponenty → `DsTextsProvider` → `DS_TEXTS_CS`. Nový text komponenty musí mít nový klíč v `DsTexts`, český výchozí text v `DS_TEXTS_CS` a slovenský překlad v `DS_TEXTS_SK`; uživatelsky viditelný text se nesmí vložit natvrdo.

- Keep document-form translations in per-language modules consumed by DsTexts. Why: the central catalogs remain readable and below the source line limit.
- Preview-only accounting examples live in showcase modules excluded by .dsignore. Why: all existing pages remain usable without leaking preview dependencies to consumers.
- Export bank-account utilities directly from the root barrel and preserve their existing component-barrel re-export. Why: consumers get a clear utility entry without breaking existing imports.

- Compute recap home totals inside the DS from document totals and rates; DocumentForm supplies its derived total. Why: applications must not duplicate conversion logic.
- Unsaved navigation uses a typed action and executes continuation only after successful saves. Why: labels and data-loss protection stay consistent across all entry points.

- Keep grid/editor text interfaces in their domain module and re-export them through the existing text entry. Why: public imports remain stable without files at the line limit.
- Keep recap header rendering and record-list navigation in focused internal modules. Why: orchestration stays readable without deleting whitespace or changing public exports.
- Keep locked bank-account reasons in a shared internal FieldValue composition. Why: issued and received accounts must share truncation, tooltip and no-lock geometry.

- Rate-source and rate-update tooltips use sibling triggers. Why: hovering the update action must expose only its own explanation.
- Use bankAccountOptionValue in selections and notices. Why: IBAN-only identity stays consistent.

## Vydání knihovny

- Před vydáním musí `package.json` obsahovat poslední VYDANOU verzi – dialog Release bere Current z aktuálního `package.json` a navrhuje Minor = Current + 1. `meta.version` v design-system.json, CHANGELOG a roadmap nesou verzi, která se vydá. Po vydání v dalším kole nejdřív nastav `package.json` na právě vydanou verzi.

- Keep bank-statement sections in a focused internal module and translations in DsTexts. Why: a small public form composes shared controls without application persistence.

- Compose document and bank-statement identity through IdentityLine; retain domain account editing in DocumentIdentityLine. Why: separators, typography and number styling have one owner.
- Keep bank-statement translations in per-language modules and calculate toggle spacing on each element. Why: attached consumers inherit locale separation and local control-height overrides.

