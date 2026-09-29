# Opravy kontroly DS 2.68.0

## Rozsah
- Omezit změnu hlavního účtu výhradně na neprázdné `mainAccountOptions`; bez této nabídky tužku vůbec nevykreslit.
- Svázat dočasný popisek vybraného účtu s aktuálním `value.mainAccountId`, zabránit přenosu mezi doklady a po zavření výběru vracet fokus na „Změnit účet“.
- Zpřístupnit zamčenou tužku s důvodem klávesnicí, pojmenovat vložený výběr „Hlavní účet“ a u interních dokladů účet vždy skrýt.
- Upravit skupinu Celkem + Měna tak, aby se při nedostatku místa zalomila jako celek bez přetečení. V poli měny zobrazit jen kód, v nabídce kód i název.
- Odstranit mrtvé API/texty/importy a přesunout odvození varianty dokladu do definic polí při zachování veřejného re-exportu.

## Ukázka
- Obnovit všechny dřívější scénáře formulářů: splátky, nastavení dokladu, chyby a informační pruhy, režim jen pro čtení s akcemi, KR, omezená editovatelná pole, DPH a DUZP, našeptávání, výdej bez partnera, propojený partner a řádky dokladu.
- Zachovat osm nových stavů jednotné hlavičky jako samostatnou část.
- Nabídnout jen povolené účty 311* a po výběru skládat identitu z aktuální hodnoty stejně jako aplikace.
- Měnit velikost písma pouze uvnitř ukázky; seskupení gridu podle skrytého sloupce vrátit do ukázky gridu.

## Ověření
- Rozšířit testy o všechny uvedené zámky, varianty, návrat hodnoty a popisku, kliknutí mimo, fokus, měnu, tooltipy a zákaz pevných „Kč“/„CZK“ ve formuláři.
- Spustit celou sadu testů a kontrolu typů, zkontrolovat automatický build.
- Projít ukázku při velikostech 0,8125 / 1 / 1,125 a v úzkém režimu, včetně ovládání účtu klávesnicí a zalamování Celkem + Měna.

Verze zůstane 2.68.0, Release se neprovede a metadata se nezmění.
