/** Autorské obohacení katalogu DE; reference se generuje ze schématu. */
import type { PanelCatalogComponent } from "./record-panel-catalog";
export function enrichTaxRecords(components: PanelCatalogComponent[]) {
  const definitions: [string, string, string, [string, string][]][] = [
    [
      "TaxBookView",
      "tax-book-view",
      "Kniha hotových zápisů APP. Filtry období, položky, daňovosti a ekonomické kategorie; standardní Excel tabulka a součty.",
      [
        ["rows", "TaxBookEntry[]"],
        ["homeCurrency", "string"],
        ["filters", "TaxBookFilters"],
        ["onFiltersChange", "(filters: TaxBookFilters) => void"],
        ["periods", "{id: string; label: string; from: string; to: string}[]"],
        ["onDocumentOpen", "(id: string) => void"],
        ["onUnassignedOpen", "(row: TaxBookEntry) => void"],
        ["storageKey", "string"],
      ],
    ],
    [
      "TaxCategorySummary",
      "tax-category-summary",
      "Přehled § 7–10 z hotových příjmů a výdajů APP, včetně výsledku výdajů procentem a stropu; nezařazené úhrady odděleně.",
      [
        ["rows", "TaxCategoryRow[]"],
        ["currency", "string"],
        ["unassignedAmount", "number"],
        ["onCategoryOpen", "(id: string) => void"],
        ["onUnassignedOpen", "() => void"],
        ["storageKey", "string"],
      ],
    ],
    [
      "CashCheckPanel",
      "cash-check-panel",
      "Kontrola peněz po pokladnách/bankách. Počáteční stav, pohyby, zůstatek a červený rozdíl dodává APP.",
      [
        ["rows", "CashCheckRow[]"],
        ["onAccountOpen", "(id: string) => void"],
        ["storageKey", "string"],
      ],
    ],
    [
      "TaxBookEntriesPanel",
      "tax-book-entries-panel",
      "Sekce Zápisy v knize pro Propojené; skládá LinkedRecordsPanel a předává proklik původního zápisu.",
      [
        ["entries", "TaxBookEntry[]"],
        ["currency", "string"],
        ["onEntryOpen", "(entry: TaxBookEntry) => void"],
      ],
    ],
    [
      "BookkeepingModeSelect",
      "bookkeeping-mode-select",
      "Řízená volba režimu nové firmy s vysvětlením, že pozdější změna znamená novou firmu.",
      [
        ["value", "BookkeepingMode"],
        ["onChange", "(value: BookkeepingMode) => void"],
        ["disabled", "boolean"],
      ],
    ],
    [
      "BookkeepingSettingsFields",
      "bookkeeping-settings-fields",
      "Nastavení knihy v DE vynechá účetní pole; firma nabídne příjmovou a výdajovou položku zaokrouhlení. Skrytí nemaže data.",
      [
        ["bookkeepingMode", "BookkeepingMode"],
        ["scope", "book | company"],
        ["accountFields", "ReactNode"],
        ["items", "AccountOption[]"],
        ["value", "{income?: string | null; expense?: string | null}"],
        ["onValueChange", "(value: {income?: string | null; expense?: string | null}) => void"],
        ["readOnly", "boolean"],
      ],
    ],
    [
      "TaxMovementSelect",
      "tax-movement-select",
      "Řízený druh interního pohybu: nepeněžní příjem, výdaj nebo přeřazení. Technickou protistranu řeší APP.",
      [
        ["value", "TaxMovementKind"],
        ["onChange", "(value: TaxMovementKind) => void"],
        ["disabled", "boolean"],
      ],
    ],
    [
      "VatPeriodBadge",
      "../data-display/vat-period-badge",
      "Štítek období DPH; podané období nahradí výstrahou APP.",
      [
        ["label", "string"],
        ["filed", "boolean"],
        ["filedWarning", "string"],
      ],
    ],
  ];
  const examples: Record<string, string> = {
    TaxBookView:
      "<TaxBookView rows={entries} homeCurrency={currency} filters={filters} onFiltersChange={setFilters} onDocumentOpen={openDocument} onUnassignedOpen={resolvePayment} />",
    TaxCategorySummary:
      "<TaxCategorySummary rows={summary} currency={currency} unassignedAmount={unassigned} onCategoryOpen={openCategory} />",
    CashCheckPanel: "<CashCheckPanel rows={cashChecks} onAccountOpen={openCashBook} />",
    TaxBookEntriesPanel:
      "<TaxBookEntriesPanel entries={entries} currency={currency} onEntryOpen={openTaxEntry} />",
    BookkeepingModeSelect: "<BookkeepingModeSelect value={mode} onChange={setMode} />",
    BookkeepingSettingsFields:
      '<BookkeepingSettingsFields bookkeepingMode={mode} scope="company" items={items} value={roundingItems} onValueChange={setRoundingItems} accountFields={accountControls} />',
    TaxMovementSelect: "<TaxMovementSelect value={movementKind} onChange={setMovementKind} />",
    VatPeriodBadge:
      "<VatPeriodBadge label={period.label} filed={period.filed} filedWarning={filedWarning} />",
  };
  const result = definitions.map(([name, file, usage, props]) => {
    let c = components.find((c) => c.name === name);
    if (!c) {
      c = {
        name,
        file: file.startsWith("../")
          ? `src/components/ds/${file.slice(3)}.tsx`
          : `src/components/ds/tax-records/${file}.tsx`,
        import_path: "@/design-system/slivka",
      };
      components.push(c);
    }
    c.usage = usage;
    c.props = [...props, ["className", "string"]].map(([name, type]) => ({ name, type }));
    c.examples = [{ label: "Řízená data aplikace", code: examples[name] ?? "" }];
    c.antipatterns = [
      "DS nesmí vytvářet zápisy, dopočítávat daně, ukládat režim ani zobrazovat technické účty.",
    ];
    return c;
  });
  const additions: Record<string, [string, string][]> = {
    JournalLinesEditor: [
      ["bookkeepingMode", "accrual | tax_records"],
      ["categoriesEnabled", "boolean"],
      ["taxMovementKind", "TaxMovementKind"],
      ["onTaxMovementKindChange", "(kind: TaxMovementKind) => void"],
    ],
    DocumentForm: [
      ["bookkeepingMode", "accrual | tax_records"],
      ["hideMainAccount", "boolean"],
      ["categoriesEnabled", "boolean"],
      ["taxMovementKind", "TaxMovementKind"],
      ["onTaxMovementKindChange", "(kind: TaxMovementKind) => void"],
    ],
    AccountSelect: [
      ["bookkeepingMode", "accrual | tax_records"],
      ["ref", "Ref<HTMLButtonElement>"],
    ],
    JournalLinesRecap: [
      ["bookkeepingMode", "accrual | tax_records"],
      ["categoriesEnabled", "boolean"],
      ["taxMovementKind", "TaxMovementKind"],
    ],
    DocumentPostingGrid: [["bookkeepingMode", "accrual | tax_records"]],
    PageHeader: [["panelToggle", "ReactNode"]],
  };
  for (const [name, props] of Object.entries(additions)) {
    const c = components.find((c) => c.name === name);
    if (!c) continue;
    c.props ??= [];
    for (const [name, type] of props)
      if (!c.props.some((p) => p.name === name)) c.props.push({ name, type });
    const rule =
      " DE vybírá položky jménem a AccountOption.technical nikdy nezobrazí; displayCode je pouze tlumený doplněk. Výchozí accrual zachovává původní API.";
    if (name !== "PageHeader" && !c.usage?.includes("AccountOption.technical"))
      c.usage = (c.usage ?? "") + rule;
    result.push(c);
  }
  for (const name of ["FormIssuesBar", "RecordDialog"]) {
    const c = components.find((c) => c.name === name);
    if (!c) continue;
    const rule =
      name === "FormIssuesBar"
        ? " FormIssue.action {label, onClick} je samostatná akce vedle odkazu na pole."
        : " lifecycleAction.confirm.reason a deleteAction.confirm.reason vyžadují důvod a předají jej callbacku po jediném potvrzení.";
    if (!c.usage?.includes(rule.trim())) c.usage = (c.usage ?? "") + rule;
    result.push(c);
  }
  return result;
}
