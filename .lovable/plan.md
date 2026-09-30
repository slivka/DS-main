# DS 2.73.0 – Edit dokladu 8 a opravy panelů

## Výsledek
- Formulář dokladu sjednotí řádek částky: vpravo bude vždy nerozdělitelná dvojice Celkem a Měna, u cizí měny před ní Kurz a přepočtený domácí součet.
- Identita pokladny a banky už nebude obsahovat měnu; měna bude stejně jako u ostatních dokladů pouze vedle Celkem.
- Datumová varování se přesunou do společného pruhu upozornění a příslušná pole zůstanou viditelně označena s nápovědou.
- Přijaté doklady dostanou požadované pořadí sekcí, rozložení základních a platebních údajů, bankovní účet s nabídkou i ručním zadáním a bezpečné předvyplnění VS.
- AppShell přestane přepisovat titulek stránky, stabilizuje tooltip a vývojová varování a zvýší kontrast odznaku aktivní položky.

## Formulář dokladu
- Upravit veřejné texty formuláře v českém i slovenském katalogu; uživatelské texty nebudou vložené přímo v komponentách.
- Odebrat měnu z `cashBank` identity a upravit pořadí na Směr → Kniha → Období → účet.
- Přestavět částkový blok do dvou nerozdělitelných dvojic. Celkem a Měna budou vždy vpravo a stejně vysoké; cizoměnový Kurz a domácí přepočet se při zúžení přesunou jako celek pod ně doprava.
- Neměnnou měnu zobrazit jako rámeček pole jen pro čtení; dostupný výběr ponechat jako kód se seznamem „kód - název“ a zachovat tooltip důvodu zákazu.
- Sjednotit všechna data do jediného pružného řádku v zadaném pořadí a zmenšit minimum pole na 8,5 rem. Nápovědu období ukotvit k pravému okraji bez vlivu na šířku.
- Datumová varování převést na `NoticeBar` položky v pruhu formuláře; `DateField` dostane jen varovný stav, ikonu a tooltip. Zámky dat zůstanou beze změny.
- Pro přijaté doklady upravit základní údaje na řádky 14/3/3, 14/6 a 20; číslo dokladu dostane span 6 a dynamický popisek podle viditelnosti DPH.
- Přesunout Platební údaje přijatých dokladů před Částku. Bankovní účet u nich bude jen v Základních údajích; platební řádek bude VS, KS, SS a nezalamovaný příznak bez platebních příkazů v šířce 6.

## Bankovní účet a VS
- Přidat samostatný `BankAccountField` s typovanými možnostmi účtu, výchozím účtem, měnou a volbou jiného účtu.
- Ruční účet ověřit existující kontrolou modulo 11 a volitelným seznamem kódů bank; chybu zobrazit pod polem. Prázdná nabídka otevře přímo volné zadání.
- Doplnit veřejné props `bankAccountOptions` a `bankCodes` do `DocumentForm`; komponentu použít u přijatých i vydaných faktur a bankovních dokladů.
- Přidat čistou exportovanou funkci `vsFromDocumentNumber`. Při změně čísla přijatého dokladu aktualizovat VS jen tehdy, když je prázdný nebo stále automaticky odvozený z předchozí hodnoty.
- Při více než 10 číslicích ponechat VS beze změny a zobrazit lokalizovanou nápovědu pod číslem dokladu.

## AppShell a vzhled menu
- Přidat `manageDocumentTitle?: boolean` s výchozí hodnotou `false`; titulek se bude měnit jen při výslovném zapnutí.
- Tooltip zakázaného kontextu držet po celý život komponenty v jednom řízeném režimu.
- Shodná vývojová varování panelů evidovat a vypsat jen jednou.
- Doplnit tokeny aktivní varianty odznaku a použít je na aktivním řádku tmavého i šedého menu; kontrast ověřit pro oba motivy.

## Ukázky a dokumentace
- Rozšířit Účetní formuláře o PO CZK, BA EUR, FV CZK/EUR, FP EUR plátce a FP neplátce včetně dvou bankovních účtů, automatického i ručního VS, dlouhého čísla, pruhu varování a nového pořadí sekcí.
- Zachovat ukázky při 80 %, 100 %, 125 % a ve třech úzkých panelech; odstranit pevné měnové značky z komponent knihovny, data ukázky smějí značky obsahovat jako vstupní data.
- Zvýšit `package.json` na 2.73.0, doplnit README changelog, systémová pravidla, veřejné exporty a katalog komponent. `.lovable/meta.yaml` zůstane beze změny a Release se neprovede.
- V changelogu označit BREAKING změny: identita `cashBank` bez měny, popisek Celkem bez měny a datumová varování mimo pole; nové props bankovního účtu jsou rozšíření API.

## Technické provedení
- Zachovat řízení hodnot výhradně přes `value` / `onChange`; komponenta nebude ukládat stav dokladu mimo formulář.
- `BankAccountField` bude samostatná typovaná, ref-forwarding komponenta se standardním `className`, sémantikou popisku a vstupu a tokenovými stavy.
- Rozložení použije kontejnerové hranice a šířky v rem; popisky a nápovědy se nezalamují, zalomí se vždy celé pole nebo dvojice polí.
- Aktualizovat obohacení změněných komponent v katalogu (`usage`, příklad, antipatterns) bez ručního přepisování generovaných pravidel.

## Ověření
- Doplnit jednotkové testy pro popisek a polohu měny, všechny identity, výšku polí, pořadí sekcí, span 6, dynamický popisek čísla, pruh datumových varování a validaci bankovního účtu.
- Otestovat `vsFromDocumentNumber` pro běžné číslo, úvodní nuly, mezery, žádné číslice a 11 číslic; otestovat zachování ručně zadaného VS.
- Doplnit regresní testy AppShellu pro titulek, stabilní tooltip, jednorázová varování a token aktivního odznaku.
- Spustit všechny jednotkové testy, kontrolu typů a sestavení.
- V prohlížeči ověřit požadované doklady při 80/100/125 %, tři panely, zalamování dvojic, datumová upozornění a kontrast odznaků ve světlém i tmavém menu.