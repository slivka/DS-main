/** Peněžní editor potvrzuje i porovnává záporné poloviny od nuly. */
import { afterEach, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GridAmountEditor, exceedsMax } from "../../src/components/ds/grid/grid-amount-editor";

afterEach(cleanup);
it("−1,005 po Enter potvrdí jako −1,01", () => {
  const onChange = mock(() => {});
  render(<GridAmountEditor value={0} onChange={onChange} ariaLabel="Částka" />);
  const input = screen.getByRole("textbox", { name: "Částka" });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "-1,005" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onChange).toHaveBeenCalledWith(-1.01);
});
it("maximum porovnává stejným peněžním zaokrouhlením", () => {
  expect(exceedsMax(-1, -1.005)).toBe(true);
  expect(exceedsMax(-1.005, -1.01)).toBe(false);
});
