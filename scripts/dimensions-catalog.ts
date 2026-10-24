/** Katalog dimenzí · vlastní veřejný kontrakt a příklady · nesmí vydávat ani odebírat. */
import type { PanelCatalogComponent } from "./record-panel-catalog";
/** Doplní komponenty a nové props, zachovává starší příklady i kompatibilní názvy. */
export function enrichDimensionsCatalog(components: PanelCatalogComponent[]) {
  const definitions = [
    {
      name: "DimensionBar",
      file: "src/components/ds/form/dimension-bar.tsx",
      usage:
        "Řízené chipy pouze přidaných typů dimenzí. Typ s valueId=null je k vyplnění. Enter volí typ a otevře hodnoty; Delete/Backspace odebere chip, Escape zavře bez volby. loadOptions dodává APP; stale odpovědi se ignorují. inactive uložená hodnota je tlumená s bublinou a znovu se nenabízí. variant=bar nebo inline, výška control-h.",
      code: "<DimensionBar types={dimensionTypes} value={dimensions} onChange={setDimensions} loadOptions={loadDimensionOptions} overrides={overrides} />",
      props: [
        ["types", "DimensionType[]"],
        ["value", "DimensionValue[]"],
        ["onChange", "(values: DimensionValue[]) => void"],
        ["loadOptions", "LoadDimensionOptions"],
        ["overrides", "Record<string, number>"],
        ["onReset", "(typeId: string) => void"],
        ["readOnly", "boolean"],
        ["disabled", "boolean"],
        ["variant", "bar | inline"],
        ["size", "default | sm"],
        ["className", "string"],
      ],
    },
    {
      name: "MultiValueCell",
      file: "src/components/ds/data-display/multi-value-cell.tsx",
      usage:
        "Obecná buňka první hodnoty + další, plný seznam v bublině myší i klávesnicí. values i additionalCount dodává APP; variant=all ukáže celý seznam.",
      code: "<MultiValueCell values={dimensionLabels} additionalCount={otherRowsCount} />",
      props: [
        ["values", "MultiValueItem[]"],
        ["additionalCount", "number"],
        ["variant", "compact | all"],
        ["className", "string"],
      ],
    },
    {
      name: "DimensionFilter",
      file: "src/components/ds/form/dimension-filter.tsx",
      usage:
        "Adaptér dimenzí na stávající ColumnFilter: hledání a checklist, prázdný Set znamená bez filtru. APP dodává možnosti a provádí filtrování seznamu dokladů.",
      code: "<DimensionFilter label={type.label} options={options} selected={selectedIds} onSelectionChange={setSelectedIds} />",
      props: [
        ["options", "DimensionOptionItem[]"],
        ["selected", "Set<string>"],
        ["onSelectionChange", "(value: Set<string>) => void"],
        ["label", "string"],
        ["className", "string"],
      ],
    },
  ];
  const touched: PanelCatalogComponent[] = [];
  for (const definition of definitions) {
    let component = components.find((item) => item.name === definition.name);
    if (!component) {
      component = {
        name: definition.name,
        file: definition.file,
        import_path: "@/design-system/slivka",
      };
      components.push(component);
    }
    component.usage = definition.usage;
    component.props ??= [];
    for (const [name, type] of definition.props) {
      if (!name || !type) continue;
      const prop = component.props.find((item) => item.name === name);
      if (prop) prop.type = type;
      else component.props.push({ name, type });
    }
    component.examples ??= [];
    if (!component.examples.some((item) => item.label === "Dimenze B2"))
      component.examples.push({ label: "Dimenze B2", code: definition.code });
    component.antipatterns ??= [];
    const avoid =
      "Nezaměňujte dimenze s ekonomickými kategoriemi; nenabízejte ukončené hodnoty a nepersistujte data v komponentě.";
    if (!component.antipatterns.includes(avoid)) component.antipatterns.push(avoid);
    touched.push(component);
  }
  for (const name of ["DocumentForm", "JournalLinesEditor"]) {
    const component = components.find((item) => item.name === name);
    if (!component) continue;
    component.props ??= [];
    for (const [propName, type] of [
      ["dimensionTypes", "DimensionType[]"],
      [
        "dimensions",
        "DimensionValue[] | CategoryOption[] (@deprecated pouze B1 číselník do 3.0.0)",
      ],
      ["onDimensionsChange", "(values: DimensionValue[]) => void"],
      ["loadDimensionOptions", "LoadDimensionOptions"],
      ["dimensionsBySide", "boolean (internal=true)"],
    ]) {
      if (!propName || !type) continue;
      const prop = component.props.find((item) => item.name === propName);
      if (prop) prop.type = type;
      else component.props.push({ name: propName, type });
    }
    component.examples ??= [];
    if (!component.examples.some((item) => item.label === "Dimenze hlavičky a řádků"))
      component.examples.push({
        label: "Dimenze hlavičky a řádků",
        code: `<${name} {...props} dimensionTypes={types} dimensions={dimensions} onDimensionsChange={setDimensions} loadDimensionOptions={loadOptions} dimensionsBySide />`,
      });
    component.antipatterns ??= [];
    const avoid =
      "Hlavička přepisuje jen inherited hodnoty; ruční MD/DAL nikdy nepřepisujte. toJournalRow zapisuje jen inherited=false a kind z APP určuje value_id/vehicle_id.";
    if (!component.antipatterns.includes(avoid)) component.antipatterns.push(avoid);
    touched.push(component);
  }
  return touched;
}
