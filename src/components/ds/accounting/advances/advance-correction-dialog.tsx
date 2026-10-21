/** Opravný DD · vlastní potvrzení náhledu APP · nesmí vytvářet daňové řádky. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../../ds-texts";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import { RecordDialog } from "../../layout/RecordDialog";
import { DataGrid } from "../../grid/DataGrid";
import type { AdvanceCorrectionRow } from "./advance-types";
import { AmountCell } from "../amount";
/** Potvrzení navrženého opravného DD. */
export interface AdvanceCorrectionDialogProps extends ComponentPropsWithoutRef<"div"> {
  /** Otevření. */ open: boolean;
  /** Zavření není rozhodnutí Nevytvářet. */ onOpenChange: (open: boolean) => void;
  /** Návrh z APP. */ rows: AdvanceCorrectionRow[];
  /** Klíč gridu. */ storageKey: string;
  /** Rozhodnutí APP, po úspěchu zavře. */ onDecision: (create: boolean) => void;
  /** Probíhá vytvoření. */ busy?: boolean;
  /** Načítání. */ loading?: boolean;
  /** Chyba APP. */ error?: string;
  /** Volitelná měna částek z APP; bez hodnoty původní zobrazení. */ currencyCode?: string;
}
/** Potvrzovací dialog se sdílenou patičkou a náhledem základu a DPH. */
export const AdvanceCorrectionDialog = forwardRef<HTMLDivElement, AdvanceCorrectionDialogProps>(
  function AdvanceCorrectionDialog(
    {
      open,
      onOpenChange,
      rows,
      storageKey,
      onDecision,
      busy,
      loading,
      error,
      currencyCode,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().advances;
    const blocked = Boolean(busy || loading || error || !rows.length);
    return (
      <RecordDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title={t.corrective}
        busy={busy}
        error={error}
        submitLabel={t.create}
        submitDisabled={blocked}
        onSubmit={() => {
          if (!blocked) onDecision(true);
        }}
        extraActions={
          <Button type="button" variant="outline" disabled={busy} onClick={() => onDecision(false)}>
            {t.doNotCreate}
          </Button>
        }
      >
        <div ref={ref} className={cn("min-w-0", className)} {...props}>
          <DataGrid
            rows={rows}
            storageKey={storageKey}
            rowKey={(row) => row.id}
            loading={loading}
            columns={[
              { id: "document", label: t.document, value: (row) => row.document },
              {
                id: "base",
                label: t.base,
                numeric: true,
                value: (row) => row.base,
                render: currencyCode
                  ? (row) => (
                      <div className="flex items-center justify-end gap-1">
                        <AmountCell value={row.base} />
                        <span>{currencyCode}</span>
                      </div>
                    )
                  : undefined,
              },
              {
                id: "vat",
                label: t.vat,
                numeric: true,
                value: (row) => row.vat,
                render: currencyCode
                  ? (row) => (
                      <div className="flex items-center justify-end gap-1">
                        <AmountCell value={row.vat} />
                        <span>{currencyCode}</span>
                      </div>
                    )
                  : undefined,
              },
            ]}
            hideToolbar
            paginated={false}
            groupable={false}
          />
        </div>
      </RecordDialog>
    );
  },
);
