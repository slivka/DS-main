/**
 * Dialog pravidla účtování banky (I5).
 * Vlastní: formulář podmínek (A ZÁROVEŇ) a výsledku s náhledem použití.
 * Nesmí: vyhodnocovat pravidlo – počet náhledu dodává aplikace.
 */
import { RecordDialog, Field, FieldGrid } from "../layout/RecordDialog";
import { OptionSelect } from "../form/option-select";
import { ChipMultiSelect } from "../form/chip-multi-select";
import { CheckboxField } from "../form/checkbox-field";
import { DecimalInput } from "../form/decimal-input";
import { Input } from "../../ui/input";
import { NoticeBar } from "../feedback/notice-bar";
import { SectionHeading } from "../layout/section-heading";
import { AccountSelect, type AccountOption } from "../accounting/account-select";
import { PartnerSelect } from "../accounting/partner-select";
import { useDsTexts } from "../../../ds-texts";
import type { BankRule } from "./bank-types";

/** Kniha pro výběr v podmínkách. */
export interface BankRuleBookOption {
  /** Stabilní klíč. */
  id: string;
  /** Název knihy. */
  name: string;
}

/** Props dialogu pravidla. */
export interface BankRuleDialogProps {
  /** Dialog je otevřený. */
  open: boolean;
  /** Změna otevření. */
  onOpenChange: (open: boolean) => void;
  /** Nové pravidlo (jinak úprava). */
  isNew?: boolean;
  /** Hodnota pravidla (bez id/order/active). */
  value: Pick<BankRule, "name" | "conditions" | "result">;
  /** Změna hodnoty. */
  onChange: (value: Pick<BankRule, "name" | "conditions" | "result">) => void;
  /** Uložení; dialog zavírá aplikace po úspěchu. */
  onSubmit: () => void;
  /** Účty pro výsledek. */
  accounts: AccountOption[];
  /** Partneři pro výsledek. */
  partners: { id: string; name: string; ico?: string; active?: boolean }[];
  /** Knihy pro podmínku; prázdný výběr = všechny. */
  books: BankRuleBookOption[];
  /** Výběr kategorie ve výsledku (slot). */
  categorySelect?: React.ReactNode;
  /** Výběr dimenzí ve výsledku (slot). */
  dimensionSelect?: React.ReactNode;
  /** Počet pohybů náhledu za posledních 90 dní (APP). */
  previewCount?: number | null;
  /** Probíhá ukládání. */
  busy?: boolean;
  /** Jen pro čtení. */
  readOnly?: boolean;
}

/** Dialog pravidla: podmínky, výsledek, náhled použití. */
export function BankRuleDialog({
  open,
  onOpenChange,
  isNew,
  value,
  onChange,
  onSubmit,
  accounts,
  partners,
  books,
  categorySelect,
  dimensionSelect,
  previewCount,
  busy,
  readOnly,
}: BankRuleDialogProps) {
  const t = useDsTexts().bankRules;
  const c = value.conditions;
  const r = value.result;
  const patchConditions = (patch: Partial<typeof c>) =>
    onChange({ ...value, conditions: { ...c, ...patch } });
  const patchResult = (patch: Partial<typeof r>) =>
    onChange({ ...value, result: { ...r, ...patch } });

  return (
    <RecordDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? t.dialogNew : t.dialogEdit}
      size="lg"
      onSubmit={readOnly ? undefined : onSubmit}
      busy={busy}
      readOnly={readOnly}
    >
      <div className="space-y-4">
        <FieldGrid cols={12}>
          <Field span={12} label={t.name}>
            <Input
              value={value.name}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
            />
          </Field>
        </FieldGrid>
        <SectionHeading>{t.conditionsSection}</SectionHeading>
        <p className="text-xs text-muted-foreground">{t.conditionsHint}</p>
        <FieldGrid cols={12}>
          <Field span={4} label={t.direction}>
            <OptionSelect
              value={c.direction ?? ""}
              onChange={(direction) =>
                patchConditions({ direction: (direction || null) as "in" | "out" | null })
              }
              options={[
                { value: "in", label: useDsTexts().bankReconcile.directionIn },
                { value: "out", label: useDsTexts().bankReconcile.directionOut },
              ]}
              placeholderValueLabel={t.directionBoth}
            />
          </Field>
          <Field span={4} label={t.counterAccount}>
            <Input
              value={c.counterAccount ?? ""}
              onChange={(event) => patchConditions({ counterAccount: event.target.value })}
            />
          </Field>
          <Field span={4} label={t.movementKind}>
            <OptionSelect
              value={c.movementKind ?? ""}
              onChange={(kind) =>
                patchConditions({
                  movementKind: (kind || null) as NonNullable<typeof c.movementKind> | null,
                })
              }
              options={[
                { value: "normal", label: t.kindNormal },
                { value: "fee", label: t.kindFee },
                { value: "interest", label: t.kindInterest },
                { value: "card", label: t.kindCard },
                { value: "reversal", label: t.kindReversal },
              ]}
            />
          </Field>
          <Field span={4} label={t.vs}>
            <Input
              value={c.vs ?? ""}
              onChange={(event) => patchConditions({ vs: event.target.value })}
            />
          </Field>
          <Field span={4} label={t.ks}>
            <Input
              value={c.ks ?? ""}
              onChange={(event) => patchConditions({ ks: event.target.value })}
            />
          </Field>
          <Field span={4} label={t.ss}>
            <Input
              value={c.ss ?? ""}
              onChange={(event) => patchConditions({ ss: event.target.value })}
            />
          </Field>
          <Field span={6} label={t.textContains}>
            <Input
              value={c.textContains ?? ""}
              onChange={(event) => patchConditions({ textContains: event.target.value })}
            />
          </Field>
          <Field span={3} label={t.amountFrom}>
            <DecimalInput
              value={c.amountFrom ?? null}
              onChange={(amountFrom) => patchConditions({ amountFrom })}
            />
          </Field>
          <Field span={3} label={t.amountTo}>
            <DecimalInput
              value={c.amountTo ?? null}
              onChange={(amountTo) => patchConditions({ amountTo })}
            />
          </Field>
          <Field span={12} label={t.booksField}>
            <ChipMultiSelect
              values={[...(c.bookIds ?? [])]}
              onChange={(bookIds) => patchConditions({ bookIds })}
              options={books.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Field>
        </FieldGrid>
        <SectionHeading>{t.resultSection}</SectionHeading>
        <FieldGrid cols={12}>
          <Field span={6} label={t.account}>
            <AccountSelect
              accounts={accounts}
              value={r.accountCode}
              onChange={(accountCode) => patchResult({ accountCode })}
            />
          </Field>
          <Field span={6} label={t.partner}>
            <PartnerSelect
              partners={partners}
              value={r.partnerId ?? null}
              onChange={(partnerId) => patchResult({ partnerId })}
            />
          </Field>
          {categorySelect ? (
            <Field span={6} label={t.category}>
              {categorySelect}
            </Field>
          ) : null}
          {dimensionSelect ? (
            <Field span={6} label={t.dimensions}>
              {dimensionSelect}
            </Field>
          ) : null}
          <Field span={12} label={t.description} hint={t.placeholdersHint}>
            <Input
              value={r.description ?? ""}
              onChange={(event) => patchResult({ description: event.target.value })}
            />
          </Field>
          <Field span={6} label={t.certaintyField}>
            <OptionSelect
              value={r.certainty}
              onChange={(certainty) =>
                patchResult({ certainty: certainty as "certain" | "suggestion" })
              }
              options={[
                { value: "certain", label: t.certain },
                { value: "suggestion", label: t.suggestion },
              ]}
              allowEmpty={false}
            />
          </Field>
          <Field span={6} label="">
            <CheckboxField
              checked={Boolean(r.nonTax)}
              onCheckedChange={(nonTax) => patchResult({ nonTax })}
              label={t.nonTax}
            />
          </Field>
        </FieldGrid>
        {previewCount != null ? (
          <NoticeBar tone="info">{t.preview.replace("{count}", String(previewCount))}</NoticeBar>
        ) : null}
      </div>
    </RecordDialog>
  );
}
