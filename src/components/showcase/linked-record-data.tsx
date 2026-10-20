/** Výhradně ukázková data vazeb, formátování a doména zůstávají v aplikaci. */
import { Banknote, FileText, Landmark, Link, Package } from "lucide-react";
import type { LinkedRecordGroup, LinkedRecordItem, SettlementRow } from "../ds";
export const LINK_TYPES = [
  { value: "manual", label: "Ruční vazba" },
  { value: "payment", label: "Úhrada" },
  { value: "asset", label: "Majetek" },
];
export const LINK_CANDIDATES: LinkedRecordItem[] = [
  {
    id: "candidate",
    number: "ID 2026/0099",
    name: "Slivka – ruční vyrovnání",
    at: "2026-10-20",
    amount: "1 000,00",
    currency: "Kč",
    icon: <Link />,
    status: { label: "Zařazen", tone: "info" },
    removable: true,
  },
  {
    id: "candidate2",
    number: "BA 2026/0088",
    name: "Slivka – bankovní úhrada",
    at: "2026-10-21",
    amount: "4 100,00",
    currency: "Kč",
    icon: <Landmark />,
    removable: true,
  },
];
export const LINK_SETTLEMENT: SettlementRow[] = [
  {
    id: "cz",
    label: "Uhrazeno",
    settled: "8 000,00",
    total: "12 100,00",
    remaining: "4 100,00",
    currency: "Kč",
    progress: 66.12,
  },
];
export const LINK_GROUPS: LinkedRecordGroup[] = [
  {
    id: "payments",
    label: "Úhrady",
    items: [
      {
        id: "p1",
        number: "BA 2026/0041",
        name: "První úhrada",
        at: "2026-10-15",
        amount: "5 000,00",
        currency: "Kč",
        icon: <Landmark />,
        status: { label: "Zaúčtován", tone: "success" },
        removable: false,
        removeDisabledReason: "Úhrada je zaúčtovaná. Vazbu nelze odebrat.",
      },
      {
        id: "p2",
        number: "PO 2026/0022",
        name: "Druhá úhrada",
        at: "2026-10-18",
        amount: "3 000,00",
        currency: "Kč",
        icon: <Banknote />,
        status: { label: "Zařazen", tone: "info" },
        removable: true,
      },
    ],
  },
  {
    id: "advance",
    label: "Zálohy",
    items: [
      {
        id: "a1",
        number: "ZFP 2026/0011",
        name: "Záloha na servis",
        at: "2026-10-10",
        amount: "2 000,00",
        currency: "Kč",
        icon: <FileText />,
        relationType: "Zúčtování zálohy",
        removable: false,
        removeDisabledReason: "Záloha je již zúčtovaná.",
      },
    ],
  },
  {
    id: "adjustment",
    label: "Vyrovnání",
    items: [
      {
        id: "kr",
        number: "KR 2026/0003",
        name: "Kurzový rozdíl",
        at: "2026-10-19",
        amount: "−25,00",
        currency: "Kč",
        icon: <FileText />,
        removable: false,
      },
    ],
  },
  {
    id: "current",
    label: "Aktuální doklad",
    items: [
      {
        id: "invoice",
        number: "FP 2026/0142",
        name: "Servis zařízení a pravidelná údržba",
        at: "2026-10-14",
        amount: "12 100,00",
        currency: "Kč",
        icon: <FileText />,
        current: true,
        status: { label: "Zařazen", tone: "info" },
      },
    ],
  },
  { id: "manual", label: "Ruční vazby", items: [] },
];
export const ASSET_GROUPS: LinkedRecordGroup[] = [
  {
    id: "asset",
    label: "Majetek",
    items: [
      {
        id: "asset1",
        number: "MA 0042",
        name: "Servisní zařízení",
        at: "2026-10-10",
        icon: <Package />,
        note: "Pořízení z přijaté faktury",
        removable: true,
      },
    ],
  },
  {
    id: "cancel",
    label: "Storno",
    items: [
      {
        id: "cancel1",
        number: "FP 2026/0143",
        name: "Storno původní faktury",
        at: "2026-10-20",
        amount: "−12 100,00",
        currency: "Kč",
        icon: <FileText />,
        status: { label: "Stornován", tone: "danger" },
        removable: false,
      },
    ],
  },
];
