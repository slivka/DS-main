/** Úložiště unit testů patří happy-dom, ne běhovému prostředí Bun. */
import { afterEach, expect, it } from "bun:test";

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

it("localStorage je úložiště window a podporuje clear", () => {
  expect(globalThis.localStorage).toBe(window.localStorage);
  localStorage.setItem("storage-regression", "value");
  expect(window.localStorage.getItem("storage-regression")).toBe("value");
  localStorage.clear();
  expect(localStorage.getItem("storage-regression")).toBeNull();
});

it("sessionStorage je úložiště window a podporuje clear", () => {
  expect(globalThis.sessionStorage).toBe(window.sessionStorage);
  sessionStorage.setItem("storage-regression", "value");
  expect(window.sessionStorage.getItem("storage-regression")).toBe("value");
  sessionStorage.clear();
  expect(sessionStorage.getItem("storage-regression")).toBeNull();
});
