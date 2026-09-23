# AppShell 2.3.0 – adaptivní lišta a období

## Rozsah
- Rozšířit PeriodSwitcher o jasný stav bez výběru a bez dostupných období včetně volitelného založení období.
- Upravit ContextPill tak, aby uměl kompaktní zobrazení, ztlumenou hodnotu, stavovou tečku a tooltip bez změny stávajícího použití.
- Doplnit AppShell o automaticky kompaktní lištu pod 1 280 px, mobilní uspořádání pod 768 px a klávesovou zkratku Ctrl+B.
- Zachovat řízené sbalení přes `collapsed` / `onCollapsedChange`; automatické sbalení použít jen do první výslovné volby uživatele.
- Zajistit jednu řádku bez vodorovného posuvníku a ponechat hledání, panely i oznámení dostupné na mobilu.
- Upravit ukázku Navigace: ikona Nastavení firmy, oba prázdné stavy období, sbalené menu a volba šířky 1 440 / 1 100 / 390 px.
- Zvýšit verzi na 2.3.0 a aktualizovat changelog, roadmapu, pravidla a katalog komponent.

## Technické provedení
- Pro sledování hranic 1 280 a 768 px použít sdílené reakce na media query; nevytvářet duplicitní varianty navigace.
- Kontextovým přepínačům předat režim z AppShellu tak, aby desktop zůstal dvouřádkový, užší šířka jednořádková a mobil maximálně úsporný.
- Tlačítko sbalení ponechat ve spodní části bočního menu s pevnou ikonovou podobou ve sbaleném stavu a přidat Ctrl+B mimo textové vstupy.
- Veřejné texty a nové stavy ponechat přepisovatelné přes vlastnosti s českými výchozími hodnotami.

## Ověření
- Typová kontrola a sestavení.
- Prohlížečová kontrola šířek 1 440, 1 100 a 390 px: bez zalomení či vodorovného posuvu, správné kontexty, dostupné akce a mobilní Sheet.
- Kontrola prázdných stavů období, založení období, Ctrl+B a řízeného sbalení menu.
