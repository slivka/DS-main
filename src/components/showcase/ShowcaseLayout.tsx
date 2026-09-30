import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  Building2,
  Car,
  FileSpreadsheet,
  Landmark,
  LayoutGrid,
  Library,
  MapPin,
  MessageSquare,
  Palette,
  Printer,
  Receipt,
  Route as RouteIcon,
  Settings,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TextCursorInput,
  UserRound,
  Users,
} from "lucide-react";

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
      { to: "/components/print", label: "Tisk", icon: Printer },
      { to: "/components/forms", label: "Formuláře", icon: TextCursorInput },
      { to: "/components/feedback", label: "Zpětná vazba", icon: MessageSquare },
      { to: "/components/accounting-forms", label: "Účetní formuláře", icon: Receipt },
      { to: "/components/matching", label: "Párování", icon: Receipt },
      { to: "/components/navigation", label: "Navigace", icon: RouteIcon },
      { to: "/workspace-settings/udaje", label: "Nastavení prostoru", icon: RouteIcon },
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
    items: [{ to: "/components/navigation", label: "Majetek", icon: Settings2, disabled: true }],
  },
];

const TARGETS = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ label: item.label, group: group.label, to: item.to })),
);

const REGISTERS_PANEL: NavGroup[] = [
  {
    id: "jobs",
    label: "",
    items: [{ to: "/components/navigation", label: "Zakázky", icon: LayoutGrid }],
  },
  {
    id: "accounting",
    label: "",
    section: "Účetnictví",
    items: [
      { to: "/components/accounting-forms", label: "Účtový rozvrh", icon: Landmark },
      { to: "/components/grid", label: "Kurzy", icon: FileSpreadsheet },
    ],
  },
  {
    id: "general",
    label: "",
    section: "Obecné",
    items: [{ to: "/components/forms", label: "Měrné jednotky", icon: Settings2 }],
  },
  {
    id: "assets",
    label: "",
    section: "Majetek",
    items: [
      { to: "/components/navigation", label: "Inventarizační zařazení", icon: Library },
      { to: "/components/navigation", label: "Místa uložení", icon: MapPin },
    ],
  },
  {
    id: "people",
    label: "",
    section: "Pracovníci a vozidla",
    items: [
      { to: "/components/navigation", label: "Pracovníci", icon: Users },
      {
        to: "/components/navigation",
        label: "Vozidla",
        icon: Car,
        badge: "Připravujeme",
        disabled: true,
      },
    ],
  },
];

const COMPANY_SETTINGS: NavGroup[] = [
  {
    id: "company",
    label: "",
    section: "Firma",
    items: [{ to: "/components/navigation", label: "Základní údaje", icon: Building2 }],
  },
  {
    id: "accounting-vat",
    label: "",
    section: "Účetnictví a DPH",
    items: [
      { to: "/components/accounting-forms", label: "Účetní nastavení", icon: Landmark },
      { to: "/components/forms", label: "DPH", icon: Receipt },
    ],
  },
  {
    id: "modules",
    label: "",
    section: "Moduly",
    items: [{ to: "/components/navigation", label: "Aktivní moduly", icon: LayoutGrid }],
  },
];

const WORKSPACE_SETTINGS: NavGroup[] = [
  {
    id: "workspace",
    label: "",
    section: "Prostor",
    items: [{ to: "/components/navigation", label: "Základní údaje", icon: Settings }],
  },
  {
    id: "users",
    label: "",
    section: "Uživatelé",
    items: [{ to: "/components/navigation", label: "Členové a pozvánky", icon: Users }],
  },
  {
    id: "templates",
    label: "",
    section: "Vzory číselníků",
    items: [{ to: "/components/navigation", label: "Výchozí číselníky", icon: Library }],
  },
];

const ADMIN_PANEL: NavGroup[] = [
  {
    id: "administration",
    label: "Administrace",
    section: "Správa systému",
    items: [
      { to: "/components/navigation", label: "Uživatelé a oprávnění", icon: ShieldCheck },
      { to: "/guidelines", label: "Pravidla systému", icon: BookOpen },
    ],
  },
];

/** Rám ukázkových stránek design systému. */
export function ShowcaseLayout({
  children,
  breadcrumbs,
  darkPreview = false,
}: {
  children: ReactNode;
  breadcrumbs?: Crumb[];
  darkPreview?: boolean;
}) {
  const [workspaceId, setWorkspaceId] = useState(MOCK_WORKSPACES[0].id);
  const [companyId, setCompanyId] = useState(MOCK_COMPANIES[0].id);
  const [periodId, setPeriodId] = useState(MOCK_PERIODS[0].id);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [settingsView, setSettingsView] = useState("company");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!darkPreview) return;
    applyTheme("dark");
    return () => applyTheme("light");
  }, [darkPreview]);

  const companies = MOCK_COMPANIES.map((company, index) => ({
    ...company,
    ico: ["12345678", "87654321", "11223344"][index],
  }));
  const activeWorkspace =
    MOCK_WORKSPACES.find((workspace) => workspace.id === workspaceId) ?? MOCK_WORKSPACES[0];
  const activeCompany = companies.find((company) => company.id === companyId) ?? companies[0];
  const notifications = [
    {
      id: "n1",
      title: "Doklad byl zaúčtován",
      body: "Faktura FV-2026-0142 byla úspěšně zaúčtována.",
      type: "success" as const,
      createdAt: new Date(Date.now() - 5 * 60_000),
    },
    {
      id: "n2",
      title: "Blíží se termín DPH",
      body: "Přiznání k DPH je potřeba podat do pěti dnů.",
      type: "warning" as const,
      createdAt: new Date(Date.now() - 42 * 60_000),
    },
    {
      id: "n3",
      title: "Nový bankovní výpis",
      body: "Byl načten výpis se 24 pohyby.",
      type: "info" as const,
      createdAt: new Date(Date.now() - 2 * 3_600_000),
    },
  ];

  return (
    <AppShell
      appName="Slivka Design System"
      navGroups={NAV_GROUPS}
      navStateKey="showcase"
      breadcrumbs={breadcrumbs}
      contextLeft={
        <>
          <CompanySwitcher items={companies} value={companyId} onChange={setCompanyId} />
          <PeriodSwitcher periods={MOCK_PERIODS} value={periodId} onChange={setPeriodId} />
        </>
      }
      actions={<SearchButton onClick={() => setSearchOpen(true)} />}
      panels={[
        {
          id: "registers",
          title: "Číselníky",
          icon: Library,
          tooltip: "Číselníky",
          nav: REGISTERS_PANEL,
          scope: "company",
          context: activeCompany.name,
        },
        {
          id: "settings",
          title: "Nastavení",
          icon: Settings,
          tooltip: "Nastavení",
          activeView: settingsView,
          onViewChange: setSettingsView,
          views: [
            {
              id: "company",
              label: "Firma",
              title: "Nastavení firmy",
              context: activeCompany.name,
              scope: "company",
              nav: COMPANY_SETTINGS,
            },
            {
              id: "workspace",
              label: "Prostor",
              title: "Nastavení prostoru",
              context: activeWorkspace.name,
              scope: "workspace",
              nav: WORKSPACE_SETTINGS,
            },
          ],
        },
        {
          id: "company-settings",
          title: "Nastavení firmy",
          icon: SlidersHorizontal,
          tooltip: "Nastavení firmy bez částí",
          views: [
            {
              id: "company",
              label: "Firma",
              title: "Nastavení firmy",
              context: activeCompany.name,
              scope: "company",
              nav: COMPANY_SETTINGS,
            },
          ],
        },
        {
          id: "admin",
          title: "Administrace",
          icon: ShieldCheck,
          tooltip: "Administrace provozovatele",
          nav: ADMIN_PANEL,
          scope: "platform",
          accent: "warning",
          badge: { label: "Provozovatel · všechny prostory", tone: "accent" },
        },
      ]}
      activePanel={activePanel}
      onActivePanelChange={setActivePanel}
      notificationBell={
        <NotificationBell
          items={notifications}
          onItemClick={() => undefined}
          onMarkAllRead={() => undefined}
          onShowAll={() => undefined}
        />
      }
      themeToggleButton={<ThemeToggleButton />}
      userMenu={
        <UserMenu
          name="Petr Slivka"
          email="petr@slivka.cz"
          workspaces={[...MOCK_WORKSPACES, { id: "ws-audit", name: "Auditní prostor" }]}
          activeWorkspaceId={workspaceId}
          onWorkspaceChange={setWorkspaceId}
          items={[{ label: "Můj profil", icon: UserRound, to: "/components/navigation" }]}
          workspaceAction={{
            label: "Spravovat pracovní prostory",
            icon: Settings2,
            to: "/components/navigation",
          }}
          onSignOut={() => undefined}
        />
      }
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
