# DS 2.71.0 – AppShell panely a rozsah platnosti

## Výsledek
- Panelové menu bude od horní lišty až dolů; řádek panelu bude pouze nad pravým obsahem a bude pevný při rolování stránky.
- Hlavní menu zůstane tmavě modré, menu panelů bude ve světlém i tmavém motivu neutrálně šedé a čitelné.
- Panel může nabídnout řízené části, například „Firma | Prostor“, které současně přepnou nadpis, kontext, rozsah platnosti a menu.
- U nastavení prostoru nebo celé platformy zůstane firma a období na místě, ale budou zřetelně zakázané s vysvětlující nápovědou.

## Veřejné rozhraní AppShellu
- Přidat `AppShellScope = "company" | "workspace" | "platform"`.
- Rozšířit `AppShellPanel` o `sidebarTone?: "app" | "panel"`, `scope?`, `views?`, `activeView?` a `onViewChange?`; výchozí tón panelu bude `panel`, výchozí rozsah `company`.
- Jedna část nebo panel bez `views` zachová dnešní chování bez přepínače; neplatné `activeView` bezpečně použije první část.
- Přidat `AppShell.contextDisabledHint`; výchozí český i slovenský text bude v centrálních textech knihovny.
- Jde o rozšíření API bez plánované BREAKING změny. Pokud kontrola odhalí nutnou nekompatibilitu, bude výslovně uvedena v changelogu.

## Rozložení a chování
- Přeskládat tělo na levé `<aside>` a pravý sloupec, ve kterém je panelový řádek a `<main>`; odstranit pevné mezery nezávislé na nastavitelné šířce menu.
- Panelový řádek uspořádat: ikona → segmenty → nadpis s kontextem → Zavřít. Na mobilu ponechat nadpis v prvním řádku a segmenty přesunout pod něj.
- Segmentům dát stejnou stabilní šířku podle nejdelšího popisku; nezalamovat ikonu, segmenty, nadpis ani Zavřít. Kontext se smí zkrátit s tooltipem.
- Aktivní část určí menu, nadpis, kontext, rozsah i klíč uloženého sbalení skupin.
- Pro rozsah `workspace` a `platform` obalit kontext firmy a období neměnným kontejnerem s `aria-disabled`, `inert`, nižší neprůhledností, vypnutými událostmi a tooltipem.
- Mobilní nabídka převezme aktivní část, tón menu a její nadpis i kontext.

## Barvy menu
- Doplnit do tématu chybějící `sidebar-muted`, `sidebar-indicator` a nový `sidebar-accent-foreground`.
- Opravit viditelnost čar hlavního menu bez změny jeho dosavadního charakteru.
- Přidat tokenové přepsání pro `[data-sidebar-tone="panel"]` ve světlém i tmavém motivu podle zadaných odstínů.
- Na každé desktopové i mobilní menu přidat `data-sidebar-tone`; aktivní položky, odznaky, text „Připravujeme“, hledání a přechody rolování budou používat výhradně sidebar tokeny.
- Zachovat varovné tónování řádku Administrace nezávisle na šedém menu.

## Pravidla skupin a hledání
- Skupinu s prázdným názvem vždy zobrazit rozbalenou a ignorovat pro ni uložené i výchozí sbalení.
- Povolit první nepojmenovanou skupinu bez sekce a následné pojmenované sekce.
- Rozšířit hledání o názvy sekcí při zachování hledání bez diakritiky a po více slovech.
- Do součtu sbalené skupiny započítat pouze číselné odznaky.

## Ukázky
- Nahradit panely v hlavní ukázce sadou Číselníky, Nastavení se dvěma částmi a Administrace přesně podle zadání.
- Doplnit samostatnou variantu Nastavení s jedinou částí, kde se přepínač nezobrazí.
- Na stránce Navigace předvést světlý i tmavý panel, rozbalené a sbalené menu, úzké rozložení a krajní zoom 70 % / 200 %.
- Ukázky budou používat skutečný AppShell, aby se ověřilo rozložení, rozsahy i přepínání, ne ručně napodobené bloky.

## Dokumentace a verze
- Zvýšit `package.json` na `2.71.0` a zapsat dokončení do `roadmap.md`.
- Doplnit README changelog 2.71.0 včetně výslovného údaje, zda je změna BREAKING.
- Aktualizovat `.lovable/system.md`: tmavé hlavní menu, šedé panelové menu, nesbalitelné názvy sekcí verzálkami, pořadí panelového řádku a rozsahy platnosti.
- Aktualizovat veřejný katalog AppShellu o nové typy, vlastnosti, příklad použití a nevhodná použití; automaticky generované soubory pravidel neupravovat.
- `.lovable/meta.yaml` ponechat bez změny a bez `upstream_versions`. Release neprovádět.

## Ověření
- Vitest: přepnutí části mění nadpis, kontext i menu; přepínač je před nadpisem; jedna část nemá přepínač.
- Vitest: `workspace` a `platform` zakážou kontext firmy a období, `company` nikoli.
- Vitest: prázdná skupina se nesbalí ani z uloženého stavu; hledání najde sekci; textový odznak nezvýší součet.
- Vitest: desktopové i mobilní `<aside>` dostane tón `panel` v panelu a `app` v běžném menu.
- Spustit všechny testy, typovou kontrolu a ověřit aktuální sestavení.
- V prohlížeči ověřit světlý/tmavý motiv, Administraci s warning řádkem, sbalené menu, mobil, úzké okno a zoom 70 % / 200 % bez překryvů a posunů horní lišty.
