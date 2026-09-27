import { createContext, useContext, type ReactNode } from "react";

import { cn } from "../../../lib/utils";

export type PageLayoutVariant = "list" | "form";

const PageLayoutContext = createContext<PageLayoutVariant | null>(null);
const AppShellContentContext = createContext<((mounted: boolean) => void) | null>(null);

/** Aktuální typ stránky; gridy v seznamu z něj automaticky převezmou výšku fill. */
export function usePageLayoutVariant() {
  return useContext(PageLayoutContext);
}

/** Interní registrace PaneLayoutu do AppShellu – aplikace nic nenastavuje. */
export function useAppShellPaneRegistration() {
  return useContext(AppShellContentContext);
}

export const AppShellContentProvider = AppShellContentContext.Provider;

export interface PageLayoutProps {
  variant?: PageLayoutVariant;
  children: ReactNode;
  className?: string;
}

/** Rozvržení stránky v panelu: list vyplní panel, form nechá rolovat celý obsah. */
export function PageLayout({ variant = "form", children, className }: PageLayoutProps) {
  return (
    <PageLayoutContext.Provider value={variant}>
      <div
        data-page-layout={variant}
        className={cn("min-w-0", variant === "list" ? "flex h-full min-h-[15rem] flex-col gap-3" : "space-y-4", className)}
      >
        {children}
      </div>
    </PageLayoutContext.Provider>
  );
}