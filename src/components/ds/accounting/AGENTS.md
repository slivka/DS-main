# Účetní komponenty – pravidla (přesunuto doslova z kořenového AGENTS.md)

- `DocumentForm`: typovaná identita; měna vždy vedle Celkem. FV/ZFV mají firemní účet před Základními údaji; přijaté doklady účet vedle čísla dodavatele a řazení Základní údaje → Datumy → Platební údaje → Částka → Řádky.
- Protistrana a zahrnutí účtu do platebních příkazů se přepínají ikonou uvnitř pole; aplikace řídí stav a DS při změně režimu nemaže data.
- VS je vždy vlevo s tabulkovými číslicemi; KS a způsob platby jsou hledatelné výběry.
- Běžná pole dokladu mají mřížku 14/3/3; data jsou ve flex řádku. DPH je vpravo, „Vstupuje do DPH“ vlevo; skrytí nemaže data a vazba ukazuje zámek.
- Varování dat jdou přes `dateWarnings` do NoticeBar; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Řádky DPH vytváří DB; DS je jen zobrazuje a předběžně počítá v `journal-vat.ts`.
- Zaokrouhlení je poslední připnutý řádek `JournalLinesEditor`; lišta nabízí jen návrh a stav rozepsání.
- `JournalLinesEditor` měří vnitřní šířku; po kaskádě sníží auto zoom nejvýš na 0,75 a až pak roluje.
