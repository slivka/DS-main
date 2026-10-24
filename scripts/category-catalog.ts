/** Katalog kategorií · vlastní kompatibilní obohacení · nesmí odebírat nebo vydávat. */
import { readFileSync, writeFileSync } from "node:fs";
import { renderPanelCatalogSections, type PanelCatalogComponent } from "./record-panel-catalog";

/** Aktualizuje kanonický výběr i přechodové props. */
export function enrichCategoryCatalog(components: PanelCatalogComponent[]) {
  const touched: PanelCatalogComponent[] = [];
  for (const name of ["CategorySelect", "DimensionSelect"]) {
    const component = components.find((item) => item.name === name);
    if (!component) throw new Error(`Chybí ${name} v katalogu.`);
    component.props ??= [];
    const names = [
      "options",
      "value",
      "onChange",
      "onCreate",
      "onEditSelected",
      "allowClear",
      "defaultOpen",
      "initialSearch",
      "id",
      "disabled",
      "className",
      "variant",
    ];
    for (const prop of names)
      if (!component.props.some((item) => item.name === prop))
        component.props.push({
          name: prop,
          type:
            prop === "options"
              ? "CategoryOption[] (code?: string | null; postable?: boolean)"
              : prop.startsWith("on")
                ? "function"
                : "optional",
        });
    const options = component.props.find((item) => item.name === "options");
    if (options)
      options.type =
        "CategoryOption[] (code?: string | null; parentId?: string | null; postable?: boolean)";
    component.usage =
      (name === "DimensionSelect"
        ? "@deprecated Od 2.138.0: alias CategorySelect, odstranění ve 3.0.0. "
        : "") +
      "Výběr ekonomické kategorie ze stromu. Nepovinný kód: kód – název, bez kódu jen název. postable=false zobrazí uzel, ale zakáže výběr. Psaní a Enter potvrzuje; Tab/Escape nevybírá.";
    const previousExamples = component.examples ?? [];
    const previousAntipatterns = component.antipatterns ?? [];
    component.examples = [
      {
        label: "Ekonomická kategorie",
        code: "<CategorySelect options={categories} value={categoryId} onChange={setCategoryId} onEditSelected={editCategory} />",
      },
    ];
    component.examples.push(
      ...previousExamples.filter(
        (item) => !component.examples?.some((next) => next.label === item.label),
      ),
    );
    component.antipatterns = [
      "Neoznačujte ekonomickou kategorii Zakázka ani dimenze; nevykazovatelný uzel nelze vybrat.",
      "Nový kód používá CategorySelect, DimensionSelect je jen přechodový alias.",
    ];
    component.antipatterns.push(
      ...previousAntipatterns.filter((item) => !component.antipatterns?.includes(item)),
    );
    if (name === "CategorySelect")
      component.file = "src/components/ds/accounting/category-select.tsx";
    touched.push(component);
  }
  for (const name of ["JournalLinesEditor", "JournalLinesRecap", "DocumentForm"]) {
    const component = components.find((item) => item.name === name);
    if (!component) throw new Error(`Chybí ${name} v katalogu.`);
    component.props ??= [];
    const add = (prop: string, type: string) => {
      if (!component.props?.some((item) => item.name === prop))
        component.props?.push({ name: prop, type });
    };
    add("categories", "CategoryOption[]");
    if (name === "JournalLinesEditor") {
      add("categoryBySide", "boolean (internal=true, mainAccount=false)");
      add("allowedCategories", '(accountCode: string, side: "MD" / "D") => string[] / null');
      add("categoryRequired", "boolean");
      add("onEditCategory", "(id: string) => void");
      add(
        "onCreateCategory",
        "(searchText: string) => void / Promise<CategoryOption / null / undefined>",
      );
      const suggestions = component.props.find((item) => item.name === "rowSuggestions");
      if (suggestions)
        suggestions.type =
          "JournalRowSuggestions (category; dimension @deprecated 2.138.0 → 3.0.0)";
    }
    for (const prop of component.props)
      if (
        ["dimensions", "onEditDimension", "onCreateDimension", "dimensionRequired"].includes(
          prop.name,
        )
      ) {
        prop.type =
          prop.type.replace(/ \(@deprecated.*\)$/, "") +
          ` (@deprecated 2.138.0: ${prop.name.replace("Dimensions", "Categories").replace("Dimension", "Category").replace("dimensions", "categories").replace("dimension", "category")}; odstranění 3.0.0)`;
      }
    const rule =
      "Kategorie: nové props mají přednost před deprecated dimension aliasy. ID má Kategorie MD / Kategorie DAL; ostatní doklady jeden sloupec na ekonomické straně. allowedCategories zahrnuje vykazovatelné potomky; jediná se doplní a zamkne, nepovolená uložená je chyba. Změna účtu zachová povolenou, jinak ji změní s upozorněním.";
    if (!component.usage?.includes("Kategorie: nové props"))
      component.usage = `${component.usage ?? ""} ${rule}`;
    component.examples ??= [];
    if (!component.examples.some((item) => item.label === "Kategorie interního dokladu"))
      component.examples.push({
        label: "Kategorie interního dokladu",
        code:
          name === "JournalLinesEditor"
            ? "<JournalLinesEditor {...documentRows} categories={categories} categoryBySide allowedCategories={allowedCategories} onEditCategory={editCategory} />"
            : `<${name} {...props} categories={categories} />`,
      });
    component.antipatterns ??= [];
    const avoid =
      "Nepoužívejte nové DimensionBar pro ekonomickou kategorii; neodstraňujte deprecated aliasy před 3.0.0.";
    if (!component.antipatterns.includes(avoid)) component.antipatterns.push(avoid);
    touched.push(component);
  }
  return touched;
}
if (import.meta.main) {
  const path = ".lovable/design-system.json";
  const catalog = JSON.parse(readFileSync(path, "utf8")) as { components: PanelCatalogComponent[] };
  const touched = enrichCategoryCatalog(catalog.components);
  writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  const ref = ".lovable/rules/components.md";
  writeFileSync(ref, renderPanelCatalogSections(readFileSync(ref, "utf8"), touched));
}
