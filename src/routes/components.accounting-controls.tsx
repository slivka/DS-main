import { createFileRoute } from "@tanstack/react-router";
import { DocumentControlsShowcase } from "@/components/showcase/DocumentControlsShowcase";
import { LiveIssuesShowcase } from "@/components/showcase/LiveIssuesShowcase";
import { FormDesignShowcase } from "@/components/showcase/FormDesignShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-controls")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – ovládací prvky – Slivka Design System" },
      {
        name: "description",
        content:
          "Hlavičky dokladů, ovládací prvky, živý pruh chyb, formulářový design a editor dokladu.",
      },
      {
        property: "og:title",
        content: "Účetní formuláře – ovládací prvky – Slivka Design System",
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
  component: AccountingControlsPage,
});

function AccountingControlsPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Ovládací prvky a hlavičky" },
      ]}
    >
      <AccountingFormsNav />
      <DocumentControlsShowcase />
      <LiveIssuesShowcase />
      <FormDesignShowcase />
    </ShowcaseLayout>
  );
}
