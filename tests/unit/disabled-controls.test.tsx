/** Zakázaná pole · vlastní interakce a prázdné hodnoty · nesmí číst zdrojový text. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { PartnerSelect } from "../../src/components/ds/accounting/partner-select";
import { OptionSelect } from "../../src/components/ds/form/option-select";

import { SegmentedField } from "../../src/components/ds/form/segmented-field";

afterEach(cleanup);

test("PartnerSelect zakázaný partner neotevře nabídku ani nezmění hodnotu", () => {
  let changed = false;
  const view = render(
    <PartnerSelect
      partners={[{ id: "p", name: "Partner" }]}
      value="p"
      disabled
      onChange={() => {
        changed = true;
      }}
    />,
  );
  const trigger = view.getByRole("combobox");
  expect(trigger.hasAttribute("disabled")).toBe(true);
  fireEvent.click(trigger);
  expect(view.queryByRole("dialog")).toBeNull();
  expect(changed).toBe(false);
  expect(trigger.textContent).toContain("Partner");
});

test("OptionSelect prázdná zakázaná hodnota zůstává odlišena od vyplněné", () => {
  const view = render(
    <OptionSelect
      value=""
      options={[]}
      searchable
      disabled
      placeholderValueLabel="Bez hodnoty"
      onChange={() => {}}
    />,
  );
  expect(view.getByText("Bez hodnoty").getAttribute("data-placeholder")).toBe("");
  expect(view.getByRole("combobox").hasAttribute("disabled")).toBe(true);
});

test("SegmentedField zakázaná vybraná volba zachová stav a nezmění hodnotu", () => {
  let changes = 0;
  const view = render(
    <SegmentedField
      ariaLabel="Volba"
      options={[
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]}
      value="a"
      disabled
      onChange={() => {
        changes += 1;
      }}
    />,
  );
  const selected = view.getByRole("radio", { name: "A" });
  expect(selected.getAttribute("aria-checked")).toBe("true");
  expect(selected.hasAttribute("disabled")).toBe(true);
  expect(selected.classList.contains("text-primary")).toBe(false);
  expect(selected.classList.contains("bg-primary/10")).toBe(false);
  expect(selected.classList.contains("disabled:bg-muted")).toBe(true);
  expect(selected.classList.contains("disabled:text-foreground")).toBe(true);
  fireEvent.click(selected);
  expect(changes).toBe(0);
});

test("SegmentedField povolená vybraná volba zachová primární vzhled a ovládání", () => {
  let chosen = "a";
  const view = render(
    <SegmentedField
      ariaLabel="Volba"
      options={[
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]}
      value="a"
      onChange={(value) => {
        chosen = value;
      }}
    />,
  );
  const selected = view.getByRole("radio", { name: "A" });
  expect(selected.classList.contains("text-primary")).toBe(true);
  expect(selected.classList.contains("bg-primary/10")).toBe(true);
  expect(selected.hasAttribute("disabled")).toBe(false);
  fireEvent.click(view.getByRole("radio", { name: "B" }));
  expect(chosen).toBe("b");
});
