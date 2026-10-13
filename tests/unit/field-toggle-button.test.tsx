/** Přepínače polí · vlastní interakční testy · nesmí číst zdrojové soubory. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ContactRound } from "lucide-react";
import { FieldToggleButton } from "../../src/components/ds/form/field-toggle-button";
import { CounterpartyInputField } from "../../src/components/ds/accounting/counterparty-input-field";
import { SuggestInput } from "../../src/components/ds/form/suggest-input";
import { DateField } from "../../src/components/ds/form/date-field";
import { DsTextsProvider } from "../../src/ds-texts";

afterEach(cleanup);
test("FieldToggleButton přepíná s neměnným názvem a předává ref", () => {
  let next = false;
  let node: HTMLButtonElement | null = null;
  const view = render(
    <FieldToggleButton
      icon={ContactRound}
      pressed
      label="Adresář"
      ref={(ref) => {
        node = ref;
      }}
      onPressedChange={(value) => {
        next = value;
      }}
      pressedTooltip="Zapnuto"
      unpressedTooltip="Vypnuto"
    />,
  );
  const button = view.getByRole("button", { name: "Adresář" });
  expect(node).toBe(button);
  expect(button.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(button);
  expect(next).toBe(false);
});
test.each(["Záznam je uzamčen", undefined])(
  "FieldToggleButton zamčení %s nevolá změnu a zachová fokus",
  (reason) => {
    let changes = 0;
    const view = render(
      <FieldToggleButton
        icon={ContactRound}
        pressed
        label="Adresář"
        lockedReason={reason}
        disabled={!reason}
        onPressedChange={() => {
          changes += 1;
        }}
        pressedTooltip="Zapnuto"
        unpressedTooltip="Vypnuto"
      />,
    );
    const button = view.getByRole("button", { name: "Adresář" });
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(changes).toBe(0);
    if (reason)
      expect(
        document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent,
      ).toBe(reason);
  },
);
test("CounterpartyInputField partner je pressed a ruční režim nemá tužku", () => {
  const base = {
    partners: [{ id: "p", name: "Partner" }],
    partnerId: "p",
    name: "Ruční",
    onPartnerChange: () => {},
    onNameChange: () => {},
    onEditPartner: () => {},
    partnerModeLabel: "Adresář",
    manualModeLabel: "Ručně",
    replaceManualWarning: "Nahradit?",
  };
  const view = render(<CounterpartyInputField {...base} mode="partner" />);
  expect(view.getByRole("button", { name: "Vybrat z adresáře" }).getAttribute("aria-pressed")).toBe(
    "true",
  );
  expect(view.getByRole("button", { name: "Upravit vybraný záznam" })).toBeTruthy();
  view.rerender(<CounterpartyInputField {...base} mode="manual" />);
  expect(view.getByRole("button", { name: "Vybrat z adresáře" }).getAttribute("aria-pressed")).toBe(
    "false",
  );
  expect(view.queryByRole("button", { name: "Upravit vybraný záznam" })).toBeNull();
});
test("SuggestInput používá slovenský stálý název a nemění hodnotu přepnutím", () => {
  let enabled = false;
  let value = "Popis";
  const view = render(
    <DsTextsProvider locale="sk">
      <SuggestInput
        value={value}
        enabled
        onEnabledChange={(next) => {
          enabled = next;
        }}
        onChange={(next) => {
          value = next;
        }}
        loadSuggestions={async () => []}
      />
    </DsTextsProvider>,
  );
  fireEvent.click(view.getByRole("button", { name: "Našepkávač z predchádzajúcich dokladov" }));
  expect(enabled).toBe(false);
  expect(value).toBe("Popis");
});
test("DateField zamčená vazba má stálý název a nemění stav", () => {
  let changes = 0;
  const view = render(
    <DateField
      value="2026-10-12"
      onChange={() => {}}
      link={{
        locked: true,
        lockedReason: "Zařazený doklad",
        onToggle: () => {
          changes += 1;
        },
      }}
    />,
  );
  const button = view.getByRole("button", { name: "Svázat s datem vystavení" });
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(button);
  expect(changes).toBe(0);
});
