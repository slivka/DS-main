/** useAutoGridZoom · změna zoomu gridu nespustí přepočet, který by zrušil ruční zoom. */
import { afterEach, expect, mock, test } from "bun:test";
import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { useAutoGridZoom } from "../../src/components/ds/grid/grid-auto-zoom";

afterEach(cleanup);

function Host({ zoom, onAuto }: { zoom: number; onAuto: (z: number, reset: boolean) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useAutoGridZoom(ref, true, 800, onAuto, zoom);
  return <div ref={ref} />;
}

test("ruční zoom (+ / −) nevyvolá automatický přepočet s resetem", () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 600,
  });
  try {
    const onAuto = mock();
    const view = render(<Host zoom={1} onAuto={onAuto} />);
    expect(onAuto).toHaveBeenCalledTimes(1);
    expect(onAuto.mock.calls[0]?.[1]).toBe(false);
    view.rerender(<Host zoom={1.1} onAuto={onAuto} />);
    view.rerender(<Host zoom={1.2} onAuto={onAuto} />);
    expect(onAuto).toHaveBeenCalledTimes(1);
  } finally {
    if (original) Object.defineProperty(HTMLElement.prototype, "clientWidth", original);
  }
});
