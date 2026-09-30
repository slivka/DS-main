import type { ReactNode } from "react";
import { SectionHeading } from "./section-heading";
import { cn } from "../../../lib/utils";

export interface SettingsSectionProps {
  title: ReactNode;
  children: ReactNode;
  /** Jednotná nápověda pod nadpisem; přepis pro jiný jazyk. */
  instantSaveHint?: ReactNode;
  className?: string;
}

/** Sekce okamžitých nastavení (`SwitchField`) – nikdy nemíchat s poli čekajícími na Uložit. */
export function SettingsSection({
  title,
  children,
  instantSaveHint = "Změny se ukládají hned",
  className,
}: SettingsSectionProps) {
  return (
    <section data-slot="settings-section" className={cn("space-y-2", className)}>
      <div>
        <SectionHeading className="mb-1">{title}</SectionHeading>
        <p className="text-xs text-muted-foreground">{instantSaveHint}</p>
      </div>
      <div className="divide-y">{children}</div>
    </section>
  );
}
