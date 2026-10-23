/** Katalog identity · vlastní pravidla jediné výšky · nesmí vydávat ani odebírat API. */
import { readFileSync, writeFileSync } from "node:fs";
import { renderPanelCatalogSections, type PanelCatalogComponent } from "./record-panel-catalog";

/** Obnoví dokumentaci ústupu identity podle aktuálního veřejného kontraktu. */
export function enrichIdentityCatalog(components: PanelCatalogComponent[]) {
  const identity = components.find((item) => item.name === "IdentityLine");
  if (!identity) throw new Error("Chybí IdentityLine v katalogu.");
  identity.props ??= [];
  if (!identity.props.some((prop) => prop.name === "fallbackShort"))
    identity.props.push({ name: "fallbackShort", type: "string" });
  identity.usage =
    "Identita se nikdy nezalamuje a má vždy jednu výšku --control-h. Nejdříve ustupuje název účtu, pak plný fallback nahradí fallbackShort, pak se zkracuje krátký stav a nakonec kniha. Rok, strana a kód účtu zůstávají celé. Plný fallback zůstává v bublině a přístupném názvu. Jediný ResizeObserver a hystereze brání kmitání; při krajním prostoru pro pevné hodnoty se přizpůsobí jejich měřítko bez změny výšky řádku.";
  identity.examples ??= [];
  const example = {
    label: "Koncept v úzkém formuláři",
    code: "<IdentityLine items={[book, period, account]} fallback={texts.numberPending} fallbackShort={texts.fallbackShort} />",
  };
  if (!identity.examples.some((item) => item.label === example.label))
    identity.examples.push(example);
  identity.antipatterns ??= [];
  const rule =
    "Identitu nezalamujte ani nezkracujte rok, stranu a kód účtu; nevytvářejte ResizeObserver při každém vykreslení.";
  if (!identity.antipatterns.includes(rule)) identity.antipatterns.push(rule);
  const document = components.find((item) => item.name === "DocumentForm");
  if (document && !document.usage?.includes("identity.fallbackShort"))
    document.usage =
      (document.usage ?? "") +
      " identity.fallbackShort volitelně přepíše krátký stav, výchozí DsTexts CS/SK je Koncept. Platí společně pro faktury i zálohové listy.";
  return [identity, ...(document ? [document] : [])];
}

if (import.meta.main) {
  const path = ".lovable/design-system.json";
  const catalog = JSON.parse(readFileSync(path, "utf8")) as { components: PanelCatalogComponent[] };
  const updated = enrichIdentityCatalog(catalog.components);
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
  const reference = ".lovable/rules/components.md";
  writeFileSync(reference, renderPanelCatalogSections(readFileSync(reference, "utf8"), updated));
}
