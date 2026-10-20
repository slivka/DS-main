import { createFileRoute } from "@tanstack/react-router";
import { VatGroupsShowcase } from "@/components/showcase/VatGroupsShowcase";
import { Dph5Showcase } from "@/components/showcase/Dph5Showcase";
import { VatJournalShowcase } from "@/components/showcase/VatJournalShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-lines")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – řádky dokladu a DPH – Slivka Design System" },
      {
        name: "description",
        content:
          "Editor řádků dokladu, skupiny DPH, rekapitulace a zaúčtovaný doklad jen ke čtení.",
      },
      {
        property: "og:title",
        content: "Účetní formuláře – řádky dokladu a DPH – Slivka Design System",
      },
      {
        property: "og:description",
        content:
          "Editor řádků dokladu, skupiny DPH, rekapitulace a zaúčtovaný doklad jen ke čtení.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingLinesPage,
});

function AccountingLinesPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Řádky dokladu a DPH" },
      ]}
    >
      <AccountingFormsNav />
      <Dph5Showcase />
      <VatGroupsShowcase />
      <VatJournalShowcase />
    </ShowcaseLayout>
  );
}
