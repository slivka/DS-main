import { afterEach, describe, expect, it } from "bun:test";
import * as React from "react";
const { render, fireEvent, cleanup } = await import("@testing-library/react");
const { FileDropZone } = await import("../../src/components/ds/feedback/file-drop-zone");
const { PaneDropOverlay } = await import("../../src/components/ds/layout/pane-drop-overlay");
const { validateFiles } = await import("../../src/hooks/use-file-drop");
afterEach(cleanup);
const file = (name = "a.xml", size = 3) => new File(["x".repeat(size)], name, { type: "text/xml" });
const transfer = (files: File[], types = ["Files"]) => ({ files, types });
describe("FileDropZone", () => {
  it("validuje přípony a MIME stejnou funkcí", () => {
    const result = validateFiles([file(), file("b.pdf")], [".XML"], 10);
    expect(result.files.map((f) => f.name)).toEqual(["a.xml"]);
    expect(result.rejected[0]?.reasons).toEqual(["type"]);
    expect(validateFiles([file()], ["text/*"], 10).files.length).toBe(1);
  });
  it("odmítne překročení velikosti; přesná hranice projde", () => {
    const result = validateFiles([file("a.xml", 10), file("b.xml", 11)], [], 10);
    expect(result.files[0]?.size).toBe(10);
    expect(result.rejected[0]?.reasons).toEqual(["size"]);
  });
  it("limit počtu počítá jen přijaté soubory", () => {
    const result = validateFiles([file("bad.pdf"), file(), file("b.xml")], [".xml"], 10, 1);
    expect(result.files.map((f) => f.name)).toEqual(["a.xml"]);
    expect(result.rejected.map((r) => r.reasons)).toEqual([["type"], ["count"]]);
    expect(validateFiles([file()], [], 10, 0).files).toEqual([]);
  });
  it("výběr předá přijaté i odmítnuté a dovolí opakovaný výběr", () => {
    let accepted: File[] = [];
    let rejected = 0;
    const view = render(
      <FileDropZone
        accept={[".xml"]}
        maxSizeBytes={10}
        maxFiles={1}
        onFiles={(files) => {
          accepted = files;
        }}
        onReject={(files) => {
          rejected = files.length;
        }}
      />,
    );
    const input = view.container.querySelector("input");
    if (!input) throw new Error("Chybí input");
    fireEvent.change(input, { target: { files: [file(), file("b.xml")] } });
    expect(accepted[0]?.name).toBe("a.xml");
    expect(rejected).toBe(1);
    expect(input.value).toBe("");
  });
  it("Enter a mezerník otevřou výběr, zakázaná plocha nic nepředá", () => {
    let clicks = 0;
    let received = 0;
    const view = render(<FileDropZone accept={[]} maxSizeBytes={10} onFiles={() => received++} />);
    const input = view.container.querySelector("input");
    input?.addEventListener("click", () => clicks++);
    const zone = view.getByRole("group");
    fireEvent.keyDown(zone, { key: "Enter" });
    fireEvent.keyDown(zone, { key: " " });
    expect(clicks).toBe(2);
    view.rerender(
      <FileDropZone disabled accept={[]} maxSizeBytes={10} onFiles={() => received++} />,
    );
    fireEvent.keyDown(zone, { key: "Enter" });
    fireEvent.drop(zone, { dataTransfer: transfer([file()]) });
    expect(received).toBe(0);
    expect(clicks).toBe(2);
  });
});
describe("PaneDropOverlay", () => {
  it("ignoruje interní DnD a nechá běžný klik", () => {
    let drops = 0;
    let clicks = 0;
    const view = render(
      <PaneDropOverlay label="Import" onFiles={() => drops++}>
        <button onClick={() => clicks++}>Akce</button>
      </PaneDropOverlay>,
    );
    const action = view.getByRole("button");
    fireEvent.dragEnter(action, { dataTransfer: transfer([], ["application/x-grid"]) });
    expect(view.queryByRole("status")).toBeNull();
    fireEvent.drop(action, { dataTransfer: transfer([file()], ["application/x-grid"]) });
    fireEvent.click(action);
    expect(drops).toBe(0);
    expect(clicks).toBe(1);
  });
  it("přijme soubory a skryje překryv po drop", () => {
    let drops = 0;
    const view = render(
      <PaneDropOverlay label="Import" onFiles={() => drops++}>
        <p>Obsah</p>
      </PaneDropOverlay>,
    );
    const content = view.getByText("Obsah");
    fireEvent.dragEnter(content, { dataTransfer: transfer([file()]) });
    expect(view.getByRole("status").textContent).toBe("Import");
    fireEvent.drop(content, { dataTransfer: transfer([file()]) });
    expect(drops).toBe(1);
    expect(view.queryByRole("status")).toBeNull();
  });
  it("vnořený cíl přijme dávku právě jednou", () => {
    let outer = 0;
    let inner = 0;
    const view = render(
      <PaneDropOverlay label="Vnější" onFiles={() => outer++}>
        <PaneDropOverlay label="Vnitřní" onFiles={() => inner++}>
          <p>Cíl</p>
        </PaneDropOverlay>
      </PaneDropOverlay>,
    );
    const target = view.getByText("Cíl");
    fireEvent.dragEnter(target, { dataTransfer: transfer([file()]) });
    expect(view.getAllByRole("status").length).toBe(1);
    fireEvent.dragOver(target, { dataTransfer: transfer([file()]) });
    expect(view.getAllByRole("status").length).toBe(1);
    expect(view.getByRole("status").textContent).toBe("Vnitřní");
    fireEvent.drop(target, { dataTransfer: transfer([file()]) });
    expect(inner).toBe(1);
    expect(outer).toBe(0);
  });
  it("zakázaný vnořený cíl ponechá přijetí povolenému rodiči", () => {
    let outer = 0;
    let inner = 0;
    const view = render(
      <PaneDropOverlay label="Vnější" onFiles={() => outer++}>
        <PaneDropOverlay disabled label="Vnitřní" onFiles={() => inner++}>
          <p>Cíl</p>
        </PaneDropOverlay>
      </PaneDropOverlay>,
    );
    fireEvent.drop(view.getByText("Cíl"), { dataTransfer: transfer([file()]) });
    expect(outer).toBe(1);
    expect(inner).toBe(0);
  });
  it("přetažení sdílí odmítnutí typu, velikosti i počtu s výběrem", () => {
    let accepted: File[] = [];
    let reasons: string[][] = [];
    const view = render(<FileDropZone accept={[".xml"]} maxSizeBytes={10} maxFiles={1}
      onFiles={(files) => { accepted = files; }}
      onReject={(files) => { reasons = files.map((entry) => entry.reasons); }} />);
    fireEvent.drop(view.getByRole("group"), {
      dataTransfer: transfer([file("bad.pdf", 11), file("a.xml"), file("b.xml")]),
    });
    expect(accepted.map((item) => item.name)).toEqual(["a.xml"]);
    expect(reasons).toEqual([["type", "size"], ["count"]]);
  });
});
