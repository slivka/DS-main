import { createFileRoute } from "@tanstack/react-router";

import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import { MatchingShowcase } from "@/components/showcase/MatchingShowcase";

const TITLE = "Saldokonto a párování – Slivka Design System";
const DESCRIPTION =
  "Otevřené položky seskupené po partnerech, věková struktura a párování protipoložek s úpravou částek.";

export const Route = createFileRoute("/components/matching")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchingPage,
});

function MatchingPage() {
  return (
    <ShowcaseLayout
      breadcrumbs={[
        { label: "Účetní formuláře", to: "/components/accounting-forms" },
        { label: "Párování" },
      ]}
    >
      <MatchingShowcase />
    </ShowcaseLayout>
  );
}
