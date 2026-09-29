# DS 2.68.0 – jednotný identifikační řádek dokladů

## Cíl a hranice změny

Sjednotit horní identifikační řádek všech dokladů, ponechat hlavní účet pouze v něm a u faktur a interních dokladů přesunout měnu vedle celkové částky. Jde o BREAKING změnu veřejného API knihovny.

Rozhodnutí M1–M4 se promítnou jako smlouva komponenty a dokumentace:
- změna měny ani hlavního účtu v DS nepřepočítá řádky;
- DS pouze změní hodnotu formuláře a aplikace ji uloží spolu s dokladem;
- výchozí měnu nové knihy a přepočet částek po uložení řeší aplikace/DB;
- hlavička zobrazuje kód období předaný aplikací;
- hlavní účet zůstává nastavením knihy a období mimo DS.

`.lovable/meta.yaml` zůstane beze změny a Release se neprovede.

## Implementace

### 1. Typovaná identita a varianty

- Nahradit `DocumentIdentityItem` a `identity.items` novými veřejnými typy `DocumentIdentityVariant` a `DocumentIdentity` podle zadání.
- Identifikační řádek bude jediný renderer pro tři varianty:
  - `cashBank`: Kniha · Období · značka měny · štítek MD/DAL + účet;
  - `invoice`: Kniha · Období · volitelný štítek MD/DAL + účet a případná tužka;
  - `internal`: Kniha · Období.
- Zachovat směr Příjem/Výdej vlevo, oddělovače, vycentrovaný štítek strany a číslo dokladu vpravo.
- `identity` zůstane volitelný. Když jej aplikace nepředá, interní varianta se odvodí z `documentType`; dostupný název knihy, období a číslo se vezmou z dat formuláře. Explicitně předaná identita má přednost a její `period` je autoritativní kód období.
- Typy dokladů se mapují: PO/BA → `cashBank`; FV/FP/ZFV/ZFP/DDPZ/DDPOZ → `invoice`; ID/UZ/KR/ZAP a neznámé → `internal`.
- Texty a popisky se nebudou zalamovat; při malé šířce se přesunou celé položky, nikoli jejich vnitřní obsah.

### 2. Účet v identifikačním řádku

- Úplně odstranit dolní pole „Hlavní účet“ a sekci vždy pojmenovat „Částka“.
- Pro `invoice` zobrazit tužku jen při `identity.account.editable`, pokud formulář není jen pro čtení a `mainAccountId` je povolené pole.
- Přidat `mainAccountOptions?: AccountOption[]`; výběr nabídne pouze tyto aplikací povolené účty.
- Tužka přepne text účtu na otevřený `AccountSelect` s fokusem. Výběr provede pouze `patch({ mainAccountId })`, ihned zobrazí nový popisek a nezasáhne řádky.
- Escape nebo zavření/ztráta fokusu bez výběru vrátí původní text.
- `disabledReason` ponechá tužku viditelnou, ale zakázanou, s tooltipem. Tooltip i přístupný název budou z textů knihovny.
- `mainAccountLocked` lze ponechat pouze jako starší přepínač „jen pro čtení“; nebude už rozhodovat o skrývání účtu.

### 3. Měna a kurz v části Částka

- U variant `invoice` a `internal` vykreslit nerozdělitelnou dvojici `[Celkem za doklad][Měna]`; měna bude hned za částkou, úzká přibližně 6,5 rem a zobrazí kód.
- U `cashBank` dolní výběr měny vůbec nevykreslit, protože značka měny je v identifikačním řádku.
- Přidat `currencyDisabledReason?: string`; zakázaný výběr zobrazí důvod v tooltipu. `currencyLocked` případně zůstane jen jako stav „jen pro čtení“, nikoli jako spínač skrývání.
- Kurz bude mít stabilní šířku přibližně 9 rem a nezalamovanou nápovědu. Kurz, důvod ručního kurzu, celková částka v měně účetnictví a kurz DPH se vykreslí pouze pro cizí měnu.
- Značky měn se vždy vezmou z `currencies`, `homeCurrencySymbol` nebo dat; žádné pevné `Kč`/`CZK` v komponentě.
- Změna měny pouze zavolá `patch({ currency })`; nepřepočítá hodnoty řádků ani celkovou částku.

### 4. Typy dokladů a pole

- Rozšířit `DocumentTypeCode` o `DDPZ`, `DDPOZ`, `KR` a `ZAP`.
- `DDPZ`/`DDPOZ` dostanou fakturační sadu polí s hlavním účtem; `KR`/`ZAP` stejnou sadu jako ID.
- Zachovat existující účetní, DPH, datumová, zaokrouhlovací a řádková pravidla beze změny.

### 5. Lokalizace a veřejné API

- Doplnit texty identifikačního řádku, změny účtu a důvodu zákazu přes prioritu `texts` → `DsTextsProvider` → české výchozí texty, včetně slovenského překladu.
- Zvýšit `package.json` a katalog na `2.68.0`.
- Aktualizovat veřejný barrel, katalog komponenty `DocumentForm` včetně usage/examples/antipatterns a zdrojovou dokumentaci.

## Ukázka Účetní formuláře

Přestavět ukázky na požadovaných osm stavů:
1. PO CZK – příjem;
2. BA EUR – výdej;
3. FV CZK – účet s aktivní tužkou;
4. FV EUR – kurz a Celkem v měně účetnictví;
5. FV spárovaná – účet i měna zakázané s tooltipy;
6. FP s pevným účtem – bez tužky;
7. ZFV bez účtu;
8. ID.

Nad sadou přidat přepínač velikosti textu 0,8125 / 1 / 1,125 a režim běžné/úzké šířky odpovídající třem panelům. Ověřit, že identita, dvojice částka–měna, kurzové údaje a číslo dokladu nepřetékají ani se nevhodně nezalamují.

## Testy

Doplnit renderovací a interakční testy:
- přesné pořadí položek pro `cashBank`, `invoice` a `internal`;
- odvození varianty pro všechny skupiny `documentType`;
- tužka pouze při `editable`, její skrytí při read-only/oprávnění, zákaz s tooltipem;
- Escape a ztráta fokusu bez výběru vrátí text účtu;
- výběr účtu volá změnu formuláře s novým `mainAccountId` a nemění řádky;
- dolní pole Hlavní účet neexistuje a sekce se vždy jmenuje Částka;
- měna je u invoice/internal hned za Celkem, u cashBank dole chybí;
- zákaz měny ukáže tooltip a změna měny zachová částky i řádky;
- kurzové údaje a kurz DPH se zobrazí jen v cizí měně;
- nové typy dokladů mají správné předvolby polí;
- české a slovenské texty projdou providerem.

Po cílených testech spustit celou unit sadu, kontrolu typů a sestavení. Ukázku ověřit v prohlížeči v běžné i úzké šířce a ve všech třech velikostech textu.

## Dokumentace a evidence

- V `.lovable/system.md` přidat pravidlo „Identifikační řádek dokladu“ a BREAKING migraci `identity.items` → typovaný tvar.
- Popsat změněnou roli `mainAccountLocked` a `currencyLocked`, nové `mainAccountOptions` a `currencyDisabledReason`, odstranění dolního hlavního účtu a přesun měny.
- Doplnit sekci 2.68.0 do README/CHANGELOG a uživatelské dokumentace bez přepisování historických sekcí.
- Zapsat DS 2.68.0 do `roadmap.md` a nahradit odpovídající trvalé pravidlo v `AGENTS.md`.
- Na konci uvést seznam změněných souborů, změny veřejného API, počet testů, výsledek typů a sestavení a konkrétní stavy ověřené v ukázce.
