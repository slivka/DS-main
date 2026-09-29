# Párování P2b – část B, verze 2.60.0

## Cíl
Rozšířit formulář dokladu o stavové štítky a informační pruhy, doplnit univerzální `NoticeBar` a opravit názvy seskupení podle skrytých sloupců. Vše bude zpětně kompatibilní; nové vlastnosti zůstanou volitelné. Verze balíčku bude 2.60.0, `.lovable/meta.yaml` zůstane bez neprázdných `upstream_versions` a vydání provede Petr.

## Veřejné API
- `DocumentForm.titleBadges?: ReactNode`
  - vykreslit bezprostředně za `DocumentStatusBadge` v jednom nezalamovaném řádku;
  - sjednotit výšku vložených stavových štítků s hlavním stavem dokladu.
- Nový exportovaný `NoticeBar`:
  - `tone: "info" | "warning" | "success" | "danger"`;
  - `title?: ReactNode`, `children: ReactNode`, `actions?: ReactNode`, `onClose?: () => void`, `className?: string`;
  - tónová ikona, barevný levý okraj, jemné tokenové pozadí, tmavý režim a přístupné zavření;
  - na úzké šířce budou akce pod textem, jinak vpravo.
- `DocumentForm.notices?: ReactNode`
  - oblast pod chybovým pruhem a nad `ReadOnlyBanner`;
  - více vložených pruhů dostane jednotné mezery.
- `DocumentForm.readOnlyTitle?: ReactNode` a `readOnlyActions?: ReactNode`
  - předat přímo do existujícího `ReadOnlyBanner`.
- `DataGrid` bez nového prop:
  - seskupovací čip, záhlaví skupiny i volby úrovní budou hledat popisek v úplné definici sloupců, nikoli jen mezi právě viditelnými;
  - stávající použití a exporty zůstanou beze změny.

## Provedení a ukázky
1. Vytvořit samostatný `NoticeBar` s pojmenovaným typem props, tokenovými variantami tónů a veřejným exportem.
2. Upravit hlavičku `DocumentForm` a pořadí pruhů na: akce → chyba → notices → jen pro čtení.
3. Opravit zdroj popisků seskupení v `DataGrid`; hodnoty a tabulkové sloupce zůstanou řízené dosavadní viditelností.
4. Rozšířit ukázku Účetní formuláře:
   - faktura: stav + „Částečně uhrazeno“;
   - informační `NoticeBar` o přeplatku 200,00 Kč a textová akce „Použít VS“;
   - doklad kurzových rozdílů pouze pro čtení s vlastním nadpisem a akcí „Otevřít párování“;
   - grid seskupený podle výchozího skrytého sloupce, kde čip i záhlaví ukážou jeho český popisek.
5. Zachovat měnové značky z ukázkových dat a nezalamování nadpisů/popisků.

## Dotčené soubory
- Nový prvek zpětné vazby v `src/components/ds/feedback/`.
- `src/components/ds/accounting/document-form.tsx`.
- `src/components/ds/grid/DataGrid.tsx`; případně pouze cílené testovací zpřístupnění v `grid-grouping.tsx`, bude-li potřeba.
- Veřejné exporty v `src/components/ds/index.ts` (kořenový export jej převezme automaticky).
- Ukázka v `src/components/showcase/DocumentFormShowcase.tsx`, případně malý ukázkový grid ve stejné sekci.
- Testy formuláře/oznámení a seskupení v `tests/unit/`.
- `components.md`, `.lovable/system.md`, `.lovable/design-system.json`, `README.md`, `roadmap.md`, `package.json`.
- `AGENTS.md` pouze pokud při realizaci vznikne nové trvalé konstrukční pravidlo; jinak beze změny.
- `.lovable/meta.yaml` se nebude měnit.

## Dokumentace a katalog
- Popsat nové props `DocumentForm` a úplné API `NoticeBar`.
- Do `system.md` doplnit volbu:
  - `NoticeBar` pro provozní informaci/varování a volitelnou akci;
  - `DocumentForm.error` pro chybu bránící uložení;
  - `ReadOnlyBanner` pro důvod nepřístupné editace.
- V katalogu nastavit verzi 2.60.0 a u `NoticeBar` doplnit použití, realistický příklad i případy, kdy jej nepoužít; aktualizovat props `DocumentForm`.
- Zapsat verzi 2.60.0 a stručný přehled změn bez přidání `upstream_versions`.

## Testy a ověření
- `DocumentForm`:
  - `titleBadges` je v HTML za stavem a v nezalamovaném společném obalu;
  - `notices` je za `error` a před bannerem jen pro čtení;
  - `readOnlyTitle` a `readOnlyActions` se objeví v banneru.
- `NoticeBar`:
  - všechny čtyři tóny mají správný stav, ikonu a tokenovou variantu;
  - vykreslí titulek, obsah a akce;
  - zavírací tlačítko zavolá `onClose` a má český přístupný popisek.
- `DataGrid`:
  - sloupec s `defaultVisible: false` zobrazí svůj `label` v seskupovacím čipu i záhlaví skupiny;
  - totéž po uživatelském vypnutí sloupce;
  - nikde se nezobrazí technické id typu `group:`.
- Spustit všechny jednotkové testy, kontrolu typů a uživatelem požadovaný produkční build.
- Prokliknout ukázku na široké i úzké šířce, ověřit pořadí pruhů, nezalamování štítků, přesun akcí a popisek skrytého seskupení; zkontrolovat konzoli.
- Na závěr uvést změněné soubory, nové props, počty testů a výsledek produkčního buildu.
