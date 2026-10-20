/** Pruh vzoru · vlastní sdílený vzhled · nesmí ukládat ani zahazovat formulář. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { Button } from "../../ui/button";
import { NoticeBar } from "../feedback/notice-bar";
/** Řízený stav úpravy vzoru. */
export interface TemplateEditState {
  /** Název vzoru. */ name: string;
  /** Uložit; APP zavírá až po úspěchu. */ onSave: () => void;
  /** Zahodit; potvrzení řídí APP. */ onDiscard: () => void;
  /** Probíhá zápis. */ busy?: boolean;
}
/** Vlastnosti pruhu. */
export interface TemplateEditBannerProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Stav a akce. */ template: TemplateEditState;
}
/** Výrazný pruh nad identitou faktury i zálohového listu. */
export const TemplateEditBanner = forwardRef<HTMLDivElement, TemplateEditBannerProps>(
  function TemplateEditBanner({ template, ...props }, ref) {
    const t = useDsTexts().templates;
    return (
      <div {...props} ref={ref}>
        <NoticeBar
          tone="warning"
          actions={
            <>
              <Button type="button" disabled={template.busy} onClick={template.onSave}>
                {t.saveTemplate}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={template.busy}
                onClick={template.onDiscard}
              >
                {t.discard}
              </Button>
            </>
          }
        >
          <strong>{t.editing(template.name)}</strong>
        </NoticeBar>
      </div>
    );
  },
);
