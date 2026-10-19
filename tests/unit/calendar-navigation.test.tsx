import { afterEach, describe, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Calendar } from "../../src/components/ui/calendar";
import { DocumentStatusBadge } from "../../src/components/ds/accounting/document-status-badge";
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
});
