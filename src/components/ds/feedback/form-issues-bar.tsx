/**
 * Živý pruh chyb a upozornění · vlastní titulek s počtem, seznam odkazů a zavření ·
 * nesmí validovat ani mazat serverové položky; prázdný seznam = pruh zmizí sám.
 */
import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { formIssuesTitle, mergeFormIssues, type FormIssue } from "../../../lib/form-issues";
import { Button } from "../../ui/button";
import { focusFieldErrorLink, type FieldErrorLink } from "./field-error-summary";

/** Vlastnosti pruhu položek. */
export interface FormIssuesBarProps {
  /** Položky (deduplikují se uvnitř). */
  issues: readonly FormIssue[];
  /** Volající hlásí, že uložení selhalo – titulek „Doklad nelze uložit (N)“. */
  saveFailed?: boolean;
  /** Přepis titulku. */
  title?: ReactNode;
  /** Obecná zpráva formuláře; nevypíše se, je-li shodná s položkou. */
  message?: ReactNode;
  /** Zavření ✕. */
  onClose?: () => void;
  /** Vlastní výběr pole; výchozí je `focusFieldErrorLink`. */
  onSelect?: (issue: FormIssue) => void;
  /** Přístupný název zavření. */
  closeLabel?: string;
  /** Datový slot pruhu. */
  dataSlot?: string;
}

/** Pruh: chyby (červeně) a pod nimi varování (žlutě); vždy s počtem. */
export function FormIssuesBar({
  issues,
  saveFailed = false,
  title,
  message,
  onClose,
  onSelect,
  closeLabel,
  dataSlot = "form-issues-bar",
}: FormIssuesBarProps) {
  const texts = useDsTexts().recordAction;
  const list = mergeFormIssues(issues);
  const autoTitle = formIssuesTitle(list, saveFailed, texts);
  if (!autoTitle) return null;
  const hasErrors = list.some((issue) => issue.severity === "error");
  const duplicateMessage =
    typeof message === "string" && list.some((issue) => issue.message === message);
  const select = (issue: FormIssue) => {
    if (onSelect) return onSelect(issue);
    if (!issue.fieldId) return;
    const link: FieldErrorLink = {
      fieldId: issue.fieldId,
      label: issue.label,
      message: issue.message,
      rowId: issue.rowId,
      columnId: issue.columnId,
    };
    focusFieldErrorLink(link);
  };
  return (
    <div
      role={hasErrors ? "alert" : "status"}
      data-slot={dataSlot}
      data-severity={hasErrors ? "error" : "warning"}
      className={cn(
        "flex items-start gap-3 border-l-4 px-4 py-3",
        hasErrors
          ? "border-destructive bg-destructive-soft text-destructive-strong"
          : "border-warning bg-warning-soft text-warning-strong",
      )}
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold" data-slot="form-issues-title">
          {title ?? autoTitle}
        </p>
        {message && !duplicateMessage ? (
          <div className="mt-0.5 text-sm text-foreground">{message}</div>
        ) : null}
        <ul className="mt-1 space-y-0.5 text-sm">
          {list.map((issue, index) => (
            <li
              key={`${issue.code ?? issue.message}-${issue.fieldId ?? ""}-${issue.rowId ?? ""}-${index}`}
              data-slot="form-issue"
              data-severity={issue.severity}
              data-source={issue.source}
              className={issue.severity === "warning" ? "text-warning-strong" : undefined}
            >
              {issue.fieldId || onSelect ? (
                <button
                  type="button"
                  className="cursor-pointer rounded-sm text-left underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => select(issue)}
                >
                  <span className="font-semibold">{issue.label}</span>: {issue.message}
                </button>
              ) : (
                <span>
                  <span className="font-semibold">{issue.label}</span>: {issue.message}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={closeLabel}
          onClick={onClose}
          className="-mr-2 -mt-2 shrink-0"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
