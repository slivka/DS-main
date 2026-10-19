import { createFileRoute } from "@tanstack/react-router";
import { DocumentFormSecondaryShowcase } from "@/components/showcase/DocumentFormSecondaryShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-documents")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – další doklady – Slivka Design System" },
      {
        name: "description",
        content:
          "Hlavičky dokladů, ovládací prvky, živý pruh chyb, formulářový design a editor dokladu.",
      },
      {
        property: "og:title",
        content: "Účetní formuláře – další doklady – Slivka Design System",
      },
      {
        property: "og:description",
        content:
          "Hlavičky dokladů, ovládací prvky, živý pruh chyb, formulářový design a editor dokladu.",
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
      <DocumentFormSecondaryShowcase />
    </ShowcaseLayout>
  );
}
