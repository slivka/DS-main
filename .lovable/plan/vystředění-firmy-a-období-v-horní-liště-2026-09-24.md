# Vystředění firmy a období v horní liště

## Rozsah
- Umístit volby firmy a účetního období na vodorovný střed celé obrazovky.
- Při zmenšení okna je automaticky přesunout vlevo pouze tehdy, když by zasahovaly do ovládacích ikon vpravo.
- Zachovat současné kompaktní zobrazení na menších šířkách a mobilní nabídku.
- Odebrat ikonu budovy z volby firmy; ostatní obsah a chování výběru zůstanou stejné.

## Technické provedení
- Horní lišta změří prostor mezi středovou volbou a pravou skupinou ovládacích prvků a podle skutečné dostupné šířky přepne mezi vystředěnou a levou polohou.
- Přepočet proběhne při změně velikosti okna i obsahu lišty, aby fungoval s různým počtem akcí.
- Veřejné vlastnosti komponent zůstanou beze změny, takže není nutné zvyšovat verzi knihovny.

## Ověření
- Zkontrolovat široké, střední a mobilní zobrazení bez překryvu nebo vodorovného posuvu.
- Ověřit otevření a zavření výběru firmy i období po změně rozložení.
- Ověřit typovou kontrolu a sestavení.
