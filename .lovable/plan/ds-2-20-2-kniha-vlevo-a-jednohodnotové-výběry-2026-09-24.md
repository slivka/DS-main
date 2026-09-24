# DS 2.20.2 – kniha vlevo a jednohodnotové výběry

## Rozsah
- Přesunout knihu na začátek `GridContextBar`, mezi knihu a období vložit hustotně řízený oddělovač a popover knihy zarovnat doleva.
- Rozšířit konfiguraci knihy o režim jen pro čtení; jedinou nebo needitovatelnou knihu zobrazovat jako tučný text, nikdy jako zakázaný výběr.
- Rozšířit formulářový `BookSelect` o výchozí textové zobrazení jediné aktivní knihy a automatické doplnění její hodnoty.
- Doplnit požadované ukázky pro více knih, jednu knihu, režim jen pro čtení a formulář s jedinou knihou.
- Aktualizovat pravidla, veřejný katalog, changelog, roadmapu a verzi na 2.20.2.

## Technické detaily
- Zachovat stávající chování vícečetného editovatelného výběru a veřejné API pouze rozšířit.
- Doplnit renderovací testy pro textové zobrazení bez tlačítka/comboboxu, režim `readOnly`, oddělovač a automatický výběr jediné knihy.
- Ověřit typy, jednotkové testy, automatický build a výsledné ukázky v prohlížeči.
