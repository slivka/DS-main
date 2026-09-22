import "./styles.css";

/**
 * Slivka Design System – veřejný barrel knihovny.
 * Komponenty se skládají výhradně z exportů design systému (src/components/ds).
 * Motiv (barvy, typografie, rozestupy) se přebírá importem `src/styles.css`,
 * který tento vstup importuje automaticky.
 */

/* Runtime obálky, které musí hostitelská aplikace nastavit (notifikace, nápovědné bubliny). */
export { Toaster } from "./components/ui/sonner";
export { TooltipProvider } from "./components/ui/tooltip";

export * from "./components/ds";
export * from "./lib/utils";
export * from "./lib/theme";
export * from "./lib/date-time-preferences";
export * from "./lib/excel-export";
