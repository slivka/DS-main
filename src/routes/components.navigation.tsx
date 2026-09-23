import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, FileText, KeyRound, LayoutGrid, SlidersHorizontal, Users } from "lucide-react";

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
    id: "documents",
    label: "Doklady",
    items: [
      { to: "/components/accounting-forms", label: "Přijaté faktury", icon: FileText },
      { to: "/components/grid", label: "Vydané faktury", icon: FileText, badge: "12" },
      { to: "/components/excel-export", label: "Bankovní výpisy", icon: FileText },
    ],
  },
  {
    id: "registers",
    label: "Číselníky",
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

  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Navigace" }]} defaultCollapsed darkPreview>
      <ShowcaseSection
        title="Horní lišta"
        description="Kontext aplikace začíná úplně vlevo. Vpravo následuje hledání, panely, oznámení, motiv a uživatelská nabídka. Horní lišta této stránky ukazuje tři nepřečtená oznámení a tmavý režim."
      >
        <div className="flex items-center justify-end gap-2 rounded-lg border bg-card p-3">
          <NotificationBell items={[]} onItemClick={() => undefined} onMarkAllRead={() => undefined} />
          <span className="text-sm text-muted-foreground">Prázdný stav oznámení</span>
          <ThemeToggleButton />
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
            <div className={cn("flex h-14 min-w-0 flex-nowrap items-center gap-1 overflow-hidden px-3", previewWidth < 1280 && "[&_[data-slot=context-pill-label]]:hidden", previewWidth < 768 && "[&_[data-slot=context-pill-mobile-value]]:inline [&_[data-slot=context-pill-value]]:hidden")}>
              <CompanySwitcher className={previewWidth < 768 ? "max-w-[72px]" : previewWidth < 1280 ? "max-w-[200px]" : undefined} items={MOCK_COMPANIES} value={MOCK_COMPANIES[0].id} onChange={() => undefined} />
              <PeriodSwitcher className={previewWidth < 768 ? "max-w-[64px]" : previewWidth < 1280 ? "max-w-[200px]" : undefined} periods={MOCK_PERIODS} value={periodId} onChange={setPeriodId} />
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

      <ShowcaseSection title="Prázdné stavy období" description="Přepínač rozlišuje chybějící výběr a firmu, která zatím nemá žádné období.">
        <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3">
          <PeriodSwitcher periods={MOCK_PERIODS} value={periodId} onChange={setPeriodId} />
          <PeriodSwitcher periods={[]} value={null} onChange={() => undefined} onCreate={() => undefined} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Boční menu se skupinami"
        description="Skupiny se sbalují, aktivní položka je zvýrazněná, nedostupné položky nesou štítek Připravujeme. Které položky se zobrazí, určuje aplikace."
      >
        <div className="rounded-lg border bg-card p-3">
          <div className="grid gap-4 md:grid-cols-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li
                      key={item.label}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                        item.disabled ? "text-muted-foreground" : "hover-surface",
                      )}
                    >
                      {item.icon ? <item.icon className="size-4 shrink-0" /> : null}
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto rounded bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                          {item.badge}
                        </span>
                      ) : null}
                      {item.disabled ? (
                        <span className="ml-auto rounded bg-muted px-1.5 text-[11px]">
                          Připravujeme
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
