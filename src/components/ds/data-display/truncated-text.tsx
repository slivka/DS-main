import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Text v buňce gridu, který se při nedostatku místa zkrátí třemi tečkami.
 * Tooltip s plným zněním se ukáže jen tehdy, když je text opravdu zkrácený.
 */
export function TruncatedText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  const check = () => {
    const el = ref.current;
    if (el) setOverflow(el.scrollWidth > el.clientWidth + 1);
  };

  const span = (
    <span
      ref={ref}
      className={`block truncate${className ? ` ${className}` : ""}`}
      onMouseEnter={check}
      onFocus={check}
      tabIndex={-1}
    >
      {text}
    </span>
  );

  if (!overflow) return span;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{span}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[28rem] break-words">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Truncated link do detailu – stejné chování jako TruncatedText,
 * ale text je zabaleny do routerového odkazu (např. proklik na kontakt).
 */
export function TruncatedLink({
  text,
  to,
  params,
  search,
}: {
  text: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [overflow, setOverflow] = useState(false);

  const check = () => {
    const el = ref.current;
    if (el) setOverflow(el.scrollWidth > el.clientWidth + 1);
  };

  const anchor = (
    <Link
      ref={ref as never}
      to={to as never}
      params={params as never}
      search={search as never}
      onMouseEnter={check}
      onFocus={check}
      className="block truncate text-primary underline-offset-2 hover:underline"
    >
      {text}
    </Link>
  );

  if (!overflow) return anchor;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{anchor}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[28rem] break-words">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

