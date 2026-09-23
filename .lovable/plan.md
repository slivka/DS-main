# Decentní stav menu a akce Nový v gridu

## Výsledek
- Nedostupná položka menu zůstane čitelná; dlouhý štítek nahradí drobná neutrální tečka s nápovědou „Připravujeme“.
- Pokud má grid hlavní akci „Nový“, zobrazí se bezprostředně vpravo od ovládání zoomu.
- Ukázka gridu dostane tlačítko „Nový doklad“ ve správné pozici.

## Technické provedení
- Upravím společnou navigaci AppShellu a zachovám text nápovědy přes stávající vlastnosti.
- V DataGridu zachovám `actions`, ale přesunu jej před doplňkové ovladače výběru, tedy přímo za `ZoomControl`.
- Zvýším patch verzi na 2.6.1 a aktualizuji changelog, roadmapu a katalog změněných komponent.
- Ověřím typovou kontrolu, sestavení a vizuálně menu i řádku akcí gridu.
