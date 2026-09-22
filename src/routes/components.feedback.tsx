import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  HistoryPanel,
  LoadingOverlay,
  RecordDialog,
  RecordNotes,
  useConfirmDialog,
  type RecordNote,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { GridEmptyRow, GridErrorRow } from "@/components/ds/grid/grid-states";
import { Table, TableBody } from "@/components/ui/table";

export const Route = createFileRoute("/components/feedback")({
  head: () => ({
    meta: [
      { title: "Zpětná vazba – Slivka Design System" },
      {
        name: "description",
        content: "Dialogy, potvrzení, hlášky, prázdné stavy, načítání a chybové stavy.",
      },
      { property: "og:title", content: "Zpětná vazba – Slivka Design System" },
      {
        property: "og:description",
        content: "Dialogy, potvrzení, hlášky, prázdné stavy, načítání a chybové stavy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<RecordNote[]>([
    {
      id: "n1",
      body: "Doklad zkontrolován, čeká na schválení.",
      author: "Jana Nováková",
      createdAt: "2026-03-10T09:15:00Z",
      editable: true,
    },
  ]);

  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Zpětná vazba" }]}>
      <ShowcaseSection title="Hlášky">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("Záznam uložen")}>
            Úspěch
          </Button>
          <Button variant="outline" onClick={() => toast.error("Záznam se nepodařilo uložit")}>
            Chyba
          </Button>
          <Button variant="outline" onClick={() => toast.info("Období je uzavřené")}>
            Informace
          </Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Dialogy a potvrzení">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setDialogOpen(true)}>Dialog záznamu</Button>
          <Button
            variant="destructive"
            onClick={() =>
              confirm({
                title: "Odstranit doklad?",
                description: "Akci nelze vzít zpět.",
                destructive: true,
                onConfirm: () => toast.success("Doklad odstraněn"),
              })
            }
          >
            Odstranit
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              confirm({ title: "Období je uzavřené", info: true })
            }
          >
            Informační dialog
          </Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Načítání">
        <div className="relative h-32 rounded-lg border bg-card">
          <LoadingOverlay show={loading} />
          <div className="p-4 text-sm text-muted-foreground">Obsah stránky</div>
        </div>
        <Button
          className="mt-2"
          variant="outline"
          onClick={() => {
            setLoading(true);
            window.setTimeout(() => setLoading(false), 1500);
          }}
        >
          Spustit načítání
        </Button>
      </ShowcaseSection>

      <ShowcaseSection title="Prázdný a chybový stav">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableBody>
                <GridEmptyRow
                  colSpan={1}
                  title="Žádné doklady"
                  description="Pro vybrané období nejsou zaúčtované doklady."
                  actionLabel="Přidat doklad"
                  onAction={() => toast.info("Nový doklad")}
                />
              </TableBody>
            </Table>
          </div>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableBody>
                <GridErrorRow
                  colSpan={1}
                  error={new Error("Spojení se nezdařilo")}
                  onRetry={() => toast.info("Zkouším znovu")}
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Poznámky a historie">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <RecordNotes
              notes={notes}
              onAdd={(body) =>
                setNotes((n) => [
                  { id: crypto.randomUUID(), body, author: "Já", createdAt: new Date().toISOString(), editable: true },
                  ...n,
                ])
              }
              onUpdate={(id, body) =>
                setNotes((n) => n.map((x) => (x.id === id ? { ...x, body } : x)))
              }
              onRemove={(id) => setNotes((n) => n.filter((x) => x.id !== id))}
            />
          </div>
          <div className="rounded-lg border bg-card p-4">
            <HistoryPanel
              entries={[
                {
                  id: "h1",
                  action: "update",
                  changedFields: ["amount"],
                  oldData: { amount: 10000 },
                  newData: { amount: 12500 },
                  author: "Jana Nováková",
                  createdAt: "2026-03-11T10:05:00Z",
                },
                {
                  id: "h2",
                  action: "insert",
                  author: "Petr Malý",
                  createdAt: "2026-03-10T08:00:00Z",
                },
              ]}
              onClose={() => toast.info("Panel zavřen")}
            />
          </div>
        </div>
      </ShowcaseSection>

      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Ukázkový dialog"
        onSubmit={() => {
          setDialogOpen(false);
          toast.success("Uloženo");
        }}
      >
        <p className="text-sm text-muted-foreground">
          Obsah dialogu se skládá ze sdílených polí design systému.
        </p>
      </RecordDialog>
      {confirmDialog}
    </ShowcaseLayout>
  );
}
