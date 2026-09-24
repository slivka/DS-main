# Accounting APP: panely, připnuté stránky a lišty gridů

## Cíl
Vydat novou minor verzi design systému, která opraví přepínač počtu panelů, přidá trvalé připnuté stránky a sjednotí akce DataGridu a TreeGridu.

## Úpravy
1. **PaneLayout a prázdné panely**
   - Při zvýšení rozložení na 2 nebo 3 vytvořit chybějící prázdné panely a aktivovat první nový.
   - Prázdný panel uchovat při serializaci, vynechat z historie, `paneKey` a `renderPane`.
   - Přidat výchozí `PaneEmpty`, texty `emptyTitle` a `emptyHint` a volitelný `renderEmpty`.
   - Doplnit připnutí v hlavičce panelu přes `isPinned` a `onTogglePin`.
   - Upravit nápovědy přepínače rozložení na „1 panel“, „2 panely“, „3 panely“; nedostupné volby dál ukážou potřebnou šířku.

2. **PinnedBar a AppShell**
   - Vytvořit veřejnou komponentu `PinnedBar` s otevřením do aktivního/nového panelu, odepnutím, přetažením a vodorovným posunem.
   - Přidat slot `subHeader` pod horní lištu AppShellu a automaticky jej skrýt při otevřeném Nastavení/Administraci.
   - Rozšířit ukázku Navigace o čtyři připnuté stránky a viditelně funkční přepínač 1/2/3.

3. **DataGrid a TreeGrid**
   - Nahradit textový přepínač hromadného výběru komponentou `GridSelectionToggle`.
   - Přidat `onRefresh` a `refreshing`, interní stav běžícího obnovení a točící se ikonu.
   - Sjednotit pořadí, výšku a velikost ikon podle zoomu.
   - Doplnit stejnou podporu výběru a obnovení do TreeGridu.
   - Aktualizovat ukázku Datová mřížka.

4. **Vydání a ověření**
   - Zvýšit minor verzi knihovny a zapsat změny veřejných props do changelogu a roadmapy.
   - Aktualizovat veřejné exporty a katalog komponent; dokumentaci komponent nebudu ručně přepisovat, pokud je generovaná z katalogu.
   - Doplnit testy, spustit cílené testy a typovou kontrolu a ověřit Navigaci i Datovou mřížku v prohlížeči.

## Technické poznámky
- Prázdný panel má `route: ""`; `paneKey` pro něj vrací `null`.
- Zmenšení rozložení panely nemaže, pouze je skryje.
- F5 zůstane bez obsluhy komponentou.
- Verze bude navýšena z aktuální veřejné verze na následující minor a sjednocena ve všech vydávaných metadatech.
