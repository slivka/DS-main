/** Autorské obohacení formátu sloupců · vlastní příklady a props · nesmí vydávat. */
import type { PanelCatalogComponent } from "./record-panel-catalog";
/** Doplní katalog aditivně bez změny dosavadních příkladů. */
export function enrichColumnFormatCatalog(components: PanelCatalogComponent[]) {
  const touched: PanelCatalogComponent[] = [];
  for (const name of [
    "DataGrid",
    "TreeGrid",
    "GridFrame",
    "JournalLinesEditor",
    "JournalLinesRecap",
    "ColumnPicker",
    "ZoomGrid",
  ]) {
    const component = components.find((item) => item.name === name);
    if (!component) continue;
    const rule =
      " Formát sloupce se nastavuje pouze v ColumnPicker: bold, tone z pevné palety. defaultStyle dodává APP, styleable=false blokuje formát; systémové a transient sloupce se neukládají. Styly patří do GridLayout.styles, pohledů a vlastního výchozího. Skupiny nemají barvu, záhlaví jen spodní proužek. Výběr/hover jsou průsvitné vrstvy nad tónem; chyba má přednost. Excel přebírá formát, tisk mění strong na soft.";
    if (!component.usage?.includes("GridLayout.styles"))
      component.usage = (component.usage ?? "") + rule;
    component.examples ??= [];
    const label = "Formát sloupců";
    if (!component.examples.some((item) => item.label === label))
      component.examples.push({
        label,
        code:
          name === "ColumnPicker"
            ? "<ColumnPicker columns={cols.columns} visible={cols.columnVisible} onToggle={cols.toggle} onReset={cols.reset} styles={cols.styles} onColumnStyleChange={cols.setColumnStyle} onClearColumnStyles={cols.clearColumnStyles} />"
            : '<DataGrid {...props} columns={[{ id: "remaining", label: texts.remaining, numeric: true, value: row => row.remaining, defaultStyle: { bold: true, tone: "blue-soft" } }]} />',
      });
    component.antipatterns ??= [];
    const avoid =
      "Nenabízejte formát v nabídce záhlaví ani volnou barvu; nepřebarvujte odznaky a odkazy.";
    if (!component.antipatterns.includes(avoid)) component.antipatterns.push(avoid);
    if (name === "ColumnPicker") {
      component.props ??= [];
      for (const prop of [
        { name: "styles", type: "Record<string, GridColumnStyle>" },
        { name: "onColumnStyleChange", type: "(id, style: GridColumnStyle | null) => void" },
        { name: "onClearColumnStyles", type: "() => void" },
      ])
        if (!component.props.some((item) => item.name === prop.name)) component.props.push(prop);
    }
    if (name === "ZoomGrid") {
      component.props ??= [];
      if (!component.props.some((item) => item.name === "columnFormat"))
        component.props.push({ name: "columnFormat", type: "{ columns, styles, offset? }" });
    }
    touched.push(component);
  }
  let editor = components.find((item) => item.name === "ColumnFormatEditor");
  if (!editor) {
    editor = {
      name: "ColumnFormatEditor",
      file: "src/components/ds/grid/column-format-editor.tsx",
      import_path: "@/design-system/{slug}",
    };
    components.push(editor);
  }
  editor.props = [
    { name: "value", type: "GridColumnStyle", required: true },
    { name: "onChange", type: "(style: GridColumnStyle) => void", required: true },
    { name: "onClose", type: "() => void", required: true },
    { name: "className", type: "string" },
  ];
  editor.usage =
    "Řízený editor formátu v okně Sloupce. Osm soft/strong tónů a Tučně; šipky mezi vzorky, Enter/mezerník vybere, Escape zavře jen rozbalený editor. Nepoužívejte v nabídce záhlaví.";
  editor.examples = [
    {
      label: "Řízený formát",
      code: "<ColumnFormatEditor value={style} onChange={setStyle} onClose={closeFormat} />",
    },
  ];
  editor.antipatterns = ["Nevytvářejte vlastní paletu nebo ukládání mimo GridLayout.styles."];
  touched.push(editor);
  return touched;
}
