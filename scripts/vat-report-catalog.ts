/** Katalog DPH · vlastní reference API · nesmí vydávat. */
import type { PanelCatalogComponent } from "./record-panel-catalog";
/** Doplní šest přehledů bez odebrání existujícího API. */
export function enrichVatReports(components: PanelCatalogComponent[]) {
  const definitions: [string, string, string, [string, string][]][] = [
    [
      "VatReturnView",
      "vat-return-view",
      "Strom přiznání s hotovými částkami a souhrnem APP, rozdíly compare a onRowOpen.",
      [
        ["rows", "VatReturnRow[]"],
        ["compare", "Record<string, {base?: number; tax?: number}>"],
        ["summary", "{liability?: number; excess?: number}"],
        ["onRowOpen", "(row: VatReturnRow) => void"],
      ],
    ],
    [
      "VatControlStatementView",
      "vat-control-statement-view",
      "Oddíly A1–B3, prázdné ztlumené; doklady a souhrny výhradně od APP.",
      [
        ["sections", "Partial<Record<VatControlSection, VatControlSectionData>>"],
        ["activeSection", "VatControlSection"],
        ["onSectionChange", "(section: VatControlSection) => void"],
        ["onDocumentOpen", "(id: string) => void"],
        ["changed", "boolean"],
      ],
    ],
    [
      "VatRecapitulativeView",
      "vat-recapitulative-view",
      "SH nebo varianta oss s opravami minulých období, součty dodaných částek bez přepočtu měn.",
      [
        ["variant", "recapitulative | oss"],
        ["rows", "VatRecapitulativeRow[]"],
        ["ossRows", "OssReturnRow[]"],
        ["onRowOpen", "(id: string) => void"],
      ],
    ],
    [
      "VatChecksPanel",
      "vat-checks-panel",
      "Nálezy APP, celkový počet, filtr závažnosti a proklik dokladu; podání neblokuje.",
      [
        ["items", "VatCheckItem[]"],
        ["severity", "all | error | warning | info"],
        ["onSeverityChange", "(severity: string) => void"],
        ["onDocumentOpen", "(id: string) => void"],
      ],
    ],
    [
      "VatFilingBar",
      "vat-filing-bar",
      "Řízený stav a druh podání; oprávnění určuje přítomnost callbacku actions. Odemknutí vyžaduje důvod a opsání confirmText.",
      [
        ["form", "return | control | recapitulative | oss"],
        ["status", "open | filed | changed"],
        ["kind", "VatFilingKind"],
        ["onKindChange", "(kind: VatFilingKind) => void"],
        ["actions", "VatFilingActions"],
        ["filedAt", "string"],
        ["filedBy", "string"],
        ["confirmText", "string"],
        ["disabled", "boolean"],
      ],
    ],
    [
      "VatPeriodPicker",
      "vat-period-picker",
      "Řízený hledatelný výběr období APP; label zachová smíšenou periodicitu DPH a KH.",
      [
        ["periods", "VatPeriod[]"],
        ["value", "{from: string; to: string} | null"],
        ["onChange", "(period: VatPeriod) => void"],
        ["label", "string"],
        ["disabled", "boolean"],
        ["readOnly", "boolean"],
      ],
    ],
  ];
  return definitions.map(([name, file, usage, props]) => {
    let component = components.find((c) => c.name === name);
    if (!component) {
      component = {
        name,
        file: `src/components/ds/vat/${file}.tsx`,
        import_path: "@/design-system/slivka",
      };
      components.push(component);
    }
    component.usage = usage;
    component.props = [
      ...props,
      ["className", "string"],
      ...(["VatReturnView", "VatControlStatementView", "VatRecapitulativeView"].includes(name)
        ? [
            ["currency", "string"],
            ["storageKey", "string"],
          ]
        : []),
    ].map(([name, type]) => catalogProp(name, type));
    const examples: Record<string, string> = {
      VatReturnView:
        "<VatReturnView rows={returnRows} compare={filedRows} summary={returnSummary} currency={currency} onRowOpen={openReturnDocuments} />",
      VatControlStatementView:
        "<VatControlStatementView sections={khSections} currency={currency} onDocumentOpen={openDocument} changed={changedSinceFiled} />",
      VatRecapitulativeView:
        '<VatRecapitulativeView variant="oss" ossRows={ossRows} currency={ossCurrency} onRowOpen={openOssDocuments} />',
      VatChecksPanel:
        "<VatChecksPanel items={checks} severity={severity} onSeverityChange={setSeverity} onDocumentOpen={openDocument} />",
      VatFilingBar:
        '<VatFilingBar form="control" status={filing.status} kind={filing.kind} onKindChange={setKind} confirmText={period.label} actions={permittedActions} />',
      VatPeriodPicker:
        "<VatPeriodPicker periods={periods} value={period} onChange={setPeriod} label={periodSummary} />",
    };
    component.examples = [{ label: "Přehled DPH z dat APP", code: examples[name] ?? "" }];
    component.antipatterns = [
      "Nevytvářejte daňové výpočty, snímky, oprávnění ani zápisy v DS; všechna data a operace dodává APP.",
    ];
    return component;
  });
}

/** Výčet literálů zapisuje jako enum s hodnotami, aby katalog nesl volby. */
function catalogProp(name: string, type: string) {
  return /^[a-z_]+( \| [a-z_]+)+$/.test(type)
    ? { name, type: "enum", values: type.split(" | ") }
    : { name, type };
}
