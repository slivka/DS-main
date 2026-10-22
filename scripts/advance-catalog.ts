/** Katalog záloh · vlastní extrakci props a autorskou dokumentaci · nesmí vydávat. */
import { readFileSync } from "node:fs";
import ts from "typescript";
import type { PanelCatalogComponent } from "./record-panel-catalog";
const definitions = [
  [
    "AdvancePaymentBreakdown",
    "advance-payment-breakdown",
    "Dvě roviny platby zálohy skládají SettlementBar a LinkedRecordsPanel. APP dodává částky, lhůtu, stav DD a oprávnění.",
    "<AdvancePaymentBreakdown totals={totals} currency={currency.symbol} planes={planes} taxStatus={status} deadline={{ days: 15, label: deadlineLabel, overdue }} actions={actions} />",
  ],
  [
    "AdvanceAllocationDialog",
    "advance-allocation-dialog",
    "Řízený výběr ZL/DD a přiřazovaných částek; výchozí minimum dodává APP. DS kontroluje meze a chrání změny.",
    '<AdvanceAllocationDialog open={open} onOpenChange={setOpen} target="list" candidates={candidates} value={value} onChange={setValue} remaining={remaining} currency={currency.symbol} storageKey="allocation" dirty={dirty} onAllocate={saveAllocation} />',
  ],
  [
    "AdvanceReasonDialog",
    "advance-reason-dialog",
    "Řízený výběr důvodu DD nebude nebo storna s textem; nabídku právních důvodů poskytuje APP.",
    "<AdvanceReasonDialog open={open} onOpenChange={setOpen} title={title} reasons={reasons} value={value} onChange={setValue} dirty={dirty} onConfirm={saveDecision} />",
  ],
  [
    "AdvanceDeductionsSection",
    "advance-deductions-section",
    "Odečty faktury pod rekapitulací přes linesEditorProps.afterVatRecap; u ZL APP slot nepředává. Částky, stav a práva z APP.",
    '<AdvanceDeductionsSection rows={deductions} storageKey="deductions" addAction={addAction} manualAction={manualAction} onAction={handleAction} onOpenTaxDocument={openDD} />',
  ],
  [
    "AdvanceRegisterGrid",
    "advance-register-grid",
    "Preset DataGridu se zůstatky APP, řízenými filtry a řezem k datu; nepočítá lhůty ani historické zůstatky. Bez viditelného nadpisového pruhu; title Evidence záloh zůstává přístupným názvem tabulky a názvem exportu.",
    '<AdvanceRegisterGrid rows={rows} storageKey="advances" filters={filters} onFiltersChange={setFilters} asOf={asOf} onOpen={openPayment} />',
  ],
  [
    "AdvanceRegisterView",
    "advance-register-view",
    "Evidence poskytnutých i přijatých záloh se záložkami Zůstatek · Platby záloh · Vyúčtování záloh (PageTabs), jedním společným Stavem k datu a řízenými filtry (stav podle záložky, více účtů). Skupiny účtu (v Zůstatku i partnera) a součtové/kontrolní řádky z obálky DB rows/totals/total_count; DS nic nepočítá ani nepáruje. Součtové řádky nejdou otevřít, při řazení zůstávají u skupiny. vatPayer=false skryje DD, scopeIncomplete skryje kontrolu účtu. AdvanceRegisterGrid zůstává beze změny.",
    '<AdvanceRegisterView activeTab={tab} onTabChange={setTab} data={{ rows, totals, total_count }} storageKey="advances-provided" homeCurrency={company.currencySymbol} asOf={asOf} filters={filters} onFiltersChange={setFilters} accountOptions={accounts} vatPayer={company.vatPayer} scopeIncomplete={scopeText} pagination={{ page, pageSize, onPageChange, onPageSizeChange }} onOpen={openDocument} />',
  ],
  [
    "AdvanceCorrectionDialog",
    "advance-correction-dialog",
    "Náhled řádků opravného DD dodaných APP a explicitní rozhodnutí Vytvořit/Nevytvářet. Zavření není odmítnutí. currencyCode dodává APP; bez něj částky jako dosud bez měny.",
    '<AdvanceCorrectionDialog open={open} onOpenChange={setOpen} rows={preview} currencyCode={currency.code} storageKey="advance-correction" onDecision={handleDecision} busy={busy} error={error} />',
  ],
];
/** Doplnění všech veřejných kompozic bez ručního kopírování seznamu props. */
export function enrichAdvanceCatalog(components: PanelCatalogComponent[]) {
  const touched: PanelCatalogComponent[] = [];
  for (const [name, slug, usage, code] of definitions) {
    if (!name || !slug || !usage || !code) continue;
    const file = `src/components/ds/accounting/advances/${slug}.tsx`;
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
    const previousProps = new Map(component.props?.map((prop) => [prop.name, prop]) ?? []);
    component.props = declaration.members.flatMap((member) =>
      ts.isPropertySignature(member) && member.type
        ? [
            {
              ...previousProps.get(member.name.getText(source)),
              name: member.name.getText(source),
              type: member.type.getText(source),
              required: !member.questionToken,
            },
          ]
        : [],
    );
    component.examples ??= [];
    if (!component.examples.some((example) => example.code === code))
      component.examples.push({
        label: name === "AdvanceCorrectionDialog" ? "Opravný DD s měnou" : "Zálohy",
        code,
      });
    component.antipatterns = [
      "Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.",
    ];
    touched.push(component);
  }
  const editor = components.find((item) => item.name === "JournalLinesEditor");
  if (editor) {
    editor.props ??= [];
    if (!editor.props.some((prop) => prop.name === "afterVatRecap"))
      editor.props.push({ name: "afterVatRecap", type: "React.ReactNode" });
    editor.usage =
      (editor.usage ?? "") +
      (editor.usage?.includes("afterVatRecap")
        ? ""
        : " Slot afterVatRecap umístí odečty pod rekapitulaci; patička používá samostatné advanceDeduction APP.");
    touched.push(editor);
  }
  return touched;
}
