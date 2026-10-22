/** Záložka tisku · skládá pole předlohy a potvrzené načtení · APP vlastní data. */
import { forwardRef } from "react";
import { Button } from "../../ui/button";
import {
  BookPrintTemplateFields,
  type BookPrintTemplateFieldsProps,
} from "./document-print-fields";
import { useDsTexts } from "../../../ds-texts";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { cn } from "../../../lib/utils";
/** Tiskové údaje dokladu včetně aplikací dodaného načtení z knihy. */
export interface DocumentPrintTabProps extends BookPrintTemplateFieldsProps {
  /** Volá se až po potvrzení přepsání tiskových údajů. */ onReloadFromBook?: () => void;
}
/** Hotová záložka tisku vydaného dokumentu. */
export const DocumentPrintTab = forwardRef<HTMLDivElement, DocumentPrintTabProps>(
  function DocumentPrintTab(
    { value, onChange, onReloadFromBook, readOnly = false, className, ...props },
    ref,
  ) {
    const t = useDsTexts().invoicePrint;
    const { confirm, confirmDialog } = useConfirmDialog();
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {onReloadFromBook && !readOnly ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => confirm({ title: t.reloadConfirm, onConfirm: onReloadFromBook })}
            >
              {t.reload}
            </Button>
          </div>
        ) : null}
        <BookPrintTemplateFields value={value} onChange={onChange} readOnly={readOnly} />
        {confirmDialog}
      </div>
    );
  },
);
