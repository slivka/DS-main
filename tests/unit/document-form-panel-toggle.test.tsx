/** DocumentForm předává ovladač panelu jako poslední akci, nikoli do záhlaví. */
import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DocumentFormTop } from "../../src/components/ds/accounting/document-form/document-form-top";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "../../src/components/ds/accounting/document-form/document-form-types";
import { DS_TEXTS_CS } from "../../src/ds-texts/cs";
import type { DocumentFormProps } from "../../src/components/ds/accounting/document-form/document-form-types";
import { RecordActionBar } from "../../src/components/ds/layout/record-action-bar";

afterEach(cleanup);

it("DocumentForm předaný ovladač panelu volá APP", () => {
  const toggle = mock();
  const props = {
    status: "draft",
    panelToggle: <button onClick={toggle}>Panel</button>,
    primaryAction: { label: "Zařadit", onClick: () => {} },
    saveAction: { dirty: true, onSave: () => {} },
  } as DocumentFormProps;
  const ui = render(
    <TooltipProvider>
      <DocumentFormTop
        props={props}
        title="Doklad"
        moreActions={[{ id: "other", label: "Další", onClick: () => {} }]}
        issues={[]}
        notices={null}
        vatRelevant={false}
        onVatRelevantChange={() => {}}
        t={{ ...DS_TEXTS_CS.documentForm, ...DEFAULT_DOCUMENT_FORM_TEXTS }}
      />
    </TooltipProvider>,
  );
  fireEvent.click(ui.getByRole("button", { name: "Panel" }));
  expect(toggle).toHaveBeenCalledTimes(1);
  const actions = ui.container.querySelector('[data-slot="record-action-buttons"]');
  expect(Array.from(actions?.querySelectorAll("button") ?? []).map(button => button.getAttribute("aria-label") ?? button.textContent)).toEqual([
    "Zařadit", "Uložit", DS_TEXTS_CS.recordAction.moreActions, "Panel",
  ]);
  expect(ui.getByRole("button", { name: "Panel" }).closest('[data-slot="document-action-bar"]')).toBeTruthy();
  expect(ui.getByRole("button", { name: "Panel" }).closest('[data-slot="page-header"]')).toBeNull();
});

it("RecordActionBar zachová samostatný panel i bez uložení", () => {
  const ui = render(<TooltipProvider><RecordActionBar panelToggle={<button>Panel</button>} /></TooltipProvider>);
  expect(ui.getByRole("button", { name: "Panel" }).closest('[data-slot="record-action-buttons"]')).toBeTruthy();
});
