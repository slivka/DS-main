# Účetní komponenty – pravidla (přesunuto doslova z kořenového AGENTS.md)

- `DocumentForm`: typovaná identita; měna vždy vedle Celkem. FV/ZFV mají firemní účet před Základními údaji; přijaté doklady účet vedle čísla dodavatele a řazení Základní údaje → Datumy → Platební údaje → Částka → Řádky.
- Protistrana a zahrnutí účtu do platebních příkazů se přepínají ikonou uvnitř pole; aplikace řídí stav a DS při změně režimu nemaže data.
- VS je vždy vlevo s tabulkovými číslicemi; KS a způsob platby jsou hledatelné výběry.
- Běžná pole dokladu mají mřížku 14/3/3; data jsou ve flex řádku. DPH je vpravo, „Vstupuje do DPH“ vlevo; skrytí nemaže data a vazba ukazuje zámek.
- Varování dat jdou přes `dateWarnings` do NoticeBar; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Řádky DPH vytváří DB; DS je jen zobrazuje a předběžně počítá v `journal-vat.ts`.
- Zaokrouhlení je poslední připnutý řádek `JournalLinesEditor`; Součet, Zaokrouhlení a Rozdíl s nabídkou dorovnání patří do patičky, lišta je nenabízí.
- `JournalLinesEditor` měří vnitřní šířku; po kaskádě sníží auto zoom nejvýš na 0,75 a až pak roluje.

- Reuse the existing numeric input typography for document totals; derive the embedded sum control size from control-h. Why: amount controls stay aligned with other form fields at every application zoom.
- Derive the KS/SS disabled reason once in DocumentForm and render blank disabled controls in PaymentSection. Why: payment changes preserve layout and never erase application data.

- Keep identity account focus and selection in a focused internal hook. Why: DocumentForm remains below the file limit without changing public behavior.
- Scope compact date geometry to DocumentDatesSection; wrap VAT dates separately when their pair cannot fit. Why: all dates and rings stay visible without changing filters or dialogs.
- Measure dates per field, including labels; shrink only overflowing fields. Key observers by format/labels. Why: preserve neighbours and avoid observers on unrelated edits.

- Keep bank-statement sections in a focused internal module and translations in DsTexts. Why: a small public form composes shared controls without application persistence.
- Share amount discrepancy presentation through AmountDifference in journal and bank-statement forms. Why: one component owns balance-state styling.
- Use IdentityLine.numberContent for controlled statement-number editing and FieldValue for locked identity. Why: identity layout remains shared without domain state.

- Keep document-form translations in per-language modules consumed by DsTexts. Why: the central catalogs remain readable and below the source line limit.
- Compute recap home totals inside the DS from document totals and rates; DocumentForm supplies its derived total. Why: applications must not duplicate conversion logic.
- Compose document sections separately and apply date links through a focused hook and pure helper. Why: orchestration stays readable and date logic is testable.

- Gate document-date initialization writes with effective read-only state, including final statuses. Why: opening a finalized document must never mark it dirty.
- Form issues flow through FormIssue (issues/saveFailed/validationActive); server items always show, client items after the first save attempt; the app removes server items via onFieldChange. Why: one deduplicated live list, never repeated messages.
- A locked VS is a preview only; the DS stores just variableSymbolLinked. Why: the database owns variable_symbol_auto.

- Daň skupin kód × sazba počítá jen `computeVatGroups` (stejně jako DB); editor rozpočtenou daň promítne do náhledu přes `applyVatAllocation`. Why: náhled, rekapitulace a součty dávají stejný výsledek jako databáze.
- Stav otevřeného pomocníka Cena s DPH drží editor, ne buňka. Why: buňka se při aktivaci bubliny stavu přemontuje.

## Shared accounting contracts

- Keep locked bank-account reasons in a shared internal FieldValue composition. Why: issued and received accounts must share truncation, tooltip and no-lock geometry.
- Rate-source and rate-update tooltips use sibling triggers. Why: hovering the update action must expose only its own explanation.
- Use bankAccountOptionValue in selections and notices. Why: IBAN-only identity stays consistent.
- Compose document and bank-statement identity through IdentityLine; retain domain account editing in DocumentIdentityLine. Why: separators, typography and number styling have one owner.
- Keep bank-statement translations in per-language modules and calculate toggle spacing on each element. Why: attached consumers inherit locale separation and local control-height overrides.
- Keep VAT exchange rates as rate/unit pairs and compare tolerances with exact cross-products. Why: division before conversion loses decimal halves.
- Form save shortcuts (Ctrl/Cmd+S, Ctrl/Cmd+Enter → onSaveAndClose) go through handleDocumentSaveShortcut and yield to nested handlers that already prevented the event. Why: the journal editor keeps Ctrl+Enter for new lines.
- Read-only identity accounts size to their text; only the open selection uses the measured width. Why: the pencil stays next to the account name.
