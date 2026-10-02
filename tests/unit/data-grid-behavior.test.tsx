import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

// Radix vybírá useLayoutEffect při prvním načtení modulu; vynutíme skutečný efekt i po SSR testech.
mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { act, cleanup, fireEvent, render, waitFor, within } = await import("@testing-library/react");
const { DataGrid, TreeGrid, DEFAULT_PINNED_COLUMNS, DEFAULT_COMPACT_COLUMNS, isPinnedColumn } =
  await import("../../src/components/ds");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type DataGridColumn<Row> = import("../../src/components/ds").DataGridColumn<Row>;
type TreeGridColumn<Row extends { id: string }> = import("../../src/components/ds").TreeGridColumn<
  Row & { parentId?: string | null }
>;

type Row = { id: string; doc: string; partner: string; amount: number };
const ROWS: Row[] = [
  { id: "1", doc: "FA-002", partner: "Beta", amount: 1000 },
  { id: "2", doc: "FA-001", partner: "Alfa", amount: 250.5 },
  { id: "3", doc: "FA-003", partner: "Alfa", amount: 2000 },
];
const COLUMNS: DataGridColumn<Row>[] = [
  { id: "doc", label: "Doklad", value: (r) => r.doc },
  { id: "partner", label: "Partner", value: (r) => r.partner },
  { id: "amount", label: "Částka", numeric: true, decimals: 2, value: (r) => r.amount },
];

let keyCounter = 0;
const nextKey = () => `behavior-grid-${++keyCounter}`;
const originalRect = HTMLElement.prototype.getBoundingClientRect;

beforeEach(() => {
  localStorage.clear();
  HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      width: 1400,
      height: 24,
      top: 0,
      left: 0,
      right: 1400,
      bottom: 24,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };
});
afterEach(() => {
  cleanup();
  HTMLElement.prototype.getBoundingClientRect = originalRect;
});

type GridProps = React.ComponentProps<typeof DataGrid<Row>>;
function Grid(props: Partial<GridProps>) {
  return (
    <TooltipProvider>
      <DataGrid<Row>
        storageKey={props.storageKey ?? "grid"}
        rows={ROWS}
        columns={COLUMNS}
        rowKey={(r) => r.id}
        paginated={false}
        {...props}
      />
    </TooltipProvider>
  );
}

/** Otevře hledání v liště a napíše dotaz. */
const typeSearch = (root: HTMLElement, value: string) => {
  const button = root.querySelector<HTMLElement>("button[data-toolbar-search]");
  if (button) fireEvent.click(button);
  const input = root.querySelector<HTMLInputElement>("[data-toolbar-search] input")!;
  fireEvent.change(input, { target: { value } });
};

const bodyTexts = (root: HTMLElement, index: number) =>
  [...root.querySelectorAll("tbody tr")]
    .map((tr) => tr.querySelectorAll("td")[index]?.textContent?.trim() ?? "")
    .filter(Boolean);

describe("DataGrid – data", () => {
  it("řadí podle prvního sloupce a kliknutím na záhlaví obrátí směr", () => {
    const view = render(<Grid storageKey={nextKey()} />);
    expect(bodyTexts(view.container, 0)).toEqual(["FA-001", "FA-002", "FA-003"]);
    fireEvent.click(view.getByRole("button", { name: "Seřadit podle Doklad" }));
    expect(bodyTexts(view.container, 0)).toEqual(["FA-003", "FA-002", "FA-001"]);
  });

  it("defaultSort={null} ponechá pořadí dat", () => {
    const view = render(<Grid storageKey={nextKey()} defaultSort={null} />);
    expect(bodyTexts(view.container, 0)).toEqual(["FA-002", "FA-001", "FA-003"]);
  });

  it("hledání filtruje řádky a hlásí onSearchChange", () => {
    const searches: string[] = [];
    const view = render(
      <Grid storageKey={nextKey()} onSearchChange={(value) => searches.push(value)} />,
    );
    typeSearch(view.container, "beta");
    expect(bodyTexts(view.container, 0)).toEqual(["FA-002"]);
    expect(searches.at(-1)).toBe("beta");
  });

  it("sloupcový filtr omezí řádky a hlásí onColumnFiltersChange", async () => {
    const reported: Record<string, string[]>[] = [];
    const view = render(
      <Grid storageKey={nextKey()} onColumnFiltersChange={(f) => reported.push(f)} />,
    );
    fireEvent.click(view.getByRole("button", { name: "Filtrovat Partner" }));
    const option = await waitFor(() => {
      const label = [...document.querySelectorAll("label")].find(
        (node) => node.textContent?.trim() === "Alfa",
      );
      if (!label) throw new Error("nabídka filtru se neotevřela");
      return label;
    });
    fireEvent.click(option.querySelector("button")!);
    await waitFor(() => expect(bodyTexts(view.container, 0)).toEqual(["FA-001", "FA-003"]));
    expect(reported.at(-1)).toEqual({ partner: ["Alfa"] });
  });

  it("součtový řádek sčítá číselné sloupce s oddělením tisíců", () => {
    const view = render(<Grid storageKey={nextKey()} />);
    const footer = view.container.querySelector("tfoot")!;
    expect(footer.textContent?.replace(/\s/g, " ")).toContain("3 250,50");
    expect(footer.textContent).toContain("Celkem");
  });
});

describe("DataGrid – sloupce", () => {
  it("skrytí sloupce ve výběru Sloupce se uloží pod storageKey a přežije nové připojení", async () => {
    const key = nextKey();
    const view = render(<Grid storageKey={key} />);
    expect(view.container.querySelector("thead")?.textContent).toContain("Partner");
    fireEvent.click(view.getAllByRole("button", { name: "Sloupce" })[0]!);
    const label = await waitFor(() => {
      const node = [...document.querySelectorAll("label")].find(
        (candidate) => candidate.textContent?.trim() === "Partner",
      );
      if (!node) throw new Error("výběr sloupců se neotevřel");
      return node;
    });
    fireEvent.click(label.querySelector("button")!);
    await waitFor(() =>
      expect(view.container.querySelector("thead")?.textContent).not.toContain("Partner"),
    );
    view.unmount();
    const again = render(<Grid storageKey={key} />);
    expect(again.container.querySelector("thead")?.textContent).not.toContain("Partner");
  });

  it("výchozí doménové sady jsou exportované konstanty a isPinnedColumn je používá", () => {
    expect(DEFAULT_PINNED_COLUMNS).toContain("status");
    expect(DEFAULT_COMPACT_COLUMNS).toContain("vs");
    expect(isPinnedColumn("status")).toBe(true);
    expect(isPinnedColumn("partner")).toBe(false);
  });

  it("připnutý sloupec stojí vlevo; vlastní pinnedColumnIds ho přesune", () => {
    const columns: DataGridColumn<Row>[] = [
      ...COLUMNS,
      { id: "status", label: "Stav", value: () => "OK" },
    ];
    const heads = (root: HTMLElement) =>
      [...root.querySelectorAll("thead th")].map((th) => th.textContent?.trim());
    const view = render(<Grid storageKey={nextKey()} columns={columns} />);
    expect(heads(view.container)[0]).toBe("Stav");
    cleanup();
    const custom = render(
      <Grid storageKey={nextKey()} columns={columns} pinnedColumnIds={["partner"]} />,
    );
    expect(heads(custom.container)[0]).toBe("Partner");
  });

  it("kompaktní sloupec má šířku podle obsahu; compactColumnIds=[] ho vypne", () => {
    const columns: DataGridColumn<Row>[] = [
      { id: "vs", label: "VS", width: 200, value: (r) => r.doc },
      ...COLUMNS,
    ];
    const vsCol = (root: HTMLElement) => root.querySelector("colgroup col") as HTMLElement;
    const view = render(<Grid storageKey={nextKey()} columns={columns} defaultSort={null} />);
    expect(vsCol(view.container).style.width).toBe("1px");
    cleanup();
    const custom = render(
      <Grid storageKey={nextKey()} columns={columns} defaultSort={null} compactColumnIds={[]} />,
    );
    expect(vsCol(custom.container).style.width).toContain("rem");
  });
});

describe("DataGrid – výběr a skupiny", () => {
  it("režim výběru: zaškrtnutí řádků hlásí výběr a selectionSummary dostane vybrané řádky", () => {
    let latest: Row[] = [];
    const view = render(
      <Grid
        storageKey={nextKey()}
        selectable
        onSelectedRowsChange={(rows) => {
          latest = rows;
        }}
        selectionSummary={(rows) => <span>Vybráno {rows.length}</span>}
      />,
    );
    fireEvent.click(view.getAllByRole("button", { name: "Vybrat více" })[0]!);
    const boxes = view.getAllByRole("checkbox", { name: "Vybrat řádek" });
    fireEvent.click(boxes[0]!);
    fireEvent.click(boxes[2]!);
    expect(latest.map((r) => r.id).sort()).toEqual(["2", "3"]);
    expect(
      view.container.querySelector('[data-slot="grid-selection-summary"]')?.textContent,
    ).toContain("Vybráno 2");
    fireEvent.click(view.getByRole("checkbox", { name: "Vybrat všechny řádky" }));
    expect(latest).toHaveLength(3);
  });

  it('groupTotals="row" vloží řádek součtu za každou skupinu', () => {
    const view = render(<Grid storageKey={nextKey()} defaultGroupBy="partner" groupTotals="row" />);
    const totals = [...view.container.querySelectorAll('[data-slot="grid-group-total"]')];
    expect(totals).toHaveLength(2);
    const text = totals.map((tr) => tr.textContent?.replace(/\s/g, " "));
    expect(text.some((t) => t?.includes("2 250,50"))).toBe(true);
    expect(text.some((t) => t?.includes("1 000,00"))).toBe(true);
  });
});

describe("DataGrid – akce řádku a lišta", () => {
  it("Upravit volá onEditRow, Odstranit se ptá a po potvrzení volá onDeleteRow", async () => {
    const edited: string[] = [];
    const deleted: string[] = [];
    const view = render(
      <Grid
        storageKey={nextKey()}
        onEditRow={(r) => edited.push(r.id)}
        onDeleteRow={(r) => deleted.push(r.id)}
        deleteConfirm={(r) => `Odstranit ${r.doc}?`}
      />,
    );
    fireEvent.click(view.getAllByRole("button", { name: "Upravit" })[0]!);
    expect(edited).toEqual(["2"]);
    fireEvent.click(view.getAllByRole("button", { name: "Odstranit" })[0]!);
    const dialog = await waitFor(() => view.getByRole("alertdialog"));
    expect(dialog.textContent).toContain("Odstranit FA-001?");
    expect(deleted).toEqual([]);
    fireEvent.click(within(dialog).getByRole("button", { name: "Odstranit" }));
    await waitFor(() => expect(deleted).toEqual(["2"]));
  });

  it("zakázané odstranění zůstane vidět, ale nic nevolá", () => {
    const deleted: string[] = [];
    const view = render(
      <Grid
        storageKey={nextKey()}
        onDeleteRow={(r) => deleted.push(r.id)}
        deleteDisabledReason={() => "Nelze"}
      />,
    );
    const button = view.getAllByRole("button", { name: "Odstranit" })[0]!;
    expect(button.hasAttribute("disabled") || button.getAttribute("aria-disabled") === "true").toBe(
      true,
    );
    fireEvent.click(button);
    expect(deleted).toEqual([]);
  });

  it("dvojklik na řádek otevře úpravu", () => {
    const edited: string[] = [];
    const view = render(<Grid storageKey={nextKey()} onEditRow={(r) => edited.push(r.id)} />);
    fireEvent.doubleClick(view.container.querySelector("tbody tr")!);
    expect(edited).toEqual(["2"]);
  });

  it("Obnovit volá onRefresh", async () => {
    let calls = 0;
    const view = render(<Grid storageKey={nextKey()} onRefresh={() => void (calls += 1)} />);
    await act(async () => {
      fireEvent.click(view.getAllByRole("button", { name: "Obnovit data" })[0]!);
    });
    expect(calls).toBe(1);
  });
});

describe("DataGrid – virtualizace bez stránkování", () => {
  const many: Row[] = Array.from({ length: 5000 }, (_, index) => ({
    id: String(index),
    doc: `D-${String(index).padStart(5, "0")}`,
    partner: index % 2 ? "Alfa" : "Beta",
    amount: 1,
  }));
  const withScroll = (height: number) => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => height,
    });
    return () => {
      if (original) Object.defineProperty(HTMLElement.prototype, "clientHeight", original);
    };
  };

  it("5 000 řádků v režimu fill vykreslí jen okno; rolování ho posune", async () => {
    const restore = withScroll(480);
    try {
      const view = render(
        <Grid storageKey={nextKey()} rows={many} height="fill" defaultSort={null} />,
      );
      const rendered = () => view.container.querySelectorAll("tbody tr[data-virtual-row]");
      await waitFor(() => expect(rendered().length).toBeLessThan(200));
      expect(rendered().length).toBeGreaterThan(20);
      expect(rendered()[0]?.textContent).toContain("D-00000");
      const scroller = view.container.querySelector(".zoom-grid") as HTMLElement;
      scroller.scrollTop = 24 * 2000;
      fireEvent.scroll(scroller);
      await waitFor(() => expect(rendered()[0]?.textContent).not.toContain("D-00000"));
      const first = Number(rendered()[0]?.textContent?.match(/D-(\d+)/)?.[1]);
      expect(first).toBeGreaterThan(1900);
      expect(first).toBeLessThan(2000);
      // Ukotvená hlavička i součtový řádek zůstávají v DOM.
      expect(view.container.querySelector("thead")?.className).toContain("sticky");
      expect(view.container.querySelector("tfoot")?.textContent?.replace(/\s/g, " ")).toContain(
        "5 000",
      );
    } finally {
      restore();
    }
  });

  it("výběr všech řádků a součty skupin platí pro celou množinu, ne jen okno", async () => {
    const restore = withScroll(480);
    try {
      let latest: Row[] = [];
      const view = render(
        <Grid
          storageKey={nextKey()}
          rows={many}
          height="fill"
          selectable
          defaultGroupBy="partner"
          groupTotals="row"
          onSelectedRowsChange={(rows) => {
            latest = rows;
          }}
        />,
      );
      fireEvent.click(view.getAllByRole("button", { name: "Vybrat více" })[0]!);
      fireEvent.click(view.getByRole("checkbox", { name: "Vybrat všechny řádky" }));
      expect(latest).toHaveLength(5000);
      expect(view.container.querySelectorAll("tbody tr[data-virtual-row]").length).toBeLessThan(
        200,
      );
      const scroller = view.container.querySelector(".zoom-grid") as HTMLElement;
      scroller.scrollTop = 24 * 6000;
      fireEvent.scroll(scroller);
      await waitFor(() =>
        expect(
          view.container.querySelectorAll('[data-slot="grid-group-total"]').length,
        ).toBeGreaterThan(0),
      );
      const totals = [...view.container.querySelectorAll('[data-slot="grid-group-total"]')].map(
        (tr) => tr.textContent?.replace(/\s/g, " "),
      );
      expect(totals.some((t) => t?.includes("2 500"))).toBe(true);
    } finally {
      restore();
    }
  });

  it("se stránkováním ani v režimu auto se nevirtualizuje", () => {
    const view = render(
      <Grid storageKey={nextKey()} rows={many.slice(0, 120)} height="auto" defaultSort={null} />,
    );
    expect(view.container.querySelectorAll("tbody tr[data-virtual-row]").length).toBe(120);
  });
});

type Node = { id: string; parentId?: string | null; name: string; amount: number };
const TREE: Node[] = [
  { id: "a", name: "Aktiva", amount: 0 },
  { id: "a1", parentId: "a", name: "Pokladna", amount: 100 },
  { id: "a2", parentId: "a", name: "Banka", amount: 1500 },
  { id: "p", name: "Pasiva", amount: 0 },
  { id: "p1", parentId: "p", name: "Závazky", amount: 300 },
];
const TREE_COLUMNS: TreeGridColumn<Node>[] = [
  { id: "name", label: "Název", value: (r) => r.name },
  { id: "amount", label: "Částka", numeric: true, value: (r) => r.amount },
];

function Tree(props: Partial<React.ComponentProps<typeof TreeGrid<Node>>>) {
  return (
    <TooltipProvider>
      <TreeGrid<Node>
        title="Osnova"
        storageKey={props.storageKey ?? nextKey()}
        rows={TREE}
        columns={TREE_COLUMNS}
        {...props}
      />
    </TooltipProvider>
  );
}

describe("TreeGrid", () => {
  const names = (root: HTMLElement) =>
    [...root.querySelectorAll("tbody tr")].map((tr) => tr.querySelector("td")?.textContent?.trim());

  it("sbalí a rozbalí uzel a součet uzlu zahrnuje potomky", () => {
    const view = render(<Tree />);
    expect(names(view.container)).toEqual(["Aktiva", "Pokladna", "Banka", "Pasiva", "Závazky"]);
    expect(
      view.container.querySelector('tr[data-row-id="a"]')?.textContent?.replace(/\s/g, " "),
    ).toContain("1 600,00");
    const node = () =>
      view.container.querySelector<HTMLElement>('tr[data-row-id="a"] button[aria-expanded]')!;
    fireEvent.click(node());
    expect(names(view.container)).toEqual(["Aktiva", "Pasiva", "Závazky"]);
    expect(node().getAttribute("aria-label")).toBe("Rozbalit");
    fireEvent.click(node());
    expect(names(view.container)).toHaveLength(5);
  });

  it("hledání ponechá cestu k nalezenému uzlu", () => {
    const view = render(<Tree />);
    typeSearch(view.container, "banka");
    expect(names(view.container)).toEqual(["Aktiva", "Banka"]);
  });

  it("akce řádku: Upravit, Odstranit s potvrzením, Obnovit", async () => {
    const edited: string[] = [];
    const deleted: string[] = [];
    let refreshed = 0;
    const view = render(
      <Tree
        onEditRow={(r) => edited.push(r.id)}
        onDeleteRow={(r) => deleted.push(r.id)}
        onRefresh={() => void (refreshed += 1)}
      />,
    );
    fireEvent.click(view.getAllByRole("button", { name: "Upravit" })[1]!);
    expect(edited).toEqual(["a1"]);
    fireEvent.click(view.getAllByRole("button", { name: "Odstranit" })[0]!);
    const dialog = await waitFor(() => view.getByRole("alertdialog"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Odstranit" }));
    await waitFor(() => expect(deleted).toEqual(["a"]));
    await act(async () => {
      fireEvent.click(view.getAllByRole("button", { name: "Obnovit data" })[0]!);
    });
    expect(refreshed).toBe(1);
  });

  it("výběr řádků hlásí onSelectedRowsChange", () => {
    let latest: Node[] = [];
    const view = render(
      <Tree
        selectable
        onSelectedRowsChange={(rows) => {
          latest = rows;
        }}
      />,
    );
    fireEvent.click(view.getAllByRole("button", { name: "Vybrat více" })[0]!);
    fireEvent.click(view.getAllByRole("checkbox", { name: "Vybrat řádek" })[1]!);
    expect(latest.map((r) => r.id)).toEqual(["a1"]);
  });
});
