/** Obnovení autorských údajů katalogu · vlastní odvozené výchozí texty a referenci · nevydává. */
import { readFileSync, writeFileSync } from "node:fs";
import { DS_TEXTS_CS } from "../src/ds-texts/cs";

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
      "Jednotný výběr dnů, měsíců a let. Inline nepřebírá fokus; v nabídce použijte initialFocus/autoFocus. disabled se slučuje s minDate/maxDate; captionLayout od 2.110.0 nemá účinek.";
  const month = catalog.components.find((component) => component.name === "MonthYearSelect");
  if (month)
    month.usage =
      "Vybere měsíc a rok společným kalendářem. Escape zavře nabídku přímo; Vymazat vrací null. emptyLabel pojmenuje prázdný výběr. minYear/maxYear omezují měsíce i roky; monthClassName/yearClassName zůstávají na společném spouštěči.";
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
  const reference = ".lovable/rules/components.md";
  let markdown = readFileSync(reference, "utf8");
  for (const component of [status, calendar, month]) {
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
    markdown = markdown.slice(0, start) + section + markdown.slice(end);
  }
  writeFileSync(reference, markdown);
  const previewPath = "src/.generated/mockup-components.ts";
  const preview = readFileSync(previewPath, "utf8");
  writeFileSync(previewPath, preview.replace(
    /("DocumentStatusBadge":.*?schemaProps: )\[.*?\](, file:)/,
    `$1${JSON.stringify(status?.props ?? [])}$2`,
  ));
}
