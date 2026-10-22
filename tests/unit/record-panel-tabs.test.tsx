/** Záložky RecordSidePanel a pole poznámek · pořadí, tablist, auto-grow · bez mock.module (globální pro celý běh). */
import { afterEach, describe, expect, it } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { FileText, History, Link2, MessageSquare, Paperclip } from "lucide-react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { RecordSidePanel } from "../../src/components/ds/layout/record-side-panel";
import { RecordNotes } from "../../src/components/ds/feedback/record-notes";
import { NoteTextarea } from "../../src/components/ds/feedback/record-note-textarea";
afterEach(cleanup);

const tabs = [
  { id: "history", label: "Historie", icon: History, content: "h" },
  { id: "attachments", label: "Přílohy", icon: Paperclip, count: 2, content: "a" },
  { id: "linked", label: "Propojené doklady", icon: Link2, content: "l" },
  { id: "notes", label: "Poznámky", icon: MessageSquare, content: "n" },
  { id: "source", label: "Zdroj", icon: FileText, content: "s" },
];
function Panel() {
  const [tab, setTab] = useState("notes");
  return (
    <TooltipProvider>
      <RecordSidePanel
        open
        onOpenChange={() => {}}
        activeTab={tab}
        onActiveTabChange={setTab}
        tabs={[tabs[4], tabs[3], tabs[1], tabs[2], tabs[0]]}
      >
        obsah
      </RecordSidePanel>
    </TooltipProvider>
  );
}

describe("RecordSidePanel záložky", () => {
  it("pořadí Zdroj · Poznámky · Přílohy | Propojené · Historie s oddělovačem", () => {
    const view = render(<Panel />);
    const list = view.container.querySelector('[data-slot="record-panel-tabs"]')!;
    expect(list.getAttribute("role")).toBe("tablist");
    const items = Array.from(list.children).map((node) =>
      node.getAttribute("data-slot") === "record-panel-tab-separator"
        ? "|"
        : node.getAttribute("aria-label"),
    );
    expect(items).toEqual([
      "Zdroj",
      "Poznámky",
      "Přílohy: 2",
      "|",
      "Propojené doklady",
      "Historie",
    ]);
    expect(view.container.querySelector('[data-slot="record-panel-tab-count"]')?.textContent).toBe(
      "2",
    );
  });
  it("tablist je vodorovný s roving tabindex (šipky ověřuje Chromium E2E)", () => {
    const view = render(<Panel />);
    expect(view.getByRole("tablist").getAttribute("aria-orientation")).toBe("horizontal");
    expect(view.getByRole("tab", { name: "Poznámky" }).getAttribute("aria-selected")).toBe("true");
  });
});

describe("RecordNotes pole", () => {
  it("Přidat je primární tlačítko", () => {
    const view = render(
      <TooltipProvider>
        <RecordNotes notes={[]} onAdd={() => {}} />
      </TooltipProvider>,
    );
    fireEvent.change(view.getByRole("textbox"), { target: { value: "x" } });
    const add = view.getByRole("button", { name: /Přidat/ });
    expect(add.className).toContain("bg-primary");
  });
  it("roste s textem bez posuvníku a nad limitem zapne posuvník", () => {
    const heights: Record<string, number> = { a: 60, b: 600 };
    const view = render(<NoteTextarea value="a" onChange={() => {}} onSubmit={() => {}} />);
    const box = view.getByRole("textbox") as HTMLTextAreaElement;
    Object.defineProperty(box, "scrollHeight", { get: () => heights[box.value] ?? 40 });
    box.style.maxHeight = "300px";
    view.rerender(<NoteTextarea value="b" onChange={() => {}} onSubmit={() => {}} />);
    view.rerender(<NoteTextarea value="a" onChange={() => {}} onSubmit={() => {}} />);
    expect(box.style.height).toBe("60px");
    expect(box.style.overflowY).toBe("hidden");
    view.rerender(<NoteTextarea value="b" onChange={() => {}} onSubmit={() => {}} />);
    expect(box.style.height).toBe("300px");
    expect(box.style.overflowY).toBe("auto");
    expect(box.className).toContain("resize-y");
  });
});
