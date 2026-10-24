/** Katalog gridů · doplňuje autorské kontrakty · nevydává ani nemění API. */
interface Component {
  name: string;
  props?: { name: string; type: string }[];
  usage?: string;
  examples?: { label: string; code: string }[];
  antipatterns?: string[];
}
/** Obohatí stávající komponenty bez odebrání položek. */
export function enrichGridContracts(components: Component[]) {
  const grid = components.find((c) => c.name === "DataGrid");
  if (grid) {
    grid.props ??= [];
    for (const [name, type] of [
      ["searchText", "(row: Row) => string"],
      ["fixedGroupBy", "string"],
    ]) {
      if (!grid.props.some((p) => p.name === name)) grid.props.push({ name, type });
    }
    const guidance =
      " D4: columns[].headerTooltip je přístupná bublina záhlaví; columns[].defaultSortDirection určuje první směr (uložený má přednost). searchText doplňuje fulltext všech sloupců; fixedGroupBy trvale seskupí podle id sloupce se záhlavím a počtem, bez možnosti změny či odstranění a bez ovlivnění uložených skupin.";
    if (!grid.usage?.includes("D4:")) grid.usage = (grid.usage ?? "") + guidance;
    grid.examples ??= [];
    if (!grid.examples.some((e) => e.label === "Pevné skupiny a fulltext"))
      grid.examples.push({
        label: "Pevné skupiny a fulltext",
        code: '<DataGrid {...props} fixedGroupBy="book" searchText={row => row.importReference} columns={[{ id: "book", label: texts.book, value: row => row.book }, { id: "date", label: texts.date, value: row => row.date, defaultSortDirection: "desc", headerTooltip: texts.dateHint }]} />',
      });
    grid.antipatterns ??= [];
    const rule = "Pevné seskupení nenahrazujte defaultGroupBy; ten může uživatel změnit.";
    if (!grid.antipatterns.includes(rule)) grid.antipatterns.push(rule);
  }
  const panel = components.find((c) => c.name === "RecordSidePanel");
  if (panel && !panel.usage?.includes("D7:"))
    panel.usage =
      (panel.usage ?? "") +
      " D7: pod 768 px hostitele místní overlay; meze táhla nikdy nepřekročí 75 % dostupné šířky ani při zoomu.";
  return [grid, panel].filter((c): c is Component => Boolean(c));
}
