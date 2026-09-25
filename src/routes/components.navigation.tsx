import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Building2, FileText, Home, KeyRound, LayoutGrid, Receipt, SlidersHorizontal, Users } from "lucide-react";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  ComingSoon,
  PermissionGate,
  ReadOnlyBanner,
  FontSizeSetting,
  NotificationBell,
  ThemeToggleButton,
  ThemeSetting,
  CompanySwitcher,
  PeriodSwitcher,
  type NavGroup,
  type NavItem,
} from "@/components/ds";
import { PaneShowcase } from "@/components/showcase/PaneShowcase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_COMPANIES, MOCK_PERIODS } from "@/lib/mock/accounting";

export const Route = createFileRoute("/components/navigation")({
  head: () => ({
    meta: [
      { title: "Navigace – Slivka Design System" },
      {
        name: "description",
        content:
          "Boční menu se skupinami, samostatný režim Administrace, oprávnění, režim jen pro čtení a stav Připravujeme.",
      },
      { property: "og:title", content: "Navigace – Slivka Design System" },
      {
        property: "og:description",
        content:
          "Boční menu se skupinami, samostatný režim Administrace, oprávnění, režim jen pro čtení a stav Připravujeme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NavigationPage,
});

const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Přehled",
    items: [
      { to: "/", label: "Domovská stránka", icon: Home },
    ],
  },
  {
    id: "issued-documents",
    label: "Vydané doklady",
    section: "Doklady",
    items: [
      { to: "/components/grid", label: "Vydané faktury", icon: FileText, badge: "12" },
      { to: "/components/accounting-forms", label: "Ostatní pohledávky", icon: Receipt },
    ],
  },
  {
    id: "received-documents",
    label: "Přijaté doklady",
    section: "Doklady",
    defaultCollapsed: true,
    items: [
      { to: "/components/accounting-forms", label: "Přijaté faktury", icon: FileText },
      { to: "/components/excel-export", label: "Bankovní výpisy", icon: FileText },
    ],
  },
  {
    id: "reports",
    label: "Výkazy",
    section: "Přehledy a evidence",
    items: [
      { to: "/components/navigation", label: "Účetní výkazy", icon: BarChart3 },
      { to: "/components/navigation", label: "Přehled hospodaření", icon: LayoutGrid },
    ],
  },
  {
    id: "registers",
    label: "Evidence",
    section: "Přehledy a evidence",
    items: [
      { to: "/components/forms", label: "Partneři", icon: Users },
      { to: "/components/feedback", label: "Zakázky", icon: LayoutGrid },
      { to: "/components/navigation", label: "Majetek", icon: Building2, disabled: true },
    ],
  },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/components/navigation", label: "Uživatelé", icon: Users },
  { to: "/components/navigation", label: "Role a oprávnění", icon: KeyRound },
  { to: "/components/navigation", label: "Nastavení firmy", icon: SlidersHorizontal },
];

const PREVIEW_WIDTHS = [1440, 1100, 390] as const;

function NavigationPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<(typeof PREVIEW_WIDTHS)[number]>(1100);
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState(MOCK_COMPANIES[0].id);
  const companies = MOCK_COMPANIES.map((company, index) => ({ ...company, ico: ["12345678", "87654321", "11223344"][index] }));

  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Navigace" }]} defaultCollapsed>
      <ShowcaseSection
        title="Horní lišta"
        description="Kontext aplikace začíná úplně vlevo. Vpravo následuje hledání, panely, oznámení, motiv a uživatelská nabídka. Horní lišta této stránky ukazuje tři nepřečtená oznámení a tmavý režim."
      >
        <div className="grid gap-3">
          <ContextStatesPreview title="Světlý režim" companies={companies} companyId={companyId} onCompanyChange={setCompanyId} onPeriodChange={setPeriodId} />
          <div className="dark rounded-lg bg-background p-3 text-foreground">
            <ContextStatesPreview title="Tmavý režim" companies={companies} companyId={companyId} onCompanyChange={setCompanyId} onPeriodChange={setPeriodId} />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Přizpůsobení šířce"
        description="Lišta zůstává v jedné řádce, kontext se na užších obrazovkách zkrátí a menu se automaticky sbalí."
      >
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Šířka náhledu">
          {PREVIEW_WIDTHS.map((width) => (
            <Button key={width} type="button" size="sm" variant={previewWidth === width ? "default" : "outline"} onClick={() => setPreviewWidth(width)}>
              {width.toLocaleString("cs-CZ")} px
            </Button>
          ))}
        </div>
        <div className="max-w-full overflow-auto rounded-lg border bg-muted p-3">
          <div className="mx-auto overflow-hidden rounded-md border bg-card" style={{ width: `${previewWidth}px`, maxWidth: "100%" }}>
            <div className={cn("flex h-14 min-w-0 flex-nowrap items-center gap-6 overflow-hidden px-3", previewWidth < 1280 && "[&_[data-slot=context-pill-label]]:hidden", previewWidth < 768 && "[&_[data-slot=context-pill-mobile-value]]:inline [&_[data-slot=context-pill-value]]:hidden")}>
              <CompanySwitcher className={previewWidth < 768 ? "max-w-[132px]" : previewWidth < 1280 ? "max-w-[200px]" : undefined} items={companies} value={companyId} onChange={setCompanyId} />
              <PeriodSwitcher className={previewWidth < 768 ? "max-w-[112px]" : previewWidth < 1280 ? "max-w-[200px]" : undefined} periods={MOCK_PERIODS} value={periodId} onChange={setPeriodId} />
              <div className="min-w-0 flex-1" />
              <NotificationBell items={[]} onItemClick={() => undefined} onMarkAllRead={() => undefined} />
            </div>
            <div className="flex h-24 border-t">
              <div className={cn("border-r bg-card p-2 transition-[width]", previewWidth < 1280 ? "w-14" : "w-60")}>
                <LayoutGrid className="size-4" />
              </div>
              <div className="p-3 text-sm text-muted-foreground">Obsah aplikace</div>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Rozbalený výběr firmy" description="Nabídka obsahuje hledání a jediný seznam všech firem bez skupinových nadpisů; vybraná firma má fajfku a pod názvem IČO.">
        <div className="min-h-80 rounded-lg border bg-card p-3">
          <CompanySwitcher items={companies} value={companyId} onChange={setCompanyId} open onOpenChange={() => undefined} onCreate={() => undefined} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Boční menu s bloky"
        description="Skupina Přehled zůstává bez sekce. Doklady a Přehledy a evidence sdružují vždy dvě samostatně sbalitelné skupiny; hledání prázdné bloky skryje."
      >
        <div className="rounded-lg border bg-card p-3">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <NavigationBlockPreview title="Rozbalené menu" groups={NAV_GROUPS} />
            <NavigationBlockPreview title="Sbalené menu" groups={NAV_GROUPS} collapsed />
            <NavigationBlockPreview title="Hledání: faktury" groups={NAV_GROUPS.filter((group) => group.section === "Doklady").map((group) => ({ ...group, items: group.items.filter((item) => item.label.includes("faktury")) })).filter((group) => group.items.length > 0)} />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Panely aplikace"
        description="V horní liště jsou samostatná tlačítka Nastavení firmy a Administrace. Otevřený panel nahradí hlavní menu a zavře se výrazným tlačítkem nebo klávesou Esc."
      >
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <span className="font-semibold">
              {activePanel === "admin" ? "Administrace" : "Slivka Accounting"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setActivePanel((value) => value === "admin" ? null : "admin")}
            >
              {activePanel === "admin" ? "Zpět do aplikace" : "Administrace"}
            </Button>
          </div>
          <ul className="space-y-0.5 p-2">
            {(activePanel === "admin" ? ADMIN_NAV : NAV_GROUPS[0].items).map((item) => (
              <li
                key={item.label}
                className="hover-surface flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              >
                {item.icon ? <item.icon className="size-4 shrink-0" /> : null}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Režim více oken"
        description="Každý panel má záložky s vlastní historií. Záložky jdou přetahovat v liště i mezi panely, rozepsaný doklad se při přesunu neztratí. Cmd/Ctrl + klik v menu otevře novou záložku, Cmd/Ctrl + Shift + klik sousední panel. Stejný doklad se otevře jen jednou."
      >
        <PaneShowcase />
      </ShowcaseSection>

      <ShowcaseSection
        title="Předvolby vzhledu"
        description="Velikost písma a motiv jsou samostatné volby pro stránku Předvolby, nikoli trvalá tlačítka v horní liště."
      >
        <div className="grid gap-6 rounded-lg border bg-card p-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium">Velikost písma</div>
            <FontSizeSetting />
          </div>
          <ThemeSetting />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Oprávnění a jen pro čtení"
        description="PermissionGate obsah skryje nebo zakáže, ReadOnlyBanner vysvětlí důvod nad formulářem."
      >
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setCanEdit((value) => !value)}>
            {canEdit ? "Odebrat oprávnění k úpravám" : "Přidělit oprávnění k úpravám"}
          </Button>
          <ReadOnlyBanner reason="Účetní období je uzavřené, doklad lze pouze prohlížet." />
          <div className="flex flex-wrap gap-2">
            <PermissionGate allowed={canEdit} mode="disable" reason="Chybí oprávnění k úpravám">
              <Button>Upravit doklad</Button>
            </PermissionGate>
            <PermissionGate allowed={canEdit} mode="hide">
              <Button variant="destructive">Odstranit doklad</Button>
            </PermissionGate>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Připravovaná stránka" description="Jednotný prázdný stav modulu.">
        <ComingSoon description="Evidence majetku bude dostupná v některém z dalších vydání." />
      </ShowcaseSection>
    </ShowcaseLayout>
  );
}

function ContextStatesPreview({ title, companies, companyId, onCompanyChange, onPeriodChange }: { title: string; companies: Array<{ id: string; name: string; ico?: string }>; companyId: string; onCompanyChange: (id: string) => void; onPeriodChange: (id: string) => void }) {
  const states = [
    { label: "Otevřené", periods: MOCK_PERIODS, value: "2026" },
    { label: "V uzávěrce", periods: MOCK_PERIODS, value: "2025" },
    { label: "Uzavřené", periods: MOCK_PERIODS, value: "2024" },
    { label: "Bez výběru", periods: MOCK_PERIODS, value: null },
    { label: "Firma bez období", periods: [], value: null },
  ];
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="grid gap-3">
        {states.map((state) => (
          <div key={state.label} className="flex min-w-0 items-center gap-6">
            <span className="w-32 shrink-0 text-sm text-muted-foreground">{state.label}</span>
            <CompanySwitcher items={companies} value={companyId} onChange={onCompanyChange} />
            <PeriodSwitcher periods={state.periods} value={state.value} onChange={onPeriodChange} onCreate={state.periods.length === 0 ? () => undefined : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NavigationBlockPreview({ title, groups, collapsed = false }: { title: string; groups: NavGroup[]; collapsed?: boolean }) {
  let previousSection: string | undefined;
  return (
    <div className={cn("overflow-hidden rounded-md border bg-sidebar text-sidebar-foreground", collapsed ? "w-14" : "min-w-0")}>
      <div className={cn("border-b border-sidebar-border py-2 text-xs font-medium text-sidebar-muted", collapsed ? "px-2 text-center" : "px-3")}>{collapsed ? "•••" : title}</div>
      <div className="p-2">
        {groups.map((group, index) => {
          const startsSection = Boolean(group.section && group.section !== previousSection);
          previousSection = group.section;
          return (
            <div key={group.id} className={cn(index > 0 && !startsSection && "mt-2 border-t border-sidebar-border pt-2")}>
              {startsSection ? collapsed ? (
                <div title={group.section} aria-label={group.section} className={cn("flex h-6 items-center px-1", index > 0 && "mt-3")}><span className="h-0.5 w-full bg-sidebar-border" /></div>
              ) : (
                <div className={cn(index > 0 && "mt-4 border-t border-sidebar-border pt-4")}>
                  <div className="flex h-7 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-sidebar-muted">{group.section}</div>
                </div>
              ) : null}
              {!collapsed ? <div className="flex h-8 items-center px-3 text-[0.8rem] font-semibold text-sidebar-muted">{group.label}</div> : null}
              <div className={cn("space-y-0.5", !collapsed && "ml-2 border-l border-sidebar-border pl-2")}>
                {group.items.map((item) => (
                  <div key={item.label} title={item.label} className={cn("flex h-8 items-center rounded-md text-sm", collapsed ? "justify-center px-2" : "gap-2 px-3", item.disabled && "text-sidebar-muted")}>
                    {item.icon ? <item.icon className="size-4 shrink-0" /> : null}
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
