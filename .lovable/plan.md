# Slivka DS 2.19.0 – bloky levého menu

## Rozsah
- Rozšířit `NavGroup` o volitelné `section?: string` bez změny stávajících vlastností.
- Seskupit po sobě jdoucí skupiny se stejnou sekcí do vizuálního bloku.
- Zachovat dosavadní chování skupin bez sekce, sbalování skupin, navigace, panelů a záložek.

## Zobrazení
- V rozbaleném, mobilním a panelovém menu zobrazit při začátku bloku neklikací nadpis sekce s předepsanou typografií, odsazením a oddělovačem.
- V ikonovém menu nahradit nadpis silnějším oddělovačem s názvem sekce v nápovědě.
- Ponechat současné oddělovače mezi skupinami uvnitř stejného bloku; první skupina bloku nebude mít vlastní horní čáru.
- Při hledání vykreslit sekci pouze tehdy, když po filtrování obsahuje nalezenou položku. Název sekce nebude vstupovat do vyhledávání.

## Ukázka a ověření
- Rozšířit stránku Navigace o přehled bez sekce, dva bloky po dvou skupinách a varianty rozbalená, sbalená a filtrovaná.
- Přidat testy nadpisů sekcí, skrytí prázdné sekce při hledání a původního chování skupin bez sekce.
- Zvýšit verzi na 2.19.0 a doplnit roadmapu, changelog a veřejný katalog komponenty AppShell.
- Spustit typovou kontrolu, jednotkové testy a ověřit sestavení i zobrazení menu. Release se neprovede.

## Technické řešení
- Přidat malou čistou pomocnou funkci, která z filtrovaných skupin odvodí začátky bloků; stejná data použije desktop, mobilní Sheet i panely přes společný `ShellNav`.
- Značky sekcí dostanou stabilní datové atributy pro testy a přístupnou nápovědu v ikonovém režimu.
