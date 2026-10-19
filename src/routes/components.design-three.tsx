import { createFileRoute } from "@tanstack/react-router";
import { DesignThreeShowcase } from "../components/showcase/DesignThreeShowcase";
import { ShowcaseLayout } from "../components/showcase/ShowcaseLayout";
export const Route = createFileRoute("/components/design-three")({
  head: () => ({
    meta: [
      { title: "Design 3 – Slivka Design System" },
      {
        name: "description",
        content: "Záložky panelu, akce dokladu, kalendář a stabilní identifikace dokladu.",
      },
      { property: "og:title", content: "Design 3 – Slivka Design System" },
      {
        property: "og:description",
        content: "Záložky panelu, akce dokladu, kalendář a stabilní identifikace dokladu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ShowcaseLayout>
      <DesignThreeShowcase />
    </ShowcaseLayout>
  ),
});
