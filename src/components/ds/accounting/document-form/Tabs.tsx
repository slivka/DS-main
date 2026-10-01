/** Záložky obsahu formuláře dokladu. */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { SectionHeading } from "../../layout/section-heading";
import type { DocumentFormTab } from "./document-form-types";
export interface DocumentFormTabsProps {
  tabs: DocumentFormTab[];
  value: string;
  onValueChange: (value: string) => void;
  linesLabel: string;
}
/** Skryje lištu jediné záložky a vícenásobné záložky drží ve stejné typografii. */
export function DocumentFormTabs({
  tabs,
  value,
  onValueChange,
  linesLabel,
}: DocumentFormTabsProps) {
  const allTabs = tabs;
  const tab = value;
  const setTab = onValueChange;
  const t = { linesTab: linesLabel };
  return (
    <>
      {allTabs.length === 1 ? (
        <>
          <SectionHeading>{t.linesTab}</SectionHeading>
          <div className="mt-2">{allTabs[0]?.content}</div>
        </>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <TabsList className="h-10 gap-1 rounded-none border-b bg-transparent p-0">
              {allTabs.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="h-10 gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  {item.label}
                  {item.badge != null ? (
                    <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {allTabs.map((item) => (
            <TabsContent key={item.id} value={item.id} className="mt-2">
              {item.content}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}
