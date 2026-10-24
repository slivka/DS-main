/** Katalog výkazů · vlastní reference API · nesmí vydávat. */
import type { PanelCatalogComponent } from "./record-panel-catalog";

type Definition = [string, string, string, [string, string][], string, string[]];

const ANTI = "Nepočítejte součty, přepočty ani dorovnání v DS; hodnoty obou jednotek dodává APP/DB.";

/** Doplní komponenty výkazů bez odebrání existujícího API. */
export function enrichStatementCatalog(components: PanelCatalogComponent[]) {
  const definitions: Definition[] = [
    [
      "FinancialStatementView",
      "financial-statement-view",
      "Rozvaha nebo výsledovka jako strom řádků s přepínačem jednotek, kontrolami, prokliky a exportem; editable povolí jen hodnoty nesoučtových řádků.",
      [
        ["kind", "balance | income"],
        ["rows", "StatementRow[]"],
        ["columns", "StatementValueColumn[]"],
        ["currency", "string"],
        ["unit", "full | thousands"],
        ["defaultUnit", "full | thousands"],
        ["onUnitChange", "(unit: StatementUnit) => void"],
        ["checks", "StatementCheck[]"],
        ["onRowOpen", "(row: StatementRow) => void"],
        ["editable", "boolean"],
        ["onValuesChange", "(patch: StatementValuePatch) => void"],
        ["title", "string"],
        ["printContext", "PrintContext"],
        ["exportName", "string"],
        ["storageKey", "string"],
        ["className", "string"],
      ],
      '<FinancialStatementView kind="balance" rows={rows} columns={columns} currency={currency} checks={checks} onRowOpen={openAccounts} />',
      ["Neměňte strukturu řádků v režimu úprav; součtové řádky vrací APP.", ANTI],
    ],
    [
      "StatementChecksBar",
      "statement-checks-bar",
      "Pruh kontrol Aktiva = Pasiva a HV rozvaha = HV výsledovka se stavem a rozdílem od APP.",
      [
        ["checks", "StatementCheck[]"],
        ["decimals", "number"],
        ["className", "string"],
      ],
      '<StatementChecksBar checks={[{ kind: "balance", ok: true }]} />',
      ["Kontroly nevyhodnocujte v DS.", ANTI],
    ],
    [
      "SavedStatementList",
      "saved-statement-list",
      "Grid uložených výkazů s akcemi Otevřít, Přejmenovat, Duplikovat, Smazat (potvrzení) a Nový z účetnictví.",
      [
        ["items", "SavedStatement[]"],
        ["currency", "string"],
        ["onOpen", "(item: SavedStatement) => void"],
        ["onRename", "(item: SavedStatement) => void"],
        ["onDuplicate", "(item: SavedStatement) => void"],
        ["onDelete", "(item: SavedStatement) => void"],
        ["onCreateFromLedger", "() => void"],
        ["loading", "boolean"],
        ["storageKey", "string"],
        ["className", "string"],
      ],
      "<SavedStatementList items={saved} currency={currency} onOpen={openSaved} onDelete={deleteSaved} onCreateFromLedger={createNew} />",
      ["Nemažte bez potvrzení; ukládání a mazání provádí APP.", ANTI],
    ],
    [
      "StatementSaveDialog",
      "statement-save-dialog",
      "RecordDialog uložení výkazu pod názvem s druhem, obdobím a jednotkami.",
      [
        ["open", "boolean"],
        ["onOpenChange", "(open: boolean) => void"],
        ["value", "StatementSaveValue"],
        ["onChange", "(value: StatementSaveValue) => void"],
        ["onSubmit", "() => void"],
        ["periods", "SelectOption[]"],
        ["currency", "string"],
        ["errors", "Partial<Record<keyof StatementSaveValue, string>>"],
        ["error", "string | null"],
        ["busy", "boolean"],
        ["lockStructure", "boolean"],
      ],
      "<StatementSaveDialog open={open} onOpenChange={setOpen} value={draft} onChange={setDraft} periods={periods} currency={currency} onSubmit={save} />",
      ["Nezavírejte dialog před úspěšným uložením v APP.", ANTI],
    ],
    [
      "StatementTemplateEditor",
      "statement-template-editor",
      "Správa šablony výkazu: strom řádků, typ součet / mapovaný, mapování účtů a skupin, přidání, odebrání a pořadí přetažením; validace z props.",
      [
        ["rows", "StatementTemplateRow[]"],
        ["onChange", "(rows: StatementTemplateRow[]) => void"],
        ["mappingOptions", "StatementMappingOption[]"],
        ["issues", "Record<string, string>"],
        ["createRowId", "() => string"],
        ["readOnly", "boolean"],
        ["className", "string"],
      ],
      "<StatementTemplateEditor rows={template} onChange={setTemplate} mappingOptions={accounts} issues={issues} />",
      ["Nevalidujte šablonu v DS; chyby předává APP v issues.", ANTI],
    ],
  ];
  return definitions.map(([name, file, usage, props, example, antipatterns]) => {
    let component = components.find((c) => c.name === name);
    if (!component) {
      component = {
        name,
        file: `src/components/ds/statements/${file}.tsx`,
        import_path: "@/design-system/slivka",
      };
      components.push(component);
    }
    component.usage = usage;
    component.props = props.map(([prop, type]) =>
      /^[a-z_]+( \| [a-z_]+)+$/.test(type)
        ? { name: prop, type: "enum", values: type.split(" | ") }
        : { name: prop, type },
    );
    component.examples = [{ label: "Výkaz z dat APP", code: example }];
    component.antipatterns = antipatterns;
    return component;
  });
}
