/** SplitButton · hlavní plocha a šipka mají oddělené funkce, jeden obrys skupiny a zakázaný stav. */
import { afterEach, describe, expect, it, mock } from "bun:test";

const { cleanup, fireEvent, render, screen } = await import("@testing-library/react");
const { SplitButton } = await import("../../src/components/ds/form/split-button");
const { DropdownMenuItem } = await import("../../src/components/ui/dropdown-menu");

afterEach(cleanup);

const setup = (props: { disabled?: boolean; disabledReason?: string } = {}) => {
  const main = mock(() => undefined);
  const pick = mock(() => undefined);
  render(
    <SplitButton
      label="Příjem"
      actionName="Příjem"
      onClick={main}
      menu={<DropdownMenuItem onSelect={pick}>Ze vzoru</DropdownMenuItem>}
      {...props}
    />,
  );
  return { main, pick };
};

describe("SplitButton", () => {
  it("hlavní plocha provede akci a nabídku neotevře", () => {
    const { main } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Příjem" }));
    expect(main).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: "Ze vzoru" })).toBeNull();
  });

  it("šipka „Další možnosti – akce“ otevře nabídku a hlavní akci nespustí", async () => {
    const { main, pick } = setup();
    const arrow = screen.getByRole("button", { name: "Další možnosti – Příjem" });
    fireEvent.keyDown(arrow, { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Ze vzoru" }));
    expect(pick).toHaveBeenCalledTimes(1);
    expect(main).not.toHaveBeenCalled();
  });

  it("obě části tvoří jednu pojmenovanou skupinu", () => {
    setup();
    const group = screen.getByRole("group", { name: "Příjem" });
    expect(group.querySelectorAll("button").length).toBe(2);
  });

  it("zakázané s důvodem: obě části zůstanou fokusovatelné a nic nespustí", () => {
    const { main } = setup({ disabled: true, disabledReason: "Období je uzavřené." });
    const button = screen.getByRole("button", { name: "Příjem" });
    const arrow = screen.getByRole("button", { name: "Další možnosti – Příjem" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(arrow.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(main).not.toHaveBeenCalled();
  });

  it("zakázané bez důvodu: obě části nativně zakázané", () => {
    setup({ disabled: true });
    expect(screen.getByRole("button", { name: "Příjem" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Další možnosti – Příjem" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});
