import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, describe, expect, it } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { NoticeBar } = await import("../../src/components/ds/feedback/notice-bar");
const { Button } = await import("../../src/components/ui/button");

afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

describe("NoticeBar 2.60.0 – interakce", () => {
  it("klikne na vloženou akci a zavření", () => {
    let actionClicks = 0;
    let closeClicks = 0;
    const { getByRole } = render(
      <NoticeBar
        tone="info"
        title="Přeplatek"
        actions={
          <Button
            type="button"
            onClick={() => {
              actionClicks += 1;
            }}
          >
            Použít VS
          </Button>
        }
        onClose={() => {
          closeClicks += 1;
        }}
      >
        Partner má otevřený přeplatek.
      </NoticeBar>,
    );

    fireEvent.click(getByRole("button", { name: "Použít VS" }));
    fireEvent.click(getByRole("button", { name: "Zavřít upozornění" }));
    expect(actionClicks).toBe(1);
    expect(closeClicks).toBe(1);
  });
});
