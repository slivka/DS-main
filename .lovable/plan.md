# DS 2.43.0 – dokončení části B po kontrole

## Rozsah

- Verzi ponechat na **2.43.0** a mimo vyjmenované opravy nic neměnit.
- Opravit editaci řádků tak, aby první napsaný znak byl okamžitou hodnotou editoru i řádku, podporoval `-` a desetinnou čárku a neztratil se při Enter, Tab ani rozostření.
- Sjednotit ukončení editace textových, číselných a výběrových buněk; Tab a Shift+Tab ve výběrech potvrdí aktivní volbu a pokračují mezi editovatelnými buňkami i řádky.
- Přestavět adaptivní sloupce bez běžného vodorovného posuvníku: šířku změří `ResizeObserver`, méně důležité údaje se přesunou do detailu v daném pořadí a účet se v úsporném režimu zkrátí na číslo s tooltipem názvu.
- Sloupec Akce vynutit vždy poslední a nepřesunutelný; staré uložené pořadí a viditelnost editoru oddělit novou verzí klíče. VS a Partner v ID ponechat výchozí skryté i při existujících datech.
- Opravit rozbalování aktivní záložky rekapitulace, šedý vzhled celých připnutých řádků a převést její vestavěné texty do `texts`.
- Upravit částkovou část formuláře, svislé pořadí DUZP → Datum DPH, tooltip zamčeného Data DPH, vypnuté ikonové přepínače a odstranit nepoužívané `DocumentForm.periodLabel`.
- Odstranit pevné výchozí měny a mapování symbolů z platebního kalendáře a formátování; české formáty sjednotit na `cs-CZ`.
- Opravit poškozenou češtinu a slovenštinu, pravidla Alt+N / Datum DPH a přejmenovat aktuální výskyty na „Zaokrouhlení“ a „Kurzové zaokrouhlení“; starší záznamy historie změn ponechat.
- Odškrtnout body 2.43.0 v roadmapě a zachovat metadata místní knihovny bez `upstream_versions`.

## Veřejné změny

- `DocumentForm.periodLabel` bude odstraněn.
- `DocumentFormTexts` získá samostatný formátovatelný text `totalHome` a text nápovědy zamčeného Data DPH.
- `PaymentScheduleEditor` bude vyžadovat měnu nebo značku měny předanou aplikací; žádná CZK nebude výchozí.
- `JournalLinesRecap` získá `texts` pro názvy záložek, sloupce, součty a oba druhy zaokrouhlení.
- Výběry zakázky, partnera a MJ získají stejné řízené oznámení otevření/zavření jako výběr účtu, aby editor mohl správně dokončit navigaci.

## Technické provedení

- Editor oddělí rozepsaný text od číselné hodnoty. Seed se zapíše do řádku při zahájení editace, ale dočasné `-`, `,` a `-,` zůstanou po dobu psaní platným vstupem; commit proběhne při Enter, Tab a blur, Esc obnoví kopii původního řádku.
- Navigace bude mít společný handler pro vstupy i výběry. U výběrů Tab/Shift+Tab nejprve předá klávesu Radix Commandu pro potvrzení aktivní položky a po uzavření přesune fokus správným směrem.
- Adaptivní vrstva bude kombinovat uživatelskou viditelnost s automaticky skrytými sloupci; automaticky skryté hodnoty zůstanou dostupné v detailu. Výpočet zohlední skutečnou šířku kontejneru a zoom, Text drží minimálně 12 rem a Akce se při každém pořadí normalizují na konec.
- Přepínače dostanou přeškrtnutí jako vizuální vrstvu nad ikonou bez nové jednorázové varianty.
- Veřejný katalog bude aktualizován pro změněné props a příklady; generované referenční soubory nebudou ručně měněny.

## Ověření

- Rozšířit jednotkové testy pro seed textu, VS, domácí/cizí částky, množství a ceny, mezistavy `-` / `,`, blur, Esc, Tab/Shift+Tab a zavření všech výběrů.
- Doplnit testy adaptivních sloupců, vynucených Akcí, nové verze uloženého nastavení, rekapitulace, měn a formuláře.
- Spustit typy, lint, produkční sestavení a všechny jednotkové i dotčené prohlížečové testy; uvést přesný počet.
- Vizuálně ověřit účetní ukázky při 560 / 1 280 / 1 920 px, zoomu 81 / 100 / 125 % a ve světlém i tmavém režimu; potvrdit, že běžné šířky nemají vodorovný posuvník a pod přibližně 24 rem se může objevit.
- Na závěr vypsat změněná místa přejmenování a jazykových oprav.
