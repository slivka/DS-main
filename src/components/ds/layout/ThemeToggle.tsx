import { Moon, Sun } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useTheme } from "../../../lib/theme";

/** Rychlé přepnutí světlého / tmavého režimu v horní liště. */
export function ThemeToggle({ className = "" }: { className?: string }) {
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
          aria-label={isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
          aria-pressed={isDark}
          onClick={() => setMode(isDark ? "light" : "dark")}
          className={`text-muted-foreground ${className}`}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Světlý režim" : "Tmavý režim"}</TooltipContent>
    </Tooltip>
  );
}
