import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";

import { RecordDialog } from "../../src/components/ds/layout/RecordDialog";
import { Field, FieldGrid } from "../../src/components/ds/layout/form-field-layout";
import { ContextSwitcher } from "../../src/components/ds/layout/context-switcher";

afterEach(cleanup);

function dialog(size: "sm" | "md", description?: string) {
  render(
    <RecordDialog
      open
      onOpenChange={() => {}}
      size={size}
      title="Nové účetní období"
      {...(description ? { description } : {})}
      onSubmit={() => {}}
      deleteAction={{ onClick: () => {}, confirm: { title: "Odstranit?" } }}
    >
      <FieldGrid cols={12}>
        <Field label="Od" span={6}>
          <input />
        </Field>
      </FieldGrid>
    </RecordDialog>,
  );
}

describe("Drobné opravy 3", () => {
  it("patička: pravá skupina vpravo v řádku, pod sebou až pod 24 rem", () => {
    dialog("sm");
    const footer = document.querySelector('[data-slot="record-dialog-footer"]')!;
    expect(footer.className).toContain("@min-[24rem]:flex-row-reverse");
    expect(footer.className).not.toContain("40rem");
    const end = footer.querySelector('[data-slot="record-dialog-footer-end"]')!;
    expect(end.className).toContain("@min-[24rem]:flex-row");
    expect(end.querySelector('[data-slot="record-submit"]')).not.toBeNull();
  });

  it("FieldGrid v sm dialogu od 24 rem, v md od 40 rem; span funguje", () => {
    dialog("sm");
    let grid = document.querySelector("[data-field-grid-breakpoint] > div")!;
    expect(grid.className).toContain("@min-[24rem]:grid-cols-12");
    expect(document.querySelector('[data-slot="field"]')!.className).toContain(
      "@min-[24rem]:col-span-6",
    );
    cleanup();
    dialog("md");
    expect(document.querySelector("[data-field-grid-breakpoint]")).toBeNull();
    grid = document.querySelector('[data-slot="field"]')!.parentElement!;
    expect(grid.className).toContain("@min-[40rem]:grid-cols-12");
  });

  it("popis je viditelný a zůstává aria-describedby", () => {
    dialog("sm", "Období navazuje na poslední rok.");
    const desc = document.querySelector('[data-slot="record-dialog-description"]')!;
    expect(desc.className).not.toContain("sr-only");
    expect(desc.className).toContain("text-muted-foreground");
    const dlg = document.querySelector('[role="dialog"]')!;
    expect(dlg.getAttribute("aria-describedby")).toBe(desc.id);
  });

  it("přepínač kontextu nemá pevnou výšku", () => {
    render(
      <ContextSwitcher
        label="Velmi dlouhý název prostoru"
        description="3 firmy"
        items={[{ id: "a", label: "A" }]}
        value="a"
        onValueChange={() => {}}
      />,
    );
    const btn = document.querySelector('[data-slot="context-switcher"]')!;
    expect(btn.className).not.toContain("h-[var(--control-h)]");
    expect(btn.className).toContain("h-auto");
    expect(btn.className).toContain("px-3");
    expect(btn.className).toContain("py-2");
  });
});
