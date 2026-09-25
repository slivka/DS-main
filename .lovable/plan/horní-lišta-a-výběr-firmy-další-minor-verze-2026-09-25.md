# Horní lišta a výběr firmy – další minor verze

## Co upravím
- Zjednoduším výběr firmy na hledání a jediný nepojmenovaný seznam všech firem; odstraním veřejné volby pro poslední firmy.
- Zajistím, že výběr firmy, období i založení nové položky vždy zavře otevřenou nabídku přes řízený stav.
- Sjednotím geometrii štítků firmy a období. Firma dostane neutrální obrys, ikonu budovy, zkrácení s nápovědou a odpovídající tmavý režim; období zachová stavové barvy a dostane stavový obrys.
- Rozšířím ukázku o všech pět stavů období ve světlém i tmavém režimu, kompaktní šířku a otevřený seznam firem bez skupin.
- Navýším verzi z 2.21.2 na 2.22.0 a doplním changelog, roadmapu, pravidla i veřejný katalog komponent.

## Ověření
- Přidám testy odstraněných voleb, zavírání nabídek a stavových tříd.
- Spustím typovou kontrolu, lint, jednotkové testy a sestavení.
- V náhledu ověřím světlý, tmavý a kompaktní stav i obsah otevřeného výběru firmy.

## Technické poznámky
- Odstranění `recentIds`, `recentLabel` a `allLabel` z `CompanySwitcherProps` je záměrná breaking změna v minor verzi 2.22.0; ukázky a projektové použití budou před změnou prověřeny.
- `WorkspaceCompanySwitcher` zachová své stávající veřejné rozhraní; jeho firemní výběr převezme stejný neutrální vizuální jazyk tam, kde to jeho současná struktura umožňuje.
