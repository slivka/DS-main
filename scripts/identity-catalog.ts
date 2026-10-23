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
  for (const name of ["bookCode", "fullLabel"])
    if (!identity.props.some((prop) => prop.name === name))
      identity.props.push({ name, type: "string" });
  identity.usage =
    "IdentityLine never wraps: jedna výška --control-h. Ústup: název účtu → fallbackShort → trojtečka stavu → trojtečka knihy → bookCode → samotný kód účtu → ikona stavu → ořez levé části na hraně. Pravá část nikdy nepřekreslí levou a skutečné číslo se nezkracuje. fullLabel zpřístupňuje celou identitu v bublině i aria-label. Plný fallback zůstává dostupný i u ikony. Písmo ani měřítko se nezmenšují; jediný ResizeObserver a hystereze brání kmitání.";
  identity.examples ??= [];
  const example = {
    label: "Koncept v úzkém formuláři",
    code: "<IdentityLine items={[book, period, account]} fallback={texts.numberPending} fallbackShort={texts.fallbackShort} />",
  };
  if (!identity.examples.some((item) => item.label === example.label))
    identity.examples.push(example);
  const extreme = { label: "Krajní šířka bez překryvu", code:
    '<IdentityLine items={[book, period, account]} bookCode="FP" fullLabel={fullIdentity} fallback={pendingText} fallbackShort={shortPendingText} />' };
  if (!identity.examples.some((item) => item.label === extreme.label)) identity.examples.push(extreme);
  identity.antipatterns ??= [];
  const rule =
    "Identitu nezalamujte ani nezkracujte rok, stranu a kód účtu; nevytvářejte ResizeObserver při každém vykreslení.";
  if (!identity.antipatterns.includes(rule)) identity.antipatterns.push(rule);
  const clipping = "Ořez hodnot na hraně levé části nikdy nenahrazujte překryvem pravé části ani zmenšením písma. Pro složené položky předejte fullLabel.";
  if (!identity.antipatterns.includes(clipping)) identity.antipatterns.push(clipping);
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
