/** Pole poznámky · vlastní přizpůsobení výšky · nesmí ukládat text. */
import { useLayoutEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { Textarea } from "../../ui/textarea";
/** Vnitřní pole s odesláním z klávesnice. */
export interface NoteTextareaProps extends Omit<ComponentPropsWithoutRef<"textarea">, "onSubmit"> {
  /** Žádost uložit z Ctrl/Cmd+Enter. */
  onSubmit: () => void;
}
/** Začíná dvěma řádky, roste bez posuvníku do limitu (12 řádků / 50 % panelu); táhlo zvětší ručně. */
export function NoteTextarea({ onSubmit, onKeyDown, ...props }: NoteTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.style.height = "auto";
    const max = Number.parseFloat(getComputedStyle(input).maxHeight);
    const height = input.scrollHeight + (input.offsetHeight - input.clientHeight);
    const limited = Number.isFinite(max) && max > 0 && height > max;
    input.style.height = `${limited ? max : height}px`;
    input.style.overflowY = limited ? "auto" : "hidden";
  }, [props.value]);
  return (
    <Textarea
      ref={ref}
      {...props}
      rows={2}
      className="min-h-[var(--note-input-min)] max-h-[var(--note-input-max)] resize-y"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          !event.nativeEvent.isComposing &&
          event.key === "Enter" &&
          (event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          event.stopPropagation();
          onSubmit();
        }
      }}
    />
  );
}
