import { ThemeToggleButton } from "./theme-toggle-button";

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
  return <ThemeToggleButton className={className} lightLabel={lightLabel} darkLabel={darkLabel} />;
}
