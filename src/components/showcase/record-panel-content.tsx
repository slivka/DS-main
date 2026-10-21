/** Ukázkové operace příloh a poznámek · vlastní stav demo · nesmí ukládat produkční data. */
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, History, Link, MessageSquare, Paperclip } from "lucide-react";
import {
  AttachmentList,
  OptionSelect,
  RecordNotes,
  SourcePreview,
  type RecordAttachment,
  type RecordSidePanelTab,
} from "../ds";
import { LinkedRecordsDemo } from "./LinkedRecordsShowcase";
import { HistoryDemo } from "./RecordHistoryShowcase";
import { ACCEPT, ATTACHMENTS, LIMIT, NOTES } from "./record-panel-data";
export type DemoPermission = "read" | "draft" | "filed" | "posted" | "locked";
type SourceScenario = "pdf" | "image" | "isdoc" | "empty" | "inherited";
const SCENARIOS: { value: SourceScenario; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Obrázek" },
  { value: "isdoc", label: "ISDOC" },
  { value: "empty", label: "Prázdný" },
  { value: "inherited", label: "Zděděný" },
];
const IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#eef3f8"/><text x="40" y="80" font-size="32" fill="#12304a">FAKTURA 2026/0142</text><text x="40" y="140" font-size="20" fill="#12304a">Kancelářské potřeby</text><text x="40" y="200" font-size="20" fill="#12304a">Celkem: 12 100,00</text></svg>`;
export function useRecordPanelContent(status: DemoPermission, sourceUrl: string) {
  const [attachments, setAttachments] = useState(ATTACHMENTS);
  const [notes, setNotes] = useState(NOTES);
  const [scenario, setScenario] = useState<SourceScenario>("pdf");
  const [source, setSource] = useState<RecordAttachment>({
    id: "source",
    name: "Faktura-2026-0142.pdf",
    type: "application/pdf",
    size: 145_200,
    uploadedBy: "Jana Nováková",
    uploadedAt: "2026-10-19T09:00:00Z",
  });
  const imageUrl = useMemo(() => `data:image/svg+xml;utf8,${encodeURIComponent(IMAGE_SVG)}`, []);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );
  const addFiles = (files: File[]) => {
    const uploaded = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Petr Slivka",
      progress: 0,
    }));
    setAttachments((items) => [...items, ...uploaded]);
    // Průběh simuluje aplikace, nikoli knihovna.
    for (const progress of [35, 70, 100])
      timers.current.push(
        setTimeout(
          () =>
            setAttachments((items) =>
              items.map((item) =>
                uploaded.some((entry) => entry.id === item.id) ? { ...item, progress } : item,
              ),
            ),
          progress * 15,
        ),
      );
  };
  const scenarioSource: RecordAttachment | null =
    scenario === "empty"
      ? null
      : scenario === "isdoc"
        ? { ...source, name: "faktura-2026-0142.isdoc", type: "text/xml", previewUrl: undefined }
        : scenario === "image"
          ? { ...source, name: "sken-faktury.svg", type: "image/svg+xml", previewUrl: imageUrl }
          : { ...source, previewUrl: sourceUrl };
  const download = (a: RecordAttachment) => {
    const anchor = document.createElement("a");
    anchor.href = sourceUrl;
    anchor.download = a.name;
    anchor.click();
  };
  const tabs: RecordSidePanelTab[] = [
    {
      id: "source",
      label: "Zdroj",
      icon: FileText,
      content: (
        <div className="flex min-h-0 flex-col gap-2">
          <div className="w-40">
            <OptionSelect
              value={scenario}
              onChange={(next) => setScenario(next as SourceScenario)}
              options={SCENARIOS}
              aria-label="Scénář zdroje"
            />
          </div>
          <SourcePreview
            source={scenarioSource}
            accept={ACCEPT}
            maxSize={LIMIT}
            canReplace={status !== "read"}
            replaceDisabledReason="Máte pouze právo číst přílohy."
            onReplace={() =>
              setSource((value) => ({ ...value, name: "Opravená-faktura-2026-0142.pdf" }))
            }
            onUpload={(files) => {
              const file = files[0];
              if (file)
                setSource({
                  id: "source",
                  name: file.name,
                  type: file.type || "application/octet-stream",
                  size: file.size,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: "Petr Slivka",
                });
            }}
            onDownload={download}
            onOpen={() => window.open(sourceUrl, "_blank", "noopener,noreferrer")}
            inheritedFrom={
              scenario === "inherited"
                ? { label: "Výpis č. 12/2026", onOpen: () => undefined }
                : undefined
            }
            onUrlExpired={() => undefined}
          />
        </div>
      ),
    },
    {
      id: "attachments",
      label: "Přílohy",
      icon: Paperclip,
      count: attachments.filter((a) => !a.removedAt).length,
      content: (
        <AttachmentList
          attachments={attachments}
          accept={ACCEPT}
          maxSize={LIMIT}
          canAdd={status !== "read"}
          addDisabledReason="Máte pouze právo číst přílohy."
          onFiles={addFiles}
          canRemove={() => status === "draft" || status === "filed"}
          removeKind={() => (status === "draft" ? "delete" : "remove")}
          removeDisabledReason={() => "V tomto stavu lze přílohy pouze přidávat."}
          allowRemovalReason
          onRemove={(a, kind, reason) =>
            setAttachments((items) =>
              kind === "delete"
                ? items.filter((item) => item.id !== a.id)
                : items.map((item) =>
                    item.id === a.id
                      ? {
                          ...item,
                          removedAt: new Date().toISOString(),
                          removedBy: "Petr Slivka",
                          removalReason: reason,
                        }
                      : item,
                  ),
            )
          }
          onSetSource={(a) =>
            setSource({
              id: "source",
              name: a.name,
              type: a.type,
              size: a.size,
              uploadedAt: a.uploadedAt,
              uploadedBy: a.uploadedBy,
            })
          }
          canSetSource={() => status !== "read"}
          setSourceDisabledReason={() => "Máte pouze právo číst přílohy."}
          onDownload={download}
          onOpen={() => window.open(sourceUrl, "_blank", "noopener,noreferrer")}
        />
      ),
    },
    {
      id: "notes",
      label: "Poznámky",
      icon: MessageSquare,
      count: notes.length,
      content: (
        <RecordNotes
          notes={notes}
          canAdd
          canPin
          onAdd={(body) =>
            setNotes((items) => [
              ...items,
              {
                id: `note-${Date.now()}`,
                body,
                author: "Petr Slivka",
                createdAt: new Date().toISOString(),
              },
            ])
          }
          onUpdate={(id, body) =>
            setNotes((items) =>
              items.map((item) =>
                item.id === id ? { ...item, body, editedAt: new Date().toISOString() } : item,
              ),
            )
          }
          onRemove={(id) => setNotes((items) => items.filter((item) => item.id !== id))}
          onPin={(id, pinned) =>
            setNotes((items) =>
              items.map((item) => ({ ...item, pinned: item.id === id && pinned })),
            )
          }
        />
      ),
    },
    {
      id: "history",
      label: "Historie",
      icon: History,
      content: <HistoryDemo />,
    },
    {
      id: "linked",
      label: "Propojené",
      icon: Link,
      content: <LinkedRecordsDemo readOnly={status === "read"} />,
    },
  ];
  return {
    tabs,
    pinnedNote: notes.find((note) => note.pinned),
    addFiles,
    addNote: (body: string) =>
      setNotes((items) => [
        ...items,
        {
          id: `bulk-${Date.now()}`,
          body,
          author: "Petr Slivka",
          createdAt: new Date().toISOString(),
        },
      ]),
  };
}
