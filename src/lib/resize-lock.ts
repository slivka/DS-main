export const RESIZE_END_EVENT = "app:resize-end";

let locks = 0;

export function isResizeLocked() {
  return typeof document !== "undefined" && document.documentElement.dataset["resizing"] === "true";
}

export function beginResize() {
  locks += 1;
  if (typeof document !== "undefined") document.documentElement.dataset["resizing"] = "true";
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    locks = Math.max(0, locks - 1);
    if (locks > 0 || typeof document === "undefined") return;
    delete document.documentElement.dataset["resizing"];
    window.dispatchEvent(new CustomEvent(RESIZE_END_EVENT));
  };
}