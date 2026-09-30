# DS 2.73.0 – druhá kontrola před vydáním

## Úpravy
- Stabilizovat režim „Jiný účet“: vlastní změny hodnoty nebudou přepínat zpět na nabídku; změna možností nebo skutečná změna hodnoty z aplikace režim znovu správně odvodí.
- Upravit datum s varováním tak, aby se celý text vešel u zamčené i odemčené vazby; rozšířit vstup ve formuláři pouze o prostor varovné ikony.
- Z automatického VS posílat změnu jen tehdy, když se VS skutečně mění, a automatickou paměť znovu odvodit při přepnutí na jiný doklad.
- Odebrat ořezávání řádku Částka, aby nebyly useknuté rámečky fokusu ani nápovědy.
- Opravit historický záznam 2.66 v README bez zásahu do ostatních změn 2.73.0.

## Testy a kontrola
- Doplnit stavový test BankAccountField: po volbě „Jiný účet“ zůstane vstup otevřený po smazání i po napsání hodnoty shodné s nabídkou.
- Doplnit test automatického VS bez zbytečné změny a po přepnutí identity dokladu.
- Doplnit regresní test AppShellu: tooltip existuje pouze při zakázaném kontextu a aktivní odznak používá token `--sidebar-badge-active`.
- Ověřit datum 30.09.2026 s varováním u zamčeného i odemčeného pole, úzký řádek Částka, všechny testy, typy a sestavení.

## Omezení
- Verze zůstane 2.73.0.
- Release se neprovede.
- `.lovable/meta.yaml` se nemění.
