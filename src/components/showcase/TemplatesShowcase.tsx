/** Ukázka duplikace a vzorů · vlastní lokální data · nesmí načítat skutečné doklady. */
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DataGrid } from "../ds/grid/DataGrid";
import { DocumentNewMenu, DocumentNewMenuItems } from "../ds/templates/document-new-menu";
import { DuplicationDialog } from "../ds/templates/duplication-dialog";
import { DuplicationPreview } from "../ds/templates/duplication-preview";
import { TemplateManager, TemplateManagerDialog } from "../ds/templates/template-manager";
import { NoticeBar } from "../ds/feedback/notice-bar";
import { Button } from "../ui/button";
import type { DuplicationValue, TemplateAction, DocumentTemplate } from "../ds/templates/template-types";
import { useDsTexts } from "../../ds-texts";
import { ShowcaseSection } from "./ShowcaseLayout";
import { SERIES_PREVIEW, TEMPLATE_EXAMPLES } from "./template-showcase-data";
import { TemplateFormsShowcase } from "./TemplateFormsShowcase";
export function TemplatesShowcase() {
  const [value, setValue] = useState<DuplicationValue>({
    mode: "single",
    date: "2026-11-15",
    months: 12,
    day: 15,
  });
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [templates, setTemplates] = useState(TEMPLATE_EXAMPLES);
  const [message, setMessage] = useState("");
  const t = useDsTexts().templates;
  const show = (mode: DuplicationValue["mode"]) => {
    setValue({ mode, date: "2026-11-15", months: 12, day: 15 });
    setDirty(false);
    setOpen(true);
  };
  const action = (template: DocumentTemplate, action: TemplateAction) => {
    if (action === "delete")
      setTemplates((items) => items.filter((item) => item.id !== template.id));
    else if (action === "share" || action === "unshare")
      setTemplates((items) =>
        items.map((item) =>
          item.id === template.id ? { ...item, shared: action === "share" } : item,
        ),
      );
    else setMessage(`${action === "rename" ? t.rename : t.edit}: ${template.name}`);
  };
  return (
    <>
      <ShowcaseSection title="Duplikace a vzory">
        <div className="space-y-4">
          {message ? <NoticeBar tone="info">{message}</NoticeBar> : null}
          <DataGrid
            storageKey="template-document-list"
            rows={[{ id: "fp1", name: "FP 2026/0142", description: "Nájem kanceláře" }]}
            rowKey={(row) => row.id}
            columns={[
              { id: "name", label: t.name, value: (row) => row.name },
              { id: "description", label: t.description, value: (row) => row.description },
            ]}
            addAction={{
              label: t.newDocument,
              onClick: () => setMessage(t.blank),
              menu: (
                <DocumentNewMenuItems
                  templates={templates}
                  onBlank={() => setMessage(t.blank)}
                  onTemplate={(_id, mode) => show(mode)}
                  onManage={() => setManagerOpen(true)}
                />
              ),
            }}
          />
          <DataGrid
            storageKey="template-cash-list"
            rows={[{ id: "p1", name: "PO 2026/0031", description: "Příjem hotovosti" }]}
            rowKey={(row) => row.id}
            columns={[
              { id: "name", label: t.name, value: (row) => row.name },
              { id: "description", label: t.description, value: (row) => row.description },
            ]}
            addAction={[
              {
                label: "Příjem",
                shortLabel: "Příjem",
                icon: ArrowDownLeft,
                onClick: () => setMessage("Prázdný příjem"),
                menu: (
                  <DocumentNewMenuItems
                    templates={templates}
                    onBlank={() => setMessage("Prázdný příjem")}
                    onTemplate={(_id, mode) => show(mode)}
                    onManage={() => setManagerOpen(true)}
                  />
                ),
              },
              {
                label: "Výdaj",
                shortLabel: "Výdaj",
                icon: ArrowUpRight,
                onClick: () => setMessage("Prázdný výdaj"),
                menu: (
                  <DocumentNewMenuItems
                    templates={templates}
                    onBlank={() => setMessage("Prázdný výdaj")}
                    onTemplate={(_id, mode) => show(mode)}
                    onManage={() => setManagerOpen(true)}
                  />
                ),
              },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <DocumentNewMenu
              label="Příjem"
              icon={<ArrowDownLeft aria-hidden="true" className="size-4" />}
              templates={templates}
              onBlank={() => setMessage("Prázdný příjem")}
              onPrimary={() => setMessage("Prázdný příjem")}
              onTemplate={(_id, mode) => show(mode)}
              onManage={() => setManagerOpen(true)}
            />
            <DocumentNewMenu
              label="Výdaj"
              icon={<ArrowUpRight aria-hidden="true" className="size-4" />}
              templates={templates}
              onBlank={() => setMessage("Prázdný výdaj")}
              onPrimary={() => setMessage("Prázdný výdaj")}
              onTemplate={(_id, mode) => show(mode)}
              onManage={() => setManagerOpen(true)}
            />
            <Button onClick={() => show("single")}>{t.single}</Button>
            <Button onClick={() => show("series")}>{t.createSeries}</Button>
            <DocumentNewMenu
              templates={[]}
              onBlank={() => setMessage(t.blank)}
              onTemplate={(_id, mode) => show(mode)}
              onManage={() => setManagerOpen(true)}
            >
              Nový – bez vzorů
            </DocumentNewMenu>
          </div>
          <DuplicationDialog
            open={open}
            onOpenChange={setOpen}
            value={value}
            dirty={dirty}
            onChange={(next) => {
              setValue(next);
              setDirty(true);
            }}
            rows={value.mode === "single" ? SERIES_PREVIEW.slice(0, 1) : SERIES_PREVIEW}
            storageKey="template-duplicate"
            onCreate={() => {
              setMessage(
                t.summary(value.mode === "single" ? 1 : 10, value.mode === "single" ? 1 : 12),
              );
              setOpen(false);
              setDirty(false);
            }}
          />
          <TemplateManagerDialog
            open={managerOpen}
            onOpenChange={setManagerOpen}
            templates={templates}
            storageKey="template-manager-dialog"
            onAction={action}
          />
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Série 12 měsíců – náhled">
        <DuplicationPreview rows={SERIES_PREVIEW} storageKey="template-series-preview" />
      </ShowcaseSection>
      <ShowcaseSection title={t.manage}>
        <TemplateManager templates={templates} storageKey="template-manager" onAction={action} />
      </ShowcaseSection>
      <TemplateFormsShowcase />
    </>
  );
}
