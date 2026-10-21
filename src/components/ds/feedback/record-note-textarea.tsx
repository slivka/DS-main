/** Pole poznámky · vlastní přizpůsobení výšky · nesmí ukládat text. */
import { useLayoutEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { Textarea } from "../../ui/textarea";
/** Vnitřní pole s odesláním z klávesnice. */
export interface NoteTextareaProps extends Omit<ComponentPropsWithoutRef<"textarea">, "onSubmit"> {
  /** Žádost uložit z Ctrl/Cmd+Enter. */
  onSubmit: () => void;
}
/** Začíná dvěma řádky, roste nejvýše na osm řádků. */
export function NoteTextarea({ onSubmit, onKeyDown, ...props }: NoteTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, [props.value]);
  return (
    <Textarea
      ref={ref}
      {...props}
      rows={2}
      className="min-h-[var(--note-input-min)] max-h-[var(--note-input-max)] resize-none overflow-y-auto"
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
