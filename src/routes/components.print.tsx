import { createFileRoute } from "@tanstack/react-router";
import { PrintShowcase } from "@/components/showcase/PrintShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";

export const Route = createFileRoute("/components/print")({
  head: () => ({ meta: [
    { title: "Tisk a PDF – Slivka Design System" },
    { name: "description", content: "Firemní PDF sestavy, tiskový náhled a pokladní doklady." },
    { property: "og:title", content: "Tisk a PDF – Slivka Design System" },
    { property: "og:description", content: "Firemní PDF sestavy, tiskový náhled a pokladní doklady." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Tisk" }]}><PrintShowcase /></ShowcaseLayout>,
});