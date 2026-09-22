# Automatické testy vzorového Excelu

## Změna
- Přidat testovací nastavení pro Chromium, Firefox a WebKit.
- V každém prohlížeči otevřít stránku exportu, stáhnout vzorový soubor a ověřit název, velikost a platný XLSX obsah.
- Společnou hloubkovou kontrolou načíst sešit přes ExcelJS a ověřit tabulku, součtové vzorce, formáty a chybějící chybové hodnoty.
- Soubor automaticky otevřít a přepočítat v LibreOffice; selhání nebo varování při opravě souboru test ukončí chybou.
- Přidat jednoduchý příkaz pro spuštění testů, zapsat změnu verze a ověřit celou sadu.
