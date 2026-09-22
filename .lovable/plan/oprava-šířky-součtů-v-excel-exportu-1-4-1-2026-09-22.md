# Oprava šířky součtů v Excel exportu 1.4.1

## Rozsah
- Rozšířit výpočet šířky sloupců o zobrazenou hodnotu automatického součtu a vlastních součtových řádků.
- Součty formátovat stejnou funkcí jako běžné buňky, aby měření odpovídalo výsledku v Excelu.
- Zachovat a ověřit předávání `exportMeta` z DataGridu; k filtrům připojit aktuální hledání a aktivní sloupcové filtry.
- Upravit vzorová data tak, aby součet částek byl delší než kterákoli jednotlivá částka.
- Zvýšit verzi na 1.4.1 a doplnit roadmapu.

## Ověření
- Doplnit automatickou kontrolu, že šířka částkového sloupce pokryje zobrazený součet.
- Spustit test stažení a otevření vzorového XLSX v podporovaných prohlížečích.
- Ověřit typovou kontrolu a stav sestavení náhledu.

## Technické řešení
- Pro `total: "sum"` sečíst konečné číselné hodnoty sloupce, normalizovat zaokrouhlení a převést přes `displayValue`.
- U `totalRows` mapovat buňky podle `labelSpan` stejně jako při zápisu do listu a měřit je přes `displayValue`.
- Sestavit popis filtrů bez prázdných položek, včetně hledaného výrazu a aktivních hodnot sloupcových filtrů.
