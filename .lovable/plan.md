# České a přepisovatelné texty komponent – verze 1.2.0

## Cíl
Sjednotit uživatelsky viditelné texty design systému do češtiny, odstranit slovenské jazykové zbytky a připravit grid pro budoucí slovenský překlad bez změny vzhledu nebo chování.

## Postup
1. Projít všechny komponenty v design systému a opravit slovenské viditelné texty, popisky přístupnosti, nápovědy, prázdné stavy a texty exportů na české výchozí hodnoty.
2. Vytvořit veřejně exportovaný typ `GridTexts` a objekt `DEFAULT_GRID_TEXTS`, který pokryje společné texty DataGridu i jeho vnořených ovládacích prvků.
3. Přidat do `DataGrid` prop `texts?: Partial<GridTexts>`, sloučit jej s českými výchozími texty a předat výsledné texty vyhledávání, filtrům, výběru sloupců, seskupování, stránkování, stavům, výběru řádků a exportu.
4. U samostatně použitelných grid komponent zachovat české výchozí hodnoty a umožnit jejich cílené přepsání přes vhodný `texts` nebo textový prop, aby fungovaly i mimo DataGrid.
5. Změnit české řazení a převod na velká písmena z `sk` / `sk-SK` na `cs` / `cs-CZ` ve všech komponentách design systému.
6. Upravit slovenské komentáře, které popisují logiku poboček a gridu, aby zdroj nebyl jazykově matoucí; logiku samotnou neměnit.
7. Zvýšit verzi knihovny na `1.2.0`, doplnit roadmapu a pravidlo dokumentace, že všechny viditelné texty musí být předávané přes props s českými výchozími hodnotami.
8. Ověřit typovou kontrolu, sestavení a hlavní scénáře showcase včetně mřížky, filtrů, výběru, seskupování a exportní nabídky.

## Technické zásady
- Bez vizuálních změn a bez změn stávající logiky dat.
- Stávající individuální textové props zůstanou funkční; nové společné `texts` je doplní, ne zruší.
- Překladový objekt bude typovaný a exportovaný přes veřejný vstup knihovny.
- Výchozí čeština bude úplná, takže stávající použití bez nového prop zůstane kompatibilní.
