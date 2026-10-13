# Edit dokladu 13b – opravy bez vydání

## Co se změní
- Výpis a doklad dostanou stejný identifikační řádek a stejné ovládání ukládání.
- Opravit rozměry ND, názvy datumových vazeb a vysvětlení zamčených přepínačů.
- Doplnit překlady, pravdivý přehled změn a zpřesnit měření popisků a ikon.
- Zachovat verzi 2.100.0; nic nevydávat a nic neodstraňovat z katalogů.

## Technické provedení
- Extrahovat společnou IdentityLine; využít RecordActionBar a společné klávesové zkratky.
- Přidat DateFieldLink.label a označit ignorované starší texty jako nepovinné deprecated.
- Překlady výpisu rozdělit do jazykových modulů; rezervu přepínače počítat lokálně.
- Katalogy upravit pouze u dotčených komponent a porovnat také řádky props s 98810718.
- Existující soubory nad 300 řádků (DateField a DocumentForm) zůstávají pohromadě: cílené změny jejich kontraktu nevyžadují širší refaktoring.

## Ověření
Unit testy, E2E Chromium/Firefox/WebKit, lint a formát; automatický sestavovací a typový výsledek. Ruční tsc ani build prostředí nepovoluje; tuto neprovedenou kontrolu výslovně uvést.
