# DS 2.41.0 – přepínač „Vstupuje do DPH“

## Rozsah
- Rozšířit nastavení DPH ve formuláři o řízený příznak, režim jen pro čtení a obsluhu změny.
- V pravé části sekce Data zobrazit přepínač pouze plátci a pouze při předání obsluhy změny.
- Při vypnutém příznaku skrýt DUZP i Období DPH bez mazání jejich hodnot; bez nové obsluhy zachovat dnešní chování.
- Doplnit ukázku tří stavů: plátce zapnuto, plátce vypnuto a neplátce.
- Přidat regresní testy všech stavů včetně režimu jen pro čtení.
- Aktualizovat katalog a dokumentaci, zvýšit verzi na 2.41.0 a odstranit `upstream_versions` z místního nastavení vydání.

## Technické provedení
- Použít stávající sdílený Switch a tokenové styly; nové texty vést přes `DocumentFormTexts`.
- Veřejné API `vat` doplnit o `relevant`, `relevantReadOnly` a `onRelevantChange`; stávající položky zůstanou zachované.
- Upravit metadata komponenty v katalogu včetně použití, příkladu a antipatternu.
- Zapsat změnu veřejného API do roadmapy a architektonické pravidlo pouze tehdy, pokud vznikne nové trvalé pravidlo.

## Ověření
- Typová kontrola, lint, všechny unit testy a sestavení.
- Kontrola aktuálního stavu náhledu po změnách.
