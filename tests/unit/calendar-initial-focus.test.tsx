/** Kalendář · počáteční fokus nikdy nepatří do sousedního měsíce. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Calendar } from "../../src/components/ui/calendar";
afterEach(cleanup);
test("prázdný kalendář zaostří dnešek ve zobrazeném měsíci", () => {
  render(
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 9, 1)}
      today={new Date(2026, 9, 20)}
      initialFocus
    />,
  );
  expect(document.activeElement?.getAttribute("data-day")).toBe("2026-10-20");
});
test("bez dneška ve zobrazeném měsíci zaostří první den, ne první buňku", () => {
  render(
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 8, 1)}
      today={new Date(2026, 9, 20)}
      initialFocus
    />,
  );
  expect(document.activeElement?.getAttribute("data-day")).toBe("2026-09-01");
});
test("vybraný den mimo zobrazený měsíc nesmí převzít fokus", () => {
  render(
    <Calendar
      mode="single"
      selected={new Date(2026, 7, 31)}
      defaultMonth={new Date(2026, 8, 1)}
      today={new Date(2026, 9, 20)}
      initialFocus
    />,
  );
  expect(document.activeElement?.getAttribute("data-day")).toBe("2026-09-01");
});
