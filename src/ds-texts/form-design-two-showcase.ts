/** Překlady náhledových scénářů; nepatří do veřejného DsTexts. */
import { useDsTexts } from "./index";
const CS = {
  title: "Design formulářů 2",
  received: "Přijatá faktura – Edit dokladu 11",
  attention: "Starší zdroj kurzu",
  settings: "Nastavení…",
  supplier: "Dodavatel s.r.o.",
  same: "Stejný kurz DPH",
  issued: "Vydaná faktura EUR",
  different: "Odlišný kurz DPH",
  transfer: "Převodem",
  cash: "Hotově",
  account: "Eurový účet",
  locked: "Hotovostní platba nepoužívá bankovní účet",
  dialog: "Neuložené změny",
  record: "FV 2026/15",
  error: "Uložení se nezdařilo. Doplňte povinné údaje.",
  fail: "Chyba při uložení",
  saved: "Uloženo",
  discarded: "Změny zahozeny",
  bank: "Banka",
};
const SK: typeof CS = {
  title: "Dizajn formulárov 2",
  received: "Prijatá faktúra – Edit dokladu 11",
  attention: "Starší zdroj kurzu",
  settings: "Nastavenia…",
  supplier: "Dodávateľ s.r.o.",
  same: "Rovnaký kurz DPH",
  issued: "Vystavená faktúra EUR",
  different: "Odlišný kurz DPH",
  transfer: "Prevodom",
  cash: "V hotovosti",
  account: "Eurový účet",
  locked: "Hotovostná platba nepoužíva bankový účet",
  dialog: "Neuložené zmeny",
  record: "FV 2026/15",
  error: "Uloženie sa nepodarilo. Doplňte povinné údaje.",
  fail: "Chyba pri ukladaní",
  saved: "Uložené",
  discarded: "Zmeny zahodené",
  bank: "Banka",
};
export function useFormDesignTwoTexts() {
  return useDsTexts().locale === "sk" ? SK : CS;
}
