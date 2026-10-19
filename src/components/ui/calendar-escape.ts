/** Escape kalendáře · vlastní předání z portálu · nesmí zavřít nadřazený pohled. */

/** Vnitřní událost návratu kalendáře; není součástí veřejného API. */
export const calendarEscapeEvent = "calendar-view-escape";

/** Zachytí Escape portálu před Radix zavřením; dny ponechá běžnému zavření. */
export function handleCalendarEscape(event: KeyboardEvent): void {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;
  const shell = event.target.closest('[data-slot="calendar-shell"]');
  if (!shell || shell.getAttribute("data-view") === "days") return;
  event.preventDefault();
  shell.dispatchEvent(new Event(calendarEscapeEvent));
}
