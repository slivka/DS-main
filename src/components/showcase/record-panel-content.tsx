/** Ukázkové operace příloh a poznámek · vlastní stav demo · nesmí ukládat produkční data. */
import { useEffect, useRef, useState } from "react";
import { History, Link, MessageSquare, Paperclip } from "lucide-react";
import { AttachmentList, RecordNotes, type RecordAttachment, type RecordSidePanelTab } from "../ds";
import { LinkedRecordsDemo } from "./LinkedRecordsShowcase";
import { HistoryDemo } from "./RecordHistoryShowcase";
import { ACCEPT, ATTACHMENTS, LIMIT, NOTES } from "./record-panel-data";
export type DemoPermission = "read" | "draft" | "filed" | "posted" | "locked";
export function useRecordPanelContent(status: DemoPermission, sourceUrl: string) {
  const [attachments, setAttachments] = useState(ATTACHMENTS);
  const [notes, setNotes] = useState(NOTES);
  const [source, setSource] = useState<RecordAttachment>({
    id: "source",
    name: "Faktura-2026-0142.pdf",
    type: "application/pdf",
    size: 145_200,
    uploadedBy: "Jana Nováková",
    uploadedAt: "2026-10-19T09:00:00Z",
  });
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
  const tabs: RecordSidePanelTab[] = [
    {
      id: "attachments",
      label: "Přílohy",
      icon: Paperclip,
      count: attachments.filter((a) => !a.removedAt).length,
      content: (
        <AttachmentList
          attachments={attachments}
          source={{ ...source, previewUrl: sourceUrl }}
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
          canReplaceSource={status !== "read"}
          replaceDisabledReason="Máte pouze právo číst přílohy."
          onReplaceSource={() =>
            setSource((value) => ({ ...value, name: "Opravená-faktura-2026-0142.pdf" }))
          }
          onDownload={(a) => {
            const anchor = document.createElement("a");
            anchor.href = sourceUrl;
            anchor.download = a.name;
            anchor.click();
          }}
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
