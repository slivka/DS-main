# Plan: Slivka DS 2.17.0 – jednotný řádek akcí gridu

## Rozsah
- Přidat veřejné komponenty `GridToolbar`, `GridToolbarSeparator`, `AsOfDateToggle` a `GridToggleButton`.
- Sjednotit DataGrid, TreeGrid a ZoomPane na stejné pořadí akcí, zalamování a ovládání zoomu.
- Rozšířit filtry, exportní menu, akce Přidat / Další, stav k datu a přepnutí Tabulka / Strom.
- Nahradit dosavadní rozbalovací ovládání TreeGridu ikonami a nabídkou úrovní.
- Odstranit spodní linku PageHeaderu.
- Aktualizovat ukázky, veřejné exporty, katalog, pravidla, changelog, roadmapu a verzi na 2.17.0.

## Kompatibilita a změny chování
- Stávající `actions` zůstane podporované a bude před nabídkou dalších akcí.
- Řízené `expandDepth` a `onExpandDepthChange` zůstanou funkční.
- Breaking změny budou výslovně uvedené: nový TreeGrid toolbar, PageHeader bez linky, oranžové seskupení a GridExport místo ExcelExportButton.

## Technické provedení
- `GridToolbar` poskytne levou a pravou skupinu, tokenové oddělovače a zalamování od šířky panelu 560 px bez vodorovného posuvu.
- Sdílené datové typy pro `asOf`, `addAction`, `moreActions` a `extraExports` budou veřejné a použité oběma gridy.
- Ctrl/Cmd+kolečko bude používat jeden výpočet zoomu nad celým blokem; běžné kolečko zůstane rolovat.
- TreeGrid export zachová Excel osnovu a SUBTOTAL, do stejného menu doplní PDF a volitelné exporty.

## Ověření
- Typová kontrola, jednotkové/cílené testy a sestavení.
- Playwright snímky při 100 %, 125 % a šířce 560 px.
- Interakčně ověřit TreeGrid Ctrl/Cmd+kolečko, oranžový filtr/seskupení, modrý stav k datu a pravou pozici Přidat.
- Zkontrolovat metadata každé obsahové stránky a výsledný katalog.
