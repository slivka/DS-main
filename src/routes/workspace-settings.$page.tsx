import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace-settings/$page")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.page} – Nastavení prostoru – Slivka Design System` },
      { name: "description", content: `Ukázka nastavení ${params.page} v Slivka Design System.` },
      { property: "og:title", content: `${params.page} – Nastavení prostoru – Slivka Design System` },
      { property: "og:description", content: `Nastavení ${params.page} ve sdíleném prostoru.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
