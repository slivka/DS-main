# DS 2.136.0 – záporné řádky a návrhy vytěžení

- Zachovat znaménko při převodu řádku k uložení. Prověřit DPH, součty, rozdíl, zaokrouhlení a zadávání záporné částky; nulová částka zůstává neplatná.
- Doplnit návrhy do všech polí hlavičky a buněk účtu, zakázky, DPH, částky a textu. Chyba má přednost, ruční změna oznamuje zrušení návrhu rodiči a F8 prochází hlavičku i řádky.
- Rozšířit ukázku Panel záznamu o přijatou fakturu, regresní unit testy a nejvýše jeden dotčený E2E spec.
- Doplnit migraci a seznam klíčů do CHANGELOGu a roadmapy 2.136.0; spustit úplnou kontrolu bez vydání.

## Technické provedení

- Hlavička použije společné přiřazení návrhů podle identifikátorů polí, aby se FV/FP/ZFV/ZFP/PO/BA/ID nerozcházely. Aplikace zůstává vlastníkem návrhů i dat.
- Buňky použijí stávající stavové bubliny a tokeny; změna nesmí zvětšit výšku.
- Stávající soubory nad 300 řádků zůstávají orchestrátory a datové kontrakty; nová logika návrhů bude v malých samostatných modulech.
- Package/meta ponechat na poslední vydané verzi 2.135.0. Release provádí Claude.