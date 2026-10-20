# DS 2.119.0 – Duplikace a vzory

## Co vznikne
- Nabídka **Nový** na liště gridu: Prázdný doklad, Ze vzoru s akcemi Vytvořit / Vytvořit sérii a Spravovat vzory. Bez vzorů bude nabídka zakázaná s vysvětlením.
- Sdílený dialog jednoho dokladu nebo série: datum dodané aplikací, počet měsíců 1–24, den 1–31, první datum a náhled s problémy. Souhrn zobrazí „Vytvoří se N z M“; bez vytvořitelných řádků nebude možné vytvoření. Načítání a chyby dodá aplikace.
- Pruh **Upravujete vzor** s názvem a akcemi nad identitou dokladu; správa vzorů s názvem, autorem, sdílením, volbou Bez částek a jednotlivě řízenými oprávněními pro akce.
- Ukázky nabídky, jednoho dokladu, série 12 měsíců se dvěma problémy, správy a pruhu na faktuře i zálohovém listu.

## Sdílené prvky a technické provedení
- Použít GridFrame a jeho lištu, existující DropdownMenu, DisabledReasonMenuItem, RecordDialog, DataGrid, FieldGrid, datumové/číselné vstupy a NoticeBar; žádná druhá implementace nabídek, gridů či ochrany neuložených změn.
- Nabídku a správu skládat z těchto prvků; nové exportované prvky přidat jen pro dosud chybějící opakovatelnou kompozici duplikace a vzorů.
- Formulář faktury i ZL zůstává společný DocumentForm. Pruh vzoru připojit v jednom místě nad identifikačním řádkem, nezávisle na variantě a viditelnosti DPH.
- Data náhledu, data vzorů, výchozí datum, výpočty, načítání, ukládání a oprávnění zůstávají v APP. DS pouze zobrazí data, ověří meze číselných ovladačů a předá události.
- Texty přes DsTexts CS/SK, tokenové styly, pojmenované a zdokumentované props, ref/className a barrel exporty. Nové soubory do 300 řádků. Existující DocumentForm a jeho typy nad limitem ponechat s minimálním napojením: nesouvisející rozdělení by měnilo rozsah oprav.

## Ověření a předání
- Testy nabídky a zakázaných důvodů, mezí 1–24 / 1–31, režimů, náhledu, nulového počtu, načítání/chyb, akcí a oprávnění správy a pruhu v obou variantách.
- Průběžně check:quick; na konci check:full --harness. E2E dávky nespouštět; případnou přímou kontrolu ukázky omezit na Chromium.
- Doplnit pouze sekce 2.119.0 (nevydáno) v CHANGELOG a roadmapě, system.md a katalog včetně použití/příkladů a nových/odstraněných props.
- Předat seznam veřejného API pro APP krok C a přesné výsledky unit testů, katalogu a lintu. Poslední vydaná verze zůstane 2.118.0; nevydávat.