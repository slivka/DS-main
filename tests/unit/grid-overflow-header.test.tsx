import { describe, expect, it } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "bun:test";
import { ZoomGrid } from "../../src/components/ds/grid/grid-zoom";

afterEach(cleanup);

describe("ZoomGrid – záhlaví ve vlastním rolovacím kontejneru", () => {
  it("při přetečení vypne posun záhlaví podle panelu", () => {
    render(
      <ZoomGrid zoom={1} height="auto" stickyHeader="pane" overflowFallback>
        <span>Řádky</span>
      </ZoomGrid>,
    );
    const grid = screen.getByText("Řádky").closest(".zoom-grid");
    expect(grid?.getAttribute("data-overflow")).toBe("true");
    expect(grid?.getAttribute("data-sticky-header")).toBe("none");
  });

  it("bez přetečení zachová přilnutí k panelu", () => {
    render(
      <ZoomGrid zoom={1} height="auto" stickyHeader="pane">
        <span>Řádky</span>
      </ZoomGrid>,
    );
    expect(screen.getByText("Řádky").closest(".zoom-grid")?.getAttribute("data-sticky-header"))
      .toBe("pane");
  });

  it("zachová přilnutí k horní hraně vlastního gridu", () => {
    render(
      <ZoomGrid zoom={1} height="fill" overflowFallback>
        <span>Řádky</span>
      </ZoomGrid>,
    );
    expect(screen.getByText("Řádky").closest(".zoom-grid")?.getAttribute("data-sticky-header"))
      .toBe("grid");
  });
});