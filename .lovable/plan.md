# Datumové volby ve filtru gridu

## Rozsah
- Rozpoznat datumové sloupce podle `exportType: "date" | "datetime"`.
- V jejich filtru zobrazit hierarchické rychlé volby **Rok → Čtvrtletí → Měsíc** a zachovat seznam jednotlivých dat.
- Výběr roku, čtvrtletí nebo měsíce vyfiltruje všechny odpovídající řádky; více voleb půjde kombinovat.
- České názvy a popisky doplnit do společných přepisovatelných textů gridu.
- Ostatní typy sloupců a vzhled gridu ponechat beze změny.

## Technické provedení
- Rozšířit metadata filtru o typ datumového sloupce a kanonický datumový klíč.
- Přidat skupinové hodnoty pro rok (`2026`), čtvrtletí (`2026-Q1`) a měsíc (`2026-03`) bez kolize s přesnými daty.
- Upravit filtrování tak, aby skupinové volby porovnávalo s původní hodnotou řádku.
- Zvýšit verzi knihovny a aktualizovat roadmapu i katalog komponent.

## Ověření
- Ověřit rok, čtvrtletí, měsíc i přesné datum na ukázkovém účetním gridu.
- Ověřit kombinaci více voleb, typovou kontrolu a sestavení.
