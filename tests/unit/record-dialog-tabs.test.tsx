import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { RecordDialog } from "../../src/components/ds/layout/RecordDialog";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));
const { cleanup, fireEvent, render } = await import("@testing-library/react");
afterEach(cleanup);
const tabs = [
  { value: "main", label: "Údaje", content: <input aria-label="Název" /> },
  { value: "accounts", label: "Účty", content: <input aria-label="Účet" /> },
];
const noop = () => {};

describe("RecordDialog – řízené záložky", () => {
  it("otevře zvolenou záložku, požádá o změnu a čeká na aplikaci", () => {
    const change = mock((_value: string) => {});
    const view = render(
      <RecordDialog open size="md" title="Partner" onOpenChange={noop}
        tabs={tabs} activeTab="accounts" onTabChange={change} />,
    );
    expect(view.getByRole("textbox", { name: "Účet" })).toBeTruthy();
    fireEvent.mouseDown(view.getByRole("tab", { name: "Údaje" }), { button: 0, ctrlKey: false });
    expect(change).toHaveBeenCalledWith("main");
    expect(view.getByRole("textbox", { name: "Účet" })).toBeTruthy();
    view.rerender(
      <RecordDialog open size="md" title="Partner" onOpenChange={noop}
        tabs={tabs} activeTab="main" onTabChange={change} error="Chyba názvu" />,
    );
    expect(view.getByRole("textbox", { name: "Název" })).toBeTruthy();
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("bez activeTab zachová vlastní výběr a oznámí změnu", () => {
    const change = mock((_value: string) => {});
    const view = render(
      <RecordDialog open size="md" title="Partner" onOpenChange={noop}
        tabs={tabs} onTabChange={change} />,
    );
    fireEvent.mouseDown(view.getByRole("tab", { name: "Účty" }), { button: 0, ctrlKey: false });
    expect(view.getByRole("textbox", { name: "Účet" })).toBeTruthy();
    expect(change).toHaveBeenCalledWith("accounts");
  });
});