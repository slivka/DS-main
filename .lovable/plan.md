# DS 2.20.3 – dokončení kontextového řádku

## Implementace
- Zachovat hotové popisky „Kniha:“ / „Období:“, oddělené záhlaví gridu a jednotnou mezeru pod nadpisem.
- Upravit víceknihový výběr na stabilní šířku podle nejdelšího dostupného popisku bez měření v JavaScriptu; dlouhé hodnoty omezit a zpřístupnit celé přes nápovědu.
- Stejným překryvným principem stabilizovat šířku období pomocí typických popisků odvozených z aktuálního období.
- Přidat `contextRight` do `GridContextBar`, `DataGrid` a `TreeGrid`; řádek se zobrazí i jen s pravým obsahem.
- Přidat přístupný `GridSegmentedToggle` s klávesovými šipkami, neutrální výchozí hodnotou a oranžovým aktivním filtrem.
- Přidat `GRID_DIRECTION_OPTIONS` a `filterByDirection`, poté je zapojit do ukázky Pokladny s více i jednou knihou.

## Dokumentace a vydání
- Rozšířit systémové pravidlo, changelog a roadmapu v rámci stejné verze 2.20.3.
- Doplnit veřejné exporty a katalog o nové vlastnosti, komponentu, příklad a nevhodná použití.

## Ověření
- Přidat testy stabilní šířky, pravého obsahu, neutrálního/oranžového stavu, klávesnice a směrového filtru.
- Ověřit typy, testy a automatické sestavení.
- V náhledu zkontrolovat 75 %, 100 %, 125 %, kompaktní hustotu a tmavý režim.

Bez breaking changes. Release se nevytváří.
