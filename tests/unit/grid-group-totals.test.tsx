/** Součty skupin · vlastní test pravidla total · nesmí testovat zdrojový text. */
import { expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useGroupedRows, type GroupingApi } from "../../src/components/ds/grid/grid-grouping";

const noop = () => {};
const grouping: GroupingApi = {
  enabled: true,
  setEnabled: noop,
  groups: [{ id: "g", granularity: "month" }],
  add: noop,
  remove: noop,
  move: noop,
  moveTo: noop,
  setGranularity: noop,
  clear: noop,
  collapsed: [],
  toggleKey: noop,
  collapseAll: noop,
  expandAll: noop,
  active: true,
};

test("useGroupedRows respektuje total none a nečíselné sloupce", () => {
  const rows = [
    { g: "A", amount: 10, balance: 100, n: 1 },
    { g: "A", amount: 5, balance: 105, n: 2 },
  ];
  const { result } = renderHook(() =>
    useGroupedRows(
      rows,
      grouping,
      [
        { id: "g", label: "G" },
        { id: "amount", label: "Částka", numeric: true },
        { id: "balance", label: "Zůstatek", numeric: true, total: "none" },
        { id: "n", label: "Číslo", numeric: false },
      ],
      (r, id) => r[id as keyof typeof r],
    ),
  );
  const group = result.current.find((i) => i.type === "group");
  expect(group?.type === "group" ? group.sums.map((s) => [s.id, s.total]) : []).toEqual([
    ["amount", 15],
  ]);
});
