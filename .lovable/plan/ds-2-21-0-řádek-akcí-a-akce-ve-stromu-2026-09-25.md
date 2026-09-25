# DS 2.21.0 – řádek akcí a akce ve stromu

## Implementace
- Sjednotit pořadí `GridToolbar` v DataGridu a TreeGridu: vytvoření vlevo, nástroje uprostřed a obnovení úplně vpravo.
- Pro šířku pod 640 px ponechat vlevo vytvoření, přepnutí pohledu a rozbalení; vpravo hledání, filtr a vždy dostupné menu dalších nástrojů.
- Přesunout export, sloupce, seskupení, hustotu, zoom a obnovení do mobilní skupiny „Nástroje“ v `GridMoreMenu`.
- Upravit `GridExpandControls`, aby rozbalení ani sbalení nemělo indikátor nabídky a jedna úroveň se rozbalila přímo.
- Rozšířit akce DataGridu o důvody zakázání a stín sticky sloupce při vodorovném posunu; zachovat neskrývatelnost a pevnou šířku.
- Přidat TreeGridu shodný sticky sloupec akcí, potvrzení odstranění, důvody zakázání a pravidlo dvojkliku.

## Ukázky a pravidla
- Aktualizovat společnou ukázku tabulky/stromu, zakázané odstranění a úzký panel.
- Přepsat pravidla řádku akcí v systémové dokumentaci a veřejném katalogu.
- Nastavit verzi 2.21.0 a doplnit changelog a roadmapu bez breaking changes.

## Ověření
- Doplnit testy pořadí, úzkého režimu, důvodů zakázání, dvojkliku a stromových akcí.
- Ověřit typy, jednotkové testy, sestavení a vzhled v širokém i úzkém gridu.
