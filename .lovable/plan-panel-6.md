# DS 2.123.0 – Panel záznamu 6

- Rozšířit existující panel o ikonové záložky, jednořádkové záhlaví a řízené táhlo; přidat sdílené tlačítko a řádek nástrojů do hlavičky a gridu.
- Upravit přílohy, poznámky, historii a propojené záznamy bez změny doménových pravidel nebo potvrzení z 2.122.0. Zdroj oddělit do samostatného náhledu při zachování starého použití.
- Doplnit překlady, veřejné exporty, katalogové ukázky a regresní testy. Ověřit širokou a úzkou plochu i zoom.
- Pokud se celé kolo nevejde, dokončit body 1–3 a 5–8; ostatní přesně ponechat v roadmapě. Nevydávat, vydaná verze zůstává 2.122.0.

## Technické provedení
- Táhlo a pomocné ovladače v samostatných modulech do 300 řádků. Stávající velké orchestrátory PageHeader/GridFrame/DataGrid upravit pouze v místech slotů; nesouvisející dělení by zvětšilo rozsah.
- `check:quick --harness`, cílené testy; závěrem `check:full --harness`, katalog bez odebrání. Automatická kontrola provede typy a sestavení.