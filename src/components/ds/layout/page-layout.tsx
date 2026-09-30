import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "../../../lib/utils";

export type PageLayoutVariant = "list" | "form";

const PageLayoutContext = createContext<PageLayoutVariant | null>(null);
const AppShellContentContext = createContext<((mounted: boolean) => void) | null>(null);

/** Aktuální typ stránky; gridy v seznamu z něj automaticky převezmou výšku fill. */
export function usePageLayoutVariant() {
  return useContext(PageLayoutContext);
}

/**
 * Interní registrace PaneLayoutu do AppShellu – aplikace nic nenastavuje.
 * PaneLayout má být přímý obsah AppShellu (children); registruje se v useLayoutEffect,
 * takže main přepne na režim bez paddingu a rolování ještě před prvním vykreslením.
 */
export function useAppShellPaneRegistration() {
  return useContext(AppShellContentContext);
}

export const AppShellContentProvider = AppShellContentContext.Provider;

export interface PageLayoutProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  variant?: PageLayoutVariant;
  children: ReactNode;
  className?: string;
}

/** Rozvržení stránky v panelu: list vyplní panel, form nechá rolovat celý obsah. */
export function PageLayout({ variant = "form", children, className, ...props }: PageLayoutProps) {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    // Rolovací oblast panelu, mimo panely rolovací main AppShellu.
    const root =
      sentinel?.closest<HTMLElement>('[data-pane-scroll], [data-slot="app-shell-main"]') ?? null;
    if (!sentinel || !root) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      root,
      threshold: 1,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  return (
    <PageLayoutContext.Provider value={variant}>
      <div
        data-page-layout={variant}
        data-scrolled={scrolled || undefined}
        {...props}
        className={cn(
          "relative min-w-0",
          variant === "list" ? "flex h-full flex-col gap-3" : "space-y-4",
          className,
        )}
      >
        <span
          ref={sentinelRef}
          data-page-scroll-sentinel
          aria-hidden
          className="pointer-events-none absolute h-px w-px"
        />
        {children}
      </div>
    </PageLayoutContext.Provider>
  );
}
