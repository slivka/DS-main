# DS 2.23.0 – stabilní kontext a jednořádkové ovládání gridu

## Výsledek
- Firma bude na počítači nejméně stejně široká jako období a mezi nimi bude skutečný viditelný oddělovač.
- Kniha i období v kontextovém řádku budou zarovnané vlevo; běžná období si zachovají krátkou stabilní šířku a dlouhé volby se rozšíří jen podle potřeby.
- Panel filtrů se otevře přímo pod řádkem akcí, zachová přirozené šířky polí, zoom, hustotu i tmavý režim.
- Řádek akcí zůstane vždy jednořádkový. Podle skutečné dostupné šířky přesune méně důležité skupiny do jediné nabídky ⋯, přičemž Obnovit zůstane úplně vpravo.
- Přidání záznamu bude vždy primárně modré a křížek hledání se zobrazí jen při zadaném textu.

## Implementace
1. Doplnit sdílené měření horního kontextu bez změny veřejných props a vložit skutečný oddělovač mezi firmu a období.
2. Upravit vnitřní zarovnání a výpočet šířky `GridBookSelect` a `GridPeriodFilter`.
3. Přestylovat `GridFilterPanel` jako samostatný navazující řádek; doplnit stav otevřeného tlačítka Filtr a pravidla přirozených šířek ovládacích prvků.
4. Doplnit sdílené měření dostupné šířky řádku akcí pomocí `ResizeObserver` a použít stejné stupně přesunu skupin v DataGridu i TreeGridu.
5. Aktualizovat ukázky horní lišty a Datové mřížky, verzi 2.23.0, changelog, roadmapu a dokumentaci komponent.
6. Doplnit testy pro zarovnání, šířky, pořadí panelu, dynamický přesun skupin, primární akci a podmíněný křížek hledání.

## Ověření
- Typová kontrola, lint, jednotkové testy a sestavení.
- Vizuální kontrola světlého i tmavého režimu při 75 %, 100 % a 125 %.
- Kontrola šířek pod 640 px a přibližně 800 px pro DataGrid i TreeGrid.

## Předpoklad
Veřejné API zůstane beze změny; chování bude řízené uvnitř design systému.
