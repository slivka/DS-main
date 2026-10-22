/** Platební kalendář · vlastní řádky a akce · nesmí persistovat data APP. */
import { useState } from "react";
import { Trash2, Unlock, Lock } from "lucide-react";

import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { roundHalfAwayFromZero } from "../../../lib/decimal-round";
import {
  sumPaymentSchedule,
  type PaymentScheduleItem,
} from "./payment-schedule";

const today = () => new Date().toISOString().slice(0, 10);
/** Zaokrouhlení polovinou od nuly jako DB. */
const round2 = (v: number) => roundHalfAwayFromZero(v, 2);
const isReleased = (item: PaymentScheduleItem) => item.kind === "retention" && !!item.releasedDate;

/**
 * Platební kalendář dokladu – splátky a pozastávky. Komponenta nic neukládá;
 * aplikace uloží celé pole `items` jedním voláním.
 */
import { DEFAULT_PAYMENT_SCHEDULE_TEXTS, type PaymentScheduleEditorProps } from "./payment-schedule-editor-types";
export { DEFAULT_PAYMENT_SCHEDULE_TEXTS } from "./payment-schedule-editor-types";
export type { PaymentScheduleEditorProps, PaymentScheduleEditorTexts, PaymentScheduleUser } from "./payment-schedule-editor-types";
export type { PaymentScheduleSaveAction } from "./payment-schedule-toolbar";
import { PaymentScheduleToolbar } from "./payment-schedule-toolbar";
import { GenerateDialog } from "./payment-schedule-generate-dialog";
import { useGridZoomContext } from "../grid/grid-zoom";

export function PaymentScheduleEditor({
  items,
  onChange,
  totalToPay,
  paid,
  remaining,
  users = [],
  currencySymbol,
  readOnly = false,
  canRelease = false,
  canUnrelease = false,
  onRelease,
  onUnrelease,
  onGenerate,
  texts,
  zoom: zoomProp,
  saveAction,
  className,
}: PaymentScheduleEditorProps) {
  const t = { ...DEFAULT_PAYMENT_SCHEDULE_TEXTS, ...texts };
  const gridZoom = useGridZoomContext();
  const zoom = zoomProp ?? gridZoom?.zoom ?? 1;
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
    onChange([
      ...items,
      { kind: "installment", dueDate: last?.dueDate ?? today(), amount: Math.max(0, unallocated) },
    ]);
    setSelected(items.length);
  };
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setSelected(null);
  };
  const fillRest = () => {
    if (unallocated === 0) return;
    const index = [...items]
      .map((item, i) => ({ item, i }))
      .reverse()
      .find(({ item }) => item.kind === "installment" && !isReleased(item))?.i;
    if (index == null) add();
    else patch(index, { amount: round2(items[index].amount + unallocated) });
  };

  const selectedItem = selected != null ? items[selected] : undefined;

  return (
    <div className={cn("@container overflow-hidden rounded-lg border bg-card", className)}>
      <PaymentScheduleToolbar
        zoom={zoom}
        density={gridZoom?.density ?? "normal"}
        addLabel={t.add}
        onAdd={add}
        readOnly={readOnly}
        saveAction={saveAction}
        actions={[
          { label: t.remove, disabled: readOnly || !selectedItem || isReleased(selectedItem), onSelect: () => { if (selected != null) remove(selected); } },
          { label: t.fillRest, disabled: readOnly || unallocated === 0, onSelect: fillRest },
          { label: t.generate, disabled: readOnly, onSelect: () => setGenerateOpen(true) },
          { label: t.release, disabled: !canRelease || !selectedItem || selectedItem.kind !== "retention" || isReleased(selectedItem), onSelect: () => { setReleaseDate(today()); setReleaseIndex(selected); } },
          { label: t.unrelease, disabled: !canUnrelease || !selectedItem || !isReleased(selectedItem), onSelect: () => { if (selected != null) askUnrelease(selected); } },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-40 px-2 py-2 text-left font-medium">{t.dueDate}</th>
              <th className="w-36 px-2 py-2 text-left font-medium">{t.kind}</th>
              <th className="w-40 px-2 py-2 text-right font-medium">
                {currencySymbol ? `${t.amount} (${currencySymbol})` : t.amount}
              </th>
              <th className="min-w-[14rem] px-2 py-2 text-left font-medium">{t.description}</th>
              <th className="w-48 px-2 py-2 text-left font-medium">{t.responsible}</th>
              <th className="w-28 px-2 py-2 text-left font-medium">{t.releasedDate}</th>
              <th className="w-32 px-2 py-2 text-left font-medium">{t.releasedBy}</th>
              <th className="w-20 px-2 py-2 text-center font-medium">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                  {t.empty}
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const locked = readOnly || isReleased(item);
                return (
                  <tr
                    key={item.id ?? index}
                    data-testid="payment-row"
                    onClick={() => setSelected(index)}
                    className={cn(
                      "border-t",
                      selected === index && "bg-primary/5",
                      isReleased(item) && "bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <td className="px-2 py-1">
                      {locked ? (
                        formatDate(item.dueDate)
                      ) : (
                        <DateField
                          value={item.dueDate}
                          onChange={(v) => patch(index, { dueDate: v ?? "" })}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {locked ? (
                        item.kind === "retention" ? (
                          t.retention
                        ) : (
                          t.installment
                        )
                      ) : (
                        <OptionSelect
                          allowEmpty={false}
                          value={item.kind}
                          onChange={(v) =>
                            patch(index, {
                              kind: v as PaymentScheduleItem["kind"],
                              responsibleUserId: v === "retention" ? item.responsibleUserId : null,
                            })
                          }
                          options={[
                            { value: "installment", label: t.installment },
                            { value: "retention", label: t.retention },
                          ]}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {locked ? (
                        <span className={amountClass(item.amount)}>
                          {formatAmount(item.amount, 2)}
                        </span>
                      ) : (
                        <DecimalInput
                          aria-label={t.amount}
                          value={item.amount}
                          onChange={(v) => patch(index, { amount: v === "" ? 0 : Number(v) })}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {locked ? (
                        item.description
                      ) : (
                        <Input
                          aria-label={t.description}
                          value={item.description ?? ""}
                          onChange={(e) => patch(index, { description: e.target.value })}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {item.kind !== "retention" ? null : locked ? (
                        userName(item.responsibleUserId)
                      ) : (
                        <OptionSelect
                          value={item.responsibleUserId ?? ""}
                          onChange={(v) => patch(index, { responsibleUserId: v || null })}
                          options={users.map((u) => ({ value: u.id, label: u.name }))}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1 tabular-nums">
                      {item.releasedDate ? formatDate(item.releasedDate) : ""}
                    </td>
                    <td className="px-2 py-1">
                      {item.releasedBy ? userName(item.releasedBy) : ""}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <div className="flex justify-center gap-1">
                        {item.kind === "retention" && !isReleased(item) && canRelease ? (
                          <RowIcon
                            label={t.release}
                            onClick={() => {
                              setReleaseDate(today());
                              setReleaseIndex(index);
                            }}
                          >
                            <Unlock />
                          </RowIcon>
                        ) : null}
                        {isReleased(item) && canUnrelease ? (
                          <RowIcon label={t.unrelease} onClick={() => askUnrelease(index)}>
                            <Lock />
                          </RowIcon>
                        ) : null}
                        {!locked ? (
                          <RowIcon label={t.remove} onClick={() => remove(index)}>
                            <Trash2 />
                          </RowIcon>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="border-t bg-muted/60 font-medium">
            <tr>
              <td colSpan={2} className="px-2 py-2">
                {t.total}
              </td>
              <td className="px-2 py-2 text-right tabular-nums" data-testid="payment-total">
                {formatAmount(total, 2)}
              </td>
              <td colSpan={5} className="px-2 py-2">
                <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 tabular-nums">
                  <span>
                    {t.unallocated}:{" "}
                    <span
                      data-testid="payment-unallocated"
                      className={unallocated !== 0 ? "text-destructive" : undefined}
                    >
                      {formatAmount(unallocated, 2)}
                    </span>
                  </span>
                  {paid != null ? (
                    <span>
                      {t.paid}: {formatAmount(paid, 2)}
                    </span>
                  ) : null}
                  {remaining != null ? (
                    <span>
                      {t.remaining}:{" "}
                      <span className={amountClass(remaining)}>{formatAmount(remaining, 2)}</span>
                    </span>
                  ) : null}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <GenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        total={totalToPay}
        texts={t}
        onApply={(params, generated) => {
          const released = items.filter(isReleased);
          const apply = () => {
            onGenerate?.(params);
            onChange([...generated, ...released]);
            setGenerateOpen(false);
            setSelected(null);
          };
          if (items.some((item) => !isReleased(item))) {
            confirm({
              title: t.overwriteTitle,
              description: t.overwriteText,
              confirmLabel: t.overwriteConfirm,
              destructive: true,
              onConfirm: apply,
            });
          } else apply();
        }}
      />

      <Dialog open={releaseIndex != null} onOpenChange={(open) => !open && setReleaseIndex(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.releaseTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <Label htmlFor="release-date">{t.releaseDateLabel}</Label>
            <DateField
              id="release-date"
              value={releaseDate}
              onChange={(v) => setReleaseDate(v ?? "")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReleaseIndex(null)}>
              {t.cancel}
            </Button>
            <Button
              type="button"
              disabled={!releaseDate}
              onClick={() => {
                if (releaseIndex == null) return;
                const item = items[releaseIndex];
                if (item.id) onRelease?.(item.id, releaseDate);
                else patch(releaseIndex, { releasedDate: releaseDate });
                setReleaseIndex(null);
              }}
            >
              {t.releaseConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );

  function askUnrelease(index: number) {
    confirm({
      title: t.unreleaseTitle,
      confirmLabel: t.unreleaseConfirm,
      onConfirm: () => {
        const item = items[index];
        if (item.id) onUnrelease?.(item.id);
        else patch(index, { releasedDate: null, releasedBy: null, releasedAt: null });
      },
    });
  }
}

function RowIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={label}
          className="size-7 [&_svg]:size-4"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

