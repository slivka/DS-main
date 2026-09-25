import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, FileSpreadsheet, Landmark, LayoutGrid, MessageSquare, Palette, Receipt, Route as RouteIcon, Settings2, ShieldCheck, SlidersHorizontal, TextCursorInput, UserRound } from "lucide-react";

import {
  AppShell,
  CompanySwitcher,
  CommandPalette,
  PeriodSwitcher,
  NotificationBell,
  SearchButton,
  ThemeToggleButton,
  UserMenu,
  type Crumb,
  type NavGroup,
} from "../ds";
import { MOCK_COMPANIES, MOCK_PERIODS, MOCK_WORKSPACES } from "../../lib/mock/accounting";
import { applyTheme } from "../../lib/theme";

const NAV_GROUPS: NavGroup[] = [
  {
    id: "design-system",
    label: "Design systém",
    items: [
      { to: "/", label: "Přehled", icon: Palette },
      { to: "/guidelines", label: "Pravidla", icon: BookOpen },
    ],
  },
  {
    id: "components",
    label: "Komponenty",
    section: "Knihovna",
    items: [
      { to: "/components/grid", label: "Datová mřížka", icon: LayoutGrid },
      { to: "/components/excel-export", label: "Export do Excelu", icon: FileSpreadsheet },
      { to: "/components/forms", label: "Formuláře", icon: TextCursorInput },
      { to: "/components/feedback", label: "Zpětná vazba", icon: MessageSquare },
      { to: "/components/accounting-forms", label: "Účetní formuláře", icon: Receipt },
      { to: "/components/navigation", label: "Navigace", icon: RouteIcon },
    ],
  },
  {
    id: "accounting",
    label: "Účetnictví",
    section: "Ukázky aplikace",
    items: [
      { to: "/components/accounting-forms", label: "Účetní doklady", icon: Landmark, badge: "3" },
      { to: "/components/grid", label: "Účetní deník", icon: LayoutGrid },
    ],
  },
  {
    id: "planned",
    label: "Další moduly",
    section: "Ukázky aplikace",
    defaultCollapsed: true,
    items: [
      { to: "/components/navigation", label: "Majetek", icon: Settings2, disabled: true },
    ],
  },
];

const TARGETS = NAV_GROUPS.flatMap((group) => group.items.map((item) => ({ label: item.label, group: group.label, to: item.to })));

const COMPANY_PANEL = [{
  id: "company-settings",
  label: "Nastavení firmy",
  section: "Firma",
  items: [
    { to: "/components/navigation", label: "Základní údaje", icon: SlidersHorizontal },
    { to: "/components/forms", label: "Předvolby dokladů", icon: Settings2 },
  ],
}];

const ADMIN_PANEL = [{
  id: "administration",
  label: "Administrace",
  section: "Správa systému",
  items: [
    { to: "/components/navigation", label: "Uživatelé a oprávnění", icon: ShieldCheck },
    { to: "/guidelines", label: "Pravidla systému", icon: BookOpen },
  ],
}];

/** Rám ukázkových stránek design systému. */
export function ShowcaseLayout({
  children,
  breadcrumbs,
  defaultCollapsed = false,
  darkPreview = false,
}: {
  children: ReactNode;
  breadcrumbs?: Crumb[];
  defaultCollapsed?: boolean;
  darkPreview?: boolean;
}) {
  const [workspaceId, setWorkspaceId] = useState(MOCK_WORKSPACES[0].id);
  const [companyId, setCompanyId] = useState(MOCK_COMPANIES[0].id);
  const [periodId, setPeriodId] = useState(MOCK_PERIODS[0].id);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!darkPreview) return;
    applyTheme("dark");
    return () => applyTheme("light");
  }, [darkPreview]);

  const companies = MOCK_COMPANIES.map((company, index) => ({ ...company, ico: ["12345678", "87654321", "11223344"][index] }));
  const notifications = [
    { id: "n1", title: "Doklad byl zaúčtován", body: "Faktura FV-2026-0142 byla úspěšně zaúčtována.", type: "success" as const, createdAt: new Date(Date.now() - 5 * 60_000) },
    { id: "n2", title: "Blíží se termín DPH", body: "Přiznání k DPH je potřeba podat do pěti dnů.", type: "warning" as const, createdAt: new Date(Date.now() - 42 * 60_000) },
    { id: "n3", title: "Nový bankovní výpis", body: "Byl načten výpis se 24 pohyby.", type: "info" as const, createdAt: new Date(Date.now() - 2 * 3_600_000) },
  ];

  return (
    <AppShell
      appName="Slivka Design System"
      navGroups={NAV_GROUPS}
      navStateKey="showcase"
      breadcrumbs={breadcrumbs}
      contextLeft={<div className="flex min-w-0 items-center gap-6"><CompanySwitcher items={companies} value={companyId} onChange={setCompanyId} /><PeriodSwitcher periods={MOCK_PERIODS} value={periodId} onChange={setPeriodId} /></div>}
      actions={<SearchButton onClick={() => setSearchOpen(true)} />}
      panels={[
        { id: "company", title: "Nastavení firmy", icon: SlidersHorizontal, tooltip: "Nastavení firmy", nav: COMPANY_PANEL },
        { id: "admin", title: "Administrace", icon: ShieldCheck, tooltip: "Administrace", nav: ADMIN_PANEL, accent: "warning" },
      ]}
      activePanel={activePanel}
      onActivePanelChange={setActivePanel}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      notificationBell={<NotificationBell items={notifications} onItemClick={() => undefined} onMarkAllRead={() => undefined} onShowAll={() => undefined} />}
      themeToggleButton={<ThemeToggleButton />}
      userMenu={<UserMenu name="Petr Slivka" email="petr@slivka.cz" workspaces={[...MOCK_WORKSPACES, { id: "ws-audit", name: "Auditní prostor" }]} activeWorkspaceId={workspaceId} onWorkspaceChange={setWorkspaceId} items={[{ label: "Můj profil", icon: UserRound, to: "/components/navigation" }]} onSignOut={() => undefined} />}
    >
      <CommandPalette targets={TARGETS} open={searchOpen} onOpenChange={setSearchOpen} />
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
