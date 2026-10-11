/** Čtyři potvrzení odchodu; stav i simulovaná chyba patří jen do ukázky. */
import { useState } from "react";
import { Button } from "../ui/button";
import { CheckboxField, NoticeBar, UnsavedChangesDialog } from "../ds";
import { DS_TEXTS_CS, useDsTexts, type UnsavedChangesAction } from "../../ds-texts";
import { useFormDesignTwoTexts } from "../../ds-texts/form-design-two-showcase";
import { ShowcaseSection } from "./ShowcaseLayout";
export function UnsavedActionsShowcase() {
  const t = useFormDesignTwoTexts();
  const p = useDsTexts().panes;
  const [action, setAction] = useState<UnsavedChangesAction | null>(null);
  const [fail, setFail] = useState(false);
  const [result, setResult] = useState("");
  const labels = p.unsavedActions ?? DS_TEXTS_CS.panes.unsavedActions;
  return (
    <ShowcaseSection title={t.dialog}>
      <div data-testid="unsaved-actions-showcase" className="flex flex-wrap gap-3">
        {(["close", "switch", "logout", "navigate"] as const).map((key) => (
          <Button key={key} variant="outline" onClick={() => setAction(key)}>
            {labels?.[key].title}
          </Button>
        ))}
        <CheckboxField
          label={t.fail}
          checked={fail}
          onCheckedChange={(checked) => setFail(Boolean(checked))}
        />
        {result ? <NoticeBar tone={fail ? "danger" : "info"}>{result}</NoticeBar> : null}
        <UnsavedChangesDialog
          open={action !== null}
          action={action ?? undefined}
          tabTitle={t.record}
          intent=""
          onBack={() => setAction(null)}
          onDiscard={() => {
            setAction(null);
            setResult(t.discarded);
          }}
          onSave={() => {
            setAction(null);
            setResult(fail ? t.error : t.saved);
          }}
          onOpenInNewTab={() => setAction(null)}
        />
      </div>
    </ShowcaseSection>
  );
}
