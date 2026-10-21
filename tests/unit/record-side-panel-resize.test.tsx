/** Táhlo šířky panelu záznamu: průběh v onSizeChange, jediný commit po gestu. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { PanelResize } from "../../src/components/ds/layout/record-side-panel/panel-resize";

afterEach(cleanup);
function mountBar() {
  const change = mock();
  const commit = mock();
  const ui = render(
    <PanelResize
      host={{ current: null }}
      size={400}
      defaultSize={384}
      min={320}
      max={900}
      onSizeChange={change}
      onSizeCommit={commit}
    />,
  );
  return { bar: ui.getByRole("separator"), change, commit };
}

describe("táhlo šířky panelu", () => {
  it("během tažení jen change, puštění právě jednou commit poslední omezené šířky", () => {
    const change = mock();
    const commit = mock();
    const ui = render(
      <PanelResize
        host={{ current: null }}
        size={400}
        defaultSize={384}
        min={320}
        max={900}
        onSizeChange={change}
        onSizeCommit={commit}
      />,
    );
    const bar = ui.getByRole("separator");
    fireEvent.pointerDown(bar, { clientX: 800, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 700, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 0, pointerId: 1 });
    expect(commit).not.toHaveBeenCalled();
    expect(change).toHaveBeenLastCalledWith(900);
    fireEvent.pointerUp(bar, { pointerId: 1 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(900);
  });
  it("klávesa i dvojklik jeden commit, nesouvisející klávesa žádný", () => {
    const change = mock();
    const commit = mock();
    const ui = render(
      <PanelResize
        host={{ current: null }}
        size={400}
        defaultSize={384}
        min={320}
        max={900}
        onSizeChange={change}
        onSizeCommit={commit}
      />,
    );
    const bar = ui.getByRole("separator");
    fireEvent.keyDown(bar, { key: "ArrowLeft" });
    fireEvent.keyUp(bar, { key: "ArrowLeft" });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenLastCalledWith(416);
    fireEvent.keyDown(bar, { key: "a" });
    fireEvent.keyUp(bar, { key: "a" });
    expect(commit).toHaveBeenCalledTimes(1);
    fireEvent.doubleClick(bar);
    expect(commit).toHaveBeenCalledTimes(2);
    expect(commit).toHaveBeenLastCalledWith(384);
  });
});

describe("táhlo šířky panelu – jen skutečná změna", () => {
  it("skutečný dvojklik (pointerdown/up ×2 + dblclick) commitne jednou", () => {
    const { bar, commit } = mountBar();
    for (let n = 0; n < 2; n += 1) {
      fireEvent.pointerDown(bar, { clientX: 500, pointerId: 1 });
      fireEvent.pointerUp(bar, { clientX: 500, pointerId: 1 });
    }
    fireEvent.doubleClick(bar);
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(384);
  });
  it("klik bez pohybu ani dvojklik na výchozí šířce nic neuloží", () => {
    const change = mock();
    const commit = mock();
    const ui = render(
      <PanelResize
        host={{ current: null }}
        size={384}
        defaultSize={384}
        min={320}
        max={900}
        onSizeChange={change}
        onSizeCommit={commit}
      />,
    );
    const bar = ui.getByRole("separator");
    fireEvent.pointerDown(bar, { clientX: 500, pointerId: 1 });
    fireEvent.pointerUp(bar, { clientX: 500, pointerId: 1 });
    fireEvent.doubleClick(bar);
    expect(commit).not.toHaveBeenCalled();
  });
  it("pointercancel po tažení commitne poslední šířku", () => {
    const { bar, commit } = mountBar();
    fireEvent.pointerDown(bar, { clientX: 800, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 700, pointerId: 1 });
    fireEvent.pointerCancel(bar, { pointerId: 1 });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(500);
  });
  it("držená šipka commitne až při puštění klávesy", () => {
    const { bar, change, commit } = mountBar();
    fireEvent.keyDown(bar, { key: "ArrowLeft" });
    fireEvent.keyDown(bar, { key: "ArrowLeft", repeat: true });
    expect(change).toHaveBeenLastCalledWith(432);
    expect(commit).not.toHaveBeenCalled();
    fireEvent.keyUp(bar, { key: "ArrowLeft" });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(432);
  });
});
