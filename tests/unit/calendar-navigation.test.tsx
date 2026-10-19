import { afterEach, describe, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { Calendar } from "../../src/components/ui/calendar";
import { DocumentStatusBadge } from "../../src/components/ds/accounting/document-status-badge";
import { MonthYearSelect } from "../../src/components/ds/form/month-year-select";
import { calendarMonthNames } from "../../src/components/ui/calendar-views";

afterEach(cleanup);
const date = new Date(2026, 9, 19);
describe("Calendar navigation", () => {
  test("nadpis používá samostatné jméno měsíce a rok", () => {
    render(<Calendar mode="single" selected={date} defaultMonth={date} />);
    expect(screen.getByRole("button", { name: /říjen 2026/i })).toBeDefined();
  });
  test("měsíce jsou v prvním pádě", () => {
    expect(calendarMonthNames("cs-CZ")).toEqual([
      "leden",
      "únor",
      "březen",
      "duben",
      "květen",
      "červen",
      "červenec",
      "srpen",
      "září",
      "říjen",
      "listopad",
      "prosinec",
    ]);
  });
  test("meze v pohledu měsíců a let a návrat Escape", () => {
    render(
      <Calendar
        mode="single"
        selected={date}
        minDate={new Date(2026, 9, 5)}
        maxDate={new Date(2026, 10, 20)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /říjen 2026/i }));
    expect(screen.getByRole("button", { name: "leden" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "listopad" }).hasAttribute("disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "2026" }));
    expect(screen.getByRole("button", { name: "2025" }).hasAttribute("disabled")).toBe(true);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Escape" });
    expect(screen.getByRole("button", { name: "leden" })).toBeDefined();
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Escape" });
    expect(screen.getByRole("button", { name: /říjen 2026/i })).toBeDefined();
  });
  test("v dnech Escape zavře a nevolá změnu data", () => {
    const close = mock();
    const select = mock();
    render(<Calendar mode="single" selected={date} onSelect={select} onClose={close} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
    expect(select).not.toHaveBeenCalled();
  });
  test("Dnes se nenabízí mimo povolený rozsah", () => {
    render(
      <Calendar
        mode="single"
        selected={date}
        today={date}
        minDate={new Date(2027, 0, 1)}
        onToday={mock()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Dnes" })).toBeNull();
  });
  test("mezní den nelze vybrat", () => {
    const select = mock();
    const { container } = render(
      <Calendar
        mode="single"
        selected={date}
        minDate={new Date(2026, 9, 5)}
        maxDate={new Date(2026, 9, 20)}
        onSelect={select}
      />,
    );
    const day = container.querySelector('button[data-day="2026-10-04"]');
    expect(day?.hasAttribute("disabled")).toBe(true);
  });
  test("Schválen je český výchozí text schválení", () => {
    render(<DocumentStatusBadge status="posted" approved />);
    expect(screen.getByText("Schválen")).toBeDefined();
    expect(screen.queryByText("Schvájen")).toBeNull();
  });
  test("šipka mění fokus v mřížce měsíců", () => {
    render(<Calendar mode="single" selected={date} />);
    fireEvent.click(screen.getByRole("button", { name: /říjen 2026/i }));
    const october = screen.getByRole("button", { name: "říjen", exact: true });
    act(() => october.focus());
    fireEvent.keyDown(october, { key: "ArrowRight" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "listopad", exact: true }),
    );
  });
  test("PageDown a Shift PageDown mění měsíc a rok", () => {
    const { container } = render(<Calendar mode="single" selected={date} />);
    const day = container.querySelector<HTMLButtonElement>('button[data-day="2026-10-19"]');
    if (!day) throw new Error("Chybí den");
    act(() => day.focus());
    fireEvent.keyDown(day, { key: "PageDown" });
    expect(screen.getByRole("button", { name: /listopad 2026/i })).toBeDefined();
    const next = document.activeElement;
    if (!next) throw new Error("Chybí fokus");
    fireEvent.keyDown(next, { key: "PageDown", shiftKey: true });
    expect(screen.getByRole("button", { name: /listopad 2027/i })).toBeDefined();
  });
  test("MonthYearSelect navigace roku nevybírá hodnotu; měsíc vybere", () => {
    const change = mock();
    render(<MonthYearSelect value="2026-10" onChange={change} minYear={2020} maxYear={2030} />);
    fireEvent.click(screen.getByRole("button", { name: "Měsíc / Rok" }));
    fireEvent.click(screen.getByRole("button", { name: "Další", exact: true }));
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "listopad", exact: true }));
    expect(change).toHaveBeenCalledWith("2027-11");
  });
});
