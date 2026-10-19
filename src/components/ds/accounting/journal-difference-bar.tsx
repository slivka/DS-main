/**
 * Patička editoru řádků: Součet · Zaokrouhlení · Rozdíl (2.109.0).
 * Vlastní: zobrazení součtu, zaokrouhlení a rozdílu proti zadané částce a nabídku dorovnání
 *   (Dorovnat DPH / Dorovnat základ / Zaokrouhlení v limitu) s výchozí zvýrazněnou volbou.
 * Nesmí: počítat součty ani daň – hodnoty dodávají useJournalTotals a useJournalVatGroups.
 */
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { AmountDifference } from "./amount-difference";
import { useJournalEditor } from "./journal-editor-context";
import { roundJournalAmount } from "./journal-lines-model";
import { type JournalDifferenceAction, type VatGroup } from "./journal-vat-groups";

/** Položka nabídky Rozdílu. */
interface DifferenceItem {
  key: string;
  action: JournalDifferenceAction;
  label: string;
  run: () => void;
  disabled: boolean;
}

/** Jedna hodnota patičky. */
function FooterValue({ label, value, slot }: { label: string; value: string; slot: string }) {
  return (
    <span data-slot={slot} className="inline-flex items-baseline gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </span>
  );
}

/** Patička Součet · Zaokrouhlení · Rozdíl s nabídkou dorovnání. */
export function JournalDifferenceBar() {
  const { editor } = useJournalEditor();
  const { totals, t, documentMark, vatGroups, foreign } = editor;
  const texts = t.vatGroups;
  const { props } = editor;
  const roundingValue = totals.roundingValue;
  const sum = foreign
    ? totals.documentLinesTotal
    : roundJournalAmount(totals.total - roundingValue);
  const totalHidden =
    editor.vatOn && !editor.layout.visibleColumns.some((column) => column.id === "grossAmount");
  const difference = totals.showRemaining ? totals.difference : 0;
  const { actions, preferred } = vatGroups.difference(difference, roundingValue);
  const groups = vatGroups.vatGroups.groups.filter((group) => group.rate > 0);
  const writeRounding = props.onRoundingChange ?? props.rounding?.onChange;
  const balanceVat = (group: VatGroup) => vatGroups.setOverride(group, group.tax + difference);
  const balanceBase = () => vatGroups.balanceBase(difference);
  const items = actions.flatMap((action): DifferenceItem[] => {
    if (action === "vat")
      return groups.map((group) => ({
        key: `vat-${group.key}`,
        action,
        label:
          groups.length > 1
            ? texts.balanceVatGroup.replace("{group}", `${group.code} ${group.rate} %`)
            : texts.balanceVat,
        run: () => void balanceVat(group),
        disabled: !vatGroups.canOverride,
      }));
    if (action === "base")
      return [{ key: "base", action, label: texts.balanceBase, run: balanceBase, disabled: false }];
    return [
      {
        key: "rounding",
        action,
        label: texts.balanceRounding,
        run: () => void writeRounding?.(roundJournalAmount(roundingValue + difference)),
        disabled: !writeRounding,
      },
    ];
  });
  const ordered = [
    ...items.filter((item) => item.action === preferred),
    ...items.filter((item) => item.action !== preferred),
  ];
  return (
    <div
      data-slot="journal-difference-bar"
      data-limit={props.roundingLimit}
      className="flex min-h-[var(--control-h)] flex-wrap items-center justify-end gap-x-4 gap-y-1 border-t bg-muted/40 px-3 py-1 text-sm"
    >
      {/* Součet je řádek mřížky (JournalFooter). Jen když celkovou částku žádný sloupec
          neukazuje (skrytý sloupec s DPH), doplní se tady – pořád jediná hodnota Součtu. */}
      {totalHidden ? (
        <FooterValue
          slot="journal-footer-sum-total"
          label={texts.sum}
          value={`${formatAmount(sum, 2)} ${documentMark}`}
        />
      ) : null}
      <FooterValue
        slot="journal-footer-rounding"
        label={props.rounding?.label ?? texts.rounding}
        value={`${formatAmount(roundingValue, 2)} ${documentMark}`}
      />
      {difference !== 0 ? (
        <span className="inline-flex items-center gap-2">
          <AmountDifference
            data-slot="journal-lines-remaining"
            value={difference}
            label={t.remaining}
            overLabel={t.exceeded}
            currencySymbol={documentMark}
          />
          {ordered.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-slot="journal-difference-actions"
                  data-preferred={preferred ?? undefined}
                  className="h-[var(--control-h)]"
                >
                  {texts.balance}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ordered.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    data-action={item.action}
                    data-preferred={item.action === preferred || undefined}
                    disabled={item.disabled}
                    className={cn(item.action === preferred && "font-semibold")}
                    onSelect={item.run}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : props.roundingLimit !== undefined ? (
            <span className="text-muted-foreground" data-slot="journal-difference-no-action">
              {texts.noAction}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
