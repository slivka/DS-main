import { createFileRoute } from "@tanstack/react-router";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";
import { AdvancesShowcase } from "@/components/showcase/AdvancesShowcase";

export const Route = createFileRoute("/components/accounting-advances")({
  head: () => ({
    meta: [
      { title: "Zálohy – Slivka Design System" },
      {
        name: "description",
        content:
          "Rozpad platby zálohy, přiřazení, odečty faktur, evidence a opravné daňové doklady.",
      },
      {
        property: "og:title",
        content: "Zálohy – Slivka Design System",
      },
      {
        property: "og:description",
        content:
          "Rozpad platby zálohy, přiřazení, odečty faktur, evidence a opravné daňové doklady.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingAdvancesPage,
});

function AccountingAdvancesPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Zálohy" },
      ]}
    >
      <AccountingFormsNav />
      <AdvancesShowcase />
    </ShowcaseLayout>
  );
}
