import { createFileRoute } from "@tanstack/react-router";
import { DocumentFormSecondaryShowcase } from "@/components/showcase/DocumentFormSecondaryShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";
import { TemplatesShowcase } from "@/components/showcase/TemplatesShowcase";

export const Route = createFileRoute("/components/accounting-documents")({
  head: () => ({
    meta: [
      { title: "Zálohy a další doklady – Slivka Design System" },
      {
        name: "description",
        content:
          "Rozpad platby zálohy, přiřazení, odečty faktur, evidence a opravné daňové doklady.",
      },
      {
        property: "og:title",
        content: "Zálohy a další doklady – Slivka Design System",
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
  component: AccountingDocumentsPage,
});

function AccountingDocumentsPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Další doklady" },
      ]}
    >
      <AccountingFormsNav />
      <AdvancesShowcase />
      <TemplatesShowcase />
      <DocumentFormSecondaryShowcase />
    </ShowcaseLayout>
  );
}
