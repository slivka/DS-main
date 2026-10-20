# DS 2.120.0 – Zálohy, krok B

## Co vznikne
1. **Rozpad platby zálohy:** souhrn Částka · ZL · Storno ZL · Bez ZL · DD · DD nebude · Bez DD · Vyúčtováno · Vráceno · Zbývá. Dva oddělené pruhy vypořádání pro ZL a DD, seznamy vazeb a jejich odebrání podle oprávnění. Akce přiřazení ZL, storna zbytku, vystavení DD a rozhodnutí DD nebude s výběrem důvodu a textem. Stav DD a upozornění na překročení lhůty 15 dnů podle dat APP.
2. **Dialog přiřazení ZL/DD:** grid kandidátů, výběr a částky k přiřazení, souhrn „Přiřazeno X z Y“. Výchozí částky dodá APP jako minimum zbývající platby a cíle; DS ověří překročení dostupných částek a zobrazí chybu bez změny výšky řádku.
3. **Odečtené zálohy pod rekapitulací faktury:** VS · Kód DPH · Základ · DPH · Celkem · Platba · DD · Stav. Přidání kandidáta, ruční odečet, navázání DD, párování platby a odebrání přes callbacky. Otevřený odečet má štítek a důvod chybějící platby/DD. Stávající patička Odečtené zálohy / K úhradě dostane data APP, bez druhého výpočtu.
4. **Evidence záloh:** preset gridu s požadovanými sloupci, filtry Po lhůtě / Bez DD a řezem k datu v liště; filtrování podle dat a řízení řezu dodává APP.
5. **Opravný DD:** potvrzovací dialog s náhledem základu a DPH a akcemi Vytvořit / Nevytvářet; řádky návrhu i rozhodnutí zajišťuje APP.
6. **Kurzové vyrovnání zálohy:** rozšíření stávajících automatických řádků o `advance_fx`, vedle zachovaného `advance`; štítek v řádcích i Zaúčtování.
7. **Ukázky:** platba 2 000 se dvěma ZL a stornem 185, poměrné DD, faktura s otevřeným a uzavřeným odečtem, evidence s položkou po lhůtě a opravný DD. Kontrola úzkého panelu a zoomu 200 %.

## Sdílené prvky a technické provedení
- Použít `SettlementBar`, `LinkedRecordsPanel` a sdílené řádky vazeb, `DataGrid` / `GridFrame`, `RecordDialog`, existující výběry a číselná pole, rekapitulaci DPH z 2.118.0, stavové štítky a sdílené důvody zakázaných akcí. Nové veřejné komponenty pouze pro chybějící kompozice záloh: `AdvancePaymentBreakdown`, `AdvanceAllocationDialog`, `AdvanceDeductionsSection`, `AdvanceRegisterGrid` a dialog opravného DD.
- Data, výpočty, lhůty, důvody, oprávnění, asynchronní stavy a zápisy dodává APP. Obecné účetní párování se nemění. DS předává typované události a kontroluje pouze meze ovladačů a přiřazení.
- Společné stavební prvky pro FV/FP, ZFV/ZFP, DDPZ/DDPOZ, BA/PO; žádné kopie formuláře ani pevné doménové větvení. Odečty se připojí jednou do sdílené kompozice rekapitulace, APP řídí jejich zobrazení. Ověřit a výslovně potvrdit dopad na faktury i ZL.
- Nové zdroje rozdělit do souborů do 300 řádků, komponenty do 30 props; tokenové styly, ref/className, typované zdokumentované props a barrel exporty. Stávající velké orchestrace a typové soubory ponechat s minimálním napojením: nesouvisející dělení by rozšířilo rozsah zadání.
- Všechny nové texty přes `DsTexts` CS/SK; katalog doplnit o použití, příklady a nevhodná použití. Pokyny aktualizovat v system.md a příslušných AGENTS.
- Dokument `zadani-zalohy.md` zatím není mezi dostupnými soubory; pro krok B je rozhodující zadání této zprávy, bez doplňování doménových pravidel.

## Ověření a předání
- Testy souhrnů a obou rovin, oprávnění a důvodů, akcí, přiřazení a překročení částek, otevřených/uzavřených odečtů, filtrů/řezu, opravného DD a `advance_fx`. Číselné příklady vycházejí přímo ze zadání; lhůta 15 dnů se testuje jako předaný údaj, ne jako nový výpočet DS.
- Průběžně `check:quick --harness` a cílené testy změněných modulů; na konci `check:full --harness` s přesnými počty unit testů, katalogu a lintu. Typy s `noImplicitReturns` a sestavení ověří automatická kontrola Lovable.
- Přímý proklik ukázek v Chromiu na široké i úzké ploše; E2E dávky nespouštět, nejvýše jeden přímo zasažený spec, pokud bude potřebný.
- Změny a výsledky pouze do existujících sekcí 2.120.0 v CHANGELOG/roadmap. Známé body FF/WebKit i sekci 2.119.0 ponechat beze změny; poslední vydaná verze zůstane 2.119.0, nevydávat.
- Předat seznam veřejných komponent, datových typů, callbacků a nových/odstraněných props pro APP krok C. Po schválení pokračovat až do dokončení bez dalších dotazů.