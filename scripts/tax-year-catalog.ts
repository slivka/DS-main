/** Katalog DE-4 až DE-6 · vlastní reference API · nesmí vydávat. */
import type { PanelCatalogComponent } from "./record-panel-catalog";

type Definition = [string, string, string, [string, string][], string, string[]];

const ANTI = "Nepočítejte v DS daň, odpisy ani částky; nezobrazujte technický účet, jen položku.";

/** Doplní komponenty konce roku a majetku DE bez odebrání existujícího API. */
export function enrichTaxYearCatalog(components: PanelCatalogComponent[]) {
  const definitions: Definition[] = [
    [
      "TaxAssetCard",
      "tax-asset-card",
      "Karta majetku v daňové evidenci jen s daňovou řadou: odpisy, zůstatková cena, drobný majetek; bez účtů a účetních odpisů.",
      [
        ["asset", "TaxAsset"],
        ["currency", "string"],
        ["onYearOpen", "(row: TaxAssetYear) => void"],
        ["storageKey", "string"],
        ["className", "string"],
      ],
      "<TaxAssetCard asset={asset} currency={currency} onYearOpen={openDepreciation} />",
      ["Neukazujte účetní řadu ani účty v DE.", ANTI],
    ],
    [
      "TaxInternalMovementFields",
      "tax-internal-movement-fields",
      "Pole interního dokladu DE: nepeněžní příjem / výdaj nebo přeřazení z položky na položku, částka a důvod.",
      [
        ["value", "TaxInternalMovementValue"],
        ["onChange", "(value: TaxInternalMovementValue) => void"],
        ["items", "TaxItemOption[]"],
        ["currency", "string"],
        ["errors", "Partial<Record<string, string>>"],
        ["disabled", "boolean"],
        ["className", "string"],
      ],
      "<TaxInternalMovementFields value={draft} onChange={setDraft} items={items} currency={currency} />",
      ["Neposílejte technické položky jako volbu uživatele.", ANTI],
    ],
    [
      "TransportAllowanceGrid",
      "transport-allowance-grid",
      "Paušál na dopravu: měsíce × vozidla, počet dní nebo měsíců, částky z APP a akce Vytvořit interní doklady; zákaz přes disabledReason.",
      [
        ["months", "{ id: string; label: string }[]"],
        ["vehicles", "{ id: string; label: string }[]"],
        ["cells", "TransportAllowanceCell[]"],
        ["unit", "days | months"],
        ["currency", "string"],
        ["onCountChange", "(monthId: string, vehicleId: string, count: number | null) => void"],
        ["onCreateDocuments", "() => void"],
        ["onDocumentOpen", "(id: string) => void"],
        ["disabledReason", "string"],
        ["busy", "boolean"],
        ["className", "string"],
      ],
      "<TransportAllowanceGrid months={months} vehicles={vehicles} cells={cells} currency={currency} onCreateDocuments={create} disabledReason={reason} />",
      ["Nepočítejte sazbu paušálu v DS.", ANTI],
    ],
    [
      "TaxYearCloseWizard",
      "tax-year-close-wizard",
      "Uzavření roku v DE bez účetních kroků: kontroly z APP (blokující / informační), potvrzení a výsledek.",
      [
        ["year", "number"],
        ["checks", "TaxYearCheck[]"],
        ["onCloseYear", "() => void"],
        ["busy", "boolean"],
        ["result", "{ status: 'success' | 'error'; message?: string } | null"],
        ["className", "string"],
      ],
      "<TaxYearCloseWizard year={2026} checks={checks} onCloseYear={closeYear} result={result} />",
      ["Nezařazené úhrady předávejte jako blocking; pohledávky k 31. 12. jako info.", ANTI],
    ],
    [
      "TaxReturnOutput",
      "tax-return-output",
      "Výstup pro přiznání: řádky tiskopisu, popis a částka z APP s proklikem a exportem do Excelu a PDF.",
      [
        ["rows", "TaxReturnLine[]"],
        ["currency", "string"],
        ["year", "number"],
        ["onLineOpen", "(row: TaxReturnLine) => void"],
        ["storageKey", "string"],
        ["className", "string"],
      ],
      "<TaxReturnOutput year={2026} rows={lines} currency={currency} onLineOpen={openItems} />",
      ["Nesčítejte řádky přiznání v DS.", ANTI],
    ],
    [
      "TaxYearCarryForward",
      "tax-year-carry-forward",
      "Stav a akce převodu daňové evidence do dalšího roku.",
      [
        ["fromYear", "number"],
        ["status", "not_started | ready | done | blocked"],
        ["onCarryForward", "() => void"],
        ["disabledReason", "string"],
        ["busy", "boolean"],
        ["className", "string"],
      ],
      '<TaxYearCarryForward fromYear={2026} status="ready" onCarryForward={carry} />',
      ["Neodvozujte stav převodu v DS.", ANTI],
    ],
  ];
  return definitions.map(([name, file, usage, props, example, antipatterns]) => {
    let component = components.find((c) => c.name === name);
    if (!component) {
      component = {
        name,
        file: `src/components/ds/tax-records/${file}.tsx`,
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
    component.examples = [{ label: "Daňová evidence z dat APP", code: example }];
    component.antipatterns = antipatterns;
    return component;
  });
}
