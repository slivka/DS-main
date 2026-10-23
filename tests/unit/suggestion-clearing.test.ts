/** První ruční změna návrhu · sdílené aliasy a nové návrhy stejného pole. */
import { describe, expect, it, mock } from "bun:test";
import { renderHook } from "@testing-library/react";
import { clearChangedHeaderSuggestions, useSuggestionClear } from "../../src/components/ds/accounting/document-form/document-suggestions";
import { useJournalSuggestionClear, journalSuggestionKey } from "../../src/components/ds/accounting/journal-suggestions";

describe("oznámení zrušení návrhu", () => {
  it("změna částky zruší i návrh sdíleného totalMode", () => {
    const cleared = mock();
    const { result } = renderHook(() => useSuggestionClear({ totalMode: { source: "f.pdf" } }, cleared));
    clearChangedHeaderSuggestions({ currency: "CZK", amountTotal: 1000, totalMode: "entered" },
      { amountTotal: 2000 }, result.current);
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(cleared).toHaveBeenCalledWith("totalMode");
  });
  it("ekvivalentní návrh při překreslení nehlásí druhé zrušení", () => {
    const cleared = mock();
    const { result, rerender } = renderHook(({ source }) =>
      useSuggestionClear({ description: { source } }, cleared), { initialProps: { source: "f.pdf" } });
    result.current("description");
    rerender({ source: "f.pdf" });
    result.current("description");
    expect(cleared).toHaveBeenCalledTimes(1);
    rerender({ source: "g.pdf" });
    result.current("description");
    expect(cleared).toHaveBeenCalledTimes(2);
  });
  it("návrh odstraněný a pak znovu dodaný lze znovu zrušit", () => {
    const cleared = mock();
    const { result, rerender } = renderHook(({ present }) => useSuggestionClear(
      present ? { description: { source: "f.pdf" } } : {}, cleared), { initialProps: { present: true } });
    result.current("description");
    rerender({ present: false });
    rerender({ present: true });
    result.current("description");
    expect(cleared).toHaveBeenCalledTimes(2);
  });
  it("název i číslo účtu a všechny stranové zakázky sdílejí správný klíč", () => {
    for (const column of ["debitAccount", "creditAccountName", "counterAccountName"])
      expect(journalSuggestionKey(column)).toBe("account");
    for (const column of ["dimensionId", "debitDimensionId", "creditDimensionId"])
      expect(journalSuggestionKey(column)).toBe("dimension");
  });
  it("řádek s ekvivalentním návrhem při dalším psaní hlásí jen jednou", () => {
    const cleared = mock();
    const { result, rerender } = renderHook(({ source }) => useJournalSuggestionClear(
      { r1: { text: { source } } }, cleared), { initialProps: { source: "f.pdf" } });
    result.current({ id: "r1", text: "A" }, { text: "B" });
    rerender({ source: "f.pdf" });
    result.current({ id: "r1", text: "B" }, { text: "C" });
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(cleared).toHaveBeenCalledWith("text", "r1");
  });
});