# Oprava veřejného zapojení knihovny

## Změny
- Doplnit do metadata přesné verze TanStack Query, TanStack Router, Tailwind CSS a Lucide podle `package.json`.
- Rozšířit hlavní barrel export o celé veřejné API TanStack Query a Lucide ikon.
- Zachovat současné importy PDF fontů: kontrola potvrdila, že Vite oba TTF soubory otiskne do klientského i serverového produkčního výstupu a importované URL používá načítání do jsPDF VFS.

## Ověření
- Spustit typovou kontrolu a produkční sestavení.
- Ověřit přítomnost obou fontů ve výsledných assets a veřejnou dostupnost vybraných Query hooků a Lucide typů/ikon.
