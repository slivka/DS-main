/** Katalog kalendáře · vlastní autorské obohacení · nesmí vydávat. */
import type { PanelCatalogComponent } from "./record-panel-catalog";
/** Zachová původní props a přidá volitelné napojení lišty. */
export function enrichPaymentScheduleCatalog(components: PanelCatalogComponent[]) {
  const component = components.find((item) => item.name === "PaymentScheduleEditor");
  if (!component) throw new Error("Chybí PaymentScheduleEditor v katalogu.");
  component.props ??= [];
  for (const prop of [
    { name: "zoom", type: "number", default: "GridZoomContext / 1" },
    {
      name: "saveAction",
      type: "PaymentScheduleSaveAction: { label?, onSave, disabled?, busy?, disabledReason? }",
    },
  ]) {
    component.props = component.props.filter((item) => item.name !== prop.name);
    component.props.push(prop);
  }
  component.usage =
    "Platební kalendář se sdílenou GridToolbar, standardním Přidat a vedlejšími akcemi v nabídce při zúžení. Zoom převezme z okolního GridZoomContext, explicitní zoom má přednost. saveAction vykreslí uložení v liště; disabled/busy blokují opakovaný klik, data a zápis vlastní APP.";
  component.examples ??= [
    { label: "Kalendář faktury", code: "<PaymentScheduleEditor items={items} onChange={setItems} totalToPay={12100} paid={3630} remaining={8470} users={users} canRelease onRelease={(id, date) => release(id, date)} />" },
  ];
  const label = "Uložení kalendáře v zoomované liště";
  component.examples = component.examples.filter((example) => example.label !== label);
  component.examples.push(
    {
      label,
      code: '<PaymentScheduleEditor items={items} onChange={setItems} totalToPay={total} zoom={zoom} saveAction={{ label: "Uložit kalendář", onSave: saveSchedule, disabled: !dirty, busy: saving, disabledReason }} />',
    },
  );
  component.antipatterns ??= [];
  const rule =
    "Nekreslete vlastní Uložit kalendář pod gridem ani vlastní pevnou velikost tlačítek; použijte saveAction a zoom.";
  if (!component.antipatterns.includes(rule)) component.antipatterns.push(rule);
  return [component];
}
