/**
 * Tooltip důvodu zablokované akce, který funguje i na dotyku.
 * Vlastní: řízený stav tooltipu – klik/klepnutí na zablokovaný spouštěč jej otevře na ~3 s,
 * zavře odchod fokusu, Escape nebo klepnutí mimo; hover a fokus beze změny.
 * Nesmí: spouštět akci spouštěče ani měnit jeho přístupný název či aria-describedby.
 */
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

/** Doba zobrazení důvodu po klepnutí. */
export const DISABLED_REASON_TAP_MS = 3000;

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
};

/** Vlastnosti tooltipu důvodu. */
export interface DisabledReasonTooltipProps {
  /** Obsah tooltipu (důvod nebo běžný popisek). */
  content?: ReactNode;
  /** Spouštěč je zablokovaný – klik/klepnutí otevře tooltip s důvodem. */
  blocked: boolean;
  /** Jediný prvek spouštěče (předává se přes asChild). */
  children: ReactElement<TriggerProps>;
}

/** Tooltip, který zablokovaná akce otevře i klepnutím; vyžaduje okolní TooltipProvider. */
export function DisabledReasonTooltip({ content, blocked, children }: DisabledReasonTooltipProps) {
  const [open, setOpen] = useState(false);
  const [tapContent, setTapContent] = useState<ReactNode>();
  const pinned = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const unpin = () => {
    pinned.current = false;
    setTapContent(undefined);
    clear();
  };
  // Úklid časovače při odpojení.
  useEffect(() => clear, []);
  const child = Children.only(children);
  if (!isValidElement<TriggerProps>(child) || content === undefined || content === null)
    return children;
  const trigger = cloneElement(child, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      child.props.onClick?.(event);
      if (!blocked) return;
      // Akce může změnit stav i svůj popisek; vysvětlení klepnutí zůstane původní.
      setTapContent(content);
      pinned.current = true;
      setOpen(true);
      clear();
      timer.current = setTimeout(() => {
        unpin();
        setOpen(false);
      }, DISABLED_REASON_TAP_MS);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      child.props.onBlur?.(event);
      unpin();
      setOpen(false);
    },
  });
  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        // Radix po kliku a opuštění ukazatele (dotyk) zavírá; připnutý důvod drží časovač.
        if (!next && pinned.current) return;
        setOpen(next);
      }}
    >
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent onEscapeKeyDown={unpin} onPointerDownOutside={unpin}>
        {tapContent ?? content}
      </TooltipContent>
    </Tooltip>
  );
}
