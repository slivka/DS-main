# DS 2.75.0 – podmenu a zavírání panelů

## Úpravy
- Přestavět nabídku uložených rozložení, odstranit výchozí rozložení i ikony počtu panelů a upravit veřejné typy bez zpětné kompatibility.
- Zjednodušit nabídku záložky na zavření, přesun, volitelné duplikování a zavření panelu se správnými oddělovači.
- Změnit Zavřít panel tak, aby zavřel všechny jeho záložky, hlídal neuložené změny, ukládal zavřené záložky pro obnovení a aktivoval sousední panel.
- Při slučování rozložení dodržet limit deseti záložek a zavřít nejstarší čisté přebytky s upozorněním.
- Přeskupit uživatelskou nabídku, přidat akci pracovního prostoru a odstranit duplicitní značku vybraného prostoru.
- Odebrat ikonu z nadpisového řádku panelu, zachovat ji v horní liště.

## Ukázka a dokumentace
- Upravit ukázku Navigace a rozložení na nové nabídky.
- Zvýšit verzi na 2.75.0 a doplnit README, systémová pravidla, katalog komponent, roadmapu a technická pravidla.

## Ověření
- Doplnit testy pořadí nabídek, oddělovačů, odstraněných ikon, uživatelské nabídky, zavření panelu, potvrzení rozepsané záložky a limitu při slučování.
- Spustit všechny testy, kontrolu typů a ověřit náhled včetně uživatelské nabídky při zoomu 70 % a 200 %.

## Omezení
- Release se neprovede.
- `.lovable/meta.yaml` se nemění.
