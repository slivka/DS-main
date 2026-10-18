import { describe, expect, it, mock } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useDocumentDateLinks } from "../../src/components/ds/accounting/document-form/use-document-date-links";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form/document-form-types";

const base = (v: Partial<DocumentHeaderValue>) => ({ id: "new", ...v }) as DocumentHeaderValue;

describe("useDocumentDateLinks", () => {
  it("nové FP s prázdným DUZP zapíše taxDate = issueDate", () => {
    const onChange = mock(() => {});
    renderHook(() =>
      useDocumentDateLinks({
        code: "FP",
        value: base({ issueDate: "2026-10-01", accountingDate: "2026-10-01", taxDate: null }),
        onChange,
        accountingDateLinked: true,
      }),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = (onChange.mock.calls[0] as unknown[])[0] as DocumentHeaderValue;
    expect(next.taxDate).toBe("2026-10-01");
  });

  it("změna vystavení posune účetní datum i DUZP; ruční DUZP se neposouvá", () => {
    const onChange = mock((v: DocumentHeaderValue) => v);
    const value = base({ issueDate: "2026-10-01", accountingDate: "2026-10-01", taxDate: "2026-10-01" });
    const { result } = renderHook(() =>
      useDocumentDateLinks({ code: "FP", value, onChange, accountingDateLinked: true }),
    );
    act(() => result.current.patch({ issueDate: "2026-10-05" }));
    const moved = onChange.mock.calls.at(-1)?.[0] as DocumentHeaderValue;
    expect(moved.accountingDate).toBe("2026-10-05");
    expect(moved.taxDate).toBe("2026-10-05");

    act(() => result.current.patch({ taxDate: "2026-09-30" }));
    act(() => result.current.patch({ issueDate: "2026-10-07" }));
    const manual = onChange.mock.calls.at(-1)?.[0] as DocumentHeaderValue;
    expect(manual.accountingDate).toBe("2026-10-07");
    expect(manual.taxDate).toBe("2026-10-01");
  });
});
