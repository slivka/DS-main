# DS 2.44.0 – doplnění editace dokladu a tisku

## Rozsah
- Doplnit `periodLabel` do nastavení DPH a zobrazit jej jako nápovědu pod Datem DPH; výstraha podaného období má přednost.
- Přidat `dateWarnings` pro pět datových polí a předávat varování příslušnému poli data.
- Rozšířit pokladní PDF o volitelné značky měny s návratem ke kódu měny, pokud značka chybí.
- Upravit ukázku Účetních formulářů, changelog, veřejný popis a verzi na 2.44.0. Metadata zůstanou místní bez `upstream_versions`.

## Ověření
- Přidat testy nápovědy a priority výstrahy, jednotlivých datových varování a měnových značek v PDF.
- Spustit všechny unit testy a ověřit výsledné sestavení.

## Technické poznámky
- `dateWarnings` bude typovaný klíči `issueDate | accountingDate | taxDate | dueDate | vatDate`.
- Do ručně udržovaného katalogu se doplní nové veřejné props a příklady; automaticky generované soubory pravidel se nebudou ručně měnit.
