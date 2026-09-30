# Úklid 1C – pojistky kvality a pravidla DS (verze 2.82.0)

Bez změny chování a veřejného API (kromě nového aliasu `fileName`). Release se nedělá, `.lovable/meta.yaml` zůstává beze změny.

## Nejdřív se změří výchozí stav
Před úpravami se spustí `typecheck`, `lint`, `test`, `format:check` a `build` a zapíšou se počty. Totéž se spustí po úpravách a obojí se porovná ve shrnutí.

## Soubory, které se změní

| Soubor | Změna |
|---|---|
| `package.json` | verze 2.82.0; `"test": "bun test tests/unit"`; `"typecheck": "tsgo --noEmit"`. Do `node_modules/.bin` je teď vidět jen `tsc`, proto se nejdřív ověří, jestli jde `tsgo` spustit v projektu. Když ne, použije se `tsc --noEmit` a zapíše se to do shrnutí. |
| `tests/unit/grid-toolbar-2211.test.ts` | import `vitest` se nahradí za `bun:test`, nic jiného se nemění |
| `eslint.config.js` | nová pravidla, přesné znění je níže |
| `src/**` (33 výskytů v 13 souborech) | `any`, `as unknown as` a `as never` se nahradí jen správným typem (generika, `satisfies`, zúžení). Místa, kde by to znamenalo změnit logiku, zůstanou a vypíšou se. |
| `src/components/ds/grid/grid-export.tsx` | nový prop `fileName`; `fijename` zůstane jako alias `/** @deprecated od 2.82.0 – použij fileName */`. Použije se `fileName ?? fijename` a jeden z nich musí být zadaný. Typ se zapíše jako sjednocení, aby veřejné API zůstalo zpětně kompatibilní. |
| `src/components/ds/grid/DataGrid.tsx` | na řádku 1181 se `fijename=` přepne na `fileName=` |
| ukázky a testy s `fijename` | přepnou se na `fileName` (najdou se přes `rg`) |
| `.lovable/design-system.json`, `.lovable/rules/components.md` | doplní se `fileName` a u `fijename` se označí, že je zastaralý. Obsah všech dosavadních pravidel zůstane. |
| `CHANGELOG.md` (nový) | celý changelog z README, seřazený od nejnovější verze. Doplní se chybějící verze 2.70, 2.72, 2.74, 2.76, 2.78 a 2.80, každá jednou větou podle historie commitů, a 2.81 a 2.82. Přibudou sem i poznámky k vydání ze `system.md`. |
| `README.md` | zůstane jen účel, instalace, použití (současné ukázky), skripty a odkazy na `CHANGELOG.md`, `.lovable/system.md` a `AGENTS.md` |
| `.lovable/system.md` | poznámky k vydání se přesunou do CHANGELOG, pravidla zůstanou doslova (podrobnosti níže) |
| `null` (v kořeni) | smazat |
| `AGENTS.md` (kořenový) | jen přidat jeden odkazový řádek (viz níže) |
| `src/components/ds/AGENTS.md` (nový) | 13 pravidel doslova podle zadání |
| `roadmap.md` | záznam 2.82.0 |

## Pravidla ESLint (přesné znění)
```js
"@typescript-eslint/no-explicit-any": "error",
"@typescript-eslint/no-unused-vars": "warn",
"max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
"no-restricted-syntax": ["error",
  { selector: "TSAsExpression > TSUnknownKeyword", message: "Použij správný typ; přetypování přes unknown/never je zakázané" },
  { selector: "TSAsExpression > TSNeverKeyword",  message: "Použij správný typ; přetypování přes unknown/never je zakázané" }],
```
Pro `**/*.test.{ts,tsx}` přibude zvláštní blok:
```js
"no-restricted-imports": ["warn", { paths: [
  { name: "node:fs", message: "Testy ověřují chování, ne zdrojový text" },
  { name: "fs",      message: "Testy ověřují chování, ne zdrojový text" }] }]
```
Poznámka: `no-explicit-any` a `no-restricted-syntax` platí jako chyba i v testech a ve složce `src/components/ui` (shadcn). Když tam něco zůstane, vypíše se to ve shrnutí jako počet chyb. Lint se v tomto kroku nevynucuje, testy ani soubory shadcn se kvůli tomu neupravují.

## `.lovable/system.md` – co se přesune
- Do CHANGELOG se celé přesunou tyto sekce: „DS 2.64.0“, „DS 2.66.0“, „DS 2.68.0“, „BREAKING pro aplikace – migrace na 2.53.0“ a „Nové API 2.53.0“. Také věty typu „od 2.xx…“, které vysvětlují historii a nejsou pravidlem.
- Z nadpisů pravidel se odebere číslo verze, například „Pravidlo 20 – nadpisy a popisky (2.54.0, závazné)“ se změní na „Pravidlo 20 – nadpisy a popisky (závazné)“. Text pravidel se nemění.
- Když sekce „DS 2.6x“ obsahuje i závazné pravidlo, pravidlo zůstane v system.md pod věcným nadpisem a jen popis vydání se přesune.

## Pravidla pro AGENTS.md
Kořenový `AGENTS.md` má dnes 1 994 bajtů a limit je 2 048, takže se do něj 13 pravidel nevejde. Proto:
- Pravidla se doslova v zadaném znění vloží do nového souboru `src/components/ds/AGENTS.md`. Je to pravidlový soubor DS, obdoba `src/components/ds/accounting/AGENTS.md`.
- Do kořenového `AGENTS.md` se přidá jen řádek: `- Pravidla kvality DS: src/components/ds/AGENTS.md.` Nic se v něm nemaže ani nepřeformulovává. Pokud by i tento řádek překročil limit, zkrátí se na `- Kvalita DS: src/components/ds/AGENTS.md.`

Pokud chcete pravidla přímo v kořenovém souboru, musely by se z něj přesunout jiné řádky, což zadání zakazuje. Proto navrhuji tento postup.

## Co se nemění
Komponenty, texty pro uživatele, logika, testy (kromě importu `bun:test` a přepnutí na `fileName`) a `.lovable/meta.yaml`. Dlouhé soubory ani komponenty s mnoha props (DataGrid) se teď nedělí. Pravidla to jen ohlašují a lint na to upozorní varováním.

## Ověření na konci
`typecheck`, `lint` (chyby a varování před a po), `test` (počet před a po, všechny musí projít), `format:check` a `build`. Kontrola, že v CHANGELOG nic nechybí: každý nadpis verze z původního README a každá přesunutá sekce ze system.md se v něm dohledá. Shrnutí uvede, co se změnilo, kde a proč, co se nezměnilo a proč, a co se neověřilo.
