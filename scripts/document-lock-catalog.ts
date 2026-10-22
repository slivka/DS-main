/** Katalog zámků dokladu · vlastní autorské obohacení · nesmí vydávat ani měnit API. */
interface Component {
  name: string;
  props?: { name: string; type: string; default?: string }[];
  usage?: string;
  examples?: { label: string; code: string }[];
  antipatterns?: string[];
}
/** Doplní kontrakt převzatých polí a akcí výpisu do publikovaného schématu. */
export function enrichDocumentLocks(components: Component[]) {
  const form = components.find((c) => c.name === "DocumentForm");
  const bank = components.find((c) => c.name === "BankStatementForm");
  for (const [component, name, type] of [
    [form, "fieldLockedReasons", "Partial<Record<DocumentHeaderField, string>>"],
    [bank, "menuActions", "RecordMoreAction[]"],
  ] as const) {
    if (!component) continue;
    component.props ??= [];
    if (!component.props.some((p) => p.name === name)) component.props.push({ name, type });
  }
  if (form) {
    const text =
      " fieldLockedReasons: jen needitovatelná pole přes FieldValue lockedReason; obecný důvod předchází součtu Σ, currencyDisabledReason a counterpartyInputLockedReason. IBAN režim: bankIban před bankAccount, bankSwift před bankCode; paymentReference pro referenci. Ruční protistrana: counterpartyName před partnerId. Zamčené datum sdílí šířku DateField; odkaz chyby zaměří zámek. Platí pro faktury i zálohové listy.";
    if (!form.usage?.includes("fieldLockedReasons:")) form.usage = (form.usage ?? "") + text;
    form.examples ??= [];
    const label = "Převzatá zahraniční platba";
    if (!form.examples.some((e) => e.label === label))
      form.examples.push({
        label,
        code: '<DocumentForm {...props} documentType="BA" editableFields={["description"]} fieldLockedReasons={{ bankAccount: accountReason, bankCode: bankReason, paymentReference: referenceReason }} />',
      });
  }
  if (bank) {
    const text =
      " menuActions: RecordMoreAction[] za stávajícími položkami. RecordMoreAction: id, label, onClick, icon?, disabled?, disabledReason?, destructive?, separatorBefore?; disabledReason se při disabled zobrazí přímo v položce a akce se neprovede.";
    if (!bank.usage?.includes("menuActions:")) bank.usage = (bank.usage ?? "") + text;
    bank.examples ??= [];
    const label = "Import v nabídce výpisu";
    if (!bank.examples.some((e) => e.label === label))
      bank.examples.push({
        label,
        code: '<BankStatementForm {...props} menuActions={[{ id: "import", label: importLabel, onClick: importStatement, disabled: !canImport, disabledReason: importReason }]} />',
      });
  }
  return [form, bank].filter((c): c is Component => Boolean(c));
}
