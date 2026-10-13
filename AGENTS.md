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
- Pravidla kvality DS: `src/components/ds/AGENTS.md`.
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

- Input owns `formatPattern`; never pass a bare placeholder for a format hint. Why: one shared input contract preserves empty values and separates format from help.
- Selection actions reserve fixed rem slots beside a fixed chevron; trailing labels precede actions. Why: shared geometry prevents overlaps at every application zoom.
- Field hints must not change a form row height; use formatPattern inside the input and FieldGrid.hint below a section. Why: adjacent control edges remain aligned.

- Keep document-form translations in per-language modules consumed by DsTexts. Why: the central catalogs remain readable and below the source line limit.
- Preview-only accounting examples live in showcase modules excluded by .dsignore. Why: all existing pages remain usable without leaking preview dependencies to consumers.
- Export bank-account utilities directly from the root barrel and preserve their existing component-barrel re-export. Why: consumers get a clear utility entry without breaking existing imports.

- Compute recap home totals inside the DS from document totals and rates; DocumentForm supplies its derived total. Why: applications must not duplicate conversion logic.
- Unsaved navigation uses a typed action and executes continuation only after successful saves. Why: labels and data-loss protection stay consistent across all entry points.

- Keep grid/editor text interfaces in their domain module and re-export them through the existing text entry. Why: public imports remain stable without files at the line limit.
- Keep recap header rendering and record-list navigation in focused internal modules. Why: orchestration stays readable without deleting whitespace or changing public exports.
- Keep locked bank-account reasons in a shared internal FieldValue composition. Why: issued and received accounts must share truncation, tooltip and no-lock geometry.

- Locked payment-order toggles remain focusable with aria-disabled and a stable action name; the reason is an accessible description. Why: keyboard users can discover why the action is unavailable.
- Rate-source and rate-update tooltips use sibling triggers. Why: hovering the update action must expose only its own explanation.
- Field label IDs derive from htmlFor. Why: locked groups need separate accessible names and reasons.
- Use bankAccountOptionValue in selections and notices. Why: IBAN-only identity stays consistent.
- Disabled fields use ds-disabled-control plus disabled token utilities; state borders win. Why: readable muted text, one surface and consumer overrides.

## Vydání knihovny

- Dialog Release bere „Current“ z `package.json` zdroje, který byl naposledy vydán, a navrhuje Minor = Current + 1. Proto v každém kole, které se bude vydávat, nastav `package.json` na verzi, pod kterou se toto kolo vydá (= poslední vydaný štítek + 1 minor; po v2.99.0 tedy 2.100.0). Pak se štítek vydání a `package.json` vydaného zdroje shodují a příští dialog nabídne správné číslo. Pokud `package.json` zůstane na posledním vydaném štítku, dialog nabídne znovu stejný štítek a aplikace aktualizaci neuvidí.

- Use FieldToggleButton for in-field icon toggles; only NonTaxToggle cells and DateField links retain their geometry. Why: one interaction and accessibility contract.
- Keep bank-statement sections in a focused internal module and translations in DsTexts. Why: a small public form composes shared controls without application persistence.

- Compose document and bank-statement identity through IdentityLine; retain domain account editing in DocumentIdentityLine. Why: separators, typography and number styling have one owner.
- Keep bank-statement translations in per-language modules and calculate toggle spacing on each element. Why: attached consumers inherit locale separation and local control-height overrides.

- Share compact date measurement between forms; keep Field labels truncated with their full title, never dynamically shrink them. Why: text zoom remains readable and label behavior stays stable.

- Resolve pane-sticky headers centrally in ZoomGrid; overflow fallback disables pane stickiness. Why: an inner scroll container must not offset its first row by the outer action bar.
