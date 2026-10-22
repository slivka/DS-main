/** Hledání v poli výběru · vlastní fokus a rozepsaný dotaz · nesmí potvrdit hodnotu při Tab. */
import * as React from "react";
import { createPortal } from "react-dom";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { CommandInput } from "../../ui/command";
import { moveMultipleFocus, toggleMultipleActive } from "./inline-search-multiple";

interface SearchContextValue {
  multiple: boolean;
  open: boolean;
  changeOpen: (open: boolean) => void;
  changeQuery?: (query: string) => void;
  target: HTMLDivElement | null;
  setTarget: (target: HTMLDivElement | null) => void;
  /** Obsah nabídky; jediný zdroj rozpoznání „uvnitř nabídky“. */
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}
/** Prvek je součástí pole nebo jeho nabídky. */
function insideSearch(context: SearchContextValue, node: EventTarget | null) {
  return (
    node instanceof Node &&
    Boolean(context.contentRef.current?.contains(node) || context.target?.contains(node))
  );
}
const SearchContext = React.createContext<SearchContextValue | null>(null);

/** Vlastnosti vnitřní obálky hledatelného výběru. */
interface InlineSearchPopoverProps extends React.ComponentProps<typeof Popover> {
  /** Vícenásobný výběr ponechá nabídku otevřenou při Tab mezi akcemi. */
  multiple?: boolean;
  /** Změna dotazu při psaní do zavřeného pole. */
  onSearchChange?: (query: string) => void;
}
/** Vnitřní sdílená obálka; veřejné API výběrů zůstává v jejich komponentách. */
export function InlineSearchPopover({
  open = false,
  onOpenChange,
  onSearchChange,
  multiple = false,
  children,
  ...props
}: InlineSearchPopoverProps) {
  const [target, setTarget] = React.useState<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <SearchContext.Provider
      value={{
        multiple,
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
        contentRef,
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
  // Při otevřeném hledání je jediným comboboxem vstup; tlačítko se skryje čtečkám i Tabu.
  const open = Boolean(context?.open);
  React.useLayoutEffect(() => {
    const button = context?.target?.querySelector<HTMLButtonElement>("button[role=combobox]");
    if (!button || !open) return;
    const tabIndex = button.getAttribute("tabindex");
    button.setAttribute("aria-hidden", "true");
    button.setAttribute("tabindex", "-1");
    return () => {
      button.removeAttribute("aria-hidden");
      if (tabIndex === null) button.removeAttribute("tabindex");
      else button.setAttribute("tabindex", tabIndex);
    };
  }, [context?.target, open]);
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
        // Mezerník jen otevře nabídku s prázdným dotazem (výchozí chování tlačítka).
        if (event.key === " ") return;
        if (event.key.length === 1 && !event.nativeEvent.isComposing) {
          const button = event.target;
          if (button instanceof HTMLButtonElement && button.disabled) return;
          event.preventDefault();
          context?.changeOpen(true);
          context?.changeQuery?.(event.key);
        }
      }}
    >
      {/* Při otevřeném hledání je jediným comboboxem vstup; tlačítko se skryje čtečkám i Tabu. */}
      <PopoverTrigger {...props}>{children}</PopoverTrigger>
    </div>
  );
}

/** Nabídka nebere fokus poli a po Tab jej nevrací zpátky. */
export const InlineSearchContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentProps<typeof PopoverContent>
>(function InlineSearchContent(
  { onOpenAutoFocus, onCloseAutoFocus, onInteractOutside, onMouseDown, onKeyDownCapture, onBlurCapture, ...props },
  ref,
) {
  const context = React.useContext(SearchContext);
  return (
    <PopoverContent
      ref={(node) => {
        if (context) context.contentRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      {...props}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        if (!context?.multiple || event.defaultPrevented) return;
        if (event.key === "Tab") {
          event.preventDefault();
          event.stopPropagation();
          moveMultipleFocus(context.target, context.contentRef.current, event.shiftKey, () => context.changeOpen(false));
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          context.changeOpen(false);
          context.target?.querySelector<HTMLButtonElement>("button")?.focus();
        }
      }}
      onBlurCapture={(event) => {
        onBlurCapture?.(event);
        if (context?.multiple && event.relatedTarget && !insideSearch(context, event.relatedTarget)) context.changeOpen(false);
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // Standardní combobox: klik do nabídky nebere fokus vstupu, jinak by blur nabídku zavřel
        // dřív, než klik doběhne. Výjimkou jsou prvky, které fokus potřebují.
        const element = event.target instanceof Element ? event.target : null;
        if (!context?.multiple && !element?.closest("input, textarea, select, [contenteditable=true]"))
          event.preventDefault();
      }}
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
  // Po zavření nabídky (výběr myší i klávesou) vrátí fokus na tlačítko, pokud neodešel jinam.
  const target = context?.target;
  React.useEffect(
    () => () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || active === document.body)
          target?.querySelector<HTMLButtonElement>("button[role=combobox]")?.focus();
      });
    },
    [target],
  );
  // cmdk vnucuje aria-labelledby na skrytý popisek nabídky; název musí nést pole (aria-label).
  React.useLayoutEffect(() => {
    inputRef.current?.removeAttribute("aria-labelledby");
  });
  if (!context?.target) return null;
  return createPortal(
    <CommandInput
      {...props}
      aria-label={triggerName(context.target) ?? props.placeholder}
      aria-expanded
      placeholder={undefined}
      ref={(node) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      onKeyDown={(event) => {
        if (context.multiple && !event.nativeEvent.isComposing && event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          toggleMultipleActive(event.currentTarget);
          return;
        }
        if (
          event.key === "Enter" &&
          (event.ctrlKey || event.metaKey) &&
          !event.nativeEvent.isComposing
        ) {
          // cmdk každý Enter potvrzuje a blokuje. Zkratku předáme z pole mimo jeho strom,
          // aby ji formulář dostal bez potvrzení právě zvýrazněné položky.
          event.stopPropagation();
          const unhandled = context.target?.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: event.key,
              code: event.code,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
              altKey: event.altKey,
              bubbles: true,
              cancelable: true,
            }),
          );
          if (unhandled === false) event.preventDefault();
          return;
        }
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
          // Vlastní obsluha (editor řádků) může Tabem potvrdit zvýrazněnou položku;
          // jinak Tab hodnotu nepotvrzuje a jen přesune fokus (2.122.0).
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (context.multiple) {
            event.preventDefault();
            event.stopPropagation();
            moveMultipleFocus(context.target, context.contentRef.current, event.shiftKey, () => context.changeOpen(false));
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          const focusable = Array.from(
            document.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
            ),
          ).filter((node) => !insideSearch(context, node) && node.getClientRects().length > 0);
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
        if (!insideSearch(context, event.relatedTarget)) context.changeOpen(false);
      }}
    />,
    context.target,
  );
});

/** Přístupný název tlačítka (aria-label nebo <label for>) převzatý vstupem hledání. */
function triggerName(target: HTMLDivElement): string | undefined {
  const button = target.querySelector<HTMLButtonElement>("button[role=combobox], button");
  if (!button) return undefined;
  const label = button.getAttribute("aria-label");
  if (label) return label;
  const text = Array.from(button.labels ?? [])
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .join(" ");
  return text || undefined;
}
