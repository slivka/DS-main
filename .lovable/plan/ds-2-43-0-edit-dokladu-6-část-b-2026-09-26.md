# DS 2.43.0 – edit dokladu 6, část B

## Výsledek
- Přepracovat editor účetních řádků tak, aby editace začínala jedním klikem i psaním, správně ukládala první znak a podporovala souvislý pohyb Tab / Shift+Tab / Enter / Esc.
- Sjednotit výchozí sloupce pro doklady s hlavním účtem a interní doklady, udržet Akce poslední a připnuté vpravo a bez vodorovného posuvu adaptivně přesouvat méně důležitá pole do detailu řádku.
- Přesunout příznak Nedaňový do buňky Částka, upravit rekapitulaci, hlavičku a datumovou/částkovou část formuláře, měnové značky, právní formu a záložky panelů.
- Vydat breaking verzi 2.43.0 s aktualizovanou ukázkou, katalogem, pravidly a migračním přehledem pro aplikaci.

## Editor řádků a sloupce
- Oddělit rozepsanou hodnotu editoru od výchozího znaku, aby první i další úhozy měnily řízenou hodnotu; společnou obsluhou dokončit nebo vrátit změnu a přesunout fokus na další/předchozí editovatelnou buňku i přes hranici řádku.
- Jeden klik spustí editaci; dvojklik, F2 a Enter zůstanou funkční. Účet, zakázka, MJ a partner dostanou řízené otevření a počáteční hledaný text, takže se výběr otevře okamžitě.
- Nastavit výchozí pořadí:
  - hlavní účet: Ř. · Text · protistranný účet se správným nadpisem MD/DAL · Částka · Zakázka · Akce;
  - interní doklad: Ř. · Text · MD účet · DAL účet · Částka · MD zakázka · DAL zakázka · Akce;
  - Množství · MJ · Cena za MJ budou volitelné a po zapnutí před Částkou; VS, Partner a domácí částka zůstanou volitelné.
- Zavést měření dostupné šířky a priority sloupců: Text pružný s minimem 12 rem, nejdřív se do detailu přesune Zakázka, potom trojice Množství/MJ/Cena, účet se v posledním kroku zobrazí jen číslem s tooltipem; vodorovný posuv až pod přibližně 24 rem.
- Detail řádku sestavit ze všech právě nezobrazených polí a použít v něm stejné editory, omezení a přepočty jako v buňkách.
- Akce vynutit jako poslední, nepřesouvatelné a připnuté vpravo včetně režimu jen pro čtení; transformaci při přetahování přesunout tak, aby neporušila sticky sloupec.
- Primární akci Přidat řádek označit stejným primárním stylem jako Nový v ostatních gridech.

## Nedaňový a účetní pravidla
- Rozšířit `AccountOption` o `nonTaxDefault?: boolean`.
- Povolení Nedaňový odvodit z `isNonTaxAllowed`, jinak z typu nákladový/výnosový; při nepovoleném účtu hodnotu vynulovat.
- Nový řádek i změna rozhodného účtu převezmou `nonTaxDefault`; u interního dokladu se použije nákladový/výnosový účet na řádku.
- Do buňky Částka vložit klávesově dostupný přepínač: daňový jako nenápadná ikona, nedaňový jako výstražný štítek ND, s tooltipy a zkratkou Alt+N.

## Rekapitulace a formulář dokladu
- Rekapitulaci převést na jediný řádek záložek s rozbalovací šipkou vpravo; odstranit nadpis. Klik na záložku ve sbaleném stavu zároveň panel rozbalí.
- Účtování zobrazí spojené sloupce „MD účet“ a „DAL účet“ ve standardním formátu číslo – název, částky se značkami měn a šedý doprovodný text připnutých řádků.
- Rozšířit `PageHeader` o slot pro badge vedle titulku a přesunout tam `DocumentStatusBadge`.
- V přilepeném pruhu akcí vlevo zobrazit řízený Switch „Vstupuje do DPH“; hodnota bude nově `DocumentHeaderValue.vatRelevant`. Sekci přejmenovat na „Datumy“ a přepínač z ní odstranit.
- Nahradit `DocumentHeaderValue.vatPeriod` hodnotou `vatDate`; z `DocumentVatConfig` odstranit `periodOptions`, `periodReadOnly` a související výběr období. Doplnit `periodLabel`, stav podaného období, `dateLink` a `dateLockReadOnly`; Datum DPH bude pod DUZP a bude reagovat na `vatRelevant`.
- `DateField` rozšířit o `hint` a výstražný `warning`; zámek data DPH bude umět zakázané odemknutí s vysvětlením.
- Kurz dostane pevnou šířku, třídesetinné zobrazení a jednotku pod polem. U Celkem přesunout text „Sčítá se z rozpisu“ do řádku popisku; domácí přepočet bude úzký, bez rámečku a zarovnaný vpravo. MD/DAL v identitě vystředit vůči textu ve všech velikostech písma.
- `SuggestInput` a obdobné ikonové přepínače sjednotit: zapnuto plné primární tlačítko s bílou ikonou, vypnuto obrys a přeškrtnutá ikona, vždy stavový tooltip.

## Měny, právní forma a čeština
- Rozšířit `CurrencyOption` o `symbol`; `DocumentForm`, `JournalLinesEditor`, `JournalLinesRecap`, `CurrencyAmount` a `RateField` budou přijímat `homeCurrencySymbol` a používat symbol z dat, s kódem jako jediným fallbackem.
- Odstranit mapování CZK → Kč i výchozí domácí měnu `CZK`; volba měny zůstane „kód – název“. Jednotka kurzu bude „{domácí značka} za {počet} {cizí značka}“.
- `LegalFormField` bude vyžadovat `options: { code; name }[]`, ukládat kód a zobrazovat „kód – název“; vestavěný slovenský seznam a jeho veřejný export odstranit.
- Projít zdroj, ukázky, testy a veřejné texty na slovenštinu a nalezené texty převést do češtiny; výsledný seznam uvést v závěrečném souhrnu.

## Veřejné rozhraní a dokumentace
- Breaking changes: `vatDate` místo `vatPeriod`; odstranění `vat.periodOptions` a výběrového API období; `vatRelevant` ve value; nové datumové DPH API; povinné `LegalFormField.options`; nové měnové symboly přes props; odstranění výchozích CZK hodnot.
- Upravit veřejné exporty, TSDoc a katalogové metadata včetně příkladů a antipatternů pro všechny dotčené komponenty.
- Aktualizovat `README`, `components.md`, `.lovable/system.md`, `AGENTS.md`, `roadmap.md` a `.lovable/design-system.json`; přidat changelog 2.43.0 a aplikační migrační seznam.
- Nastavit `package.json` na 2.43.0. Protože `source_type` je `local`, klíč `upstream_versions` v `.lovable/meta.yaml` ponechat zcela nepřítomný, což je platná prázdná podoba pro Release.

## Testy a ověření
- Doplnit jednotkové testy veřejných typů, DPH data/zámku, měnových symbolů, právní formy, rekapitulace, názvu/statusu, šířek záložek, pořadí/priorit sloupců, Nedaňový a výchozích hodnot účtu.
- Rozšířit interakční test editoru o text, VS, domácí/cizí částku, množství, cenu, účet, zakázku a MJ; ověřit první znak, další psaní, uložení, Esc, jeden klik, automatické otevření výběru a Tab/Shift+Tab přes řádky.
- Vizuálně zkontrolovat PO CZK, PO EUR, FV, FP a ID při 560 / 1 280 / 1 920 px, zoomu 81 / 100 / 125 %, ve světlém i tmavém režimu; zahrnout sbalenou/rozbalenou rekapitulaci, detail řádku, sticky Akce a absenci vodorovného posuvu nad limitem.
- Nakonec spustit všechny unit a E2E testy, kontrolu typů, lint a build; závěr uvede počet testů, výsledek každé vizuální matice, změněné soubory, nové/odstraněné props a nalezené slovenské texty.
