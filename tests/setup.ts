/**
 * Společné DOM prostředí jednotkových testů.
 * Vlastní: jedinou registraci happy-dom pro celý běh Bun testů.
 * Nesmí: odpojovat globální DOM mezi jednotlivými testovacími soubory.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register({ url: "http://localhost/", width: 1600, height: 1000 });
}