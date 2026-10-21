import { afterEach, expect, it } from "bun:test";
import * as React from "react";
const { render, cleanup, fireEvent } = await import("@testing-library/react");
const { CheckList, summarizeChecks } = await import("../../src/components/ds/feedback/check-list");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
afterEach(cleanup);
it("CheckList shrne dvě chyby a jedno upozornění a seřadí výsledky", () => {
  let calls = 0;
  const items = [
    { severity: "ok" as const, title: "A" },
    { severity: "error" as const, title: "B" },
    { severity: "warning" as const, title: "C" },
    {
      severity: "error" as const,
      title: "D",
      action: { label: "Opravit", onClick: () => calls++ },
    },
  ];
  expect(summarizeChecks(items)).toEqual({ errors: 2, warnings: 1 });
  const view = render(
    <TooltipProvider>
      <CheckList items={items} />
    </TooltipProvider>,
  );
  const titles = view.getAllByRole("listitem").map((item) => item.querySelector("p")?.textContent);
  expect(titles).toEqual(["B", "D", "C", "A"]);
  fireEvent.click(view.getByRole("button", { name: "Opravit" }));
  expect(calls).toBe(1);
});
