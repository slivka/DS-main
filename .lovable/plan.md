# AppShell 2.0

## Rozsah
- Přestavět rám aplikace na horní lištu přes celou šířku a boční menu pod ní.
- Přidat řízené panely, sbalitelné boční menu a zachovat mobilní nabídku.
- Zachovat staré vlastnosti AppShellu jako funkční, označené zastaralé aliasy.
- Přidat ContextPill, CompanySwitcher, PeriodSwitcher, UserMenu, SearchButton a ThemeSetting.
- Rozšířit CommandPalette o řízené otevření při zachování dosavadního použití.
- Upravit ukázku navigace na dva panely, přepínače kontextu, tři pracovní prostory, sbalené menu a tmavý motiv.
- Zvýšit verzi na 2.0.0 a doplnit pravidla, roadmapu, changelog a stručný přechod z 1.x.

## Chování a kompatibilita
- Nové sloty lišty budou `contextLeft`, `actions`, `panelButtons` a `userMenu`; staré `topBarLeft` a `topBarRight` zůstanou funkční.
- `adminNav`, `adminMode`, `adminTitle`, `adminButtonLabel`, `adminBackLabel`, `adminBasePath` a `onAdminModeChange` se interně převedou na jeden panel.
- FontSizeSetting a starý ThemeToggle se v liště zobrazí pouze přes `showLegacyToolbar`; samostatně zůstanou veřejné.
- Veškeré nové viditelné texty budou přepisovatelné přes vlastnosti s českými výchozími hodnotami.

## Technické provedení
- Rozdělit nové prvky lišty do samostatných veřejně exportovaných souborů s typovanými vlastnostmi.
- Použít existující Popover, Command, DropdownMenu, RadioGroup, Tooltip, Button a účetní typy období.
- Aktivní navigaci zvýraznit levým primary proužkem; sbalenou variantu držet na šířce 14 s tooltipy.
- Doplnit veřejnou dokumentaci komponent v katalogu knihovny a pravidla AppShell 2.0.

## Ověření
- Typová kontrola a sestavení.
- Prohlížečová kontrola desktopu, sbaleného menu, panelů, klávesy Esc, tmavého motivu a mobilní nabídky.
