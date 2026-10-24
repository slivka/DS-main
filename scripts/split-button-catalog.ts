/** Katalog rozděleného tlačítka · vlastní autorské obohacení · nesmí vydávat ani odebírat. */
import { readFileSync, writeFileSync } from "node:fs";
import { renderPanelCatalogSections, type PanelCatalogComponent } from "./record-panel-catalog";

/** Doplní veřejné rozdělené tlačítko a aktuální pravidla dotčených ovladačů. */
export function enrichSplitButtonCatalog(components: PanelCatalogComponent[]) {
  const props = [
    { name: "label", type: "ReactNode", required: true },
    { name: "actionName", type: "string", required: true },
    { name: "icon", type: "ReactNode" },
    { name: "onClick", type: "(event: MouseEvent<HTMLButtonElement>) => void", required: true },
    { name: "menu", type: "ReactNode", required: true },
    {
      name: "variant",
      type: '"primary" | "outline"',
      values: ["primary", "outline"],
      default: "primary",
    },
    { name: "size", type: '"default" | "sm"', values: ["default", "sm"], default: "default" },
    { name: "disabled", type: "boolean" },
    { name: "disabledReason", type: "ReactNode" },
    { name: "tooltip", type: "ReactNode" },
    { name: "menuAlign", type: '"start" | "end"', values: ["start", "end"], default: "start" },
    { name: "mainProps", type: "PartProps" },
    { name: "menuProps", type: "PartProps" },
    { name: "className", type: "string" },
  ];
  let split = components.find((item) => item.name === "SplitButton");
  if (!split) {
    split = {
      name: "SplitButton",
      file: "src/components/ds/form/split-button.tsx",
      import_path: "",
    };
    components.push(split);
  }
  Object.assign(split, {
    props,
    usage:
      "Jedno tlačítko se společným obrysem: hlavní plocha provede akci, šipka otevře nabídku APP. Výchozí výška je --control-h; size=sm použijte výslovně pro kompaktní lištu. Každá část má vlastní fokus a najetí.",
    examples: [
      {
        label: "Hlavní akce a další možnosti",
        code: "<SplitButton label={texts.create} actionName={texts.create} onClick={createRecord} menu={<DropdownMenuItem onSelect={createFromTemplate}>{texts.fromTemplate}</DropdownMenuItem>} />",
      },
    ],
    antipatterns: [
      "Neskládejte dvě samostatná tlačítka s mezerou; nevkládejte do komponenty doménovou logiku.",
      "Kompaktní výšku nevolte pomocí className; použijte size=sm.",
    ],
  });
  const panel = components.find((item) => item.name === "PanelToggleButton");
  if (panel)
    panel.usage =
      "Orámovaný ovladač panelu s výškou --control-h. Ikona i přístupný název popisují akci: Otevřít panel (←), Zavřít panel (→). Stav elsewhere otevírá/zaměří sousední okno, neuzavírá místní panel. Ve formuláři patří za nabídku akcí, v gridu za Obnovit.";
  const suggestion = components.find((item) => item.name === "FieldSuggestionIndicator");
  if (suggestion)
    Object.assign(suggestion, {
      usage:
        "Ikona nejistého návrhu; FieldSuggestion.action zpřístupní odkazovou akci v bublině. Po najetí se bublina po odjetí zavře s prodlevou pro přejezd myši; klik a Escape zachovávají ovládání.",
      examples: [
        {
          label: "Kontrola návrhu s akcí",
          code: "<FieldSuggestionIndicator suggestion={{ source: fileName, uncertain: true, message: texts.review, action: { label: texts.create, onClick: createRecord } }} />",
        },
      ],
      antipatterns: [
        "Nevykreslujte druhou ikonu návrhu přes ikonová tlačítka pole; používejte sdílený Field.",
      ],
    });
  return [split, ...(panel ? [panel] : []), ...(suggestion ? [suggestion] : [])];
}

if (import.meta.main) {
  const path = ".lovable/design-system.json";
  const catalog = JSON.parse(readFileSync(path, "utf8")) as { components: PanelCatalogComponent[] };
  const updated = enrichSplitButtonCatalog(catalog.components);
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
  const reference = ".lovable/rules/components.md";
  writeFileSync(reference, renderPanelCatalogSections(readFileSync(reference, "utf8"), updated));
}
