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
- Karta: stav v `PageHeader.titleBadge`; checkboxy v `CheckboxGroup` nebo `FieldGrid align="input"`; Uložit a akce vždy v `RecordActionBar`, nikdy pod poli.
- Kód a název formátujte pouze přes `formatCodeName`; proč: UI, gridy a exporty musí mít jeden typografický standard.

## Jazyk knihovny

Jazyk nastav jednou v kořeni: `<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">`. Bez provideru čeština; priorita prop → provider → `DS_TEXTS_CS`. Každý nový text má klíč v `DsTexts` a překlady `DS_TEXTS_CS`/`DS_TEXTS_SK`; žádné pevné UI texty.

- Keep preview examples in .dsignore-excluded showcase modules. Why: preserve pages without shipping preview dependencies.
- Export bank-account utilities directly from the root barrel and preserve their existing component-barrel re-export. Why: stable utility imports.

- Unsaved navigation uses a typed action and executes continuation only after successful saves. Why: labels and data-loss protection stay consistent across all entry points.

- Keep grid/editor text interfaces in their domain module and re-export them through the existing text entry. Why: public imports remain stable without files at the line limit.
- RecordSidePanel owns layout; file selection and useFileDrop share validation. Why: no consumer fetching or duplicate validation.

## Vydání knihovny

- `meta.version` = `package.json` = poslední VYDANÁ verze; CHANGELOG a roadmap nesou další minor „(nevydáno)“. Nepromítne-li se commit vydání, nastav obě hodnoty a commit zapiš do `.lovable/release-base.json`.
- Use `bun run check:catalog` (`--refresh` to refresh); record removals in `.lovable/catalog-removals.json` and CHANGELOG counts only from its output. Why: code/references agree without hardcoded commits.

- Measure full and short grid primary-action labels and the merged trigger in the toolbar copy; choose full → short → menu by available width. Why: avoid boundary overflow.
- Exclude every preview-only path from source_manifest according to .dsignore. Why: the manifest consistently describes distributable source.

- Measure form action widths centrally: text-only → secondary icons → Save icon; retain accessible names and tooltips. Why: every form inherits the same overflow cascade.
- Position action measurements absolutely inside bar padding; identify live actions by their slot. Why: sticky/backdrop containment must not move copies across the form edge.
- Separate enabled-action touch explanations from blocked-action reasons in DisabledReasonTooltip. Why: enabled clicks never pin blocked explanations.

- Share feedback, translated column labels and origin-tagged editor issues; register control-h independently. Why: stable heights and no stale errors.

- Source scanning for monetary rounding belongs in the shared check-money-rounding script, not unit tests; exceptions carry reasons in one list. Why: tests verify behavior and both check levels enforce the same audit.

- Run check:full --harness in Lovable; CI runs all stages. Why: typecheck/build are harness-owned.
- CI reads Bun from .bun-version; unit storage always comes from happy-dom. Why: runner updates must not change test DOM behavior.
- PopoverContent forwards calendar Escape before dismissal. Why: Radix capture must not close intermediate views.
- RecordDialog uses activeTab when supplied, local selection otherwise; onTabChange reports user requests only. Why: error navigation without callback loops.

- Keep inline-search as the shared selection input/portal owner and account conversion in bank-account. Why: consumers inherit one keyboard contract and one checksum implementation.

- Linked records share LinkedRecordEntry and RecordDialog; mapped amounts and permissions come from the application. Why: consistent views without domain logic.
