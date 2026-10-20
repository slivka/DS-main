/** Zámek VS · ověřuje pouze uživatelské změny vazby a paměť platného náhledu. */
import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { DS_TEXTS_CS } from "../../src/ds-texts";
import { useVariableSymbolLink } from "../../src/components/ds/accounting/document-form/use-variable-symbol-link";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";
afterEach(cleanup);
describe("VariableSymbolLink", () => {
  for (const code of ["FP", "ZFP", "DDPOZ", "FV", "ZFV", "DDPZ"]) {
    test(`${code}: písmena, platné číslo, smazání a 11 číslic zámek neuvolní`, () => {
      const received = ["FP", "ZFP", "DDPOZ"].includes(code);
      const sourceKey = received ? "externalNumber" : "number";
      const { result } = renderHook(() => {
        const [value, setValue] = useState<DocumentHeaderValue>({
          currency: "EUR",
          amountTotal: 0,
          totalMode: "entered",
          variableSymbolLinked: true,
        });
        const link = useVariableSymbolLink(
          code,
          value,
          (next) => setValue((previous) => ({ ...previous, ...next })),
          DS_TEXTS_CS.documentEdit,
        );
        return {
          value,
          link,
          change: (text: string) =>
            setValue((previous) => ({ ...previous, ...link.sourcePatch({ [sourceKey]: text }) })),
        };
      });
      act(() => result.current.change("F"));
      expect(result.current.link.linked).toBe(true);
      expect(result.current.link.derivedValue).toBeNull();
      expect(result.current.link.warning).toBe(DS_TEXTS_CS.documentEdit.vsNoDigits);
      act(() => result.current.change("FA2026001"));
      expect(result.current.link.derivedValue).toBe("2026001");
      expect(result.current.link.linked).toBe(true);
      act(() => result.current.change("FA"));
      expect(result.current.link.derivedValue).toBeNull();
      expect(result.current.link.warning).toBeDefined();
      act(() => result.current.change("12345678901"));
      expect(result.current.link.linked).toBe(true);
      expect(result.current.link.derivedValue).toBeNull();
      expect(result.current.link.warning).toBe(DS_TEXTS_CS.documentEdit.vsTooLong);
      act(() => result.current.link.onLinkedChange(false));
      expect(result.current.value.variableSymbol).toBe("2026001");
      expect(result.current.link.warning).toBeUndefined();
    });
  }
  test("odemčení bez platného náhledu vrací prázdno, ne starý vlastní VS", () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState<DocumentHeaderValue>({
        currency: "EUR",
        amountTotal: 0,
        totalMode: "entered",
        externalNumber: "F",
        variableSymbolLinked: true,
        variableSymbol: "999",
      });
      return {
        value,
        link: useVariableSymbolLink(
          "FP",
          value,
          (next) => setValue((old) => ({ ...old, ...next })),
          DS_TEXTS_CS.documentEdit,
        ),
      };
    });
    act(() => result.current.link.onLinkedChange(false));
    expect(result.current.value.variableSymbol).toBeNull();
  });
});
