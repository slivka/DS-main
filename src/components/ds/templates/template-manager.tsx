/** Správa vzorů · vlastní grid a nabídky · APP provádí změny a kontroluje práva. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { useDsTexts } from "../../../ds-texts";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "../../ui/dropdown-menu";
import { DisabledReasonMenuItem } from "../feedback/disabled-reason-menu-item";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { RecordDialog } from "../layout/RecordDialog";
import { RecordReadOnlyProvider } from "../form/record-read-only";
import { DataGrid } from "../grid/DataGrid";
import type { DocumentTemplate, TemplateAction, TemplatePermission } from "./template-types";
/** Vlastnosti správy vzorů. */
export interface TemplateManagerProps extends ComponentPropsWithoutRef<"div"> {
  /** Vzory. */ templates: DocumentTemplate[];
  /** Samostatný klíč gridu. */ storageKey: string;
  /** Akce s ověřeným oprávněním, smazání až po potvrzení. */
  onAction: (template: DocumentTemplate, action: TemplateAction) => void;
  /** Načítání. */ loading?: boolean;
  /** Chyba od APP. */ error?: string;
}
/** Správa jako obsah panelu nebo dialogu. */
export const TemplateManager = forwardRef<HTMLDivElement, TemplateManagerProps>(
  function TemplateManager({ templates, storageKey, onAction, loading, error, ...props }, ref) {
    const t = useDsTexts().templates;
    const ds = useDsTexts();
    const { confirm, confirmDialog } = useConfirmDialog();
    const actions = (template: DocumentTemplate) => {
      const item = (action: TemplateAction, label: string, permission: TemplatePermission) => (
        <DisabledReasonMenuItem
          key={action}
          disabled={!permission.allowed}
          disabledReason={permission.reason}
          onSelect={() => {
            if (action === "delete")
              confirm({
                title: t.removeConfirm(template.name),
                destructive: true,
                confirmLabel: t.remove,
                onConfirm: () => onAction(template, action),
              });
            else onAction(template, action);
          }}
        >
          {label}
        </DisabledReasonMenuItem>
      );
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`${t.manage}: ${template.name}`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item("rename", t.rename, template.canRename)}
            {item(
              template.shared ? "unshare" : "share",
              template.shared ? t.unshare : t.share,
              template.canShare,
            )}
            {item("edit", t.edit, template.canEdit)}
            {item("delete", t.remove, template.canDelete)}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };
    return (
      <div {...props} ref={ref}>
        <DataGrid
          rows={templates}
          storageKey={storageKey}
          rowKey={(row) => row.id}
          loading={loading}
          error={error}
          showTotalRow={false}
          hideDefaultActions
          rowActions={actions}
          columns={[
            { id: "name", label: t.name, value: (row) => row.name },
            { id: "author", label: t.author, value: (row) => row.author },
            {
              id: "sharing",
              label: t.sharing,
              value: (row) => (row.shared ? t.company : t.private),
            },
            {
              id: "withoutAmounts",
              label: t.withoutAmounts,
              value: (row) => (row.withoutAmounts ? ds.common.yes : ds.common.no),
            },
          ]}
        />
        {confirmDialog}
      </div>
    );
  },
);
/** Vlastnosti dialogové obálky správy. */
export interface TemplateManagerDialogProps extends TemplateManagerProps {
  /** Otevření. */ open: boolean;
  /** Zavření. */ onOpenChange: (open: boolean) => void;
}
/** Správa vzorů ve sdíleném dialogu md; akce se ukládají jednotlivě přes APP. */
export const TemplateManagerDialog = forwardRef<HTMLDivElement, TemplateManagerDialogProps>(
  function TemplateManagerDialog({ open, onOpenChange, error, ...props }, ref) {
    const t = useDsTexts().templates;
    return (
      <RecordDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title={t.manage}
        error={error}
        readOnly
      >
        <RecordReadOnlyProvider value={false}>
          <TemplateManager {...props} ref={ref} />
        </RecordReadOnlyProvider>
      </RecordDialog>
    );
  },
);
