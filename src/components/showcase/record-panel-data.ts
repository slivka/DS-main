/** Ukázková data panelu · vlastní pouze demo · nesmí se distribuovat aplikacím. */
import type { RecordAttachment, RecordNote } from "../ds";
export const ACCEPT = [".pdf", ".jpg", ".jpeg", ".png", ".isdoc", ".xml", ".docx", ".xlsx"];
export const LIMIT = 20_000_000;
export const ATTACHMENTS: RecordAttachment[] = [
  {
    id: "order",
    name: "Objednávka.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 1_200_000,
    uploadedBy: "Jana Nováková",
    uploadedAt: "2026-10-19T09:15:00Z",
  },
  {
    id: "delivery",
    name: "Dodací list.xml",
    type: "application/xml",
    size: 8400,
    uploadedBy: "Petr Slivka",
    uploadedAt: "2026-10-19T10:15:00Z",
  },
  {
    id: "old",
    name: "Původní objednávka.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 900_000,
    uploadedBy: "Jana Nováková",
    uploadedAt: "2026-10-18T09:15:00Z",
    removedAt: "2026-10-19T11:00:00Z",
    removedBy: "Petr Slivka",
    removalReason: "Nahrazeno opravenou objednávkou",
  },
];
export const NOTES: RecordNote[] = [
  {
    id: "important",
    body: "Před úhradou ověřit dodání všech položek. Dodavatel potvrdil termín do 23. října.",
    author: "Jana Nováková",
    createdAt: "2026-10-18T09:15:00Z",
    pinned: true,
  },
  {
    id: "checked",
    body: "Částka souhlasí s objednávkou.",
    author: "Petr Slivka",
    createdAt: "2026-10-19T11:00:00Z",
    editedAt: "2026-10-19T11:30:00Z",
  },
];
export const DOCUMENTS = [
  { id: "one", number: "FP 2026/0142", name: "Kancelářské potřeby", files: 2, notes: 2 },
  { id: "two", number: "FP 2026/0143", name: "Dodávka materiálu", files: 0, notes: 1 },
  { id: "three", number: "FP 2026/0144", name: "Servis techniky", files: 1, notes: 0 },
];
