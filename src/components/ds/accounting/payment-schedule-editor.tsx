import { useMemo, useState } from "react";
import { Trash2, Unlock, Lock } from "lucide-react";

import { Button } from "../../ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { DateField } from "../form/date-field";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { amountClass, formatAmount, formatDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import {
  generatePaymentSchedule, sumPaymentSchedule,
  type PaymentScheduleInterval, type PaymentScheduleItem, type PaymentScheduleParams,
} from "./payment-schedule";

export type PaymentScheduleUser = { id: string; name: string };

export interface PaymentScheduleEditorTexts {
  dueDate: string; kind: string; amount: string; description: string; responsible: string;
  releasedDate: string; releasedBy: string; actions: string;
  installment: string; retention: string;
  total: string; unallocated: string; paid: string; remaining: string;
  add: string; remove: string; fillRest: string; generate: string; release: string; unrelease: string;
  empty: string;
  generateTitle: string; count: string; firstDueDate: string; interval: string;
  intervalMonth: string; intervalQuarter: string; intervalDays: string; days: string;
  retentionMode: string; retentionNone: string; retentionPercent: string; retentionAmount: string;
  retentionValue: string; retentionDueDate: string; preview: string; apply: string; cancel: string;
  overwriteTitle: string; overwriteText: string; overwriteConfirm: string;
  releaseTitle: string; releaseDateLabel: string; releaseConfirm: string;
  unreleaseTitle: string; unreleaseConfirm: string;
}

export const DEFAULT_PAYMENT_SCHEDULE_TEXTS: PaymentScheduleEditorTexts = {
  dueDate: "Datum platby", kind: "Typ", amount: "Částka", description: "Popis",
  responsible: "Odpovědná osoba", releasedDate: "Datum uvolnění", releasedBy: "Uvolnil", actions: "Akce",
  installment: "Splátka", retention: "Pozastávka",
  total: "Celkem", unallocated: "Zbývá rozepsat", paid: "Uhrazeno", remaining: "Zbývá",
  add: "Přidat", remove: "Smazat", fillRest: "Doplnit zbytek", generate: "Rozložit…",
  release: "Uvolnit pozastávku", unrelease: "Zrušit uvolnění",
  empty: "Platební kalendář je prázdný",
  generateTitle: "Rozložit na splátky", count: "Počet splátek", firstDueDate: "První splatnost",
  interval: "Interval", intervalMonth: "Měsíc", intervalQuarter: "Čtvrtletí", intervalDays: "Vlastní počet dní",
  days: "Počet dní", retentionMode: "Pozastávka", retentionNone: "Bez pozastávky",
  retentionPercent: "V procentech", retentionAmount: "Částkou", retentionValue: "Výše pozastávky",
  retentionDueDate: "Datum uvolnění pozastávky", preview: "Náhled", apply: "Použít", cancel: "Zrušit",
  overwriteTitle: "Přepsat platební kalendář?",
  overwriteText: "Neuvolněné položky budou nahrazeny vygenerovanými. Uvolněné pozastávky zůstanou.",
  overwriteConfirm: "Přepsat",
  releaseTitle: "Uvolnit pozastávku", releaseDateLabel: "Datum uvolnění", releaseConfirm: "Uvolnit",
  unreleaseTitle: "Zrušit uvolnění pozastávky?", unreleaseConfirm: "Zrušit uvolnění",
};

export interface PaymentScheduleEditorProps {
  items: PaymentScheduleItem[];
  onChange: (items: PaymentScheduleItem[]) => void;
  /** Částka k úhradě dokladu. */
  totalToPay: number;
  /** Uhrazeno – dodává aplikace, jen zobrazení. */
  paid?: number;
  /** Zbývá uhradit – dodává aplikace, jen zobrazení. */
  remaining?: number;
  users?: PaymentScheduleUser[];
  currencySymbol?: string;
  readOnly?: boolean;
  canRelease?: boolean;
  canUnrelease?: boolean;
  onRelease?: (itemId: string, date: string) => void;
  onUnrelease?: (itemId: string) => void;
  /** Volá se s parametry dialogu Rozložit (např. pro audit). Řádky editor vygeneruje sám. */
  onGenerate?: (params: PaymentScheduleParams) => void;
  texts?: Partial<PaymentScheduleEditorTexts>;
  className?: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const isReleased = (item: PaymentScheduleItem) => item.kind === "retention" && !!item.releasedDate;

/**
 * Platební kalendář dokladu – splátky a pozastávky. Komponenta nic neukládá;
 * aplikace uloží celé pole `items` jedním voláním.
 */
export function PaymentScheduleEditor({
  items, onChange, totalToPay, paid, remaining, users = [], currencySymbol,
  readOnly = false, canRelease = false, canUnrelease = false, onRelease, onUnrelease, onGenerate,
  texts, className,
}: PaymentScheduleEditorProps) {
  const t = { ...DEFAULT_PAYMENT_SCHEDULE_TEXTS, ...texts };
  const { confirm, confirmDialog } = useConfirmDialog();
  const [selected, setSelected] = useState<number | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [releaseIndex, setReleaseIndex] = useState<number | null>(null);
  const [releaseDate, setReleaseDate] = useState(today());

  const total = sumPaymentSchedule(items);
  const unallocated = round2(totalToPay - total);
  const userName = (id?: string | null) => users.find((u) => u.id === id)?.name ?? id ?? "";

  const patch = (index: number, values: Partial<PaymentScheduleItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...values } : item)));

  const add = () => {
    const last = items[items.length - 1];
    onChange([...items, { kind: "installment", dueDate: last?.dueDate ?? today(), amount: Math.max(0, unallocated) }]);
    setSelected(items.length);
  };
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setSelected(null);
  };
  const fillRest = () => {
    if (unallocated === 0) return;
    const index = [...items].map((item, i) => ({ item, i })).reverse()
      .find(({ item }) => item.kind === "installment" && !isReleased(item))?.i;
    if (index == null) add();
    else patch(index, { amount: round2(items[index].amount + unallocated) });
  };

  const selectedItem = selected != null ? items[selected] : undefined;

  return (
    <div className={cn("@container overflow-hidden rounded-lg border bg-card", className)}>
      <div className="zoom-filters grid-toolbar-row flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2">
        <Button type="button" size="sm" variant="outline" className="grid-toolbar-control" onClick={add} disabled={readOnly}>{t.add}</Button>
        <Button type="button" size="sm" variant="outline" className="grid-toolbar-control" onClick={() => selected != null && remove(selected)}
          disabled={readOnly || !selectedItem || isReleased(selectedItem)}>{t.remove}</Button>
        <Button type="button" size="sm" variant="outline" className="grid-toolbar-control" onClick={fillRest} disabled={readOnly || unallocated === 0}>{t.fillRest}</Button>
        <Button type="button" size="sm" variant="outline" className="grid-toolbar-control" onClick={() => setGenerateOpen(true)} disabled={readOnly}>{t.generate}</Button>
        <Button type="button" size="sm" variant="outline" className="grid-toolbar-control"
          disabled={!canRelease || !selectedItem || selectedItem.kind !== "retention" || isReleased(selectedItem)}
          onClick={() => { setReleaseDate(today()); setReleaseIndex(selected); }}>{t.release}</Button>
        <Button type="button" size="sm" variant="outline" className="grid-toolbar-control"
          disabled={!canUnrelease || !selectedItem || !isReleased(selectedItem)}
          onClick={() => selected != null && askUnrelease(selected)}>{t.unrelease}</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-40 px-2 py-2 text-left font-medium">{t.dueDate}</th>
              <th className="w-36 px-2 py-2 text-left font-medium">{t.kind}</th>
              <th className="w-40 px-2 py-2 text-right font-medium">{currencySymbol ? `${t.amount} (${currencySymbol})` : t.amount}</th>
              <th className="min-w-[14rem] px-2 py-2 text-left font-medium">{t.description}</th>
              <th className="w-48 px-2 py-2 text-left font-medium">{t.responsible}</th>
              <th className="w-28 px-2 py-2 text-left font-medium">{t.releasedDate}</th>
              <th className="w-32 px-2 py-2 text-left font-medium">{t.releasedBy}</th>
              <th className="w-20 px-2 py-2 text-center font-medium">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">{t.empty}</td></tr>
            ) : items.map((item, index) => {
              const locked = readOnly || isReleased(item);
              return (
                <tr key={item.id ?? index} data-testid="payment-row"
                  onClick={() => setSelected(index)}
                  className={cn("border-t", selected === index && "bg-primary/5", isReleased(item) && "bg-muted/40 text-muted-foreground")}>
                  <td className="px-2 py-1">
                    {locked ? formatDate(item.dueDate) : (
                      <DateField value={item.dueDate} onChange={(v) => patch(index, { dueDate: v ?? "" })} />
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {locked ? (item.kind === "retention" ? t.retention : t.installment) : (
                      <OptionSelect allowEmpty={false} value={item.kind}
                        onChange={(v) => patch(index, { kind: v as PaymentScheduleItem["kind"], responsibleUserId: v === "retention" ? item.responsibleUserId : null })}
                        options={[{ value: "installment", label: t.installment }, { value: "retention", label: t.retention }]} />
                    )}
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {locked ? <span className={amountClass(item.amount)}>{formatAmount(item.amount, 2)}</span> : (
                      <DecimalInput aria-label={t.amount} value={item.amount}
                        onChange={(v) => patch(index, { amount: v === "" ? 0 : Number(v) })} />
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {locked ? item.description : (
                      <Input aria-label={t.description} value={item.description ?? ""}
                        onChange={(e) => patch(index, { description: e.target.value })} />
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {item.kind !== "retention" ? null : locked ? userName(item.responsibleUserId) : (
                      <OptionSelect value={item.responsibleUserId ?? ""}
                        onChange={(v) => patch(index, { responsibleUserId: v || null })}
                        options={users.map((u) => ({ value: u.id, label: u.name }))} />
                    )}
                  </td>
                  <td className="px-2 py-1 tabular-nums">{item.releasedDate ? formatDate(item.releasedDate) : ""}</td>
                  <td className="px-2 py-1">{item.releasedBy ? userName(item.releasedBy) : ""}</td>
                  <td className="px-2 py-1 text-center">
                    <div className="flex justify-center gap-1">
                      {item.kind === "retention" && !isReleased(item) && canRelease ? (
                        <RowIcon label={t.release} onClick={() => { setReleaseDate(today()); setReleaseIndex(index); }}><Unlock /></RowIcon>
                      ) : null}
                      {isReleased(item) && canUnrelease ? (
                        <RowIcon label={t.unrelease} onClick={() => askUnrelease(index)}><Lock /></RowIcon>
                      ) : null}
                      {!locked ? <RowIcon label={t.remove} onClick={() => remove(index)}><Trash2 /></RowIcon> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t bg-muted/60 font-medium">
            <tr>
              <td colSpan={2} className="px-2 py-2">{t.total}</td>
              <td className="px-2 py-2 text-right tabular-nums" data-testid="payment-total">{formatAmount(total, 2)}</td>
              <td colSpan={5} className="px-2 py-2">
                <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 tabular-nums">
                  <span>{t.unallocated}: <span data-testid="payment-unallocated" className={unallocated !== 0 ? "text-destructive" : undefined}>{formatAmount(unallocated, 2)}</span></span>
                  {paid != null ? <span>{t.paid}: {formatAmount(paid, 2)}</span> : null}
                  {remaining != null ? <span>{t.remaining}: <span className={amountClass(remaining)}>{formatAmount(remaining, 2)}</span></span> : null}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <GenerateDialog open={generateOpen} onOpenChange={setGenerateOpen} total={totalToPay} texts={t}
        onApply={(params, generated) => {
          const released = items.filter(isReleased);
          const apply = () => {
            onGenerate?.(params);
            onChange([...generated, ...released]);
            setGenerateOpen(false);
            setSelected(null);
          };
          if (items.some((item) => !isReleased(item))) {
            confirm({ title: t.overwriteTitle, description: t.overwriteText, confirmLabel: t.overwriteConfirm, destructive: true, onConfirm: apply });
          } else apply();
        }} />

      <Dialog open={releaseIndex != null} onOpenChange={(open) => !open && setReleaseIndex(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{t.releaseTitle}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-1">
            <Label htmlFor="release-date">{t.releaseDateLabel}</Label>
            <DateField id="release-date" value={releaseDate} onChange={(v) => setReleaseDate(v ?? "")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReleaseIndex(null)}>{t.cancel}</Button>
            <Button type="button" disabled={!releaseDate} onClick={() => {
              if (releaseIndex == null) return;
              const item = items[releaseIndex];
              if (item.id) onRelease?.(item.id, releaseDate);
              else patch(releaseIndex, { releasedDate: releaseDate });
              setReleaseIndex(null);
            }}>{t.releaseConfirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );

  function askUnrelease(index: number) {
    confirm({
      title: t.unreleaseTitle, confirmLabel: t.unreleaseConfirm,
      onConfirm: () => {
        const item = items[index];
        if (item.id) onUnrelease?.(item.id);
        else patch(index, { releasedDate: null, releasedBy: null, releasedAt: null });
      },
    });
  }
}

function RowIcon({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" size="icon" variant="ghost" aria-label={label} className="size-7 [&_svg]:size-4"
          onClick={(e) => { e.stopPropagation(); onClick(); }}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function GenerateDialog({
  open, onOpenChange, total, texts: t, onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  texts: PaymentScheduleEditorTexts;
  onApply: (params: PaymentScheduleParams, items: PaymentScheduleItem[]) => void;
}) {
  const [count, setCount] = useState("3");
  const [firstDueDate, setFirstDueDate] = useState(today());
  const [interval, setInterval] = useState<PaymentScheduleInterval>("month");
  const [intervalDays, setIntervalDays] = useState("30");
  const [retentionMode, setRetentionMode] = useState<"none" | "percent" | "amount">("none");
  const [retentionValue, setRetentionValue] = useState("10");
  const [retentionDueDate, setRetentionDueDate] = useState("");

  const params: PaymentScheduleParams = {
    count: Math.max(1, Number(count) || 1), firstDueDate: firstDueDate || today(), interval,
    intervalDays: Number(intervalDays) || 30,
    retentionPercent: retentionMode === "percent" ? Number(retentionValue) || 0 : null,
    retentionAmount: retentionMode === "amount" ? Number(retentionValue) || 0 : null,
    retentionDueDate: retentionDueDate || null,
    installmentDescription: undefined,
    retentionDescription: t.retention,
  };
  const preview = useMemo(() => generatePaymentSchedule(total, params), [total, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.generateTitle}</DialogTitle>
          <DialogDescription>{`${t.total}: ${formatAmount(total, 2)}`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ps-count">{t.count}</Label>
            <DecimalInput id="ps-count" decimals={0} value={count} onChange={setCount} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ps-first">{t.firstDueDate}</Label>
            <DateField id="ps-first" value={firstDueDate} onChange={(v) => setFirstDueDate(v ?? "")} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ps-interval">{t.interval}</Label>
            <OptionSelect id="ps-interval" allowEmpty={false} value={interval} onChange={(v) => setInterval(v as PaymentScheduleInterval)}
              options={[{ value: "month", label: t.intervalMonth }, { value: "quarter", label: t.intervalQuarter }, { value: "days", label: t.intervalDays }]} />
          </div>
          {interval === "days" ? (
            <div className="flex flex-col gap-1">
              <Label htmlFor="ps-days">{t.days}</Label>
              <DecimalInput id="ps-days" decimals={0} value={intervalDays} onChange={setIntervalDays} />
            </div>
          ) : <div />}
          <div className="flex flex-col gap-1">
            <Label htmlFor="ps-ret-mode">{t.retentionMode}</Label>
            <OptionSelect id="ps-ret-mode" allowEmpty={false} value={retentionMode} onChange={(v) => setRetentionMode(v as typeof retentionMode)}
              options={[{ value: "none", label: t.retentionNone }, { value: "percent", label: t.retentionPercent }, { value: "amount", label: t.retentionAmount }]} />
          </div>
          {retentionMode !== "none" ? (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="ps-ret-value">{retentionMode === "percent" ? `${t.retentionValue} (%)` : t.retentionValue}</Label>
                <DecimalInput id="ps-ret-value" value={retentionValue} onChange={setRetentionValue} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="ps-ret-date">{t.retentionDueDate}</Label>
                <DateField id="ps-ret-date" value={retentionDueDate} onChange={(v) => setRetentionDueDate(v ?? "")} />
              </div>
            </>
          ) : null}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.preview}</p>
          <div className="max-h-56 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                {preview.map((item, i) => (
                  <tr key={i} className="border-t first:border-t-0">
                    <td className="px-2 py-1 tabular-nums">{formatDate(item.dueDate)}</td>
                    <td className="px-2 py-1">{item.kind === "retention" ? t.retention : t.installment}</td>
                    <td className="px-2 py-1">{item.description}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{formatAmount(item.amount, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button type="button" onClick={() => onApply(params, preview)}>{t.apply}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
