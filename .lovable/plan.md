# Navigace a kontext horní lišty – DS 2.15.0

## Rozsah
- Rozšířit `AppShell` o výrazně oddělené, sbalitelné skupiny s uloženým stavem a zachovanými odznaky i aktivním stavem.
- Přidat hledání v menu s diakriticky nezávislým filtrem, klávesovým ovládáním, zvýrazněním shod a překryvem pro sbalené menu.
- Upravit `ContextPill`, `CompanySwitcher` a `PeriodSwitcher` na jednořádkový výraznější kontext firmy a období, včetně stavů období a přístupných tooltipů.
- Neměnit chování záložek a panelů; veřejné rozhraní pouze rozšířit.
- Doplnit ukázky, dokumentaci a katalog komponent; vydat verzi 2.15.0.

## Technické provedení
- `AppShell` dostane volitelné props `navStateKey`, `navSearch`, `navSearchPlaceholder` a `navSearchEmptyText`; uložený stav skupin bude oddělený pro hlavní menu a jednotlivé panely.
- Hledání bude používat normalizaci bez diakritiky, společnou cestu otevření jako kliknutí v menu a dočasný překryv při sbaleném menu.
- Skupiny zachovají existující aktivní indikátor a doplní vodicí linku, součet odznaků a indikaci aktivní stránky ve sbalené skupině.
- Přepínač období využije existující stavová data a tokenové barvy; texty, prázdné stavy a kompaktní hodnoty zůstanou přepisovatelné.
- Metadata komponent dostanou popis použití, příklad a nevhodná použití pro změněné veřejné API.

## Ověření
- Automaticky ověřit filtr bez diakritiky, více slov, Enter s modifikátory, Esc, přeskočení zakázaných položek, `/`, ukládání skupin a překryv sbaleného menu.
- V prohlížeči ověřit hlavní, panelové i mobilní menu a čtyři stavy období ve světlém i tmavém režimu.
- Ověřit široké, kompaktní a mobilní rozložení bez kolizí v horní liště.
- Spustit cílené testy, typovou kontrolu a sestavení.
