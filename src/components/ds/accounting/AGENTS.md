# Účetní komponenty – pravidla (přesunuto doslova z kořenového AGENTS.md)

- `DocumentForm`: typovaná identita; účet jen v ní, měna vždy vedle Celkem; přijaté doklady řadí Základní údaje → Datumy → Platební údaje → Částka → Řádky.
- Běžná pole dokladu mají mřížku 14/3/3; data jsou ve flex řádku. DPH je vpravo, „Vstupuje do DPH“ vlevo; skrytí nemaže data a vazba ukazuje zámek.
- Varování dat jdou přes `dateWarnings` do NoticeBar; období DPH patří do `vat.periodLabel` a podané období jej nahrazuje výstrahou.
- Řádky DPH vytváří DB; DS je jen zobrazuje a předběžně počítá v `journal-vat.ts`.
- Zaokrouhlení je poslední připnutý řádek `JournalLinesEditor`; lišta nabízí jen návrh a stav rozepsání.
- `JournalLinesEditor` měří vnitřní šířku; po kaskádě sníží auto zoom nejvýš na 0,75 a až pak roluje.
