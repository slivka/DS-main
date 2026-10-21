/** DocumentForm předává ovladač panelu do záhlaví. */
import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DocumentFormTop } from "../../src/components/ds/accounting/document-form/document-form-top";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "../../src/components/ds/accounting/document-form/document-form-types";
import { DS_TEXTS_CS } from "../../src/ds-texts/cs";
import type { DocumentFormProps } from "../../src/components/ds/accounting/document-form/document-form-types";

afterEach(cleanup);

it("DocumentForm předaný ovladač panelu volá APP", () => {
  const toggle = mock();
  const props = {
    status: "draft",
    panelToggle: <button onClick={toggle}>Panel</button>,
  } as DocumentFormProps;
  const ui = render(
    <TooltipProvider>
      <DocumentFormTop
        props={props}
        title="Doklad"
        moreActions={[]}
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
});
