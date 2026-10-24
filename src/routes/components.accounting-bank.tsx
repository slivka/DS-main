import { createFileRoute } from "@tanstack/react-router";
import { BankStatementShowcase } from "@/components/showcase/BankStatementShowcase";
import { BankReconcileShowcase } from "@/components/showcase/BankReconcileShowcase";
import { BankVatShowcase } from "@/components/showcase/BankVatShowcase";
import { FormDesignTwoShowcase } from "@/components/showcase/FormDesignTwoShowcase";
import { DocumentDatesShowcase } from "@/components/showcase/DocumentDatesShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { AccountingFormsNav } from "@/components/showcase/AccountingFormsNav";

export const Route = createFileRoute("/components/accounting-bank")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – bankovní výpis – Slivka Design System" },
      {
        name: "description",
        content:
          "Bankovní výpis, pohyb výpisu, DPH v bankovním pohybu, data dokladu a srovnávací formuláře.",
      },
      { property: "og:title", content: "Účetní formuláře – bankovní výpis – Slivka Design System" },
      {
        property: "og:description",
        content:
          "Bankovní výpis, pohyb výpisu, DPH v bankovním pohybu, data dokladu a srovnávací formuláře.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingBankPage,
});

function AccountingBankPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Komponenty", to: "/" },
        { label: "Účetní formuláře" },
        { label: "Bankovní výpis a pohyb" },
      ]}
    >
      <AccountingFormsNav />
      <BankReconcileShowcase />
      <BankStatementShowcase />
      <BankVatShowcase />
      <FormDesignTwoShowcase />
      <DocumentDatesShowcase />
    </ShowcaseLayout>
  );
}
