/** PeriodSwitcher · název období se nezkracuje, rozsah dat je celý nebo skrytý. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { PeriodSwitcher } from "../../src/components/ds/layout/period-switcher";

afterEach(cleanup);

test("název období je celý a rozsah se nikdy nezkracuje trojtečkou", () => {
  const view = render(
    <PeriodSwitcher
      periods={[{ id: "p", name: "Rok 2026", from: "2026-01-01", to: "2026-12-31", state: "open" }]}
      value="p"
      onChange={() => {}}
    />,
  );
  const value = view.container.querySelector('[data-slot="context-pill-value"]');
  expect(value?.textContent).toBe("Rok 2026");
  const detail = view.container.querySelector('[data-slot="context-pill-detail"]');
  expect(detail?.textContent).toBe("1. 1. – 31. 12. 2026");
  expect(detail?.textContent).not.toContain("…");
});
