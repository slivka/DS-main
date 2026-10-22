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
    name: "PanelToggleButton",
    file: "src/components/ds/layout/panel-toggle-button.tsx",
    usage:
      "Tlačítko panelu ve formuláři přes DocumentForm.panelToggle / RecordActionBar.panelToggle úplně vpravo za nabídkou akcí, nikoli v záhlaví. DataGrid.panelToggle zůstává za Obnovit. Stav elsewhere zaměří sousední okno přes onFocusElsewhere; tooltip a indikátor dodává APP.",
    code: "<PanelToggleButton open={open} onToggle={() => setOpen(!open)} indicator={hasActivity} tooltip={panelSummary} state={panelState} onFocusElsewhere={focusPanel} />",
    avoid:
      "Nevytvářejte druhý místní panel při state=elsewhere a nedoplňujte počty ani oprávnění v DS.",
  },
  {
    name: "RecordPanelToolbar",
    file: "src/components/ds/layout/record-panel-toolbar.tsx",
    usage:
      "Jednořádkové nástroje každé záložky: start pro zobrazení/filtr/řazení, end pro vlastní obsah, action pro modrou hlavní akci zkrácenou při nedostatku místa na ikonu s tooltipem.",
    code: "<RecordPanelToolbar start={sortControl} action={{ label: texts.add, icon: Plus, onClick: addAttachment, disabled: !canAdd, disabledReason }} />",
    avoid:
      "Nezalamujte nástroje ani nezkracujte název záznamu místo hlavní akce; nepředávejte DS doménovou logiku.",
  },
  {
    name: "SourcePreview",
    file: "src/components/ds/feedback/source-preview.tsx",
    usage:
      "Záložka Zdroj panelu záznamu: vyplní zbývající výšku pod nástroji v hostiteli s určenou výškou, PDF.js v iframe vykreslí stránky podle šířky a přepočítá je při tažení; svisle roluje jen náhled. Obrázek contain přes celou plochu, ostatní typy bez náhledu. Nástroje Nahradit/Stáhnout/Otevřít, prázdný stav s přetažením a Nahrát zdroj, inheritedFrom pro zděděný zdroj jen ke čtení, onUrlExpired pro obnovu podepsané adresy. PDF.js a jeho worker se načítají jen v klientském efektu.",
    code: "<SourcePreview source={source} accept={accept} maxSize={limit} canReplace={canEdit} onReplace={replaceSource} onUpload={uploadSource} onDownload={download} onOpen={open} inheritedFrom={inherited} onUrlExpired={refreshUrl} />",
    avoid:
      "Nevracejte náhled zdroje do AttachmentList (source je deprecated) a negenerujte adresy v DS – dodává je APP.",
  },
  {
    name: "SettlementBar",
    file: "src/components/ds/data-display/settlement-bar.tsx",
    usage:
      "Souhrn úhrad nebo zúčtování po měnách. Částky, měny, label a progres dodává aplikace; komponenta nic nepočítá.",
    code: "<SettlementBar rows={settlementRows} />",
    avoid: "Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.",
  },
  {
    name: "LinkedRecordEntry",
    file: "src/components/ds/data-display/linked-record-entry.tsx",
    usage:
      "Sdílený klikací řádek nebo uzel vazby; zmapované hodnoty, stav a ikonu dodává aplikace.",
    code: '<LinkedRecordEntry item={record} variant="node" onOpen={openRecord} />',
    avoid: "Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.",
  },
  {
    name: "LinkedRecordsPanel",
    file: "src/components/ds/data-display/linked-records-panel.tsx",
    usage:
      "Propojené záznamy jako obsah záložky RecordSidePanel: řízené skupiny a seznam/tok, souhrn vypořádání a akce aplikace. unlinkReason + onUnlink zobrazí jediné potvrzení s důvodem; confirmUnlink=false přenechá potvrzení APP.",
    code: "<LinkedRecordsPanel groups={groups} mode={mode} onModeChange={setMode} collapsedGroups={collapsed} onCollapsedGroupsChange={setCollapsed} onOpen={openRecord} unlinkReason={{ required: true }} onRemove={removeLink} onLink={saveLink} linkDialog={linkConfig} />",
    avoid: "Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.",
  },
  {
    name: "LinkRecordDialog",
    file: "src/components/ds/data-display/link-record-dialog.tsx",
    usage:
      "Dialog nové vazby s návrhy, hledáním aplikace, typem a poznámkou. RecordDialog chrání změny; při chybě se nezavře.",
    code: "<LinkRecordDialog open={open} onOpenChange={setOpen} candidates={suggestions} relationTypes={types} onSearch={searchRecords} onSave={saveLink} />",
    avoid: "Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.",
  },

  {
    name: "RecordSidePanel",
    file: "src/components/ds/layout/record-side-panel.tsx",
    usage:
      "Obal hlavního obsahu a pravého panelu záznamu. Na běžné šířce obsah odsune, pod 640 px šířky prostředí používá místní překryv. onSizeChange mění živý stav, APP ukládá v onSizeCommit jednou po puštění táhla/klávese/dvojkliku. Záložky, připnutí a šířku řídí aplikace; nic nenačítá.",
    code: "<RecordSidePanel open={open} onOpenChange={setOpen} activeTab={tab} onActiveTabChange={setTab} tabs={tabs} pinned={pinned} onPinnedChange={setPinned} size={size} defaultSize={384} onSizeChange={setSize} onSizeCommit={savePanelSize}><DocumentForm {...formProps} /></RecordSidePanel>",
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
      "Přílohy bez náhledů s ikonovými akcemi, filtrem odebraných a modrou akcí Přidat přílohu. removeKind určuje Smazat/Odebrat; onSetSource a canSetSource přidají nabídku Použít jako zdroj. Starý source a jeho náhrada zůstávají kompatibilní, jsou deprecated od 2.123.0.",
    code: "<AttachmentList attachments={files} accept={allowedTypes} maxSize={limit} canAdd={rights.add} onFiles={upload} canRemove={canRemove} removeKind={removeKind} onRemove={removeAttachment} onSetSource={setSource} canSetSource={canSetSource} />",
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
    code: "<RecordHistoryTimeline events={historyEvents} mode={mode} onModeChange={setMode} hiddenKinds={hiddenKinds} onHiddenKindsChange={setHiddenKinds} loading={isLoading} />",
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
    const previous = item.props ?? [];
    // Zachová výčty a výchozí hodnoty z extraktoru, které parser rozhraní nečte.
    item.props = interfaceProps(definition.types ?? definition.file, definition.name).map(
      (prop) => {
        const merged = { ...previous.find((old) => old.name === prop.name), ...prop };
        // Řetězcový výčet publikuje stejně jako extraktor: type enum + values.
        if (/^"[^"]+"( \| "[^"]+")*$/.test(prop.type))
          return {
            ...merged,
            type: "enum",
            values: prop.type.split(" | ").map((v) => v.slice(1, -1)),
          };
        return merged;
      },
    );
    item.examples ??= [];
    const label = "Panel záznamu";
    const existing = item.examples.find((entry) => entry.label === label);
    if (!existing) item.examples.push({ label, code: definition.code });
    if (!item.examples.some((entry) => entry.label === "Panel záznamu 6"))
      item.examples.push({ label: "Panel záznamu 6", code: definition.code });
    if (
      definition.name === "LinkedRecordsPanel" &&
      !item.examples.some((entry) => entry.label === "Jediné potvrzení s důvodem")
    )
      item.examples.push({
        label: "Jediné potvrzení s důvodem",
        code: "<LinkedRecordsPanel {...panelProps} unlinkReason={{ required: true }} onUnlink={unlinkWithReason} />",
      });
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
    if (!document.props.some((item) => item.name === "panelToggle"))
      document.props.push({ name: "panelToggle", type: "ReactNode" });
    const guidance =
      " panelToggle předává ovladač do RecordActionBar úplně vpravo za nabídku akcí ve všech šířkách, nikdy do záhlaví; společné pro faktury i zálohové listy.";
    document.usage = document.usage?.replace(
      " panelToggle předává ovladač do PageHeader mezi nabídku a zavření; společné pro faktury i zálohové listy.",
      guidance,
    );
    if (!document.usage?.includes("panelToggle"))
      document.usage = (document.usage ?? "") + guidance;
    document.examples ??= [];
    // Historický katalogový klíč zachováme, jeho obsah už učí nové umístění.
    const oldExample = document.examples.find((item) => item.label === "Ovladač panelu v záhlaví");
    if (oldExample)
      oldExample.code =
        "<DocumentForm {...formProps} panelToggle={<PanelToggleButton open={open} onToggle={togglePanel} indicator tooltip={panelSummary} />} />";
    else
      document.examples.push({
        label: "Ovladač panelu v záhlaví",
        code: "<DocumentForm {...formProps} panelToggle={<PanelToggleButton open={open} onToggle={togglePanel} indicator tooltip={panelSummary} />} />",
      });
    if (!document.examples.some((item) => item.label === "Ovladač panelu za akcemi"))
      document.examples.push({
        label: "Ovladač panelu za akcemi",
        code: "<DocumentForm {...formProps} panelToggle={<PanelToggleButton open={open} onToggle={togglePanel} indicator tooltip={panelSummary} />} />",
      });
    touched.push(document);
  }
  const actionBar = components.find((item) => item.name === "RecordActionBar");
  if (actionBar) {
    actionBar.props ??= [];
    if (!actionBar.props.some((item) => item.name === "panelToggle"))
      actionBar.props.push({ name: "panelToggle", type: "ReactNode" });
    const rule =
      " panelToggle je poslední za nabídkou, nikdy se neslučuje do nabídky ani nezmizí při zkrácení akcí.";
    if (!actionBar.usage?.includes("panelToggle")) actionBar.usage = (actionBar.usage ?? "") + rule;
    actionBar.examples ??= [];
    if (!actionBar.examples.some((item) => item.label === "Panel za nabídkou"))
      actionBar.examples.push({
        label: "Panel za nabídkou",
        code: "<RecordActionBar saveAction={save} moreActions={actions} panelToggle={<PanelToggleButton open={open} onToggle={toggle} tooltip={summary} />} />",
      });
    actionBar.antipatterns ??= [];
    const avoid =
      "Ve formuláři nevkládejte ovladač panelu do PageHeader; použijte RecordActionBar.panelToggle.";
    if (!actionBar.antipatterns.includes(avoid)) actionBar.antipatterns.push(avoid);
    touched.push(actionBar);
  }
  const grid = components.find((item) => item.name === "DataGrid");
  if (grid) {
    grid.props ??= [];
    if (!grid.props.some((item) => item.name === "onIndicatorClick"))
      grid.props.push({ name: "onIndicatorClick", type: "(row: Row, id: string) => void" });
    if (!grid.props.some((item) => item.name === "panelToggle"))
      grid.props.push({ name: "panelToggle", type: "ReactNode" });
    if (!grid.props.some((item) => item.name === "onRowOpen"))
      grid.props.push({ name: "onRowOpen", type: "(row: Row) => void" });
    if (!grid.usage?.includes("onRowOpen"))
      grid.usage =
        (grid.usage ?? "") +
        " onRowOpen má při dvojkliku/Enter přednost před editací i v režimu výběru; canEditRow/editDisabledReason jej neblokují. onEditRow nadále řídí tužku.";
    grid.examples ??= [];
    if (!grid.examples.some((item) => item.label === "Otevření jen pro čtení"))
      grid.examples.push({
        label: "Otevření jen pro čtení",
        code: "<DataGrid {...gridProps} canEditRow={() => false} onRowClick={selectRow} onRowOpen={openRecord} />",
      });
    const rule =
      'Sloupec type="record-indicators" přijímá indicators s libovolnými id a count(row); klik volá onIndicatorClick bez výběru řádku, Excel rozvine samostatné číselné počty.';
    if (!grid.usage?.includes("record-indicators")) grid.usage = `${grid.usage ?? ""} ${rule}`;
    touched.push(grid);
  }
  const header = components.find((item) => item.name === "PageHeader");
  if (header) {
    header.props ??= [];
    if (!header.props.some((item) => item.name === "panelToggle"))
      header.props.push({ name: "panelToggle", type: "ReactNode" });
    touched.push(header);
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
