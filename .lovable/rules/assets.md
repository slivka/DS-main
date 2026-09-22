---
description: "Brand assets shipped by the Design System design system (logos, icons, illustrations, photography, fonts, videos) with exact import paths. Read before adding any logo, icon, illustration, image, video, or font to the app: use these real assets instead of placeholders, stock photos, or generated images."
---

# Design System — Assets

These files are copied into `src/design-system/{slug}/assets/` in this project — never generate, placeholder, or substitute an asset that exists here.

Raw files import directly, e.g. `import logo from "@/design-system/{slug}/assets/logos/logo.svg"`.
The full machine-readable catalog lives in this library's `design-system.json` (`assets` array).

## Icons

- `@/design-system/{slug}/assets/icons/excel.svg` (svg)
- `@/design-system/{slug}/assets/icons/pdf.svg` (svg)

## Fonts

- `@/design-system/{slug}/assets/roboto-bold.ttf` (ttf)
- `@/design-system/{slug}/assets/roboto-regular.ttf` (ttf)

