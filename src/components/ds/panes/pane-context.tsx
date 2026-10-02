/**
 * Veřejný vstup kontextu panelových záložek.
 * Vlastní: stabilní re-export veřejného API z rozdělených modulů.
 * Nesmí: obsahovat implementaci poskytovatele ani přechodů stavu.
 */
export * from "./pane-context-types";
export * from "./pane-context-hooks";
export * from "./pane-context-provider";
export * from "./pane-context-chrome";
