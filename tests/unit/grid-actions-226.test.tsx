import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DataGrid } from "../../src/components/ds/grid/DataGrid";
import { TreeGrid } from "../../src/components/ds/grid/TreeGrid";

describe("záhlaví sloupce akcí 2.26.0", () => {
  it("DataGrid zobrazuje výchozí i vlastní popisek a zachová další akce", () => {
    const html = renderToStaticMarkup(
      <DataGrid
        storageKey="action-test"
        rows={[{ id: "1", name: "Doklad" }]}
        columns={[{ id: "name", label: "Název", value: (row) => row.name }]}
        rowKey={(row) => row.id}
        onEditRow={() => {}}
        onDeleteRow={() => {}}
        rowActions={() => <span>⋯</span>}
        actionsLabel="Možnosti"
        paginated={false}
      />,
    );
    expect(html).toContain(">Možnosti</th>");
    expect(html).toContain("Upravit");
    expect(html).toContain("Odstranit");
    expect(html).toContain("⋯");
  });

  it("TreeGrid zobrazuje výchozí popisek Akce", () => {
    const html = renderToStaticMarkup(
      <TreeGrid
        storageKey="tree-action-test"
        rows={[{ id: "1", name: "Účet" }]}
        columns={[{ id: "name", label: "Název", value: (row) => row.name }]}
        onEditRow={() => {}}
      />,
    );
    expect(html).toContain(">Akce</th>");
    expect(html).toContain("Upravit");
  });
});
