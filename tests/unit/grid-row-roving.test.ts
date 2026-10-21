/** Roving tabIndex gridu ve virtualizaci. */
import { expect, it } from "bun:test";
import { rovingTabKey } from "../../src/components/ds/grid/grid-row-roving";

it("aktuální řádek ve vykresleném okně drží tabIndex 0", () => {
  expect(rovingTabKey("b", ["a", "b", "c"])).toBe("b");
});
it("aktuální řádek mimo okno: tabIndex 0 dostane první viditelný řádek", () => {
  expect(rovingTabKey("x", ["k", "l"])).toBe("k");
});
it("prázdné okno nemá řádek s tabIndex 0", () => {
  expect(rovingTabKey("x", [])).toBeNull();
});
