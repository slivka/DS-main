/** Hledání v poli výběru · vlastní fokus a rozepsaný dotaz · nesmí potvrdit hodnotu při Tab. */
import * as React from "react";
import { createPortal } from "react-dom";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { CommandInput } from "../../ui/command";

interface SearchContextValue {
  open: boolean;
  changeOpen: (open: boolean) => void;
  changeQuery?: (query: string) => void;
  target: HTMLDivElement | null;
  setTarget: (target: HTMLDivElement | null) => void;
}
const SearchContext = React.createContext<SearchContextValue | null>(null);

/** Vlastnosti vnitřní obálky hledatelného výběru. */
interface InlineSearchPopoverProps extends React.ComponentProps<typeof Popover> {
  /** Změna dotazu při psaní do zavřeného pole. */
  onSearchChange?: (query: string) => void;
}
/** Vnitřní sdílená obálka; veřejné API výběrů zůstává v jejich komponentách. */
export function InlineSearchPopover({
  open = false,
  onOpenChange,
  onSearchChange,
  children,
  ...props
}: InlineSearchPopoverProps) {
  const [target, setTarget] = React.useState<HTMLDivElement | null>(null);
  return (
    <SearchContext.Provider
      value={{
        open,
        changeOpen: (next) => {
          if (next !== open) {
            if (next) onSearchChange?.("");
            onOpenChange?.(next);
          }
        },
        changeQuery: onSearchChange,
        target,
        setTarget,
      }}
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next !== open && next) onSearchChange?.("");
          onOpenChange?.(next);
        }}
        {...props}
      >
        {children}
      </Popover>
    </SearchContext.Provider>
  );
}

/** Spouštěč s místem pro vstup; první napsaný znak otevírá nové hledání. */
export function InlineSearchTrigger({
  children,
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  const context = React.useContext(SearchContext);
  React.useEffect(() => {
    const target = context?.target;
    const composed = (event: CompositionEvent) => {
      if (!context?.open && event.data) {
        context?.changeOpen(true);
        context?.changeQuery?.(event.data);
      }
    };
    target?.addEventListener("compositionend", composed);
    return () => target?.removeEventListener("compositionend", composed);
  }, [context]);
  return (
    <div
      ref={context?.setTarget}
      className="inline-search-field relative min-w-0 w-full"
      data-search-open={context?.open || undefined}
      onKeyDownCapture={(event) => {
        if (context?.open || event.ctrlKey || event.metaKey) return;
        if (event.altKey && event.key === "ArrowDown") {
          event.preventDefault();
          context?.changeOpen(true);
          return;
        }
        if (event.altKey) return;
        if (event.key.length === 1 && !event.nativeEvent.isComposing) {
          const button = event.target;
          if (button instanceof HTMLButtonElement && button.disabled) return;
          event.preventDefault();
          context?.changeOpen(true);
          context?.changeQuery?.(event.key);
        }
      }}
    >
      <PopoverTrigger {...props}>{children}</PopoverTrigger>
    </div>
  );
}

/** Nabídka nebere fokus poli a po Tab jej nevrací zpátky. */
export const InlineSearchContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentProps<typeof PopoverContent>
>(function InlineSearchContent(
  { onOpenAutoFocus, onCloseAutoFocus, onInteractOutside, ...props },
  ref,
) {
  const context = React.useContext(SearchContext);
  return (
    <PopoverContent
      ref={ref}
      {...props}
      onInteractOutside={(event) => {
        if (event.target instanceof Node && context?.target?.contains(event.target))
          event.preventDefault();
        else onInteractOutside?.(event);
      }}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        onOpenAutoFocus?.(event);
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        onCloseAutoFocus?.(event);
      }}
    />
  );
});

/** Vstup zůstává ve stromu Command, ale vykresluje se přímo přes pole výběru. */
export const InlineSearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof CommandInput>
>(function InlineSearchInput({ onKeyDown, ...props }, forwardedRef) {
  const context = React.useContext(SearchContext);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useLayoutEffect(() => {
    inputRef.current?.focus();
  }, [context?.target]);
  if (!context?.target) return null;
  return createPortal(
    <CommandInput
      {...props}
      placeholder={undefined}
      ref={(node) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) {
          event.stopPropagation();
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          context.changeOpen(false);
          context.target?.querySelector<HTMLButtonElement>("button[role=combobox]")?.focus();
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          event.stopPropagation();
          const focusable = Array.from(
            document.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
            ),
          ).filter(
            (node) =>
              !context.target?.contains(node) &&
              !node.closest('[data-slot="popover-content"]') &&
              node.getClientRects().length > 0,
          );
          const trigger = context.target?.querySelector('button[role="combobox"]');
          const next = event.shiftKey
            ? focusable
                .filter(
                  (node) =>
                    trigger &&
                    node.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING,
                )
                .at(-1)
            : focusable.find(
                (node) =>
                  trigger &&
                  trigger.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
              );
          context.changeOpen(false);
          next?.focus();
          return;
        }
        onKeyDown?.(event);
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        if (
          !(
            event.relatedTarget instanceof Element &&
            event.relatedTarget.closest('[data-slot="popover-content"], .inline-search-field')
          )
        )
          context.changeOpen(false);
      }}
    />,
    context.target,
  );
});
