/** Katalog importních prvků · vlastní autorskou extrakci · nesmí vydávat knihovnu. */
import { readFileSync } from "node:fs";
import ts from "typescript";
import type { PanelCatalogComponent } from "./record-panel-catalog";
const definitions = [
  [
    "FileDropZone",
    "feedback/file-drop-zone",
    "Výběr a přetažení sdílejí validateFiles, limit typu/velikosti/počtu. maxFiles je zbývající kapacita další dávky. size sm je kompaktní pruh; children pojmou přehled APP.",
    '<FileDropZone accept={[".xml", "application/pdf"]} maxFiles={remainingSlots} maxSizeBytes={limit} onFiles={addFiles} onReject={showRejected} hint={limitsLabel}>{overview}</FileDropZone>',
  ],
  [
    "FileChipBar",
    "feedback/file-chip-bar",
    "Řízené čipy FileChip (id, file, severity, message), odebrání podle id a přidání/přetažení další dávky. maxVisible zapne +N, jinak se všechny zalomí.",
    "<FileChipBar files={files} onRemove={removeFile} accept={accept} maxSizeBytes={limit} maxFiles={remainingSlots} onFiles={addFiles} onReject={showRejected} maxVisible={3} />",
  ],
  [
    "FileSeverityIcon",
    "feedback/file-severity",
    "Sdílená přístupná stavová ikona souboru nebo kontroly; message od APP je tooltip i přístupný název.",
    '<FileSeverityIcon severity="warning" message={check.detail} />',
  ],
  [
    "PaneDropOverlay",
    "layout/pane-drop-overlay",
    "Obal podokna nebo stránky. Pouze soubory OS (Files), žádné interní DnD; vnořený povolený cíl má přednost. Volitelné limity přes sdílenou validaci.",
    "<PaneDropOverlay label={texts.dropToImport} onFiles={startImport} disabled={!canImport}><DataGrid {...gridProps} /></PaneDropOverlay>",
  ],
  [
    "CheckList",
    "feedback/check-list",
    "Výsledky kontrol APP (severity, title, detail, action). Souhrn chyb/upozornění; pořadí error → warning → info → ok, bez doménové kontroly.",
    '<CheckList items={statement.checks} size="sm" />',
  ],
  [
    "SelectableGroupList",
    "data-display/selectable-group-list",
    "Skupiny s počtem a nezávislým activeId/checkedIds. Chyba či disabled blokuje zaškrtnutí, nikoli detail; důvod v tooltipu. Šipky/Home/End posouvají, mezerník zaškrtne, hromadná akce jen povolené.",
    "<SelectableGroupList groups={groups} activeId={activeId} onActiveChange={setActiveId} checkedIds={checkedIds} onCheckedChange={setCheckedIds} />",
  ],
];
/** Doplní zdrojové props a idempotentní dokumentaci. */
export function enrichFileImportCatalog(components: PanelCatalogComponent[]) {
  const touched: PanelCatalogComponent[] = [];
  for (const [name, slug, usage, code] of definitions) {
    if (!name || !slug || !usage || !code) continue;
    const file = `src/components/ds/${slug}.tsx`;
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const declaration = source.statements.find(
      (node): node is ts.InterfaceDeclaration =>
        ts.isInterfaceDeclaration(node) && node.name.text === `${name}Props`,
    );
    if (!declaration) throw new Error(`Chybí ${name}Props`);
    let component = components.find((item) => item.name === name);
    if (!component) {
      component = { name };
      components.push(component);
    }
    component.file = file;
    component.import_path = "@/design-system/{slug}";
    component.usage = usage;
    component.props = declaration.members.flatMap((member) =>
      ts.isPropertySignature(member) && member.type
        ? [
            {
              name: member.name.getText(source),
              type: member.type.getText(source),
              required: !member.questionToken,
            },
          ]
        : [],
    );
    component.examples = [{ label: "Import souborů", code }];
    component.antipatterns = [
      "Neprovádějte bankovní kontroly ani parsování v DS; nepřidávejte vlastní validaci výběru či další přijímač stejného přetažení.",
    ];
    touched.push(component);
  }
  const dialog = components.find((item) => item.name === "RecordDialog");
  const size = dialog?.props?.find((prop) => prop.name === "size");
  if (dialog && size) {
    size.values = [...new Set([...(size.values ?? ["sm", "md", "lg"]), "xl"])];
    size.type = '"sm" | "md" | "lg" | "xl"';
    if (!dialog.usage?.includes("size xl"))
      dialog.usage =
        (dialog.usage ?? "") +
        " size xl (80 rem) pro import a rozsáhlé pracovní dialogy; menší velikosti beze změny.";
    touched.push(dialog);
  }
  return touched;
}
