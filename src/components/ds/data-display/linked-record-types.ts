/** Zmapované vazby · vlastní veřejné datové typy · nesmí znát doménu aplikace. */
import type { ReactNode } from "react";
import type { StatusTone } from "./status-badge";

export type LinkedRecordsMode = "list" | "flow";
/** Modifikátory kliku a požadovaný cíl; navigaci provádí aplikace. */
export interface LinkedRecordModifiers {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  target: "replace" | "adjacentPane";
}
/** Aplikace dodává popisky, měnu a již naformátovanou částku. */
export interface LinkedRecordItem {
  id: string;
  number: string;
  name?: string;
  at: string;
  icon?: ReactNode;
  amount?: string;
  currency?: string;
  status?: { label: string; tone?: StatusTone };
  relationType?: string;
  note?: string;
  current?: boolean;
  removable?: boolean;
  removeDisabledReason?: string;
}
/** Skupina v pořadí aplikace; sbalení řídí rodič. */
export interface LinkedRecordGroup {
  id: string;
  label: string;
  items: LinkedRecordItem[];
}
/** Souhrn jedné měny; žádné výpočty úhrady v DS. */
export interface SettlementRow {
  id: string;
  label: string;
  settled: string;
  total: string;
  remaining: string;
  currency: string;
  progress: number;
}
/** Uložení nové vazby aplikací. */
export interface LinkRecordValue {
  record: LinkedRecordItem;
  relationType: string;
  note: string;
}
/** Nastavení dialogu předané panelem beze změny. */
export interface LinkRecordConfig {
  candidates?: LinkedRecordItem[];
  results?: LinkedRecordItem[];
  relationTypes: { value: string; label: string }[];
  onSearch: (query: string) => Promise<LinkedRecordItem[]>;
}
