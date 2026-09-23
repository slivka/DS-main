import { Search } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

export interface SearchButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

/** Ikonové tlačítko globálního hledání. */
export function SearchButton({ onClick, label = "Hledat (Ctrl+K)", className }: SearchButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label} onClick={onClick} className={className}>
          <Search className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}