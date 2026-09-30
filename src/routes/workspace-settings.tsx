import { createFileRoute } from "@tanstack/react-router";

import { WorkspaceSettingsShowcase } from "@/components/showcase/WorkspaceSettingsShowcase";

export const Route = createFileRoute("/workspace-settings")({
  head: () => ({
    meta: [
      { title: "Nastavení prostoru – Slivka Design System" },
      { name: "description", content: "Ukázka obrazovky nastavení prostoru mimo hlavní rám aplikace: přepínač prostoru, menu stránek a nebezpečná zóna." },
      { property: "og:title", content: "Nastavení prostoru – Slivka Design System" },
      { property: "og:description", content: "Přepínač prostoru, menu stránek, nebezpečná zóna a potvrzení opsáním názvu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkspaceSettingsShowcase,
});
