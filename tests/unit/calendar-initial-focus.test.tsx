/** Kalendář · počáteční fokus nikdy nepatří do sousedního měsíce. */
import { afterEach, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
test("Enter na další měsíc nechá fokus na šipce a nevybere den", () => {
  const select = mock();
  render(
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 9, 1)}
      today={new Date(2026, 9, 20)}
      onSelect={select}
      initialFocus
    />,
  );
  for (let i = 0; i < 2; i++) {
    const next = screen.getByRole("button", { name: /další měsíc|next/i });
    act(() => next.focus());
    fireEvent.click(next);
    expect(document.activeElement?.outerHTML.slice(0, 120)).toBe(
      screen.getByRole("button", { name: /další měsíc|next/i }).outerHTML.slice(0, 120),
    );
  }
  expect(screen.getByRole("button", { name: /prosinec 2026/i })).toBeDefined();
  expect(select).not.toHaveBeenCalled();
});
