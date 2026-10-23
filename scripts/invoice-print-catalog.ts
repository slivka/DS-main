/** Katalog faktury · vlastní autorské props a příklady · nevydává knihovnu. */
import type { PanelCatalogComponent } from "./record-panel-catalog";
/** Zachová katalog a obohatí jen tiskové komponenty. */
export function enrichInvoicePrintCatalog(components: PanelCatalogComponent[]) {
  const specs = [
    {
      name: "InvoicePrintDialog",
      file: "src/components/ds/print/invoice/invoice-print-dialog.tsx",
      props: [
        { name: "open", type: "boolean", required: true },
        { name: "onOpenChange", type: "(open: boolean) => void", required: true },
        { name: "data", type: "InvoicePrintData", required: true },
        { name: "opts", type: "BuildInvoicePdfOptions" },
        { name: "settings", type: "ReactNode" },
        { name: "onError", type: "(error: unknown) => void" },
      ],
      usage:
        "Náhled vydané faktury návrhu C přes sdílený PrintPreviewDialog; tisk a stažení s názvem nadpis–číslo. Data jsou hotový výstup APP, bez výpočtů DPH a záloh.",
      code: "<InvoicePrintDialog open={open} onOpenChange={setOpen} data={printData} opts={{ homeCurrency: companyCurrency }} />",
    },
    {
      name: "BookPrintTemplateFields",
      file: "src/components/ds/accounting/document-print-fields.tsx",
      props: [
        { name: "value", type: "DocumentPrintValue", required: true },
        { name: "onChange", type: "(value: DocumentPrintValue) => void", required: true },
        { name: "readOnly", type: "boolean" },
      ],
      usage:
        "Společná řízená pole předlohy knihy a dokladu: pět voleb (kalendář, zálohy, QR, podpis, vystavil), záhlaví/zápatí/poznámka a kontakty. Texty se tisknou pouze vyplněné.",
      code: "<BookPrintTemplateFields value={printTemplate} onChange={setPrintTemplate} />",
    },
    {
      name: "DocumentDeliveryFields",
      file: "src/components/ds/accounting/document-delivery-fields.tsx",
      props: [
        { name: "value", type: "DocumentDeliveryValue | null", required: true },
        { name: "onChange", type: "(value: DocumentDeliveryValue | null) => void", required: true },
        { name: "countries", type: "Array<{ code: string; name: string }>" },
        { name: "readOnly", type: "boolean" },
        { name: "mapAction", type: "AddressMapAction" },
      ],
      usage:
        "Jiná dodací adresa přes sdílený AddressFieldGrid; vypnutí předává null a odstraní adresu. Mapa za Zemí je akce APP.",
      code: "<DocumentDeliveryFields value={delivery} onChange={setDelivery} countries={countries} mapAction={{ label: texts.map, onClick: openMap }} />",
    },
    {
      name: "DocumentPrintTab",
      file: "src/components/ds/accounting/document-print-tab.tsx",
      props: [{ name: "onReloadFromBook", type: "() => void" }],
      usage:
        "Tiskové údaje FV i ZFV sdílejí BookPrintTemplateFields; Načíst z knihy vyžaduje jediné potvrzení a poté callback APP.",
      code: "<DocumentPrintTab value={print} onChange={setPrint} onReloadFromBook={reloadPrintTemplate} />",
    },
    {
      name: "DocumentCounterpartyTab",
      file: "src/components/ds/accounting/document-detail-tabs.tsx",
      props: [
        { name: "deliveryMapAction", type: "AddressMapAction" },
        { name: "deliveryReadOnly", type: "boolean" },
      ],
      usage:
        "Údaje odběratele doplňuje řízená delivery adresa; platí pro FV i ZFV. deliveryReadOnly=false odemkne dodání při counterpartyLocked; bez prop přebírá jeho zámek, celkové readOnly má přednost.",
      code: "<DocumentCounterpartyTab value={{ ...customer, delivery }} onChange={setCustomer} deliveryMapAction={{ label: texts.map, onClick: openMap }} />",
    },
    {
      name: "PrintPreviewDialog",
      file: "src/components/ds/print/print-preview-dialog.tsx",
      props: [
        { name: "filename", type: "string" },
        { name: "error", type: "string" },
      ],
      usage:
        "Jediný společný náhled PDF: Tisk/Stáhnout PDF, vlastní filename volitelně, výchozí název sestavy zachován.",
      code: "<PrintPreviewDialog open={open} onOpenChange={setOpen} blob={blob} title={title} companyName={company.name} filename={filename} />",
    },
    {
      name: "DocumentForm",
      file: "src/components/ds/accounting/document-form.tsx",
      props: [],
      usage:
        "FV a ZFV mají customerOrderRef v základních údajích. Tisk dostává hotová InvoicePrintData z APP; DS nepočítá součty faktury ani záloh.",
      code: "const blob = await buildInvoicePdf(printData, { homeCurrency: companyCurrency });",
    },
  ];
  return specs.map((spec) => {
    let c = components.find((item) => item.name === spec.name);
    if (!c) {
      c = { name: spec.name, file: spec.file, import_path: "@/design-system/{slug}" };
      components.push(c);
    }
    c.props ??= [];
    if (spec.name === "DocumentCounterpartyTab") {
      c.examples ??= [];
      const label = "Dodání při zamčeném odběrateli";
      if (!c.examples.some((e) => e.label === label))
        c.examples.push({
          label,
          code: "<DocumentCounterpartyTab value={customer} onChange={setCustomer} counterpartyLocked deliveryReadOnly={false} />",
        });
      c.antipatterns ??= [];
      const rule =
        "Neodemykejte odběratele kvůli dodání; použijte deliveryReadOnly=false. Celkové readOnly nelze touto volbou obejít.";
      if (!c.antipatterns.includes(rule)) c.antipatterns.push(rule);
    }
    for (const prop of spec.props)
      if (!c.props.some((p) => p.name === prop.name)) c.props.push(prop);
    if (spec.name === "BookPrintTemplateFields") {
      const rule =
        "Tiskové volby jsou volitelné: kalendář false, podrobné zálohy true, QR true, podpis false, vystavil true. Staré showHeader/showFooter/showVatRecap/showNote/showColumnHeadings/showTotalsRow jsou ignorované @deprecated do 3.0.0.";
      c.antipatterns ??= [];
      if (!c.antipatterns.includes(rule)) c.antipatterns.push(rule);
    }
    if (!c.usage?.includes(spec.usage)) c.usage = (c.usage ? c.usage + " " : "") + spec.usage;
    c.examples ??= [];
    const label = "Tisk faktury návrh C";
    if (!c.examples.some((e) => e.label === label)) c.examples.push({ label, code: spec.code });
    c.antipatterns ??= [];
    const rule =
      "Nepočítejte tiskové daně ani odečty v DS; nepřidávejte druhý PDF systém ani generované firemní logo.";
    if (!c.antipatterns.includes(rule)) c.antipatterns.push(rule);
    return c;
  });
}
