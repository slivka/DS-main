/** IdentityLine · vlastní regresní kontrolu ústupu a krátkého stavu · neověřuje třídy. */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, renderHook, act } from "@testing-library/react";
import { IdentityLine } from "../../src/components/ds/layout/identity-line";
import { resolveIdentityLevel, useIdentityLayout } from "../../src/components/ds/layout/use-identity-layout";
import { DS_TEXTS_CS } from "../../src/ds-texts/cs";
import { DS_TEXTS_SK } from "../../src/ds-texts/sk";

afterEach(cleanup);

describe("IdentityLine", () => {
  const widths = { full: 400, minimum: 220, status: 160, short: 70 };
  it("zkracuje účet před přechodem na krátký stav a trojtečku", () => {
    expect(resolveIdentityLevel({ ...widths, available: 600 })).toBe(0);
    expect(resolveIdentityLevel({ ...widths, available: 420 })).toBe(1);
    expect(resolveIdentityLevel({ ...widths, available: 320 })).toBe(2);
    expect(resolveIdentityLevel({ ...widths, available: 260 })).toBe(3);
  });
  it("hystereze brání kmitání při návratu z krátkého stavu", () => {
    expect(resolveIdentityLevel({ ...widths, available: 390 }, 2)).toBe(2);
    expect(resolveIdentityLevel({ ...widths, available: 410 }, 2)).toBe(1);
  });
  it("bez krátkého tvaru zkracuje plný fallback", () => {
    const ui = render(<IdentityLine items={["Kniha", "2026"]} fallback="Koncept – číslo při zařazení" />);
    expect(ui.getByText("Koncept – číslo při zařazení")).toBeTruthy();
  });
  it("krátký stav zachovává plné znění v přístupném názvu", () => {
    const ui = render(<IdentityLine items={["Kniha", "2026"]} fallback="Koncept – číslo při zařazení" fallbackShort="Koncept" />);
    const status = ui.container.querySelector('[data-slot="identity-status-text"]');
    expect(status?.textContent).toBe("Koncept");
    expect(status?.getAttribute("aria-label")).toBe("Koncept – číslo při zařazení");
    expect(ui.container.querySelector("[data-stacked]")).toBeNull();
  });
  it("skutečné číslo má přednost před oběma texty konceptu", () => {
    const ui = render(<IdentityLine items={["Kniha"]} number="FV202600001" fallback="Číslo při zařazení" fallbackShort="Koncept" />);
    expect(ui.getByText("FV202600001")).toBeTruthy();
    expect(ui.queryByText("Koncept")).toBeNull();
  });
  it("CS i SK dodávají krátký stav Koncept", () => {
    expect(DS_TEXTS_CS.documentForm.fallbackShort).toBe("Koncept");
    expect(DS_TEXTS_SK.documentForm.fallbackShort).toBe("Koncept");
  });
});