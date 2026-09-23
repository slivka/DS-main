import { Moon, Sun } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useTheme } from "../../../lib/theme";

/** Rychlé přepnutí světlého / tmavého režimu v horní liště. */
export interface ThemeToggleProps {
  className?: string;
  lightLabel?: string;
  darkLabel?: string;
}

export function ThemeToggle({
  className = "",
  lightLabel = "Světlý režim",
  darkLabel = "Tmavý režim",
}: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? lightLabel : darkLabel}
          aria-pressed={isDark}
          onClick={() => setMode(isDark ? "light" : "dark")}
          className={`text-muted-foreground ${className}`}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </TooltipTrigger>
        <TooltipContent>{isDark ? lightLabel : darkLabel}</TooltipContent>
    </Tooltip>
  );
}
