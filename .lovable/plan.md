# Edit dokladu 14 – část DS

## Zachování vydané knihovny
- Zachovat všech 430 současných názvů komponent, obsah katalogů i existující záznamy manifestu. Nové komponenty a props přidávat bez plošného přegenerování katalogů.
- Nové vydání vést pouze v CHANGELOG jako **2.105.0 (nevydáno)** s návodem migrace u BREAKING změn.
- **Nesoulad aktuálního stavu:** oba soubory verzí nyní obsahují **2.103.0**, nikoli uvedených 2.104.0. Podle pokynu „NEMĚŇ je“ je ponechat beze změny; nevydávat knihovnu.

## Sdílená pole a ovládání (S1–S4)
- Sjednotit chyby a varování: barevný rámeček, výstražná ikona uvnitř před akcemi, úplný text v přístupném tooltipu; žádný text výstrahy pod polem a žádná změna výšky řádku. DocumentForm zobrazí stejné zprávy také ve společném pruhu.
- Použít společné řešení v Field/Input, datumech, kurzech i výběrech. Zachovat oddělení formátu a vysvětlení a pravidlo nezalamovaných popisků/nadpisů.
- Zachovat šířku Celkem v obou režimech; tooltip Σ jen „Sčítá částky z rozpisu“.
- Přidat exportovanou StepperInput s min/max/step, tlačítky −/+, šipkami a validací všech způsobů zadání. Počet kopií nahradit rozsahem 1–5.
- Opravit geometrické vystředění RadioGroup bez závislosti na konkrétním zoomu nebo prohlížeči.

## Lišty, výběry a datumy (S5–S8)
- Standardně textové akce bez ikon; podle skutečně měřených šířek zkrátit nejdříve vedlejší akce a nakonec Uložit. Zachovat primární barvu, dirty/disabled/busy, tooltipy a přístupné názvy.
- Přesunout přidání do pravého konce řádku hledání jako + s názvem a důvodem nepřístupnosti; callback dostane současný dotaz. Prověřit všechny výběry s přidáním, nejen vyjmenované.
- Sjednotit nabídky: nejméně šířka pole, růst podle obsahu do hranice panelu/okna a 36 rem, bez zalomení, poté výpustka a tooltip.
- DateField rozšířit o quickOptions a základní datum; volby uvnitř kalendáře, relativní zápis +14. Splatnost od vystavení: +7, +14 dní, +1 kalendářní měsíc včetně konců měsíců.

## Doklady a výpisy (S9–S10)
- FV/ZFV: platba před účtem; vedle Popisu přidat řízené číslo daňového dokladu s vazbou/zámkem, výzvou konceptu a varováním duplicity.
- FP/ZFP/DDPOZ: výchozí accountingDateLinked=true; DUZP doplnit z vystavení a následovat jej do ruční změny. Zachovat řízení hodnot aplikací a umožnit vypnutí vazby.
- BA: „Bankovní pohyb“, „Datum pohybu“, sekce „PROTIÚČET A SYMBOLY“, český účet / IBAN, hledatelný kód banky, SWIFT a VS/KS/SS; číslo daňového dokladu při DPH.
- ID: Partner, Popis a při DPH číslo daňového dokladu, pak Datumy; účetní datum svázané s vystavením, příslušná data DPH.
- Všechny peněžní směry přepsat na „Výdaj“ včetně badge, krátkých popisků a nabídek; české i slovenské texty přes DsTexts.
- Výpis bez viditelného štítku stavu; nový neuložený výpis s prázdným gridem a sdělením. Akce + Příjem / + Výdaj volají dodaný onSaveThenAdd(direction); ukládání nadále vlastní aplikace.

## Ověření a předání
- Doplnit trvalé ukázky všech bodů a unit testy konkrétních pravidel a interakcí.
- E2E měření S1/S4/S5/S7: zoom 100/150/200 % × panely 360/640/1200 px; doplnit krajní zoom 70 % a kontrolu radio v dostupných prohlížečích.
- Spustit unit, relevantní E2E a lint; formát dotčených souborů. Sestavení a typy ověřuje automatika prostředí, ručně je nespouštět.
- Uvést skutečné výsledky kontrol, počet komponent a úplný seznam nových/změněných props, nic nevydávat.

## Technické zásady
- Vycházet ze sdílených komponent, řízených hodnot a DsTexts CS/SK; všechnu geometrii navázat na rem a tokeny.
- Nové samostatné moduly držet pod 300 řádky. Existující rozsáhlejší orchestrace a veřejné typy zůstanou pohromadě kvůli kompatibilitě; nové chování přidat v menších pomocných modulech, ne nafukovat soubory nad limit.
- Nové komponenty: typované props, ref, className a nativní props, barrel export a doplnění usage/examples/antipatterns v katalogu. Automaticky renderované soubory rules ručně nepřepisovat.
- Před úpravami uložit výchozí inventuru katalogů pro závěrečné porovnání; neodstraňovat žádný dnešní název ani záznam manifestu.