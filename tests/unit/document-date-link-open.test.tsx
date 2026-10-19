/** Vazba Datum účetního případu ↔ Datum vystavení při otevření dokladu (FP, ZFP, ZFV, DDPOZ). */
import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useDocumentDateLinks } from "../../src/components/ds/accounting/document-form/use-document-date-links";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";

afterEach(cleanup);

const base = { bookId: "b", number: "X1", currency: "CZK" };
const unlinked = {
  ...base,
  id: "doc-1",
  issueDate: "2026-10-05",
  accountingDate: "2026-09-30",
  taxDate: "2026-10-05",
} as DocumentHeaderValue;

function setup(initial: DocumentHeaderValue, code = "FP", preference = true) {
  const calls: DocumentHeaderValue[] = [];
  const hook = renderHook(
    ({ value }: { value: DocumentHeaderValue }) =>
      useDocumentDateLinks({
        code,
        value,
        onChange: (next) => calls.push(next),
        accountingDateLinked: preference,
      }),
    { initialProps: { value: initial } },
  );
  return { hook, calls };
}

describe("useDocumentDateLinks – otevření dokladu", () => {
  for (const code of ["FP", "ZFP", "ZFV", "DDPOZ"])
    it(`${code}: koncept s odpojeným datem zůstane beze změny a vazba je vypnutá`, () => {
      const { hook, calls } = setup(unlinked, code, true);
      expect(calls).toHaveLength(0);
      expect(hook.result.current.effectiveValue.accountingDate).toBe("2026-09-30");
      expect(hook.result.current.link?.locked).toBe(false);
    });

  it("UZ = vystavení: vazba zapnutá, onChange nevolán", () => {
    const { hook, calls } = setup({ ...unlinked, accountingDate: "2026-10-05" });
    expect(calls).toHaveLength(0);
    expect(hook.result.current.link?.locked).toBe(true);
  });

  it("nový doklad: výchozí stav vazby z nastavení uživatele", () => {
    const fresh = { ...unlinked, id: undefined };
    expect(setup(fresh, "FP", true).hook.result.current.link?.locked).toBe(true);
    cleanup();
    expect(setup(fresh, "FP", false).hook.result.current.link?.locked).toBe(false);
  });

  it("změna data vystavení při zapnuté vazbě změní Datum účetního případu", () => {
    const { hook, calls } = setup({ ...unlinked, accountingDate: "2026-10-05" });
    act(() => hook.result.current.patch({ issueDate: "2026-10-12" }));
    expect(calls.at(-1)?.accountingDate).toBe("2026-10-12");
  });

  it("opětovné zapnutí vazby zapíše datum vystavení", () => {
    const { hook, calls } = setup(unlinked);
    act(() => hook.result.current.link?.onToggle(true));
    expect(calls.at(-1)?.accountingDate).toBe("2026-10-05");
  });

  it("přepnutí na jiný doklad odvodí stav vazby znovu z dat", () => {
    const { hook, calls } = setup({ ...unlinked, accountingDate: "2026-10-05" });
    expect(hook.result.current.link?.locked).toBe(true);
    hook.rerender({ value: { ...unlinked, id: "doc-2" } });
    expect(hook.result.current.link?.locked).toBe(false);
    hook.rerender({ value: { ...unlinked, id: "doc-3", accountingDate: "2026-10-05" } });
    expect(hook.result.current.link?.locked).toBe(true);
    expect(calls).toHaveLength(0);
  });
});
