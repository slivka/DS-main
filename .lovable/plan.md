# DS 2.86.0 – Edit dokladu 10

## Cíl
Dokončit všech 14 bodů jako jednu verzi 2.86.0, zachovat stávající chování mimo zadání, aktualizovat pravidla a nic nevydávat.

## Postup

1. **Veřejné API a texty**
   - Rozšířit `DocumentFormProps` o řízení firemního účtu, ruční nápovědu odběratele a režim záložky Odběratel.
   - Rozšířit stav DPH o datum nespolehlivosti.
   - Doplnit texty CS i SK; slovenská sada zůstane záměrně obsahově shodná s českou.
   - Rozšířit `OptionSelect` o hledání a zkrácený popisek vybrané hodnoty; výchozí hledání od 8 položek.
   - Doplnit `onEditSelected` do výběrů partnera, zakázky a měrné jednotky a předat jej i pro místo/pracovníka přes jejich sdílenou implementaci.

2. **Rozložení DocumentForm**
   - Data DPH ponechat vpravo na široké ploše, ale po zalomení celé skupiny je zarovnat vlevo; ověřit ve třech šířkách.
   - Zarovnat částku se zamčenou měnou k pravému okraji a sjednotit levé hrany popisku a hodnoty měny.
   - Přesunout účet partnera u přijatých dokladů do Základních údajů vedle externího čísla.
   - Platební údaje převést na pružné poměrové rozložení bez prázdného pravého prostoru.
   - U FV/ZFV přesunout účet firmy před Základní údaje; `companyBankAccountDisabledReason` zobrazí prázdné zašedlé pole s tooltipem. DDPZ ponechat v Platebních údajích.
   - Nahradit nápovědu přepínačem-ikonou „Vybraný │ Ručně“ přímo v poli protistrany, včetně zamčení a potvrzení při přechodu na adresář.
   - U přijatých dokladů přidat do účtu přepínač platebního příkazu; při vypnutí skrýt KS/SS a účet vyprázdnit a zašednout.
   - Pro ruční protistranu podporovat řízené CZ číslo/IBAN/SWIFT podle měny a validace modulo 11/modulo 97.

3. **Záložka Odběratel**
   - Pole ponechat editovatelná v obou režimech protistrany; na `FieldValue` je převést pouze při `counterpartyLocked`.
   - U polí uvedených v `counterpartyManualFields` zobrazit odznak „upraveno ručně“.
   - Přidat řízené potvrzení „Aktualizovat z partnera“ s důraznou variantou a textem dodaným aplikací.
   - Přidat odznak zmrazení údajů při zařazení.

4. **Výběry a VS**
   - Zarovnat VS vlevo ve formuláři, editoru řádků, detailu, rekapitulacích a gridech; přidat sdílený `vsColumn()` pro DataGrid.
   - Konstantní symbol vykreslit jako hledatelný číselník: hledání kódu/názvu, v poli jen kód, v nabídce celý název, možnost vymazání.
   - Způsob platby vykreslit stejným hledatelným výběrem s názvem po výběru.

5. **Zaoblení a pravidla**
   - Nahradit holá tlačítka v DS sdíleným `Button`, nebo jim výslovně přidat tokenové zaoblení tam, kde HTML tlačítko vyžaduje speciální struktura.
   - Zachovat výjimky pro vnitřní hrany segmentů a záložky.
   - Uvést přesný počet opravených míst.
   - Aktualizovat `system.md`, účetní pravidla, `CHANGELOG.md`, `roadmap.md` a verzi balíčku na 2.86.0; BREAKING změny označit a doplnit migraci.

6. **Ukázky a ověření**
   - Rozšířit účetní formuláře tak, aby byl vidět každý bod: tři šířky dat, pevná měna, přijatý/vydaný účet, pružné platební údaje, oba režimy protistrany a jejich zamčení, oba stavy záložky Odběratel, VS, oba hledatelné číselníky, tužky, nespolehlivý plátce a zaoblení.
   - Přidat testy chování pro každý bod; rozložení ověřit měřením DOM, ne názvy tříd.
   - Spustit formátování, typecheck, lint celého projektu s 0 chybami, všechny testy a build.
   - Náhled ověřit v prohlížeči ve třech šířkách a zkontrolovat přetečení.

## Technické poznámky
- `DocumentForm.tsx` je nyní 497 řádků, proto z něj přesunu sestavení bankovních polí a nové rozhodování do malých pomocných modulů; nesmí překročit 500 řádků.
- `DocumentFormShowcase.tsx` má 333 řádků; nové scénáře rozdělím do samostatného showcase souboru, aby zůstal pod limitem.
- Stávající `OptionSelect` je založený na prostém Selectu. Hledatelnou větev složím ze stávajících `Popover` + `Command`, nehledatelnou větev zachovám kvůli kompatibilitě.
- Veřejné exporty a katalogová metadata komponent upravím ve stejné změně jako API.

## Výstup
Závěrečný report bude obsahovat stav každého bodu, tabulku **bod → soubor → test**, počty testů a výsledky všech kontrol. Release nebude proveden.
