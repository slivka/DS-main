# Roadmap

## Import design systému z GitHubu (slivka/slivka-design-system)
- [x] Stáhnout a prozkoumat repozitář
- [x] Přenést tokeny (src/styles.css), komponenty (src/components/ds, src/components/ui)
- [x] Přenést hooky (src/hooks) a pomocné funkce (src/lib) dle seznamu
- [x] Přenést ukázkové stránky ze src/routes jako showcase (vč. /components/feedback)
- [x] Nainstalovat závislosti, udržet vzhled a chování beze změny
- [x] Vytvořit .lovable/ konfiguraci (meta.yaml, system.md, sources.yaml) a lovable.toml
- [x] Ověřit build a showcase (doplněn Tailwind plugin do konfigurace překladu; přehled, mřížka, formuláře i zpětná vazba vykresleny bez chyb)

## Verze 1.1.0 (Accounting APP)
- [x] DocumentStatusBadge: stavy draft/filed/posted/locked/cancelled + příznak Schválen
- [x] Nová komponenta PageHeader (layout) + export v ds/index.ts
- [x] Ukázky v showcase (Přehled: Hlavička stránky, Stavy a štítky)
- [x] Aktualizace .lovable/system.md (účetní konvence, PageHeader)
- [x] Verze knihovny 1.1.0

## Verze 1.2.0 (čeština a přepisovatelné texty)
- [x] Opravit slovenské viditelné texty a locale ve všech komponentách design systému
- [x] Přidat společné přepisovatelné texty DataGridu a souvisejících grid komponent
- [x] Přidat české přepisovatelné texty AddressFields / AddressFieldGrid a ostatních formulářů
- [x] Aktualizovat pravidla knihovny a verzi na 1.2.0
- [x] Ověřit typovou kontrolu, sestavení a showcase

## Verze 1.2.1 (zapojení knihovny)
- [x] Zachovat styly při výběrovém načítání komponent
- [x] Zpřístupnit motiv a nastavení data a času přes veřejný vstup
- [x] Přesně připnout ověřené základní závislosti
- [x] Doplnit pravidlo pro načtení firemních písem v připojených aplikacích
- [x] Ověřit typovou kontrolu, sestavení a showcase


## Verze 1.3.0 (standard exportu do Excelu)
- [x] Vytvořit veřejné funkce buildExcelWorkbook a downloadWorkbook
- [x] Převést GridExport vždy na skutečnou Excel tabulku se vzorci a metadaty sloupců
- [x] Doplnit hlavičku sestavy, tisk, vlastnosti souboru, šířky a Navy Trust styl
- [x] Přidat showcase Export do Excelu s účetními daty a kontrolním seznamem
- [x] Aktualizovat pravidla knihovny a verzi na 1.3.0
- [x] Ověřit typovou kontrolu, sestavení, showcase a obsah staženého XLSX

## Verze 1.3.1 (stálé zaoblení při zoomu)
- [x] Zachovat stejné zaoblení tlačítek a výběrů při změně velikosti písma
- [x] Ověřit výběr účetního období ve všech podporovaných měřítkách

## Verze 1.3.2 (zarovnání odznaků v gridu)
- [x] Zarovnat všechny systémové odznaky v datových sloupcích vždy vlevo
- [x] Ověřit typovou kontrolu, sestavení a showcase gridu
- [x] Zajistit spolehlivé stažení platného vzorového XLSX napříč prohlížeči

## Verze 1.3.3 (datumové filtry v gridu)
- [x] Doplnit do datumových sloupců volby podle roku, čtvrtletí a měsíce
- [x] Zachovat výběr jednotlivých dat a kombinování více voleb
- [x] Ověřit typovou kontrolu, sestavení a účetní showcase

## Verze 1.3.4 (kompaktní systémové sloupce)
- [x] Stavové odznaky, datumy, čísla dokladů, VS a účty MD/Dal držet na nejmenší šířce podle obsahu
- [x] Zachovat jednořádkové hodnoty, filtry, řazení a zarovnání
- [x] Ověřit typovou kontrolu, sestavení a skutečné šířky v účetním showcase

## Verze 1.3.5 (automatické testy vzorového Excelu)
- [x] Ověřit stažení vzorového exportu v Chromium, Firefoxu a WebKitu
- [x] Kontrolovat skutečnou Excel tabulku, součtové vzorce, formáty a chybové hodnoty
- [x] Otevírat stažený soubor v LibreOffice a odmítnout hlášení o opravě či poškození
- [x] Ověřit celou testovací sadu, typovou kontrolu a sestavení
