# Čitelnost a orientace DS 2.11.0

## Rozsah
- Upravit světlé a tmavé tokeny ploch, okrajů, stínů, stavových barev a typografické škály.
- Zachovat bílé pracovní karty, formuláře, dialogy a mřížky proti jemně modrému pozadí stránky; horní lištu a levé menu ponechat bílé a oddělené linkou.
- Převést aktivní hledání, filtry, počet filtrů a štítky filtrů na nový oranžový token `filter-active`; červenou ponechat pouze chybám, odstranění a záporným částkám.
- Doplnit modrý levý pruh pouze vybranému řádku mřížky.
- Sjednotit nadpisy, popisky, záhlaví a součty na Work Sans bez verzálek a zvětšeného prokládání; JetBrains Mono ponechat jen identifikátorům a kódům.
- Částky zobrazovat i zadávat ve Work Sans s tabulkovými číslicemi a záporné hodnoty formátovat znakem `−`.
- Odstranit duplicitní podklad záhlaví mřížky a nepoužívané webové barevné tokeny.

## Ukázky a dokumentace
- Upravit typografickou ukázku: samostatně částka ve Work Sans a účet `221.001` v JetBrains Mono.
- Aktualizovat odkazy na řezy písem, komentář sdíleného pozadí a pravidla design systému.
- Vydat minor verzi `2.11.0` a stručně zapsat změny do changelogu a roadmapy.

## Technické provedení
- Hlavní zásahy budou v tokenové a stylové vrstvě; v komponentách pouze cílené třídy pro odznak filtrů, štítky filtrů, identifikátory a ukázku.
- `AppShell` se změní jen tehdy, pokud současné `bg-card` a okraje nevyhoví požadovanému oddělení ploch.
- Export do Excelu ani jeho formátování se nebude měnit.

## Ověření
- Typová kontrola a automatické testy včetně Excel exportu.
- Vizuální kontrola Přehledu, Datové mřížky a Účetních formulářů ve světlém i tmavém režimu.
- U mřížky ověřit aktivní filtr, počet filtrů, vybraný řádek, součty a zoom 81 % / 125 %.
- Ověřit tisk/PDF s tmavě modrým nadpisem a potvrdit, že Excel export zůstal funkčně beze změny.
