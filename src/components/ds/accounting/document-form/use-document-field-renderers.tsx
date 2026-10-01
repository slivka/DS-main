/** Pomocné vykreslení polí formuláře dokladu. */
import type { ReactNode } from "react";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { DateField } from "../../form/date-field";
import { SuggestInput } from "../../form/suggest-input";
import { Field } from "../../layout/RecordDialog";
import { cn } from "../../../../lib/utils";
import type {
  DocumentAccountingDateLink,
  DocumentDateField,
  DocumentHeaderField,
  DocumentHeaderValue,
  DocumentSuggestConfig,
} from "./document-form-types";
export interface DocumentFieldRenderersArgs {
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  can: (key: DocumentHeaderField) => boolean;
  dateWarnings?: Partial<Record<DocumentDateField, string>>;
  accountingDateLink?: DocumentAccountingDateLink;
}
/** Vrátí jednotné vykreslovače běžných, datových a našeptávaných polí. */
export function useDocumentFieldRenderers({
  value,
  patch,
  can,
  dateWarnings,
  accountingDateLink,
}: DocumentFieldRenderersArgs) {
  const field = (
    id: string,
    label: ReactNode,
    control: ReactNode,
    span = 3,
    mobileHalf = false,
    className?: string,
  ) => (
    <Field
      htmlFor={id}
      label={label}
      span={span as 3 | 4 | 5 | 6 | 14 | 20}
      className={cn("col-span-20", mobileHalf && "col-span-10", className)}
    >
      {control}
    </Field>
  );
  const date = (
    key: DocumentDateField,
    label: string,
    className?: string,
    options?: {
      link?: React.ComponentProps<typeof DateField>["link"];
      hint?: string;
      warning?: string;
    },
  ) => {
    const warning = options?.warning ?? dateWarnings?.[key];
    return field(
      `document-${key}`,
      label,
      <DateField
        id={`document-${key}`}
        value={value[key] ?? ""}
        onChange={(next) => patch({ [key]: next || null })}
        disabled={!can(key)}
        link={
          options?.link ??
          (key === "accountingDate" && accountingDateLink
            ? {
                locked: accountingDateLink.locked,
                onToggle: accountingDateLink.onToggle,
                lockedHint: accountingDateLink.hint,
              }
            : undefined)
        }
        hint={options?.hint}
        warning={warning}
        warningDisplay="indicator"
      />,
      3,
      false,
      className,
    );
  };
  const text = (
    key: "constantSymbol" | "specificSymbol" | "handedOverBy",
    label: string,
    span = 3,
    className?: string,
  ) =>
    field(
      `document-${key}`,
      label,
      <Input
        id={`document-${key}`}
        value={value[key] ?? ""}
        onChange={(event) => patch({ [key]: event.target.value })}
        disabled={!can(key)}
        className="h-9 font-mono tabular-nums"
      />,
      span,
      false,
      className,
    );
  const suggestedText = (
    key: "handedOverBy" | "description",
    label: string,
    config: DocumentSuggestConfig | undefined,
    span: number,
    className?: string,
  ) =>
    field(
      `document-${key}`,
      label,
      config ? (
        <SuggestInput
          id={`document-${key}`}
          value={value[key] ?? ""}
          onChange={(next) => patch({ [key]: next })}
          loadSuggestions={config.load}
          enabled={config.enabled}
          onEnabledChange={config.onEnabledChange}
          disabled={!can(key)}
          maxLength={key === "description" ? 500 : 200}
        />
      ) : key === "description" ? (
        <Textarea
          id={`document-${key}`}
          rows={2}
          value={value[key] ?? ""}
          onChange={(event) => patch({ [key]: event.target.value })}
          disabled={!can(key)}
        />
      ) : (
        <Input
          id={`document-${key}`}
          value={value[key] ?? ""}
          onChange={(event) => patch({ [key]: event.target.value })}
          disabled={!can(key)}
        />
      ),
      span,
      false,
      className,
    );
  return { field, date, text, suggestedText };
}
