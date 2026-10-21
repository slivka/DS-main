import { afterEach, expect, it } from "bun:test";
import * as React from "react";
const { render, cleanup, fireEvent } = await import("@testing-library/react");
const { FileChipBar } = await import("../../src/components/ds/feedback/file-chip-bar");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
afterEach(cleanup);
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
