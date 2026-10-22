/** Rozložení kalendáře · vlastní dialog parametrů a náhled · nesmí ukládat. */
import { useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { DateField } from "../form/date-field";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { formatAmount, formatDate } from "../../../lib/format";
import { generatePaymentSchedule, type PaymentScheduleInterval, type PaymentScheduleItem, type PaymentScheduleParams } from "./payment-schedule";
import type { PaymentScheduleEditorTexts } from "./payment-schedule-editor-types";
const today = () => new Date().toISOString().slice(0, 10);
export function GenerateDialog({
  open,
  onOpenChange,
  total,
  texts: t,
  onApply,
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
    count: Math.max(1, Number(count) || 1),
    firstDueDate: firstDueDate || today(),
    interval,
    intervalDays: Number(intervalDays) || 30,
    retentionPercent: retentionMode === "percent" ? Number(retentionValue) || 0 : null,
    retentionAmount: retentionMode === "amount" ? Number(retentionValue) || 0 : null,
    retentionDueDate: retentionDueDate || null,
    installmentDescription: undefined,
    retentionDescription: t.retention,
  };
  const preview = useMemo(
    () => generatePaymentSchedule(total, params),
    [total, JSON.stringify(params)],
  ); // eslint-disable-line react-hooks/exhaustive-deps

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
            <DateField
              id="ps-first"
              value={firstDueDate}
              onChange={(v) => setFirstDueDate(v ?? "")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ps-interval">{t.interval}</Label>
            <OptionSelect
              id="ps-interval"
              allowEmpty={false}
              value={interval}
              onChange={(v) => setInterval(v as PaymentScheduleInterval)}
              options={[
                { value: "month", label: t.intervalMonth },
                { value: "quarter", label: t.intervalQuarter },
                { value: "days", label: t.intervalDays },
              ]}
            />
          </div>
          {interval === "days" ? (
            <div className="flex flex-col gap-1">
              <Label htmlFor="ps-days">{t.days}</Label>
              <DecimalInput
                id="ps-days"
                decimals={0}
                value={intervalDays}
                onChange={setIntervalDays}
              />
            </div>
          ) : (
            <div />
          )}
          <div className="flex flex-col gap-1">
            <Label htmlFor="ps-ret-mode">{t.retentionMode}</Label>
            <OptionSelect
              id="ps-ret-mode"
              allowEmpty={false}
              value={retentionMode}
              onChange={(v) => setRetentionMode(v as typeof retentionMode)}
              options={[
                { value: "none", label: t.retentionNone },
                { value: "percent", label: t.retentionPercent },
                { value: "amount", label: t.retentionAmount },
              ]}
            />
          </div>
          {retentionMode !== "none" ? (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="ps-ret-value">
                  {retentionMode === "percent" ? `${t.retentionValue} (%)` : t.retentionValue}
                </Label>
                <DecimalInput
                  id="ps-ret-value"
                  value={retentionValue}
                  onChange={setRetentionValue}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="ps-ret-date">{t.retentionDueDate}</Label>
                <DateField
                  id="ps-ret-date"
                  value={retentionDueDate}
                  onChange={(v) => setRetentionDueDate(v ?? "")}
                />
              </div>
            </>
          ) : null}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.preview}
          </p>
          <div className="max-h-56 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                {preview.map((item, i) => (
                  <tr key={i} className="border-t first:border-t-0">
                    <td className="px-2 py-1 tabular-nums">{formatDate(item.dueDate)}</td>
                    <td className="px-2 py-1">
                      {item.kind === "retention" ? t.retention : t.installment}
                    </td>
                    <td className="px-2 py-1">{item.description}</td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {formatAmount(item.amount, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button type="button" onClick={() => onApply(params, preview)}>
            {t.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
