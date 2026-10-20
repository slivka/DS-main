/** Katalog panelu · vlastní autorská obohacení · nesmí vydávat nebo odstraňovat komponenty. */
import { readFileSync } from "node:fs";
export interface PanelCatalogComponent {
  name: string;
  file?: string;
  import_path?: string;
  props?: { name: string; type: string; required?: boolean; values?: string[]; default?: string }[];
  usage?: string;
  examples?: { label: string; code: string }[];
  antipatterns?: string[];
}
const definitions = [
  {
    name: "RecordSidePanel",
    file: "src/components/ds/layout/record-side-panel.tsx",
    usage:
      "Obal hlavního obsahu a pravého panelu záznamu. Na běžné šířce obsah odsune, pod 640 px šířky prostředí používá místní překryv. Záložky, připnutí a šířku řídí aplikace; nic nenačítá.",
    code: "<RecordSidePanel open={open} onOpenChange={setOpen} header={record.number} activeTab={tab} onActiveTabChange={setTab} tabs={tabs} pinned={pinned} onPinnedChange={setPinned} width={width} onWidthChange={setWidth}><DocumentForm {...formProps} /></RecordSidePanel>",
    avoid:
      "Nevykreslujte panel vedle obalu bez children; aplikace řídí vazbu připnutí na záznam, nikoli DS.",
  },
  {
    name: "RecordPanelTriggers",
    file: "src/components/ds/layout/record-panel-triggers.tsx",
    usage:
      "Sdílené ikonové spouštěče s počty; aplikace dodává libovolná id, popisky a ikony. Nula ukazuje tlumenou ikonu bez čísla. V DocumentForm použijte actionBarContent, v RecordDialog headerExtra.",
    code: '<RecordPanelTriggers indicators={[{ id: "files", label: "Přílohy", icon: Paperclip, count: 2 }]} onIndicatorClick={id => { setTab(id); setOpen(true); }} />',
    avoid: "Nevkládejte napevno doménová id ani neoznačujte řádek při kliku na indikátor.",
  },
  {
    name: "AttachmentList",
    file: "src/components/ds/feedback/attachment-list.tsx",
    types: "src/components/ds/feedback/attachment-types.ts",
    usage:
      "Zdroj s náhledem a akcí Nahradit, ostatní přílohy s metadaty a operacemi aplikace. removeKind určuje delete/Smazat nebo remove/Odebrat; oprávnění a důvody dodává aplikace. Výběr i přetažení sdílejí validateFiles, chyby zobrazuje NoticeBar.",
    code: "<AttachmentList attachments={files} source={source} accept={allowedTypes} maxSize={limit} canAdd={rights.add} onFiles={upload} canRemove={canRemove} removeKind={removeKind} onRemove={removeAttachment} allowRemovalReason onReplaceSource={replaceSource} />",
    avoid:
      "Nenačítejte soubory uvnitř DS; nerozhodujte removeKind podle stavu dokladu v komponentě. Zakázanou akci nezakrývejte. Zdroj nemažte ani neodebírejte.",
  },
  {
    name: "PinnedNoteBar",
    file: "src/components/ds/feedback/pinned-note-bar.tsx",
    usage:
      "Jediný řádek hlavičky s textem připnuté poznámky. Zkrácení zachovává celý text v tooltipu dostupném myší i fokusem; klik otevírá poznámky.",
    code: '<PinnedNoteBar text={pinnedNote.body} onOpen={() => { setTab("notes"); setOpen(true); }} />',
    avoid: "Nezvětšujte pruh na více řádků ani v něm neřešte připnutí nebo ukládání.",
  },
  {
    name: "MultiSelectionPanel",
    file: "src/components/ds/layout/multi-selection-panel.tsx",
    usage:
      "Souhrn více vybraných záznamů se slotem children pro hromadnou akci. Jinou doménu pojmenujte propem label; počet se formátuje s oddělenými tisíci.",
    code: "<MultiSelectionPanel count={selection.count}><Button onClick={addNoteToSelected}>Přidat poznámku</Button></MultiSelectionPanel>",
    avoid: "Neprovádějte hromadné operace ani dotazy v DS.",
  },
  {
    name: "RecordNotes",
    file: "src/components/ds/feedback/record-notes.tsx",
    usage:
      "Existující panel poznámek s řazením, úpravou a odstraněním. canEdit/canRemove mají přednost před starým editable; canAdd=false skryje vstup. pinned/editedAt jsou data aplikace, onPin žádá změnu; nejvýše jednu připnutou hlídá aplikace. Výchozí texty přes DsTexts CS/SK, lokální texts mají přednost.",
    code: "<RecordNotes notes={notes} canAdd={rights.add} canEdit={canEdit} canRemove={canRemove} canPin={rights.pin} onPin={pinNote} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} />",
    avoid:
      "Nevynucujte jediné připnutí v DS a neslučujte canEdit s canRemove. editable zůstává zpětně kompatibilní záloha.",
  },
  {
    name: "RecordHistoryTimeline",
    file: "src/components/ds/feedback/record-history-timeline.tsx",
    usage:
      "Historie záznamu jako časová osa po dnech (Dnes / Včera / datum), nejnovější nahoře; funguje i jako záložka RecordSidePanel v úzké šířce. Aplikace dodává už zmapované události s popisky a hodnotami a řídí režim (basic/detailed) i filtr typů; komponenta nic nenačítá ani doménově neformátuje.",
    code: '<RecordHistoryTimeline events={historyEvents} mode={mode} onModeChange={setMode} filter={filter} onFilterChange={setFilter} loading={isLoading} />',
    avoid:
      "Nepředávejte surová data auditu (názvy sloupců, JSON, ID); hodnoty mapuje a formátuje aplikace. Nepoužívejte zastaralý HistoryPanel.",
  },
];
/** Props veřejného pojmenovaného rozhraní; děděné HTML props se neopakují. */
function interfaceProps(file: string, name: string) {
  const text = readFileSync(file, "utf8");
  const start = text.indexOf(`export interface ${name}Props`);
  if (start < 0) throw new Error(`Chybí ${name}Props v ${file}`);
  const body = text.slice(text.indexOf("{", start) + 1).split("\n}")[0] ?? "";
  return Array.from(body.matchAll(/^ {2}(\w+)(\?)?: ([\s\S]*?);/gm)).map((match) => ({
    name: match[1] ?? "",
    type: (match[3] ?? "").replace(/\s+/g, " ").trim(),
    required: !match[2],
  }));
}
/** Aditivně aktualizuje katalog; existující příklady a zákazy zachová. */
export function enrichRecordPanelCatalog(components: PanelCatalogComponent[]) {
  const touched: PanelCatalogComponent[] = [];
  for (const definition of definitions) {
    let item = components.find((entry) => entry.name === definition.name);
    if (!item) {
      item = { name: definition.name, file: definition.file, import_path: "" };
      components.push(item);
    }
    item.usage = definition.usage;
    item.props = interfaceProps(definition.types ?? definition.file, definition.name);
    item.examples ??= [];
    const label = "Panel záznamu";
    const existing = item.examples.find((entry) => entry.label === label);
    if (existing) existing.code = definition.code;
    else item.examples.push({ label, code: definition.code });
    item.antipatterns ??= [];
    if (!item.antipatterns.includes(definition.avoid)) item.antipatterns.push(definition.avoid);
    touched.push(item);
  }
  const legacy = components.find((item) => item.name === "HistoryPanel");
  if (legacy) {
    legacy.usage =
      "Zastaralé od 2.114.0 – použijte RecordHistoryTimeline; odstraní se v příští major verzi.";
    legacy.antipatterns ??= [];
    const rule = "Nepoužívejte v nových obrazovkách; nahraďte RecordHistoryTimeline.";
    if (!legacy.antipatterns.includes(rule)) legacy.antipatterns.push(rule);
    touched.push(legacy);
  }
  const document = components.find((item) => item.name === "DocumentForm");
  if (document) {
    document.props ??= [];
    if (!document.props.some((item) => item.name === "actionBarContent"))
      document.props.push({ name: "actionBarContent", type: "ReactNode" });
    touched.push(document);
  }
  const grid = components.find((item) => item.name === "DataGrid");
  if (grid) {
    grid.props ??= [];
    if (!grid.props.some((item) => item.name === "onIndicatorClick"))
      grid.props.push({ name: "onIndicatorClick", type: "(row: Row, id: string) => void" });
    const rule =
      'Sloupec type="record-indicators" přijímá indicators s libovolnými id a count(row); klik volá onIndicatorClick bez výběru řádku, Excel rozvine samostatné číselné počty.';
    if (!grid.usage?.includes("record-indicators")) grid.usage = `${grid.usage ?? ""} ${rule}`;
    touched.push(grid);
  }
  return touched;
}
/** Vykreslí pouze dotčené sekce katalogu z jeho schématu. */
export function renderPanelCatalogSections(markdown: string, components: PanelCatalogComponent[]) {
  for (const item of components) {
    const heading = `### ${item.name}\n`;
    const start = markdown.indexOf(heading);
    const next = start < 0 ? -1 : markdown.indexOf("\n### ", start + heading.length);
    const end = next < 0 ? markdown.length : next;
    const props = item.props ?? [];
    const section = `${heading}\n\`\`\`tsx\nimport { ${item.name} } from "@/design-system/{slug}";\n\`\`\`\n\n${item.usage ?? ""}\n\n**Props:**\n\n| Prop | Type | Default |\n|---|---|---|\n${props.map((prop) => `| \`${prop.name}\` | ${prop.type.replaceAll("|", " / ")} | \`${prop.default ?? "—"}\` |`).join("\n")}\n\n**Examples:**\n\n${(item.examples ?? []).map((example) => `**${example.label}:**\n\n\`\`\`tsx\n${example.code}\n\`\`\``).join("\n\n")}\n\n**Avoid:**\n\n${(item.antipatterns ?? []).map((rule) => `- ${rule}`).join("\n")}\n`;
    markdown =
      start < 0
        ? `${markdown}\n${section}`
        : markdown.slice(0, start) + section + markdown.slice(end);
  }
  return markdown;
}
