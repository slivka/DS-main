/** Obnovení autorských údajů katalogu · vlastní odvozené výchozí texty a referenci · nevydává. */
import { readFileSync, writeFileSync } from "node:fs";
import { DS_TEXTS_CS } from "../src/ds-texts/cs";
import { enrichRecordPanelCatalog, renderPanelCatalogSections } from "./record-panel-catalog";

interface CatalogProp {
  name: string;
  type: string;
  values?: string[];
  default?: string;
}
interface CatalogComponent {
  name: string;
  usage?: string;
  props?: CatalogProp[];
  examples?: { label: string; code: string }[];
  antipatterns?: string[];
}
interface Catalog {
  components: CatalogComponent[];
}

/** Obnoví výchozí schválení z DsTexts a vygeneruje dotčené referenční tabulky ze schématu. */
export function refreshCatalog() {
  const path = ".lovable/design-system.json";
  const catalog = JSON.parse(readFileSync(path, "utf8")) as Catalog;
  const status = catalog.components.find((component) => component.name === "DocumentStatusBadge");
  const approved = status?.props?.find((prop) => prop.name === "approvedLabel");
  if (!approved) throw new Error("Chybí DocumentStatusBadge.approvedLabel v katalogu.");
  approved.default = DS_TEXTS_CS.date.approved;
  const calendar = catalog.components.find((component) => component.name === "Calendar");
  if (calendar)
    calendar.usage =
      "Jednotný výběr dnů, měsíců a let. Inline nepřebírá fokus; initialFocus volí vybraný den, dnešek v měsíci, první povolený den měsíce. Rámeček jen při klávesnici, Dnes uprostřed. disabled se slučuje s minDate/maxDate; captionLayout od 2.110.0 nemá účinek.";
  const header = catalog.components.find((component) => component.name === "PageHeader");
  if (header) {
    header.usage =
      "Nadpis stránky se stavovým štítkem centrovaným na účaří + polovinu x-výšky písma; bez pevného posunu. Záhlaví panelu řadí historii, maximalizaci, menu a Zavřít panel.";
    header.examples ??= [];
    if (!header.examples.some((example) => example.label === "Nadpis se stavem"))
      header.examples.push({
        label: "Nadpis se stavem",
        code: '<PageHeader title="Přijatá faktura" titleBadge={<DocumentStatusBadge status="draft" />} />',
      });
    header.antipatterns ??= [];
    const rule =
      "Neposouvejte štítek pevným px ani cap metrikou; nesmí se ořezat diakritika nadpisu.";
    if (!header.antipatterns.includes(rule)) header.antipatterns.push(rule);
  }
  const searchable = new Set([
    "SearchableOptionSelect",
    "OptionSelect",
    "EntitySelect",
    "AccountSelect",
    "PartnerSelect",
    "DimensionSelect",
    "UnitSelect",
    "VatCodeSelect",
    "CountrySelect",
    "CategorySelect",
    "LegalFormField",
    "TagPicker",
    "MultiSelect",
    "ChipMultiSelect",
    "ContextSwitcher",
    "CompanySwitcher",
  ]);
  for (const component of catalog.components) {
    if (!searchable.has(component.name)) continue;
    const guidance =
      " Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.";
    if (!component.usage?.includes("Hledání probíhá přímo v poli"))
      component.usage = (component.usage ?? "Výběr z hodnot dodaných aplikací.") + guidance;
    component.examples ??= [];
    component.antipatterns ??= [];
    const rule = "Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.";
    if (!component.antipatterns.includes(rule)) component.antipatterns.push(rule);
  }
  const pill = catalog.components.find((component) => component.name === "ContextPill");
  if (pill && !pill.props?.some((prop) => prop.name === "onSearchChange")) {
    pill.props ??= [];
    pill.props.push({ name: "onSearchChange", type: "function" });
  }
  const month = catalog.components.find((component) => component.name === "MonthYearSelect");
  if (month)
    month.usage =
      "Vybere měsíc a rok společným kalendářem. Escape zavře nabídku přímo; Vymazat vrací null. emptyLabel pojmenuje prázdný výběr. minYear/maxYear omezují měsíce i roky; monthClassName/yearClassName zůstávají na společném spouštěči.";
  const record = catalog.components.find((component) => component.name === "RecordDialog");
  if (record) {
    const source = readFileSync("src/components/ds/layout/RecordDialog.tsx", "utf8");
    for (const name of ["activeTab", "onTabChange"]) {
      if (!source.includes(`${name}?:`)) throw new Error(`Chybí RecordDialog.${name} ve zdroji.`);
      record.props ??= [];
      if (!record.props.some((prop) => prop.name === name))
        record.props.push({ name, type: name === "activeTab" ? "string" : "function" });
    }
    if (!record.usage?.includes("activeTab"))
      record.usage =
        (record.usage ?? "") +
        " Záložky lze řídit activeTab + onTabChange; bez activeTab vybírá DS.";
    record.examples ??= [];
    const label = "Partner na zvolené záložce";
    if (!record.examples.some((example) => example.label === label))
      record.examples.push({
        label,
        code: '<RecordDialog open={open} size="md" title="Partner" onOpenChange={setOpen} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} error={saveError} onSubmit={save} />',
      });
    record.antipatterns ??= [];
    const rule =
      "V řízeném režimu aktualizujte activeTab přes onTabChange; DS hodnotu sám nepřepíše.";
    if (!record.antipatterns.includes(rule)) record.antipatterns.push(rule);
  }
  const provider = catalog.components.find((component) => component.name === "PaneTabsProvider");
  if (provider) {
    const guidance =
      " Navázaná okna (openLinkedTab) sledují zdrojovou záložku, ne pozici panelu; připnutí zamkne záznam, zavření zdroje nechá okno připnuté na posledním záznamu.";
    if (!provider.usage?.includes("openLinkedTab"))
      provider.usage =
        (provider.usage ?? "Stav a akce záložek v panelech; obaluje AppShell i PaneLayout.") +
        guidance;
    provider.examples ??= [];
    const label = "Navázané okno panelu záznamu";
    if (!provider.examples.some((example) => example.label === label))
      provider.examples.push({
        label,
        code: 'tabs.openLinkedTab(pane.tabId, { id: "history", label: "Historie" })',
      });
    provider.antipatterns ??= [];
    const rule =
      "Navázanou záložku nevážete na pozici panelu ani ji neotvírejte vlastní cestou; vždy přes openLinkedTab.";
    if (!provider.antipatterns.includes(rule)) provider.antipatterns.push(rule);
  }
  const panelComponents = enrichRecordPanelCatalog(catalog.components);
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
  const reference = ".lovable/rules/components.md";
  let markdown = readFileSync(reference, "utf8");
  for (const component of [
    status,
    calendar,
    month,
    record,
    header,
    pill,
    provider,
    ...catalog.components.filter((component) => searchable.has(component.name)),
  ]) {
    if (!component) continue;
    const heading = `### ${component.name}\n`;
    const start = markdown.indexOf(heading);
    if (start < 0) throw new Error(`Chybí referenční sekce ${component.name}.`);
    const next = markdown.indexOf("\n### ", start + heading.length);
    const end = next < 0 ? markdown.length : next;
    let section = markdown.slice(start, end);
    if (component.usage)
      section = section.replace(
        /(```\n)([\s\S]*?)(?=\n\*\*Props:|\n\*\*Examples:|\n\*\*Avoid:|$)/,
        `$1\n${component.usage}\n`,
      );
    if (component.props?.length) {
      const rows = component.props.map(
        (prop) =>
          `| \`${prop.name}\` | ${prop.values?.join(" · ") ?? prop.type} | \`${prop.default ?? "—"}\` |`,
      );
      section = section.replace(
        /\*\*Props:\*\*\n\n[\s\S]*?(?=\n\n|$)/,
        `**Props:**\n\n| Prop | Type | Default |\n|---|---|---|\n${rows.join("\n")}`,
      );
    }
    if (component === record) {
      const example = component.examples?.at(-1);
      if (example && !section.includes(example.label))
        section = section.replace(
          "**Avoid:**",
          `**${example.label}:**\n\n\`\`\`tsx\n${example.code}\n\`\`\`\n\n**Avoid:**`,
        );
      const rule = component.antipatterns?.at(-1);
      if (rule && !section.includes(rule)) section += `\n- ${rule}\n`;
    }
    markdown = markdown.slice(0, start) + section + markdown.slice(end);
  }
  writeFileSync(reference, renderPanelCatalogSections(markdown, panelComponents));
  const previewPath = "src/.generated/mockup-components.ts";
  const preview = readFileSync(previewPath, "utf8");
  writeFileSync(
    previewPath,
    preview.replace(
      /("DocumentStatusBadge":.*?schemaProps: )\[.*?\](, file:)/,
      `$1${JSON.stringify(status?.props ?? [])}$2`,
    ),
  );
}
