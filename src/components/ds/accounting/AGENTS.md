# Účetní komponenty – pravidla (přesunuto doslova z kořenového AGENTS.md)

- `DocumentForm`: typovaná identita; měna vždy vedle Celkem. FV/ZFV mají firemní účet před Základními údaji; přijaté doklady účet vedle čísla dodavatele a řazení Základní údaje → Datumy → Platební údaje → Částka → Řádky.
- Protistrana a zahrnutí účtu do platebních příkazů se přepínají ikonou uvnitř pole; aplikace řídí stav a DS při změně režimu nemaže data.
- VS je vždy vlevo s tabulkovými číslicemi; KS a způsob platby jsou hledatelné výběry.
- Běžná pole dokladu mají mřížku 14/3/3; data jsou ve flex řádku. DPH je vpravo, „Vstupuje do DPH“ vlevo; skrytí nemaže data a vazba ukazuje zámek.
- Varování dat jdou přes `dateWarnings` do NoticeBar; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Řádky DPH vytváří DB; DS je jen zobrazuje a předběžně počítá v `journal-vat.ts`.
- Zaokrouhlení je poslední připnutý řádek `JournalLinesEditor`; lišta nabízí jen návrh a stav rozepsání.
- `JournalLinesEditor` měří vnitřní šířku; po kaskádě sníží auto zoom nejvýš na 0,75 a až pak roluje.

- Reuse the existing numeric input typography for document totals; derive the embedded sum control size from control-h. Why: amount controls stay aligned with other form fields at every application zoom.
- Derive the KS/SS disabled reason once in DocumentForm and render blank disabled controls in PaymentSection. Why: payment changes preserve layout and never erase application data.

- Keep identity account focus and selection in a focused internal hook. Why: DocumentForm remains below the file limit without changing public behavior.
- Scope compact date geometry to DocumentDatesSection; wrap VAT dates separately when their pair cannot fit. Why: all dates and rings stay visible without changing filters or dialogs.
- Measure dates per field, including labels; shrink only overflowing fields. Key observers by format/labels. Why: preserve neighbours and avoid observers on unrelated edits.

- Keep bank-statement sections in a focused internal module and translations in DsTexts. Why: a small public form composes shared controls without application persistence.
- Share amount discrepancy presentation through AmountDifference in journal and bank-statement forms. Why: one component owns balance-state styling.
- Use IdentityLine.numberContent for controlled statement-number editing and FieldValue for locked identity. Why: identity layout remains shared without domain state.
