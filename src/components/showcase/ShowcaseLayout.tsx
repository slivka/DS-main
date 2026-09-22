import { useState, type ReactNode } from "react";
import { BookOpen, LayoutGrid, MessageSquare, Palette, TextCursorInput } from "lucide-react";

import {
  AppShell,
  CommandPalette,
  WorkspaceCompanySwitcher,
  type Crumb,
  type NavItem,
} from "../ds";
import { MOCK_COMPANIES, MOCK_WORKSPACES } from "../../lib/mock/accounting";

const NAV: NavItem[] = [
  { to: "/", label: "Přehled", icon: Palette, section: "Design systém" },
  { to: "/guidelines", label: "Pravidla", icon: BookOpen, section: "Design systém" },
  { to: "/components/grid", label: "Datová mřížka", icon: LayoutGrid, section: "Komponenty" },
  { to: "/components/forms", label: "Formuláře", icon: TextCursorInput, section: "Komponenty" },
  { to: "/components/feedback", label: "Zpětná vazba", icon: MessageSquare, section: "Komponenty" },
];

const TARGETS = NAV.map((n) => ({ label: n.label, group: n.section ?? "Stránky", to: n.to }));

/** Rám ukázkových stránek design systému. */
export function ShowcaseLayout({
  children,
  breadcrumbs,
}: {
  children: ReactNode;
  breadcrumbs?: Crumb[];
}) {
  const [workspaceId, setWorkspaceId] = useState(MOCK_WORKSPACES[0].id);
  const [companyId, setCompanyId] = useState(MOCK_COMPANIES[0].id);

  return (
    <AppShell
      appName="Slivka Design System"
      items={NAV}
      breadcrumbs={breadcrumbs}
      topBarLeft={
        <WorkspaceCompanySwitcher
          workspaces={MOCK_WORKSPACES}
          companies={MOCK_COMPANIES}
          workspaceId={workspaceId}
          companyId={companyId}
          onWorkspaceChange={(id) => {
            setWorkspaceId(id);
            const first = MOCK_COMPANIES.find((c) => c.workspaceId === id);
            if (first) setCompanyId(first.id);
          }}
          onCompanyChange={setCompanyId}
        />
      }
    >
      <CommandPalette targets={TARGETS} />
      {children}
    </AppShell>
  );
}

/** Nadpis sekce ukázkové stránky. */
export function ShowcaseSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mb-3 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
