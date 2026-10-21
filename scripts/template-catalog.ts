/** Katalog vzorů · vlastní extrakci veřejných props · nesmí vydávat ani odebírat API. */
import { readFileSync } from "node:fs";
import ts from "typescript";
import type { PanelCatalogComponent } from "./record-panel-catalog";
const definitions = [
  {
    name: "DocumentNewMenu",
    file: "document-new-menu",
    usage:
      "Nabídka Nový v DataGrid.toolbarLeft: prázdný doklad, vzory s jedním dokladem/sérií a správa. APP dodává vzory a callbacky. label/icon/onPrimary umožní dvě nezávislá split-button tlačítka pro pokladnu.",
    code: "<DocumentNewMenu templates={templates} onBlank={openBlank} onTemplate={openFromTemplate} onManage={openManager} />",
  },
  {
    name: "DuplicationDialog",
    file: "duplication-dialog",
    usage:
      "Řízený dialog jednoho dokladu nebo série s náhledem APP. RecordDialog chrání změny; vytvoření je blokované bez platného náhledu.",
    code: '<DuplicationDialog open={open} onOpenChange={setOpen} value={parameters} onChange={setParameters} rows={preview} loading={loading} error={error} dirty={dirty} busy={busy} storageKey="invoice-duplicate" onCreate={createDocuments} />',
  },
  {
    name: "DuplicationPreview",
    file: "duplication-preview",
    usage:
      "Náhled již zmapovaných řádků v DataGrid. canCreate určuje souhrn; důvod nevytvoření má ikonu a tooltip bez změny výšky.",
    code: '<DuplicationPreview rows={previewRows} loading={loading} storageKey="invoice-preview" />',
  },
  {
    name: "TemplateEditBanner",
    file: "template-edit-banner",
    usage:
      "Pruh Upravujete vzor se společnými akcemi. V dokladu použijte DocumentForm.templateEdit, funguje pro faktury i ZL.",
    code: "<TemplateEditBanner template={{ name: template.name, onSave: saveTemplate, onDiscard: discardTemplate, busy }} />",
  },
  {
    name: "TemplateManager",
    file: "template-manager",
    usage:
      "Správa vzorů jako obsah panelu; samostatná oprávnění canRename/canShare/canEdit/canDelete a důvody. Smazání přes ConfirmDialog.",
    code: '<TemplateManager templates={templates} storageKey="document-templates" onAction={handleTemplateAction} loading={loading} error={error} />',
  },
  {
    name: "TemplateManagerDialog",
    file: "template-manager",
    usage:
      "Správa vzorů ve sdíleném dialogu md. Nemá společné Uložit; individuální akce předává APP a chybu zobrazí v patičce.",
    code: '<TemplateManagerDialog open={open} onOpenChange={setOpen} templates={templates} storageKey="template-manager-dialog" onAction={handleTemplateAction} error={error} />',
  },
];
function getProps(file: string, name: string): NonNullable<PanelCatalogComponent["props"]> {
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = source.statements.find(
    (node): node is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(node) && node.name.text === `${name}Props`,
  );
  if (!declaration) throw new Error(`Chybí rozhraní ${name}Props`);
  const result: NonNullable<PanelCatalogComponent["props"]> = [];
  if (name === "TemplateManagerDialog") result.push(...getProps(file, "TemplateManager"));
  for (const member of declaration.members) {
    if (!ts.isPropertySignature(member) || !member.type) continue;
    result.push({
      name: member.name.getText(source),
      type: member.type.getText(source),
      required: !member.questionToken,
    });
  }
  return result;
}
/** Doplní katalog aditivně a vrátí sekce pro existující renderer. */
export function enrichTemplateCatalog(components: PanelCatalogComponent[]) {
  const touched: PanelCatalogComponent[] = [];
  for (const definition of definitions) {
    const file = `src/components/ds/templates/${definition.file}.tsx`;
    let component = components.find((item) => item.name === definition.name);
    if (!component) {
      component = { name: definition.name };
      components.push(component);
    }
    component.file = file;
    component.import_path = "@/design-system/{slug}";
    component.usage = definition.usage;
    component.props = getProps(file, definition.name);
    component.examples ??= [];
    if (!component.examples.some((example) => example.label === "Duplikace a vzory"))
      component.examples.push({ label: "Duplikace a vzory", code: definition.code });
    component.antipatterns ??= [];
    const rule =
      "Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.";
    if (!component.antipatterns.includes(rule)) component.antipatterns.push(rule);
    touched.push(component);
  }
  for (const [name, prop, type, usage, code] of [
    [
      "DocumentForm",
      "templateEdit",
      "TemplateEditState",
      " Pruh vzoru přes templateEdit sdílí faktury i ZL nad identitou.",
      "<DocumentForm {...formProps} templateEdit={{ name, onSave: saveTemplate, onDiscard: discardTemplate }} />",
    ],
    [
      "RecordDialog",
      "submitDisabled",
      "boolean",
      " submitDisabled blokuje uložení i klávesou; zavření zůstává dostupné.",
      '<RecordDialog open={open} size="md" title={title} onOpenChange={setOpen} submitDisabled={!canCreate} onSubmit={create} />',
    ],
  ]) {
    const component = components.find((item) => item.name === name);
    if (!component || !prop || !type || !usage || !code) continue;
    component.props ??= [];
    if (!component.props.some((item) => item.name === prop))
      component.props.push({ name: prop, type });
    if (!component.usage?.includes(usage.trim())) component.usage = (component.usage ?? "") + usage;
    component.examples ??= [];
    if (!component.examples.some((example) => example.label === "Duplikace a vzory"))
      component.examples.push({ label: "Duplikace a vzory", code });
    touched.push(component);
  }
  return touched;
}
