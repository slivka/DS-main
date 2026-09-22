# Standard sloupců účtů MD / DAL – verze 1.5.0

## Rozsah
- Přidat veřejný helper `accountColumns()`, který vytvoří čtyři jednotné účetní sloupce: skryté krátké MD/DAL a viditelné „MD účet“/„DAL účet“.
- Všechny hodnoty připravit jako text přes sdílené formátování účtu, včetně názvu účtu; zachovat je tak pro filtr, hledání, seskupení i export.
- Doplnit oddělenou hodnotu pro číselné řazení účtů a tooltip u zkrácených názvů.
- Zapojit helper do ukázek Datová mřížka a Export do Excelu a sjednotit popisek částkové strany na „DAL“.
- Aktualizovat účetní pravidla, veřejnou verzi 1.5.0 a roadmapu.

## Technické provedení
- Rozšířit definici sloupce o volitelné `sortValue`; ostatní operace nadále používají formátovaný `value`.
- Vytvořit typovaný helper s přepisovatelnými ID a českými popisky, sekcí a šířkou dlouhých sloupců přibližně 220 px.
- Ověřit výchozí viditelnost, nabídku sloupců, tečky ve filtru a XLSX buňku typu text s hodnotou „321.100 - Závazky“.

## Ověření
- Typová kontrola a sestavení.
- Náhled obou ukázek v prohlížeči.
- Stažení vzorového Excelu a kontrola obsahu i typu buňky; přepočet bez chyb.
