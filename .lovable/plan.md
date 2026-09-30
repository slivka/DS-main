# DS 2.79.0 – Nastavení nad úrovní firmy

Verze `package.json` 2.79.0, Release nedělám, `.lovable/meta.yaml` beze změny. Změna je rozšíření, ne BREAKING.

## 1. Sdílený zoom – `useAppZoomShortcuts()`
- Z `AppShell` přesunu do `lib/app-zoom.ts` (hook): start `applyAppZoom(getAppZoom())`, klávesy přes `isAppZoomShortcut` (i v polích, `event.repeat` jako dnes), Ctrl/Cmd + kolečko přes `createAppWheelZoom` (nad gridem nechá zoom gridu).
- `AppShell` volá hook místo vlastních efektů; chování stejné, dosavadní testy zoomu musí projít. Export z balíku i `hooks/index.ts`.

## 2. `StandaloneShell` (`layout/standalone-shell.tsx`)
- Props `brand`, `title`, `userMenu?`, `onClose?`, `closeLabel?`, `sidebar?`, `children`, spread + `className`.
- `h-dvh`, horní lišta se stejnými třídami/tokeny jako lišta `AppShell` (výšku a styl vytáhnu do sdílené konstanty), bez kontextu, panelů a hledání. Zavřít = textové tlačítko s X jako u panelu, jen s `onClose`.
- Levý sloupec `<nav data-sidebar-tone="panel">`, šířka čtená z `app:menu-width` (bez táhla), sloupec i `main` rolují zvlášť.
- Esc: listener na `window`, ignoruje `defaultPrevented` a otevřený překryv (`[data-state=open]` u `role=dialog|menu|listbox`, popover obsah radix).
- Pod `md`: sloupec nad obsahem, `overflow-x-hidden`. Nadpis `truncate` + `title`.

## 3. `StandaloneNav`
- Vykreslení položky a nadpisu sekce vytáhnu z `ShellNav` (`ShellNavSection`, položka s odznakem, `isActive` podle trasy) do sdíleného modulu `layout/nav-items.tsx`; `AppShell` i `StandaloneNav` ho používají.
- Skupiny nesbalitelné, tón panelu. Pod `md` (`useIsMobile`) `OptionSelect`/Select s položkami ve skupinách podle sekce; výběr naviguje přes `to`.

## 4. `ContextSwitcher`
- Rozšíření místo duplikace: seznam s hledáním z `CompanySwitcher` vytáhnu do sdíleného `ContextSwitcherList` (Command, prázdný stav, ✓, klávesnice). `CompanySwitcher` ho dál používá beze změny vzhledu i API; `ContextSwitcher` = jiné tlačítko (varianta „block“ přes celou šířku sloupce: čtvereček s iniciálami/ikonou · label tučně · description šedě · ▾) nad stejným seznamem.
- Props `label`, `description?`, `icon?`, `items {id,label,trailing?,current?}`, `value`, `onValueChange`, `actions {id,label,icon,onSelect}`, `searchThreshold=6`, `texts?`.
- Zelená tečka u `current` (token `success`), hledání jen od prahu, akce pod oddělovačem. Esc zavře jen popover (`stopPropagation` + `preventDefault`, shell tedy nereaguje).
- Popover `min-w-[var(--radix-popover-trigger-width)] max-w-[22rem]`, názvy `TruncatedText`. Texty `DsTexts.contextSwitcher` CS/SK.

## 5. `ConfirmByTypingDialog`
- Dialog na shadcn `Dialog`, props dle zadání. Pokyn „Pro potvrzení opište: **{confirmText}**“, pole `Input`, volitelný `CheckboxField`.
- Tlačítko aktivní jen při `value.trim() === confirmText` a zaškrtnutí; během běhu spinner, `onOpenChange`/Esc/overlay zablokované; chyba → `NoticeBar tone="danger"` v dialogu; úspěch zavře a vynuluje stav. Tlačítka jen textová, destruktivní červené. Texty v `DsTexts`.

## 6. `DangerZone`
- Sekce s okrajem `border-destructive`, nadpis přes `SectionHeading` (výchozí „Nebezpečná zóna“ z `DsTexts`), řádky title/description/action, oddělené linkou; nezalamuje nadpisy, tmavý motiv přes tokeny.

## 7. `NoticeBar`
- Akce vpravo už umí (`actions`). Chybí neutrální varianta → přidám `tone="neutral"` (ikona Info, `border-l-border bg-muted`), zavírací aria-label přesunu do `texts`/DsTexts.

## 8. Ukázka „Nastavení prostoru“
- Nová trasa v náhledu + odkaz v navigaci ukázek: shell s `ContextSwitcher` (3 prostory, 2 akce), `StandaloneNav` se třemi sekcemi dle zadání, `NoticeBar` neutral s akcí, grid firem, přepínač role „člen“ (jen Údaje prostoru), stav bez prostoru, `DangerZone` s oběma variantami `ConfirmByTypingDialog`.
- Ověření v prohlížeči: úzké okno, zoom 70 % a 200 %.

## 9. Dokumentace a testy
- `system.md`: pravidla o prostorech, `ContextSwitcher`, nevratných akcích; README changelog 2.79.0 + ukázka; AGENTS.md pravidlo o sdíleném zoomu a vykreslení menu; roadmap.
- `design-system.json`: nové komponenty s usage/examples/antipatterns, verze 2.79.0.
- `.lovable/rules/*.md`: doplním nové komponenty a `tone="neutral"` do stávajících souborů, nic nemažu; porovnám s předchozí verzí (git diff), že žádná sekce nezmizela.
- Testy (`tests/unit/standalone-279.test.tsx`): Esc s otevřeným popoverem/dialogem shell nezavře, bez překryvu zavře; Esc v `ContextSwitcher` zavře jen popover; potvrzení jen při shodě + zaškrtnutí; chyba nechá dialog otevřený; úspěch zavře; hook zoomu v obou shellech (Ctrl+plus mění kořen); `StandaloneNav` pod `md` = Select; hledání až od prahu; `CompanySwitcher` beze změny.
- Na konci `bun test tests/unit`, `bunx tsgo --noEmit`, shrnutí a počet testů.
