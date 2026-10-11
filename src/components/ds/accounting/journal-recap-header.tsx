/** Záložky a rozbalovač rekapitulace; nepočítá částky. */
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import { TabsList, TabsTrigger } from "../../ui/tabs";
interface JournalRecapHeaderProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  shown: boolean;
  changeOpen: (open: boolean) => void;
  headerTotal?: ReactNode;
  t: { collapse: string; expand: string };
}
export function JournalRecapHeader({ tabs, activeTab, shown, changeOpen, headerTotal, t }: JournalRecapHeaderProps) {
  return (
        <div className="flex items-center border-b">
          <TabsList className="h-9 min-w-0 flex-1 overflow-x-auto justify-start rounded-none bg-transparent px-2">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                onClick={() => {
                  if (!shown && item.id === activeTab) changeOpen(true);
                }}
                className="h-9 rounded-none border-b-2 border-transparent text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {headerTotal}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => changeOpen(!shown)}
            aria-label={shown ? t.collapse : t.expand}
            aria-expanded={shown}
            className="mr-1 size-8"
          >
            {shown ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>
  );
}
