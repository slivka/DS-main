# Oprava kompatibility XLSX s Microsoft Excelem

## Změny
- Zpřísnit názvy tabulky a sloupců, sjednotit je s hlavičkou a vynechat neplatné volby součtů.
- Opravit osnovu řádků: bez `collapsed`, správná maximální úroveň a žádná osnova u plochých dat.
- Oddělit vlastní součty prázdným řádkem, nevytvářet prázdné řetězce ani nadbytečně stylované buňky.
- Převádět datum bez času přes UTC a datum s časem tak, aby Excel zachoval místní čas.
- Zachovat kompletní Blob se správným typem a bezpečně odloženým uvolněním adresy.
- Z ukázky odstranit falešné seskupení řádků.

## Ověření
- Rozšířit automatický test o kontrolu rozbalené struktury XLSX: tabulku, filtr, hlavičky, sloučení, osnovu, prázdné sdílené řetězce a celé pořadové číslo data.
- Pokud je dostupný validátor Open XML SDK, spustit jej; jinak použít strukturální kontrolu přes JSZip.
- Spustit typovou kontrolu, test stažení a kontrolu sestavení; verzi ponechat 1.5.1 a zapsat opravu do roadmapy.
