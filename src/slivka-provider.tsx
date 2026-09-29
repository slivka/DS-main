import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ComponentProps, type ReactNode } from "react";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { DsTextsProvider, type DsLocale, type DsTexts } from "./ds-texts";

export interface SlivkaProviderProps {
  children: ReactNode;
  /** Volitelný klient hostitelské aplikace; bez něj se vytvoří izolovaný výchozí klient. */
  queryClient?: QueryClient;
  tooltipDelayDuration?: number;
  toasterProps?: ComponentProps<typeof Toaster>;
  /** Jazyk společných textů; bez zadání zůstává čeština. */
  locale?: DsLocale;
  /** Volitelné přepsání společných textů. */
  texts?: Partial<DsTexts>;
}

/** Společná runtime obálka pro dotazy, tooltipy a notifikace design systému. */
export function SlivkaProvider({
  children,
  queryClient,
  tooltipDelayDuration = 300,
  toasterProps,
  locale,
  texts,
}: SlivkaProviderProps) {
  const [fallbackClient] = useState(() => new QueryClient());

  return (
    <DsTextsProvider locale={locale} texts={texts}>
    <QueryClientProvider client={queryClient ?? fallbackClient}>
      <TooltipProvider delayDuration={tooltipDelayDuration}>
        {children}
        <Toaster richColors position="top-right" {...toasterProps} />
      </TooltipProvider>
    </QueryClientProvider>
    </DsTextsProvider>
  );
}
