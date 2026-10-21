import { afterEach, expect, it } from "bun:test";
import * as React from "react";
const { render, cleanup, fireEvent } = await import("@testing-library/react");
const { FileChipBar } = await import("../../src/components/ds/feedback/file-chip-bar");
const { FileDropZone } = await import("../../src/components/ds/feedback/file-drop-zone");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
afterEach(cleanup);
it("FileChipBar uvnitř zóny zachová vlastní zastávky akcí bez vnoření do tlačítka", () => {
  const view = render(
    <TooltipProvider>
      <FileDropZone accept={[]} maxSizeBytes={100} onFiles={() => {}}>
        <FileChipBar
          files={["a", "b"].map((id) => ({ id, file: new File(["xml"], `${id}.xml`) }))}
          onRemove={() => {}}
          accept={[]}
          maxSizeBytes={100}
          onFiles={() => {}}
          maxVisible={1}
        />
      </FileDropZone>
    </TooltipProvider>,
  );
  const selectors = view.getAllByRole("button", { name: "Přetáhněte soubory sem" });
  expect(selectors).toHaveLength(2);
  for (const selector of selectors) {
    expect(selector.tabIndex).toBe(0);
    expect(selector.querySelector('button, input, [role="button"]')).toBeNull();
    expect(selector.parentElement?.getAttribute("role")).toBe("group");
  }
  for (const name of ["Odebrat a.xml", "+1 dalších"]) {
    const action = view.getByRole("button", { name });
    expect(action.tabIndex).toBe(0);
    expect(action.parentElement?.closest('[role="button"], button')).toBeNull();
  }
  fireEvent.click(view.getByRole("button", { name: "+1 dalších" }));
  expect(view.getByRole("button", { name: "Odebrat b.xml" }).tabIndex).toBe(0);
});
it("FileChipBar rozbalí další soubory a odebere podle klíče", () => {
  let removed = "";
  const files = ["a", "b", "c"].map((id) => ({ id, file: new File(["xml"], `${id}.xml`) }));
  const view = render(
    <TooltipProvider>
      <FileChipBar
        files={files}
        onRemove={(id) => {
          removed = id;
        }}
        accept={[]}
        maxSizeBytes={100}
        onFiles={() => {}}
        maxVisible={1}
      />
    </TooltipProvider>,
  );
  expect(view.queryByText("b.xml")).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "+2 dalších" }));
  fireEvent.click(view.getByRole("button", { name: "Odebrat b.xml" }));
  expect(removed).toBe("b");
});
