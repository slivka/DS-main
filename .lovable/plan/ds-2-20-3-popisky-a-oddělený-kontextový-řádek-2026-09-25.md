# DS 2.20.3 – popisky a oddělený kontextový řádek

## Co změním
- Rozšířím `GridContextBar` o volitelné texty `bookLabel` a `periodLabel` s českými výchozími hodnotami.
- Popisky propojím s příslušnými ovládacími prvky pomocí přístupnostních vazeb; u textové knihy zachovám tučný název.
- Kontextový řádek dostane odlišné tokenové pozadí záhlaví, spodní linku, nižší výšku a bílé výběry. Ve tmavém režimu použije stávající tmavé tokeny.
- Upravím skládání DataGridu a TreeGridu tak, aby kontext, akční řádek a tabulka tvořily jeden blok s jedním vnějším okrajem a stínem.
- Sjednotím mezeru mezi hlavičkou stránky a gridem v pravidlech a ukázkách.

## Ukázky a ověření
- Doplním ukázky pro tři knihy, jednu knihu, samotné období a TreeGrid.
- Přidám testy českých i vlastních popisků a jejich vazby na výběry.
- Ověřím typy, všechny jednotkové testy, sestavení a vzhled při 75 %, 100 %, 125 %, v kompaktní hustotě a tmavém režimu.

## Vydání
- Zvýším verzi na 2.20.3 a aktualizuji changelog, roadmapu, pravidla a katalog design systému.
- Veřejné API se pouze rozšíří; bez breaking changes. Release nevytvořím.
