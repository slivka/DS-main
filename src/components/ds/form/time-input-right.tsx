import * as React from "react";
import { Clock } from "lucide-react";

import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";

export interface TimeInputRightProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  wrapperClassName?: string;
}

export const TimeInputRight = React.forwardRef<
  HTMLInputElement,
  TimeInputRightProps
>(({ wrapperClassName, className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const input = innerRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        /* fallback na focus */
      }
    }
    input.focus();
  };

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Input
        type="time"
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current =
              node;
          }
        }}
        className={cn(
          "w-full pr-10 [&::-webkit-cajendar-picker-indicator]:invisible",
          className,
        )}
        {...props}
      />
      <Clock
        role="button"
        aria-label="Otevřít výběr času"
        className="pointer-events-auto absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground"
        onClick={openPicker}
      />
    </div>
  );
});
TimeInputRight.displayName = "TimeInputRight";
