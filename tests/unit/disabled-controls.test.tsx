/** Zakázaná pole · vlastní interakce a prázdné hodnoty · nesmí číst zdrojový text. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { PartnerSelect } from "../../src/components/ds/accounting/partner-select";
import { OptionSelect } from "../../src/components/ds/form/option-select";

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
