export type LegalFormOption = { code: string; name: string };

/** Číselník právnych foriem (ŠÚ SR / Finstat) – najpoužívanejšie položky pre SR. */
export const LEGAL_FORMS: LegalFormOption[] = [
  { code: "101", name: "Podnikateľ-fyzická osoba-nezapísaný v obchodnom registri" },
  { code: "102", name: "Podnikateľ-fyzická osoba-zapísaný v obchodnom registri" },
  { code: "103", name: "Samostatne hospodáriaci roľník nezapísaný v obchodnom registri" },
  { code: "104", name: "Samostatne hospodáriaci roľník zapísaný v obchodnom registri" },
  {
    code: "105",
    name: "Slobodné povolanie-fyzická osoba podnikajúca na základe iného ako živnostenského zákona",
  },
  {
    code: "106",
    name: "Slobodné povolanie-fyzická osoba podnikajúca na základe iného ako živnostenského zákona zapísaná v obchodnom registri",
  },
  { code: "111", name: "Verejná obchodná spoločnosť" },
  { code: "112", name: "Spoločnosť s ručením obmedzeným" },
  { code: "113", name: "Komanditná spoločnosť" },
  { code: "117", name: "Nadácia" },
  { code: "118", name: "Neinvestičný fond" },
  { code: "121", name: "Akciová spoločnosť" },
  { code: "122", name: "Jednoduchá spoločnosť na akcie" },
  { code: "123", name: "Európska spoločnosť" },
  { code: "205", name: "Družstvo" },
  { code: "271", name: "Spoločenstvo vlastníkov pozemkov, bytov a nebytových priestorov" },
  { code: "301", name: "Štátny podnik" },
  { code: "321", name: "Rozpočtová organizácia" },
  { code: "331", name: "Príspevková organizácia" },
  { code: "381", name: "Fondy" },
  { code: "382", name: "Verejnoprávna inštitúcia" },
  { code: "421", name: "Zahraničná osoba, právnická osoba so sídlom mimo územia SR" },
  { code: "521", name: "Samostatná pobočka zahraničnej právnickej osoby" },
  { code: "601", name: "Vysoká škola (verejná, štátna)" },
  { code: "701", name: "Združenie (zväz, spolok, spoločnosť, klub a i.)" },
  { code: "711", name: "Politická strana, politické hnutie" },
  { code: "721", name: "Cirkevná organizácia" },
  { code: "741", name: "Stavovská organizácia - profesná komora" },
  { code: "745", name: "Komora (s vynimkou profesných komôr)" },
  { code: "751", name: "Záujmové združenie právnických osôb" },
  { code: "801", name: "Obec (obecný úrad)" },
  { code: "804", name: "Samosprávny kraj" },
  { code: "921", name: "Medzinárodné organizácie a združenia" },
  { code: "931", name: "Zastúpenie zahraničnej právnickej osoby" },
  { code: "801x", name: "Nezisková organizácia poskytujúca všeobecne prospešné služby" },
];

export function findLegalForm(value?: string | null): LegalFormOption | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  return LEGAL_FORMS.find((f) => f.name.toLowerCase() === v || f.code === v);
}
