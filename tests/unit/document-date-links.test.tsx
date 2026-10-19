import { describe, expect, it, mock } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useDocumentDateLinks } from "../../src/components/ds/accounting/document-form/use-document-date-links";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form/document-form-types";

const base = (v: Partial<DocumentHeaderValue>) => ({ id: "new", ...v }) as DocumentHeaderValue;

describe("useDocumentDateLinks", () => {
  it("jiné value.id resetuje ručně změněné DUZP a obnoví automatickou vazbu", () => {
    const onChange = mock((v: DocumentHeaderValue) => v);
    const { result, rerender } = renderHook(
      ({ value }) =>
        useDocumentDateLinks({ code: "FP", value, onChange, accountingDateLinked: true }),
      { initialProps: { value: base({ issueDate: "2026-10-01", taxDate: "2026-10-01" }) } },
    );
    act(() => result.current.patch({ taxDate: "2026-09-30" }));
    const before = onChange.mock.calls.length;
    rerender({ value: base({ id: "other", issueDate: "2026-10-18", taxDate: null }) });
    // Otevření existujícího dokladu nic nezapisuje (2.109.0); vazba platí až po akci.
    expect(onChange.mock.calls.length).toBe(before);
    act(() => result.current.patch({ issueDate: "2026-10-19" }));
    expect(onChange.mock.calls.at(-1)?.[0].taxDate).toBe("2026-10-19");
  });

  it("readOnly doklad s odlišným DUZP po otevření nevolá onChange", () => {
    const onChange = mock((v: DocumentHeaderValue) => v);
    const value = base({
      issueDate: "2026-10-18",
      accountingDate: "2026-10-10",
      taxDate: "2026-10-05",
    });
    const { result } = renderHook(() =>
      useDocumentDateLinks({
        code: "FP",
        value,
        onChange,
        accountingDateLinked: true,
        readOnly: true,
      }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.effectiveValue.accountingDate).toBe("2026-10-10");
    expect(result.current.effectiveValue.taxDate).toBe("2026-10-05");
  });

  it("nové FP s prázdným DUZP zapíše taxDate = issueDate", () => {
    const onChange = mock(() => {});
    renderHook(() =>
      useDocumentDateLinks({
        code: "FP",
        value: base({
          id: undefined,
          issueDate: "2026-10-01",
          accountingDate: "2026-10-01",
          taxDate: null,
        }),
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
    const value = base({
      issueDate: "2026-10-01",
      accountingDate: "2026-10-01",
      taxDate: "2026-10-01",
    });
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
