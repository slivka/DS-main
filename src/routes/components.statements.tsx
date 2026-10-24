import { createFileRoute } from "@tanstack/react-router";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";
import { StatementsShowcase } from "@/components/showcase/StatementsShowcase";
export const Route = createFileRoute("/components/statements")({
  head: () => ({
    meta: [
      { title: "Výkazy – Slivka Design System" },
      { name: "description", content: "Rozvaha, výsledovka, uložené výkazy a šablony výkazů." },
      { property: "og:title", content: "Výkazy – Slivka Design System" },
      {
        property: "og:description",
        content: "Ukázky rozvahy, výsledovky, uložených výkazů a šablon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Výkazy" }]}>
      <AccountingFormsNav />
      <StatementsShowcase />
    </ShowcaseLayout>
  ),
});
