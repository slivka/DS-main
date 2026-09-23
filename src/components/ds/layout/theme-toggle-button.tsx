import { Moon, Sun } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useTheme, type ThemeMode } from "../../../lib/theme";
import { cn } from "../../../lib/utils";

export interface ThemeToggleButtonProps {
  darkLabel?: string;
  lightLabel?: string;
  onThemeChange?: (theme: ThemeMode) => void;
  className?: string;
}

/** Ikonové přepnutí světlého a tmavého motivu sdílené s ThemeSetting. */
export function ThemeToggleButton({
  darkLabel = "Tmavý režim",
  lightLabel = "Světlý režim",
  onThemeChange,
  className,
}: ThemeToggleButtonProps) {
  const { isDark, setMode } = useTheme();
  const label = isDark ? lightLabel : darkLabel;

  const toggle = () => {
    const next: ThemeMode = isDark ? "light" : "dark";
    setMode(next);
    onThemeChange?.(next);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            aria-pressed={isDark}
            onClick={toggle}
            className={cn("text-muted-foreground", className)}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}