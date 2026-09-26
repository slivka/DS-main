import { Building2, Layers } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { cn } from "../../../lib/utils";

export type WorkspaceOption = { id: string; name: string };
export type CompanyOption = { id: string; name: string; workspaceId?: string; ico?: string };

/** Výběr pracovního prostoru a firmy v horní liště aplikace. */
export function WorkspaceCompanySwitcher({
  workspaces,
  companies,
  workspaceId,
  companyId,
  onWorkspaceChange,
  onCompanyChange,
  workspaceLabel = "Workspace",
  companyLabel = "Firma",
  className,
}: {
  workspaces: WorkspaceOption[];
  companies: CompanyOption[];
  workspaceId: string;
  companyId: string;
  onWorkspaceChange: (id: string) => void;
  onCompanyChange: (id: string) => void;
  workspaceLabel?: string;
  companyLabel?: string;
  className?: string;
}) {
  const visibleCompanies = companies.filter(
    (c) => !c.workspaceId || c.workspaceId === workspaceId,
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={workspaceId} onValueChange={onWorkspaceChange}>
        <SelectTrigger className="h-9 w-[170px]" aria-label={workspaceLabel}>
          <Layers className="size-4 opacity-70" />
          <SelectValue placeholder={workspaceLabel} />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={companyId} onValueChange={onCompanyChange}>
        <SelectTrigger className="h-9 w-[200px] border-grid-chrome bg-background px-2.5 py-1 text-base font-semibold hover:border-input hover:bg-surface-hover focus-visible:border-primary" aria-label={companyLabel}>
          <Building2 className="size-4 text-primary" />
          <SelectValue placeholder={companyLabel} />
        </SelectTrigger>
        <SelectContent>
          {visibleCompanies.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="min-w-0"><span className="block truncate">{c.name}</span>{c.ico ? <span className="block text-xs font-normal text-muted-foreground">IČO {c.ico}</span> : null}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Obecný přepínač jedné entity (např. pobočka, středisko, sklad). */
export function EntitySwitcher({
  items,
  value,
  onChange,
  label = "Výběr",
  icon,
  className,
}: {
  items: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-[180px]", className)} aria-label={label}>
        {icon ?? <Building2 className="size-4 opacity-70" />}
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.id} value={i.id}>
            {i.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
