/** Duplicitní přidání · vlastní testy zakázané akce · nesmí vytvářet duplicitní záznam. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { DS_TEXTS_CS, DS_TEXTS_SK, DsTextsProvider } from "../../src/ds-texts";
import { TagPicker } from "../../src/components/ds/form/TagPicker";
import { UnitSelect } from "../../src/components/ds/accounting/unit-select";

afterEach(cleanup);

for (const texts of [DS_TEXTS_CS, DS_TEXTS_SK]) {
  test(`TagPicker duplicitní název blokuje přidání (${texts.selectCreate.tag})`, async () => {
    const calls: string[] = [];
    const view = render(
      <DsTextsProvider texts={texts}>
        <TagPicker
          tags={[{ id: "t", name: "Urgent" }]}
          value={[]}
          onChange={() => {}}
          onCreate={(name) => {
            calls.push(name);
          }}
        />
      </DsTextsProvider>,
    );
    fireEvent.click(view.getByRole("button", { name: "Štítky" }));
    fireEvent.change(view.getByPlaceholderText("Hledat štítek…"), {
      target: { value: " urgent " },
    });
    const add = view.getByRole("button", { name: texts.selectCreate.tag });
    expect(add.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(add);
    await waitFor(() =>
      expect(
        view.getAllByText(`${texts.selectCreate.tag}: ${texts.selectCreate.duplicate}`).length,
      ).toBeGreaterThan(0),
    );
    expect(calls).toEqual([]);
  });

  for (const query of ["ks", "kus"]) {
    test(`UnitSelect duplicitní kód nebo název blokuje přidání (${query}, ${texts.selectCreate.unit})`, async () => {
      const calls: string[] = [];
      const view = render(
        <DsTextsProvider texts={texts}>
          <UnitSelect
            options={[{ id: "u", code: "ks", name: "Kus", isActive: true }]}
            defaultOpen
            initialSearch={query}
            onChange={() => {}}
            onCreateUnit={async (code) => {
              calls.push(code);
              return { id: "new", code, name: code, isActive: true };
            }}
          />
        </DsTextsProvider>,
      );
      const add = view.getByRole("button", { name: texts.selectCreate.unit });
      expect(add.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(add);
      await waitFor(() =>
        expect(
          view.getAllByText(`${texts.selectCreate.unit}: ${texts.selectCreate.duplicate}`).length,
        ).toBeGreaterThan(0),
      );
      expect(calls).toEqual([]);
    });
  }
}
