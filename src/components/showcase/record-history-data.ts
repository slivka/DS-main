/** Ukázková historie dokladu · vlastní zmapované události demo · nesmí jít do aplikací. */
import type { HistoryEvent } from "../ds";

/** Pevné „teď“ ukázky – hydratace serveru a klienta musí vykreslit stejný text. */
export const DEMO_NOW = new Date("2026-10-20T12:00:00");

const at = (daysAgo: number, time: string) => {
  const day = new Date(DEMO_NOW.getTime() - daysAgo * 86_400_000).toISOString().slice(0, 10);
  return new Date(`${day}T${time}:00`).toISOString();
};

/** Přibližně 15 událostí přijaté faktury. */
export const DEMO_HISTORY: HistoryEvent[] = [
  {
    id: "1",
    at: at(6, "08:12"),
    author: "Jana Nováková",
    kind: "status",
    title: "Vytvořeno",
    statusChange: { to: "Koncept", tone: "draft" },
  },
  {
    id: "2",
    at: at(6, "08:15"),
    author: "Jana Nováková",
    kind: "attachment",
    title: "Přidána příloha Faktura-2026-0142.pdf",
  },
  {
    id: "3",
    at: at(5, "09:40"),
    author: "Jana Nováková",
    kind: "status",
    title: "Zařazeno – 5 polí",
    statusChange: { from: "Koncept", to: "Zařazen", tone: "info" },
    changes: [
      {
        label: "Partner",
        before: "",
        after: "Kancelářské potřeby Brno s.r.o., Masarykova 12, 602 00 Brno",
      },
      { label: "Datum vystavení", before: "", after: "14.10.2026" },
      { label: "Splatnost", before: "", after: "28.10.2026" },
      { label: "Variabilní symbol", before: "", after: "20260142" },
      { label: "Kniha", before: "Nezařazeno", after: "Faktury přijaté" },
    ],
  },
  {
    id: "4",
    at: at(5, "10:02"),
    author: "Petr Slivka",
    kind: "note",
    title: "Přidána poznámka",
    note: "Ověřit u dodavatele cenu tonerů.",
  },
  {
    id: "5",
    at: at(4, "11:20"),
    author: "Petr Slivka",
    kind: "change",
    title: "Upraveny řádky – 3 změny",
    lines: [
      { label: "řádek 3", kind: "added", summary: "Servis 1 500,00" },
      { label: "řádek 2", kind: "removed" },
      {
        label: "Řádek 1",
        kind: "changed",
        changes: [{ label: "Účet MD", before: "518", after: "548" }],
      },
    ],
    auto: [
      { label: "Základ 21 %", before: "10 000,00", after: "11 500,00" },
      { label: "DPH 21 %", before: "2 100,00", after: "2 415,00" },
      { label: "Celkem", before: "12 100,00", after: "13 915,00" },
    ],
  },
  {
    id: "6",
    at: at(4, "11:21"),
    kind: "change",
    title: "Automatický přepočet DPH",
    auto: [{ label: "Zaokrouhlení", before: "0,00", after: "0,40" }],
  },
  {
    id: "7",
    at: at(3, "13:05"),
    author: "Jana Nováková",
    kind: "link",
    title: "Spárováno s platbou BV 2026/0088",
  },
  {
    id: "8",
    at: at(3, "13:30"),
    author: "Jana Nováková",
    kind: "change",
    title: "Upraveno – 1 pole",
    changes: [
      {
        label: "Popis",
        before: "Kancelářské potřeby",
        after: "Kancelářské potřeby a servis tiskáren pro pobočku Brno – říjen 2026",
      },
    ],
  },
  {
    id: "9",
    at: at(2, "08:00"),
    author: "Petr Slivka",
    kind: "status",
    title: "Schváleno",
    statusChange: { to: "Schválen", tone: "success" },
  },
  {
    id: "10",
    at: at(2, "08:30"),
    author: "Petr Slivka",
    kind: "status",
    title: "Zaúčtováno",
    statusChange: { from: "Zařazen", to: "Zaúčtován", tone: "success" },
  },
  {
    id: "11",
    at: at(1, "09:10"),
    author: "Jana Nováková",
    kind: "attachment",
    title: "Odebrána příloha dodaci-list.jpg",
  },
  {
    id: "12",
    at: at(1, "15:45"),
    author: "Jana Nováková",
    kind: "note",
    title: "Upravena poznámka",
    note: "Cena tonerů ověřena, odpovídá objednávce.",
  },
  {
    id: "13",
    at: at(0, "08:05"),
    author: "Petr Slivka",
    kind: "link",
    title: "Zrušeno spárování s platbou BV 2026/0088",
  },
  {
    id: "14",
    at: at(0, "08:10"),
    author: "Petr Slivka",
    kind: "status",
    title: "Stornováno",
    statusChange: { from: "Zaúčtován", to: "Stornován", tone: "danger" },
    changes: [{ label: "Důvod storna", after: "Duplicitní doklad" }],
  },
  {
    id: "15",
    at: at(0, "08:11"),
    kind: "change",
    title: "Automatický přepočet salda",
    auto: [{ label: "Saldo partnera", before: "13 915,00", after: "0,00" }],
  },
];
