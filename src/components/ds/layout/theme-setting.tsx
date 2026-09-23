import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { useTheme, type ThemeMode } from "../../../lib/theme";
import { cn } from "../../../lib/utils";

export interface ThemeSettingProps {
  label?: string;
  lightLabel?: string;
  darkLabel?: string;
  systemLabel?: string;
  className?: string;
}

/** Nastavení světlého, tmavého nebo systémového motivu pro stránku Předvolby. */
export function ThemeSetting({
  label = "Motiv",
  lightLabel = "Světlý",
  darkLabel = "Tmavý",
  systemLabel = "Podle systému",
  className,
}: ThemeSettingProps) {
  const { mode, setMode } = useTheme();
  const options: Array<{ value: ThemeMode; label: string }> = [
    { value: "light", label: lightLabel },
    { value: "dark", label: darkLabel },
    { value: "system", label: systemLabel },
  ];
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="text-sm font-medium">{label}</legend>
      <RadioGroup value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem id={`theme-${option.value}`} value={option.value} />
            <Label htmlFor={`theme-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}