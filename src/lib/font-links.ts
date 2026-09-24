/** Odkazy na firemní písma pro vložení do `head()` hostitelské aplikace. */
export const SLIVKA_FONT_LINKS = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Work+Sans:wght@400;500;600;700&display=swap",
  },
] as const;