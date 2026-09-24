import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ComponentProps, type ReactNode } from "react";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

export interface SlivkaProviderProps {
  children: ReactNode;
  /** Volitelný klient hostitelské aplikace; bez něj se vytvoří izolovaný výchozí klient. */
  queryClient?: QueryClient;
  tooltipDelayDuration?: number;
  toasterProps?: ComponentProps<typeof Toaster>;
}

/** Společná runtime obálka pro dotazy, tooltipy a notifikace design systému. */
export function SlivkaProvider({
  children,
  queryClient,
  tooltipDelayDuration = 300,
  toasterProps,
}: SlivkaProviderProps) {
  const [fallbackClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient ?? fallbackClient}>
      <TooltipProvider delayDuration={tooltipDelayDuration}>
        {children}
        <Toaster richColors position="top-right" {...toasterProps} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
