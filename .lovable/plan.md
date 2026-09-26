# DS 2.40.0 – kontext panelů a detail jen pro čtení

## Výsledek
- Administrace bude v otevřeném panelu zřetelně označena štítkem „Provozovatel · všechny prostory“.
- Nastavení prostoru a firmy ukáže ve druhém řádku hlavičky název právě upravovaného objektu; dlouhý název se zkrátí s nápovědou.
- Detail prostoru půjde otevřít jen pro čtení se záložkami Členové, Pozvánky a Firmy; každá záložka zobrazí datovou mřížku a dialog nabídne jen Zavřít.
- Ukázkový grid Uživatelé předvede stavy Zablokován, Provozovatel, Bez členství, Nepotvrzený e-mail a Archivovaný.

## Implementace
1. Rozšířit položku `AppShell.panels` o volitelné `badge` a `context` a vytvořit pružnou, dvouřádkovou hlavičku pro počítač i úzké zobrazení.
2. Doplnit výrazný, nealarmující token pro tón `accent` a rozšířit `StatusBadge` tak, aby všech pět požadovaných stavů používalo jednotné tóny.
3. Rozšířit `RecordDialog` o řízený režim `readOnly` a záložky `tabs`; v tomto režimu skrýt Uložit a zobrazit pouze Zavřít.
4. Upravit ukázku Navigace na tři panely, kontext prostoru a firmy, grid uživatelů a detail prostoru se třemi gridovými záložkami.
5. Zvýšit verzi na 2.40.0, zachovat místní zdroj bez verzí externích balíčků a aktualizovat veřejný katalog, pravidla, README, changelog a roadmapu.
6. Doplnit testy veřejných vlastností, tónů, hlavičky panelu a dialogu jen pro čtení se záložkami.

## Technické provedení
- Stávající položky `panels` bez `badge` a `context` zůstanou beze změny.
- Záložky dialogu budou řízené aplikací a jejich obsah bude předán jako součást položek, aby dialog neznal data gridů.
- Vzhled použije pouze tokeny design systému a velikosti odvozené od osobní velikosti písma.

## Ověření
- Typová kontrola, lint, kompletní testy a sestavení.
- Vizuální kontrola při šířkách 1 280 px a 560 px, ve světlém i tmavém režimu a se sbaleným menu.
- Kontrola, že hlavička, štítek, kontext, tři panely, uživatelské odznaky i dialog jsou čitelné bez překryvů.
