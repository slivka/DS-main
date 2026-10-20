# DS 2.113.0 – Panel záznamu, přílohy a poznámky

## Výsledek

Sdílený panel záznamu pro formulář, dialog a grid. Data, oprávnění, pořadí záložek,
připnutí i ukládání řídí aplikace; knihovna nic nenačítá. Body Firefox/WebKit
v roadmapě a jejich nastavení zůstanou beze změny. Bez vydání; poslední vydaná
verze zůstane 2.112.0, změny budou pod 2.113.0 (nevydáno).

## Rozsah

1. **Panel a tlačítka:** RecordSidePanel s trvale viditelným názvem záznamu,
   řízenými záložkami, připnutím, dvěma šířkami a volitelným otevřením v sousedním
   okně. Na běžné šířce odsune obsah; pod 640 px šířky svého prostředí jej překryje
   s tlumeným pozadím. Esc zavře příslušný panel, vrátí fokus na původní spouštěč
   a respektuje vnořené nabídky a potvrzení. RecordPanelTriggers ukáže pouze
   dodané indikátory; nula bude tlumená ikona bez čísla.
2. **Přílohy:** AttachmentList zobrazí zdroj s náhledem a akcí Nahradit, ostatní
   přílohy s metadaty a povolenými akcemi. Rozliší Smazat a Odebrat včetně
   potvrzení a volitelného důvodu. Zakázané akce zůstanou dostupné s vysvětlením.
   Odebrané přílohy nabídne přepínač, včetně autora, času a důvodu odebrání.
   Přidání více souborů výběrem i přetažením, průběh a chyby po souborech z props.
3. **Poznámky:** rozšířit existující RecordNotes, nikoli vytvořit náhradu.
   Připnuté poznámky nahoře, oddělené canEdit/canRemove, canAdd/canPin a editedAt.
   Dosavadní editable zůstane záložním oprávněním. Jediné připnutí hlídá aplikace.
   PinnedNoteBar zabere nejvýše jeden řádek a zpřístupní celý text v bublině.
4. **Grid:** obecný sloupec record-indicators s pevnou šířkou, oddělenými kliky
   bez výběru řádku a číselným exportem. useFollowSelection zpozdí jediný výběr
   o výchozích 250 ms, přeskočí mezikroky a vrátí stav multi s počtem.
   MultiSelectionPanel nabídne přeložený nadpis a slot pro akci aplikace.
5. **Ukázka:** nová stránka Panel záznamu s formulářem, existujícím HistoryPanel,
   gridem, sledováním výběru, oprávněními všech zadaných stavů, úzkou šířkou
   a 200% zoomem. Zdroj ve všech ukázkových stavech pouze Nahradit.

## Technické řešení a předpoklady

- Znovu použít RecordNotes, HistoryPanel, DisabledReasonTooltip, NoticeBar,
  sdílené potvrzení, existující primitiva záložek a panelové/fokusové mechanismy.
  Připojení do DocumentForm a RecordDialog použije existující sloty; nový slot
  vznikne pouze při skutečné absenci vhodného místa a bude popsán v CHANGELOG.
- RecordSidePanel bude mít kompoziční obal pro hlavní obsah (`children`), aby
  odsunutí fungovalo i bez zásahů aplikace do vnějšího rozložení. Výchozí šířku
  omezí dostupné místo; wide bude přibližně polovina šířky obalu aplikace.
- Typy a maximální velikost souborů jsou povinnosti aplikace, nikoli pevné limity
  knihovny. Ukázka použije 20 MB a PDF/JPG/PNG/ISDOC/XML/DOCX/XLSX.
  useFileDrop vrátí přijaté soubory a odmítnuté se strukturovanými důvody;
  AttachmentList je zobrazí přes NoticeBar. Stejná validace platí pro výběr souborů.
- Více indikátorů v jedné buňce se pro Excel rozvine na samostatné číselné sloupce
  s názvy dodanými aplikací; žádné spojování počtů do textu ani pevná doménová ID.
- Nové komponenty budou v malých samostatných modulech s typovanými props,
  dokumentací, ref, className a exporty z veřejného barrel. Použijí stávající
  tokeny; novou geometrii panelu definují pojmenované tokeny.
- Nové výchozí texty v DsTexts CS/SK, včetně dosavadních textů poznámek.
  Zachovat přednost textových props a existující veřejné importy.
- Velké existující soubory (DataGrid, katalogy textů, system.md, roadmap a
  CHANGELOG) zůstanou pohromadě kvůli zachování jejich veřejné či referenční role;
  přidat pouze cílené napojení. Nové chování se oddělí do menších modulů.
- Katalogové usage/examples/antipatterns doplnit pro nové komponenty; generované
  referenční soubory obnovit jen přes check:catalog, ne ručně.

## Ověření a dokumentace

- Testing Library: trigger → správná záložka, Esc a návrat fokusu, obě potvrzení
  podle removeKind, odmítnutí souboru nad 20 MB, přeskočení mezikroků při 250 ms,
  klik indikátoru bez výběru řádku a kompatibilita editable.
- Další konkrétní testy: nulové počty, oddělená oprávnění poznámek, přijaté typy,
  stav multi a číselná data exportu. Netestovat zdrojový text ani CSS třídy.
- Průběžně check:quick --harness a cílené unit testy; nejvýše jeden nový E2E spec
  pouze Chromium. V něm ověřit také úzký panel a 200% zoom.
- Na konci aktualizovat system.md, CHANGELOG a roadmap, prověřit katalog,
  uvést počty skutečně spuštěných kontrol i co neběželo.
- Plná E2E sada, Firefox/WebKit a úplná vydávací kontrola nejsou součástí kola.