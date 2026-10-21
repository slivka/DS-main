import { createFileRoute } from "@tanstack/react-router";
import { FileImportShowcase } from "@/components/showcase/FileImportShowcase";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
export const Route = createFileRoute("/components/file-import")({
  head: () => ({
    meta: [
      { title: "Import souborů – Slivka Design System" },
      {
        name: "description",
        content:
          "Výběr a přetažení souborů, kontroly a seskupený výběr bankovních výpisů na fiktivních datech.",
      },
      { property: "og:title", content: "Import souborů – Slivka Design System" },
      {
        property: "og:description",
        content: "Sdílené importní prvky Slivka: soubory, kontroly a výběr výpisů.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FileImportPage,
});
function FileImportPage() {
  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Import souborů" }]}>
      <FileImportShowcase />
    </ShowcaseLayout>
  );
}
