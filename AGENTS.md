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

- Preview-only accounting examples live in showcase modules excluded by .dsignore. Why: all existing pages remain usable without leaking preview dependencies to consumers.
- Export bank-account utilities directly from the root barrel and preserve their existing component-barrel re-export. Why: consumers get a clear utility entry without breaking existing imports.

- Unsaved navigation uses a typed action and executes continuation only after successful saves. Why: labels and data-loss protection stay consistent across all entry points.

- Keep grid/editor text interfaces in their domain module and re-export them through the existing text entry. Why: public imports remain stable without files at the line limit.
- Keep recap header rendering and record-list navigation in focused internal modules. Why: orchestration stays readable without deleting whitespace or changing public exports.
- Keep locked bank-account reasons in a shared internal FieldValue composition. Why: issued and received accounts must share truncation, tooltip and no-lock geometry.

- Rate-source and rate-update tooltips use sibling triggers. Why: hovering the update action must expose only its own explanation.
- Use bankAccountOptionValue in selections and notices. Why: IBAN-only identity stays consistent.

## Vydání knihovny

- `meta.version` = `package.json` = poslední VYDANÁ verze; CHANGELOG a roadmap nesou další minor „(nevydáno)“. Nepromítne-li se commit vydání, nastav obě hodnoty a commit zapiš do `.lovable/release-base.json`.
- Katalog jen přes `bun run check:catalog`; odebrání jen záznamem v `.lovable/catalog-removals.json`; čísla katalogu v CHANGELOG jen z jeho výstupu. Proč: žádné skripty s natvrdo commitem.

- Compose document and bank-statement identity through IdentityLine; retain domain account editing in DocumentIdentityLine. Why: separators, typography and number styling have one owner.
- Keep bank-statement translations in per-language modules and calculate toggle spacing on each element. Why: attached consumers inherit locale separation and local control-height overrides.


- Measure full and short grid primary-action labels and the merged trigger in the toolbar copy; choose full → short → menu by available width. Why: estimates and fixed breakpoints overflow near boundaries.
- Exclude every preview-only path from source_manifest according to .dsignore. Why: the manifest consistently describes distributable source.

- Measure form action widths centrally: text-only → secondary icons → Save icon; retain accessible names and tooltips. Why: every form inherits the same overflow cascade.
- Position action measurements absolutely inside bar padding; identify live actions by their slot. Why: sticky/backdrop containment must not move copies across the form edge.
- Separate enabled-action touch explanations from blocked-action reasons in DisabledReasonTooltip. Why: normal clicks never pin an explanation or imply a blocked action.

- Share feedback, translated column labels and origin-tagged editor issues; register control-h independently. Why: stable heights and no stale errors.

- Keep VAT exchange rates as rate/unit pairs and compare tolerances with exact cross-products. Why: division before conversion loses decimal halves.
- Source scanning for monetary rounding belongs in the shared check-money-rounding script, not unit tests; exceptions carry reasons in one list. Why: tests verify behavior and both check levels enforce the same audit.

- Run check:full with --harness inside Lovable so typecheck/build stay harness-owned; CI runs the default full pipeline. Why: duplicate manual builds are forbidden in the editor, while CI must validate all stages.
