# Excel export 1.3.0

## Rozsah
- Oddělit čisté sestavení a stažení sešitu do veřejných funkcí `buildExcelWorkbook` a `downloadWorkbook`.
- Vždy vytvořit skutečnou Excel tabulku, sloučit víceřádková záhlaví, přenést seskupení do osnovy a součty do vzorců tabulky/SUBTOTAL.
- Přidat typovaná metadata sloupců a automaticky je vytvářet z definic sloupců DataGridu.
- Zavést jednotné číselné formáty, zarovnání, šířky, zalamování, hlavičku sestavy, tiskové nastavení a vlastnosti souboru.
- Zachovat PDF a HTML export beze změny.
- Přidat stránku „Export do Excelu“ s účetními daty, seskupenými záhlavími, samostatným stažením a kontrolním seznamem pravidel.
- Aktualizovat veřejné exporty, pravidla knihovny, znalosti, roadmapu a verzi na 1.3.0.

## Ověření
- Typová kontrola a automatické sestavení náhledu.
- Kontrola stránky na počítači i mobilu a stažení vzorového souboru.
- Načtení staženého XLSX přes ExcelJS a ověření tabulky, součtových vzorců, formátů, zarovnání, šířek, osnovy a tiskových nastavení.

## Technické poznámky
- Výchozí číselný formát bude `#,##0.00;[Red]-#,##0.00`; výjimky vzniknou jen z `columnMeta`.
- Barvy Excelu budou odvozené z Navy Trust tokenů a předané jako výchozí exportní motiv.
- `DataGridColumn.exportType` určí explicitní výjimky; `numeric`, `decimals`, `align`, `total`, `section` a šířka doplní ostatní metadata automaticky.
