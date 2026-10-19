import { createFileRoute } from "@tanstack/react-router";
import { DocumentFormShowcase } from "@/components/showcase/DocumentFormShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-forms")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – editor dokladů – Slivka Design System" },
      {
        name: "description",
        content:
          "Hlavičky dokladů, ovládací prvky, živý pruh chyb, formulářový design a editor dokladu.",
      },
      {
        property: "og:title",
        content: "Účetní formuláře – editor dokladů – Slivka Design System",
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
  component: AccountingFormsPage,
});

function AccountingFormsPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Editor dokladů" },
      ]}
    >
      <AccountingFormsNav />
      <DocumentFormShowcase />
    </ShowcaseLayout>
  );
}
