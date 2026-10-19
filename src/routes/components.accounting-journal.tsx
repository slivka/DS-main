import { createFileRoute } from "@tanstack/react-router";
import { JournalExamplesShowcase } from "@/components/showcase/JournalExamplesShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-journal")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – řádky zápisu – Slivka Design System" },
      {
        name: "description",
        content:
          "Řádky zápisu v Kč i cizí měně, interní, pokladní, zaúčtovaný doklad a validace buněk.",
      },
      {
        property: "og:title",
        content: "Účetní formuláře – řádky zápisu – Slivka Design System",
      },
      {
        property: "og:description",
        content:
          "Řádky zápisu v Kč i cizí měně, interní, pokladní, zaúčtovaný doklad a validace buněk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingJournalPage,
});

function AccountingJournalPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Řádky zápisu" },
      ]}
    >
      <AccountingFormsNav />
      <JournalExamplesShowcase />
    </ShowcaseLayout>
  );
}
