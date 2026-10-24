import { createFileRoute } from "@tanstack/react-router";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";
import { VatReportsShowcase } from "@/components/showcase/VatReportsShowcase";
export const Route = createFileRoute("/components/vat-reports")({
  head: () => ({
    meta: [
      { title: "Přehledy DPH a OSS – Slivka Design System" },
      { name: "description", content: "Přiznání DPH, kontrolní a souhrnné hlášení, OSS a podání." },
      { property: "og:title", content: "Přehledy DPH a OSS – Slivka Design System" },
      { property: "og:description", content: "Ukázky přiznání, kontrol, hlášení a podání DPH." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "DPH a OSS" }]}>
      <AccountingFormsNav />
      <VatReportsShowcase />
    </ShowcaseLayout>
  ),
});
