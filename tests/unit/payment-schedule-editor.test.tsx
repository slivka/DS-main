/** Kalendář: sdílený zoom a uložení od APP v liště. */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PaymentScheduleEditor } from "../../src/components/ds/accounting/payment-schedule-editor";
import { GridZoomContext, gridFontSize } from "../../src/components/ds/grid/grid-zoom";
afterEach(cleanup);
describe("PaymentScheduleEditor", () => {
  it("převezme změnu okolního zoomu a vlastní zoom má přednost", () => {
    const editor = <PaymentScheduleEditor items={[]} onChange={() => {}} totalToPay={100} />;
    const view = render(
      <GridZoomContext.Provider value={{ zoom: 1, setZoom: () => {}, density: "normal" }}>
        {editor}
      </GridZoomContext.Provider>,
    );
    const toolbar = view.container.querySelector<HTMLElement>('[data-slot="grid-toolbar"]');
    expect(toolbar?.style.fontSize).toBe(gridFontSize(1));
    view.rerender(
      <GridZoomContext.Provider value={{ zoom: 0.7, setZoom: () => {}, density: "normal" }}>
        {editor}
      </GridZoomContext.Provider>,
    );
    expect(toolbar?.style.fontSize).toBe(gridFontSize(0.7));
    view.rerender(
      <GridZoomContext.Provider value={{ zoom: 0.7, setZoom: () => {}, density: "normal" }}>
        <PaymentScheduleEditor items={[]} onChange={() => {}} totalToPay={100} zoom={1.2} />
      </GridZoomContext.Provider>,
    );
    expect(Number.parseFloat(toolbar?.style.fontSize ?? "")).toBe(Number.parseFloat(gridFontSize(1.2)));
  });
  it("uložení je v liště, volá APP a disabled/busy brání dalšímu uložení", () => {
    let saved = 0;
    const props = { items: [], onChange: () => {}, totalToPay: 100 };
    const view = render(
      <PaymentScheduleEditor
        {...props}
        saveAction={{
          label: "Uložit kalendář",
          onSave: () => {
            saved++;
          },
        }}
      />,
    );
    const button = screen.getByRole("button", { name: "Uložit kalendář" });
    expect(button.closest('[data-slot="grid-toolbar"]')).not.toBeNull();
    fireEvent.click(button);
    expect(saved).toBe(1);
    view.rerender(
      <PaymentScheduleEditor
        {...props}
        saveAction={{
          label: "Uložit kalendář",
          disabled: true,
          onSave: () => {
            saved++;
          },
        }}
      />,
    );
    fireEvent.click(button);
    expect(saved).toBe(1);
    view.rerender(
      <PaymentScheduleEditor
        {...props}
        saveAction={{
          label: "Uložit kalendář",
          busy: true,
          onSave: () => {
            saved++;
          },
        }}
      />,
    );
    fireEvent.click(button);
    expect(saved).toBe(1);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });
  it("standardní Přidat předává nové řádky původním onChange", () => {
    let amounts: number[] = [];
    render(
      <PaymentScheduleEditor
        items={[]}
        onChange={(items) => {
          amounts = items.map((item) => item.amount);
        }}
        totalToPay={100}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Přidat (N)" }));
    expect(amounts).toEqual([100]);
  });
});
