/** Vzory · ověřuje nabídku, oprávnění a pruh v obou variantách. */
import { afterEach, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { DocumentNewMenu } from "../../src/components/ds/templates/document-new-menu";
import { TemplateManager } from "../../src/components/ds/templates/template-manager";
import { DuplicationPreview } from "../../src/components/ds/templates/duplication-preview";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { DsTextsProvider } from "../../src/ds-texts";
import type { DocumentTemplate } from "../../src/components/ds/templates/template-types";
afterEach(cleanup);
const noop = () => {};
const template: DocumentTemplate = {
  id: "t",
  name: "Nájem",
  author: "Jana",
  shared: false,
  withoutAmounts: true,
  canRename: { allowed: false, reason: "Chybí právo" },
  canShare: { allowed: true },
  canEdit: { allowed: true },
  canDelete: { allowed: true },
};
async function openMenu(button: HTMLElement) {
  fireEvent.pointerDown(button, { button: 0, ctrlKey: false });
  await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeTruthy());
}
test("DocumentNewMenu prázdný doklad a správa předají callback", async () => {
  const blank = mock();
  const manage = mock();
  const view = render(
    <DocumentNewMenu templates={[]} onBlank={blank} onManage={manage} onTemplate={noop} />,
  );
  await openMenu(view.getByRole("button", { name: "Nový" }));
  fireEvent.click(view.getByRole("menuitem", { name: "Prázdný doklad" }));
  expect(blank).toHaveBeenCalledTimes(1);
  await openMenu(view.getByRole("button", { name: "Nový" }));
  fireEvent.click(view.getByRole("menuitem", { name: "Spravovat vzory" }));
  expect(manage).toHaveBeenCalledTimes(1);
});
test("DocumentNewMenu bez vzorů ukazuje důvod a nespustí vytvoření", async () => {
  const select = mock();
  const view = render(
    <DocumentNewMenu templates={[]} onBlank={noop} onManage={noop} onTemplate={select} />,
  );
  await openMenu(view.getByRole("button", { name: "Nový" }));
  const item = view.getByRole("menuitem", { name: "Ze vzoru" });
  expect(item.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(item);
  expect(select).not.toHaveBeenCalled();
});
test("DuplicationPreview souhrn vychází z canCreate a pořadí APP", () => {
  const view = render(
    <DuplicationPreview
      storageKey="preview-test"
      rows={[
        { id: "a", date: "2026-11-15", period: "11", description: "A", canCreate: true },
        {
          id: "b",
          date: "2026-12-15",
          period: "12",
          description: "B",
          canCreate: false,
          problem: "Uzavřeno",
        },
      ]}
    />,
  );
  expect(view.getByText("Vytvoří se 1 z 2")).toBeTruthy();
  expect(view.getByText("Uzavřeno").closest("[aria-invalid]")).toBeTruthy();
});
test("TemplateManager nepovolí zakázané přejmenování a dovolí sdílet", async () => {
  const action = mock();
  const view = render(
    <TemplateManager templates={[template]} storageKey="manager-test" onAction={action} />,
  );
  await openMenu(view.getByRole("button", { name: "Spravovat vzory: Nájem" }));
  fireEvent.click(view.getByRole("menuitem", { name: "Přejmenovat" }));
  expect(action).not.toHaveBeenCalled();
  fireEvent.click(view.getByRole("menuitem", { name: "Sdílet" }));
  expect(action).toHaveBeenCalledWith(template, "share");
});
test("TemplateManager smazání předá až po potvrzení", async () => {
  const action = mock();
  const view = render(
    <TemplateManager templates={[template]} storageKey="manager-delete" onAction={action} />,
  );
  await openMenu(view.getByRole("button", { name: "Spravovat vzory: Nájem" }));
  fireEvent.click(view.getByRole("menuitem", { name: "Smazat" }));
  expect(action).not.toHaveBeenCalled();
  fireEvent.click(view.getByRole("button", { name: "Smazat" }));
  expect(action).toHaveBeenCalledWith(template, "delete");
});
for (const type of ["FV", "FP", "ZFV", "ZFP"] as const) {
  test(`DocumentForm ${type} sdílí pruh i callbacky vzoru`, () => {
    const save = mock();
    const discard = mock();
    const view = render(
      <DocumentForm
        title={type}
        documentType={type}
        homeCurrency="EUR"
        status="draft"
        value={{ currency: "EUR", rate: 1 }}
        onChange={noop}
        lines={[]}
        onLinesChange={noop}
        books={[]}
        accounts={[]}
        templateEdit={{ name: "Nájem", onSave: save, onDiscard: discard }}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Uložit vzor" }));
    fireEvent.click(view.getByRole("button", { name: "Zahodit změny" }));
    expect(save).toHaveBeenCalledTimes(1);
    expect(discard).toHaveBeenCalledTimes(1);
  });
}
test("DuplicationPreview respektuje slovenský jazyk", () => {
  const view = render(
    <DsTextsProvider locale="sk">
      <DuplicationPreview storageKey="sk-preview" rows={[]} />
    </DsTextsProvider>,
  );
  expect(view.getByText("Vytvorí sa 0 z 0")).toBeTruthy();
});
for (const action of ["rename", "share", "edit", "delete"] as const) {
  test(`TemplateManager oprávnění ${action} zablokuje callback`, async () => {
    const callback = mock();
    const item: DocumentTemplate = {
      ...template,
      canRename: { allowed: false, reason: "Bez práva" },
      canShare: { allowed: false, reason: "Bez práva" },
      canEdit: { allowed: false, reason: "Bez práva" },
      canDelete: { allowed: false, reason: "Bez práva" },
    };
    const labels = { rename: "Přejmenovat", share: "Sdílet", edit: "Upravit", delete: "Smazat" };
    const view = render(
      <TemplateManager templates={[item]} storageKey={`denied-${action}`} onAction={callback} />,
    );
    await openMenu(view.getByRole("button", { name: "Spravovat vzory: Nájem" }));
    fireEvent.click(view.getByRole("menuitem", { name: labels[action] }));
    expect(callback).not.toHaveBeenCalled();
  });
}
test("TemplateManager sdílený vzor nabízí Nesdílet", async () => {
  const action = mock();
  const item = { ...template, shared: true };
  const view = render(
    <TemplateManager templates={[item]} storageKey="unshare" onAction={action} />,
  );
  await openMenu(view.getByRole("button", { name: "Spravovat vzory: Nájem" }));
  fireEvent.click(view.getByRole("menuitem", { name: "Nesdílet" }));
  expect(action).toHaveBeenCalledWith(item, "unshare");
});
