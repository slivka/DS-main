import { createFileRoute } from "@tanstack/react-router";
import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { RecordPanelShowcase } from "@/components/showcase/RecordPanelShowcase";
import { RecordHistoryShowcase } from "@/components/showcase/RecordHistoryShowcase";
import { LinkedRecordsShowcase } from "@/components/showcase/LinkedRecordsShowcase";
export const Route = createFileRoute("/components/record-panel")({
  head: () => ({
    meta: [
      { title: "Panel záznamu – Slivka Design System" },
      {
        name: "description",
        content: "Panel záznamu s přílohami, poznámkami, historií a sledováním výběru dokladů.",
      },
      { property: "og:title", content: "Panel záznamu – Slivka Design System" },
      {
        property: "og:description",
        content: "Přílohy, poznámky, historie a indikátory ve sdíleném panelu záznamu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Panel záznamu" }]}>
      <RecordPanelShowcase />
      <RecordHistoryShowcase />
      <LinkedRecordsShowcase />
    </ShowcaseLayout>
  ),
});
