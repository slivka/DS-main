import { createFileRoute } from "@tanstack/react-router";
import { ReportsShowcase } from "@/components/showcase/ReportsShowcase";
import { AccountingFieldsDemo } from "@/components/showcase/AccountingFieldsDemo";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-fields")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – pole a sestavy – Slivka Design System" },
      {
        name: "description",
        content: "Výběr partnera, knihy a zakázky, částka v měně a účetní sestavy.",
      },
      { property: "og:title", content: "Účetní formuláře – pole a sestavy – Slivka Design System" },
      {
        property: "og:description",
        content: "Výběr partnera, knihy a zakázky, částka v měně a účetní sestavy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingFieldsPage,
});

function AccountingFieldsPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Pole a sestavy" },
      ]}
    >
      <AccountingFormsNav />
      <AccountingFieldsDemo />
      <ReportsShowcase />
    </ShowcaseLayout>
  );
}
