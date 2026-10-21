import { useState } from "react";
import { FileText, ListChecks, Rows3 } from "lucide-react";
import {
  Button,
  CheckList,
  DataGrid,
  FileChipBar,
  FileDropZone,
  NoticeBar,
  PageHeader,
  PaneDropOverlay,
  RecordDialog,
  RecordSidePanel,
  RecordPanelToolbar,
  SelectableGroupList,
  SourcePreview,
  type FileChip,
} from "../ds";
import type { RejectedFile } from "../../hooks/use-file-drop";
import { IMPORT_GROUPS, IMPORT_MOVEMENTS, importChecks } from "./file-import-data";

const LIMIT = 20_000_000;
const ACCEPT = [".xml", ".gpc", ".abo", ".csv", ".pdf"];
export function FileImportShowcase() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileChip[]>([]);
  const [step, setStep] = useState(1);
  const [active, setActive] = useState("s1");
  const [checked, setChecked] = useState<string[]>(["s1", "s2"]);
  const [tab, setTab] = useState("checks");
  const [panelOpen, setPanelOpen] = useState(true);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const [result, setResult] = useState("");
  const addFiles = (incoming: File[]) => {
    setFiles((current) => [
      ...current,
      ...incoming.map((file, index) => ({
        id: `${current.length + index}-${file.name}`,
        file,
        severity: "ok" as const,
        message: "Ukázkový soubor připraven",
      })),
    ]);
    setRejected([]);
  };
  const launch = () => {
    setStep(1);
    setOpen(true);
    setResult("");
  };
  const overlayFiles = (incoming: File[]) => {
    addFiles(incoming);
    launch();
  };
  const currentFile = files[0]?.file;
  const title = IMPORT_GROUPS.flatMap((group) => group.items).find(
    (item) => item.id === active,
  )?.title;
  const source = currentFile
    ? {
        id: "import-file",
        name: currentFile.name,
        type: currentFile.type || "application/octet-stream",
        size: currentFile.size,
        uploadedAt: "2026-10-21T20:30:00Z",
      }
    : null;
  return (
    <div data-slot="file-import-showcase" className="space-y-4">
      <PageHeader
        title="Import souborů"
        actions={<Button onClick={launch}>Importovat výpisy</Button>}
      />
      {result ? <NoticeBar tone="success">{result}</NoticeBar> : null}
      <PaneDropOverlay
        label="Pusťte pro import výpisů"
        accept={ACCEPT}
        maxFiles={10 - files.length}
        maxSizeBytes={LIMIT}
        onFiles={overlayFiles}
        onReject={setRejected}
      >
        <DataGrid
          title="Bankovní výpisy"
          storageKey="import-statements-demo"
          rowKey={(row) => row.id}
          rows={IMPORT_GROUPS.flatMap((group) => group.items)}
          columns={[
            { id: "title", label: "Výpis", value: (row) => row.title },
            { id: "subtitle", label: "Období a pohyby", value: (row) => row.subtitle },
            { id: "value", label: "Zůstatek", value: (row) => String(row.value), align: "right" },
          ]}
          paginated={false}
          groupable={false}
        />
      </PaneDropOverlay>
      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Import bankovních výpisů"
        size="xl"
        description="Ukázkový import s fiktivními výpisy."
        submitLabel={step === 1 ? "Pokračovat" : `Importovat ${checked.length} výpisů`}
        submitDisabled={step === 1 ? !files.length : !checked.length}
        onSubmit={() => {
          if (step === 1) {
            setStep(2);
            setPanelOpen(true);
          } else {
            setResult(`Ukázka dokončena: ${checked.length} výpisů.`);
            setOpen(false);
          }
        }}
        extraActions={
          step === 2 ? (
            <Button variant="outline" onClick={() => setStep(1)}>
              Zpět
            </Button>
          ) : undefined
        }
      >
        {rejected.length ? (
          <NoticeBar tone="warning">
            Odmítnuté soubory: {rejected.map((item) => item.file.name).join(", ")}
          </NoticeBar>
        ) : null}
        {step === 1 ? (
          <>
            <FileDropZone
              accept={ACCEPT}
              maxFiles={10 - files.length}
              maxSizeBytes={LIMIT}
              hint="XML, GPC, ABO, CSV nebo PDF · nejvýše 10 souborů · 20 MB na soubor"
              onFiles={addFiles}
              onReject={setRejected}
            />
            {files.length ? (
              <FileChipBar
                files={files}
                onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
                accept={ACCEPT}
                maxFiles={10 - files.length}
                maxSizeBytes={LIMIT}
                onFiles={addFiles}
                onReject={setRejected}
              />
            ) : null}
            <NoticeBar tone="info">
              Fiktivní data ukázky · Hlavní kniha / Vedlejší kniha · říjen 2026
            </NoticeBar>
          </>
        ) : (
          <div className="space-y-3">
            <FileChipBar
              files={files}
              onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
              accept={ACCEPT}
              maxFiles={10 - files.length}
              maxSizeBytes={LIMIT}
              onFiles={addFiles}
              onReject={setRejected}
              maxVisible={3}
            />
            <RecordSidePanel
              open={panelOpen}
              onOpenChange={setPanelOpen}
              activeTab={tab}
              onActiveTabChange={setTab}
              header={title}
              width="wide"
              tabs={[
                {
                  id: "checks",
                  label: "Kontroly",
                  icon: ListChecks,
                  content: (
                    <>
                      <RecordPanelToolbar />
                      <CheckList items={importChecks(active)} size="sm" />
                    </>
                  ),
                },
                {
                  id: "movements",
                  label: "Pohyby",
                  icon: Rows3,
                  count: 3,
                  content: (
                    <>
                      <RecordPanelToolbar />
                      <DataGrid
                        rows={IMPORT_MOVEMENTS}
                        rowKey={(row) => row.id}
                        storageKey="import-movements-demo"
                        hideToolbar
                        paginated={false}
                        groupable={false}
                        columns={[
                          { id: "date", label: "Datum", value: (row) => row.date },
                          { id: "title", label: "Popis", value: (row) => row.title },
                          {
                            id: "amount",
                            label: "Částka EUR",
                            numeric: true,
                            value: (row) => row.amount,
                          },
                        ]}
                      />
                    </>
                  ),
                },
                {
                  id: "file",
                  label: "Soubor",
                  icon: FileText,
                  content: (
                    <SourcePreview
                      source={source}
                      accept={ACCEPT}
                      maxSize={LIMIT}
                      canReplace={false}
                      replaceDisabledReason="Původní soubor ukázky"
                      onUpload={(incoming) => addFiles(incoming)}
                    />
                  ),
                },
              ]}
            >
              <SelectableGroupList
                groups={IMPORT_GROUPS}
                activeId={active}
                checkedIds={checked}
                onActiveChange={(id) => {
                  setActive(id);
                  setPanelOpen(true);
                }}
                onCheckedChange={setChecked}
              />
            </RecordSidePanel>
          </div>
        )}
      </RecordDialog>
    </div>
  );
}
