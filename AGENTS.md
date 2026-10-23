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

- Route form panel toggles through RecordActionBar and include their fixed control slot in action-width measurement. Why: the toggle stays last and visible at every width without duplicating live controls.
- SourcePreview fills a min-height-zero flex chain; RecordSidePanel hosts must receive an available height, and PDF.js loads only in a client effect with a bundled worker to render pages at iframe width on resize. Why: editor, grid and linked panes share predictable previews without native viewer zoom differences.
- PDF preview sessions own loading-task destruction and guard async imports; fetch bytes with an owned abort before PDF.js. Cancelled sessions catch loading/render/cleanup rejections. Why: PDF.js 5.x network-reader cancellation can leak an unhandled rejection during regeneration.
- E2E tooltip checks share a real pointer/keyboard interaction helper, retaining explicit click, touch and dismissal assertions. Why: delayed hydration and grid relayout must not make tooltip tests depend on synthetic focus alone.

- Pravidla dokladů, DPH a editoru řádků: `src/components/ds/accounting/AGENTS.md`.
- Pravidla kvality, formulářů a gridů DS: `src/components/ds/AGENTS.md`; před změnami této části je přečti.
- Značky měn pocházejí z dat; nikdy nevkládej pevné `Kč` ani `CZK`.
- Zoom aplikace ukládá zařízení; Ctrl/Cmd+kolečko rozlišuje grid a aplikaci; automat gridů počítá z px při kořeni 16 px.
- Sbalitelné panely mají šipku vpravo a řízený stav přes props, nikdy `localStorage`.
- AppShell: aplikace má tmavé menu, panely šedé; view řídí titul, nav, scope a `context` pojmenuje objekt; provozovatel = `badge` + warning accent.
- LayoutMenu, nabídka záložky a UserMenu mají pevné pořadí; další položku přidej jen na výslovný požadavek. Nadpis panelu nemá ikonu.
- Grids use GridFrame, useRowActions and useGlobalShortcuts (one listener). Why: shared behavior.
- Neaktivní volby filtruj přes sdílené `InactiveTag` / `selectableItems`.
- Hodnota jen ke čtení patří do `FieldValue` uvnitř `Field`.
- Karta: stav v `PageHeader.titleBadge`; checkboxy v `CheckboxGroup` nebo `FieldGrid align="input"`; Uložit a akce vždy v `RecordActionBar`, nikdy pod poli.
- Kód a název formátujte pouze přes `formatCodeName`; proč: UI, gridy a exporty musí mít jeden typografický standard.

## Jazyk knihovny

Jazyk nastav jednou v kořeni: `<DsTextsProvider texts={DS_TEXTS_SK} locale="sk">`. Bez provideru čeština; priorita prop → provider → `DS_TEXTS_CS`. Každý nový text má klíč v `DsTexts` a překlady `DS_TEXTS_CS`/`DS_TEXTS_SK`; žádné pevné UI texty.

- Keep preview examples in excluded showcase modules. Why: no preview dependencies in consumers.
- Export bank-account utilities directly from the root barrel and preserve their existing component-barrel re-export. Why: stable utility imports.

- Unsaved navigation uses a typed action and executes continuation only after successful saves. Why: labels and data-loss protection stay consistent across all entry points.

- Keep grid/editor texts in domain modules, re-exported through the existing text entry. Why: stable imports and bounded files.
- Panels share layout/resize/tools; file surfaces share useFileDrop/validateFiles and innermost enabled drop ownership. Why: consistent limits, keyboard and no duplicate drops. Internal drag is cleared on window capture drop/dragend; selection lists use semantic lists with focusable checkboxes, not mixed listbox children.
- FileDropZone owns drag events on a group; its selection button contains only static content and children remain siblings. Why: chip actions stay independently accessible without nested controls.
- Keep pane providers, pane layout, grid model/toolbar/body and document value/props/text contracts in focused internal modules; preserve their public entry re-exports. Why: maintenance stays bounded without changing consumer imports or behavior.

## Vydání knihovny

- `meta.version` = `package.json` = poslední VYDANÁ verze; CHANGELOG a roadmap nesou další minor „(nevydáno)“. Nepromítne-li se commit vydání, nastav obě hodnoty a commit zapiš do `.lovable/release-base.json`.
- Use `bun run check:catalog` (`--refresh` to refresh); record removals in `.lovable/catalog-removals.json` and CHANGELOG counts only from its output. Why: code/references agree without hardcoded commits.

- Measure full and short grid primary-action labels and the merged trigger in the toolbar copy; choose full → short → menu by available width. Why: avoid boundary overflow.
- Exclude preview-only paths from source_manifest per .dsignore. Why: only distributable source belongs there.

- Form action overflow rules live in src/components/ds/AGENTS.md. Why: shared measurement.
- Journal overflow disables right-sticky actions in shared CSS. Why: no covered controls in invoices or advance lists.
- Position action measurements absolutely inside bar padding; identify live actions by their slot. Why: sticky/backdrop containment must not move copies across the form edge.
- Separate enabled-action touch explanations from blocked-action reasons in DisabledReasonTooltip. Why: enabled clicks never pin blocked explanations.

- Share feedback, translated column labels and origin-tagged editor issues; register control-h independently. Why: stable heights and no stale errors.

- Source scanning for monetary rounding belongs in the shared check-money-rounding script, not unit tests; exceptions carry reasons in one list. Why: tests verify behavior and both check levels enforce the same audit.
- Unit tests never mock.module library modules; shared cleanup lives in tests/setup.ts and check-test-isolation lists allowed external mocks with reasons. Why: Bun module mocks persist for the whole run, so file order must not decide results.

- Use check:full --harness; CI runs all stages. Keep noImplicitReturns enabled for consumers.
- CI reads Bun from .bun-version; unit storage always comes from happy-dom. Why: runner updates must not change test DOM behavior.
- PopoverContent forwards calendar Escape before dismissal. Why: Radix capture must not close intermediate views.
- RecordDialog uses activeTab when supplied, local selection otherwise; onTabChange reports user requests only. Why: error navigation without callback loops.

- Keep inline-search as the shared selection input/portal owner and account conversion in bank-account. Why: consumers inherit one keyboard contract and one checksum implementation.

- Linked records share LinkedRecordEntry and RecordDialog; mapped amounts and permissions come from the application. Why: consistent views without domain logic.
- Linked-tabs owns follow/pin/orphan rules; panel context uses reducers/provider guards; PaneLayout has an optional renderer with renderTab fallback. Why: APP content, shared state.
- Templates/advances reuse grids/dialogs and afterVatRecap. Why: APP owns data/writes.
- PaymentScheduleEditor composes GridToolbar/GridAddActions and keeps its contracts and generation dialog in internal modules. Why: shared zoom/overflow without changing consumer imports or persistence ownership.

- Multi-selection uses cmdk items and the opt-in inline-search multiple focus contract; single-selection Tab remains non-confirming. Why: portaled search and actions share one keyboard owner.

- DocumentForm composes an input resolver, base model, feedback model and view; preview scenarios remain separate excluded modules. Why: preserve the public contract while keeping source units bounded.
- Column formats use sanitized GridLayout.styles, shared columnFormatCss in ZoomGrid and light ARGB through the Excel palette module; contrast tests read CSS tokens explicitly. Why: UI, views, exports and print share one format contract without domain logic.
- Grid preferences guard hydration with a configuration generation and capture the originating store/layout in a focused save queue; scope changes discard pending work while active writes finish in the old store. Why: account switches cannot move private layouts into another user's scope.

- Invoice printing composes section modules over createPrintDocument/Roboto and PrintPreviewDialog; APP supplies every monetary total and resolved logo; shared invoice-options owns defaults, including the explicitly required home-currency fallback. Why: one PDF system without a second accounting engine.

- Keep print/export and journal-editor translations in dedicated per-language modules, re-exported through DsTexts. Why: bounded translation catalogs preserve public imports.
- DocumentCounterpartyTab resolves delivery locking independently, defaulting to counterpartyLocked with global readOnly taking precedence. Why: APP can edit descriptive delivery data without unlocking the counterparty.
- DocumentForm resolves header suggestions through an opt-in Field context; journal columns map to shared suggestion keys and report first manual changes. Why: all document variants share presentation without owning application proposals.
