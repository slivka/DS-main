# DS 2.20.1 – škálování kontextového řádku gridu

## Implementace
- Rozšířit `GridContextBar` o volitelné `zoom` a `density`; bez nich převezme hodnoty z `useGridZoomContext`, jinak použije 100 % a normální hustotu.
- Použít stejné měřítko písma, atribut hustoty, řádkové rozestupy a ovládací třídy jako `GridToolbar`; pevné rozměry ovládacích prvků převést na `em`.
- Předat aktuální zoom a hustotu z `DataGrid` a `TreeGrid`. Kontextový řádek zůstane uvnitř společného bloku, takže Ctrl/Cmd + kolečko bude dál obsluhovat `useWheelZoom`.

## Dokumentace a verze
- Doplnit pravidlo do systémových pravidel.
- Zvýšit verzi na 2.20.1 a přidat nejnovější záznam do changelogu, roadmapy a veřejného katalogu.

## Ověření
- Doplnit test výchozích hodnot a dědění zoomu/hustoty.
- Spustit typovou kontrolu, všechny jednotkové testy a ověřit automatický build.
- V prohlížeči porovnat Doklady se třemi knihami a TreeGrid při 60 %, 100 %, 140 % a kompaktní hustotě; zkontrolovat také Ctrl/Cmd + kolečko nad kontextovým řádkem.
