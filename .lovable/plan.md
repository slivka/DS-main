# DS 2.70.0 – oprava zoomu aplikace (reklamace)

Verze v `package.json` → 2.70.0. Release se neprovádí, `.lovable/meta.yaml` se nemění. Nic mimo zoom se nemění.

## Co uživatel uvidí
- Ctrl (Mac: Cmd) + plus / minus / 0 zvětší, zmenší a vrátí celou aplikaci – na české i americké klávesnici, i s kurzorem v poli dokladu. Prohlížeč se přitom nezvětšuje.
- Ctrl/Cmd + kolečko (i roztažení prsty na trackpadu): nad gridem mění jen grid, kdekoli jinde (menu, horní lišta, dialog, formulář) celou aplikaci po 5 %.
- Po zvětšení aplikace rostou i řádky dokladu; když se nevejdou, sloupce přejdou do detailu řádku, až nakonec se roluje.
- „Velikost zobrazení“ v uživatelském menu vždy ukazuje aktuální hodnotu.

## 1. Klávesové zkratky (`src/lib/app-zoom.ts`, `AppShell`)
- Nové `isMacPlatform()` (`navigator.userAgentData?.platform`, jinak `navigator.platform`).
- `isAppZoomShortcut(event, isMac?)` přepsán: modifikátor Cmd na Macu / Ctrl jinde (druhý modifikátor nesmí být stisknut), Alt zakázán, AltGraph → null, Shift povolen.
  - zvětšit: `key` „+“ / „=“ nebo `code` `NumpadAdd`
  - zmenšit: `key` „-“ nebo `code` `NumpadSubtract`
  - obnovit: `key` „0“ nebo `code` `Digit0` / `Numpad0`
- Varianta Ctrl+Alt zrušena (BREAKING, bez kompatibility).
- `AppShell`: zkratka zoomu se vyhodnotí před podmínkou `isEditing` a vždy volá `preventDefault`. Ctrl+B a „/“ beze změny.

## 2. Ctrl/Cmd + kolečko podle polohy
- `app-zoom.ts`: nový `createAppWheelZoom()` – akumulátor delt (přepočet `deltaMode` shodný s `wheelZoom` v gridu), práh 100 px, krok ±5 % přes `setAppZoom`, nejvýš 1 krok / 80 ms, po kroku se akumulátor vynuluje; meze 70–200 % přes `clampAppZoom`. Čistá funkce s injektovaným časem kvůli testům.
- `AppShell`: posluchač `wheel` na `window` s `{ passive: false }`; pokud `defaultPrevented` → nic; jinak při `ctrlKey || metaKey` `preventDefault` a krok zoomu aplikace.
- Gridové handlery (`ZoomGrid`, `ZoomPane`, `useWheelZoom`, editor řádků) zůstávají, jen se ověří, že volají `preventDefault` (a tím mají přednost – posluchač na elementu běží před posluchačem na `window` ve fázi bublání).
- Uživatelské menu už poslouchá `app:zoom-change` přes `useAppZoom`; ověří se, případně doplní.

## 3. Automatický zoom gridů nekompenzuje zoom aplikace
- `grid-auto-zoom.ts` / `useAutoGridZoom`: `calculateAutoGridZoom(šířka px, potřebná šířka px při 16 px)` – odstraněno násobení `rootPx / 16`. Přepočet po `app:zoom-change` zůstává, ale výsledek se nezmění, pokud se nezměnila šířka v px (a pak ani nezruší ruční zoom).
- Editor řádků (`resolveJournalZoomLayout`): nový vstup `appZoom` (= kořen px / 16) a dostupná šířka v px.
  - auto zoom = `calculateAutoGridZoom(šířka px, plná potřebná šířka × 16)` – stejně jako ostatní gridy;
  - kaskáda a rozhodnutí o rolování porovnávají `šířka při 100 % × appZoom × zoom gridu` s dostupnou šířkou;
  - pořadí jeden průchod: plná sada → zoom (auto / ruční) → kaskáda → rolování.
- V editoru `autoInputsKey` přestane obsahovat `rootRemPx` a vychází ze šířky v px, takže změna zoomu aplikace sama auto zoom ani ruční zoom nemění; šířky `colgroup` a úchyt sloupce zůstávají konzistentní (hodnoty v rem už obsahují zoom aplikace přes kořen).

## 4. Dokumentace a ukázka
- `.lovable/system.md`, sekce Zoom: kolečko podle polohy (grid × aplikace), klávesy Cmd/Ctrl + plus/minus/0 převzaté od prohlížeče i v polích, automat gridů nekompenzuje zoom aplikace; sekce BREAKING 2.70.0 (Ctrl+Alt zrušeno).
- `roadmap.md` (changelog) – záznam 2.70.0 s BREAKING.
- Ukázka „Režim více oken“ (PaneShowcase) a doklad: krátký návod – kolečko nad gridem vs. nad menu/lištou, klávesy, doklad v 1 panelu při 110 → 130 % (písmo roste, sloupce do detailu, bez vodorovného posuvníku stránky).
- `components.md` / `README.md` jen tam, kde popisují zkratky Ctrl+Alt.

## Testy (bun)
- Přepsat `app-zoom-264.test.ts` (Ctrl+Alt test odstraněn) a doplnit nový `app-zoom-270.test.ts`:
  - US: Ctrl+= , Ctrl+Shift+= (key „+“), Ctrl+-, Ctrl+0; CZ: `Digit1`/„+“, `Slash`/„-“, Shift+`Digit0`/„0“; numpad;
  - Mac s Cmd funguje, Ctrl na Macu nic; Alt i AltGr ignorovány;
  - zdrojová kontrola, že zkratka zoomu v `AppShell` neleží za `isEditing` a volá `preventDefault` (událost z `<input>` zoom změní);
  - akumulátor kolečka: malé delty bez kroku, práh → jeden krok, trhnutí = jen jeden krok, 80 ms limit, `deltaMode` řádky, meze;
  - auto zoom: 1 panel s appZoom 1,1 → 1,3 zůstane 1,0 a kaskáda skryje sloupce dle potřeby; úzký panel 0,75; změna appZoom bez změny px šířky nemění auto zoom;
  - `grid-auto-zoom.ts` už neobsahuje `rootPx / 16`.
- Upravit `zoom-fixes-264.test.ts` podle nového podpisu `resolveJournalZoomLayout`.
- Playwright kontrola v dev náhledu: kolečko nad gridem vs. nad lištou, klávesy v poli, doklad 110 → 130 %.

## Změněné soubory (předpoklad)
`package.json`, `src/lib/app-zoom.ts`, `src/components/ds/layout/AppShell.tsx`, `src/components/ds/grid/grid-auto-zoom.ts`, případně `grid-zoom.tsx` a `user-menu.tsx`, `src/components/ds/accounting/journal-lines-editor.tsx`, `src/components/showcase/PaneShowcase.tsx`, `.lovable/system.md`, `roadmap.md`, `AGENTS.md` (pravidlo zoomu), testy výše.

Na konci: počet testů, typy, build, seznam změněných souborů.
