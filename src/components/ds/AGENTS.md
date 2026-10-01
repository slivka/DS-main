# Pravidla kvality DS

## Dialogy záznamů

Všechny ovládací prvky a hodnoty jen ke čtení mají výšku `--control-h`. Řádky jednoho dialogu sdílejí svislé linky 12sloupcové mřížky. Vysvětlení patří pod sekci (`FieldGrid.hint`), `Field.hint` jen výjimečně. Záložky jen pro rovnocenné a obsáhlé části; méně než ~8 řádků polí = sekce pod sebou. Dialog s jedinou záložkou lištu nemá. Co po založení nejde měnit, je `FieldValue` (s `lockedReason`), ne zakázané pole. Okamžitě ukládané ovládání (matice oprávnění) do dialogu s Uložit nepatří. Malé editovatelné tabulky v dialogu = `FieldTable`, ne vlastní `<table>`.

- Před implementací vyhledej existující komponenty, hooky, typy a pomocné funkce a použij je; druhou implementaci stejného pravidla nevytvářej. Proč: jedno místo pravidla.
- Zachovávej existující chování mimo rozsah zadání; závažný problém ohlas a navrhni řešení, nevyžádaný refaktoring nedělej. Proč: každá zpráva má jedno téma a kontroluje se diffem.
- Soubor nad 300 řádků posuď a v plánu napiš, proč zůstává pohromadě; nad 500 řádků lint varuje a nový soubor nad 500 se nepřijme; komponenta ≤ 300, funkce ≤ 60 řádků; řádek ≤ 100 znaků (Prettier). Proč: soubor, který nejde přečíst za 10 minut, nejde zkontrolovat.
- Komponenta nad 30 props se dělí (konfigurační objekt, podkomponenty, slot). Proč: DataGrid se 77 props nejde zkontrolovat.
- Texty jen přes DsTexts (CS i SK), žádné české výchozí řetězce v komponentách. Proč: knihovna bude i slovensky (system.md pravidlo 9).
- Obecné komponenty neznají doménu: žádné natvrdo id sloupců („md“, „vs“, „status“) ani kódy druhů dokladů („FP“, „DDPOZ“); doména jde props nebo document-fields.ts. Proč: DataGrid a DocumentForm musí sloužit i jiným aplikacím.
- Identifikátory anglicky (PascalCase komponenty a typy, camelCase funkce, useXxx hooky, kebab-case ostatní soubory), texty a komentáře česky s diakritikou – nikdy slovensky ani anglicky. Proč: jeden styl v celé knihovně.
- Žádné any, as unknown as, as never, @ts-ignore; ! jen s komentářem proč. Proč: přetypování vypíná kontrolu, která má chytit chybu.
- useEffect jen pro synchronizaci s vnějškem; ne kopírování props do stavu, ne odvozování (useMemo), ne volání callbacku rodiče po změně stavu; eslint-disable pro exhaustive-deps jen s komentářem proč na témže řádku; efekt bez pole závislostí zakázán; globální posluchače (window) v jednom hooku na účel s úklidem. Proč: efekty synchronizující stav jsou zdroj smyček.
- Každý soubor v components/ds a lib začíná hlavičkou (co · vlastní · nesmí); každý export a každý prop má JSDoc; @deprecated s verzí a náhradou, maže se v nejbližší major verzi; workaround má důvod a podmínku odstranění. Proč: čtenář potřebuje důvod, ne popis.
- Testy ověřují chování (render + interakce přes Testing Library, nebo čistá funkce vstup → výstup); readFileSync na src/** v testu je zakázán; Tailwind třídy se netestují řetězcem; názvy testů podle komponenty, ne podle verze. Proč: test nad textem spadne při formátování a nic nedokazuje.
- BREAKING změna vždy s návodem na migraci v CHANGELOG.md; system.md obsahuje jen pravidla, ne poznámky k vydání. Proč: APP se aktualizuje podle CHANGELOG.
- Před dokončením spusť typecheck, lint, test, format:check a build a uveď počty; netvrď, že kontrola prošla, pokud neběžela. Ve shrnutí: co se změnilo a proč, jak ověřeno, co neověřeno. Proč: Claude kontroluje každý krok.
