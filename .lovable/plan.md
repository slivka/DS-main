# DS 2.43.0 – poslední kontrola před vydáním

## Úpravy
- Nahradit pevné šířkové hranice editoru řádků výpočtem ze skutečné šířky, zoomu a aktuálně viditelných sloupců.
- Zachovat Textu nejméně 12 rem, postupně přesouvat zakázky a množstevní sloupce do detailu a nakonec zúžit účty na 6 rem; Akce zůstane poslední.
- Opravit uvedené staré názvy, překlepy, ukázku neplátce a odstranit poslední použití odebraného `periodLabel`.
- Přesunout zapnutý tooltip Nedaňový a výchozí upozornění podaného DPH období do přeložitelných textů.

## Ověření
- Doplnit regresní testy výpočtu sloupců pro režimy ID i PO.
- Spustit unit testy a E2E kontrolu při šířkách 560, 640, 730, 900 a 1 280 px a zoomu 81, 100 a 125 %; ověřit, že tabulka nemá vodorovný posuvník.
- Zkontrolovat náhled a výsledek sestavení; verzi ponechat 2.43.0.

## Technické řešení
- Výpočet bude čistá exportovaná funkce nad modelem sloupců a šířkami v rem, aby byl deterministicky testovatelný.
- Dostupná šířka se převede podle aktuálního zoomu a porovná se součtem pevných sloupců plus minimem Textu; vlastní uživatelské šířky zůstanou respektované.
- Vodorovný posuvník se připustí pouze pod minimální šířkou tabulky přibližně 24 rem.
