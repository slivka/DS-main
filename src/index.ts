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
export * from "./components/ui/button";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/checkbox";
export * from "./components/ui/badge";
export * from "./components/ui/card";
export * from "./components/ui/table";
export * from "./components/ui/dialog";
export * from "./components/ui/alert-dialog";
export * from "./components/ui/separator";
export * from "./components/ui/tabs";

export * from "./components/ds";
export * from "./lib/utils";
export * from "./lib/theme";
export * from "./lib/date-time-preferences";
export * from "./lib/excel-export";
export * from "./lib/font-scale";
export * from "./lib/font-links";
export * from "./lib/format";
