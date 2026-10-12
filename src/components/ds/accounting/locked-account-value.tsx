/** Zamčený účet · vlastní důvod uvnitř pole · nesmí kreslit zámek ani měnit hodnoty. */
import { forwardRef, useRef, useState } from "react";
import { FieldValue, type FieldValueProps } from "../form/field-value";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

/** Vstupy společného důvodu zamčení bankovního účtu. */
interface LockedAccountValueProps extends FieldValueProps {
  /** Plný důvod zamčení z textů aplikace nebo DsTexts. */
  reason: string;
}

/** Důvod uvnitř jednořádkového šedého pole, přístupný i klávesnicí. */
export const LockedAccountValue = forwardRef<HTMLDivElement, LockedAccountValueProps>(
  function LockedAccountValue({ reason, className, ...props }, ref) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [truncated, setTruncated] = useState(false);
    const measure = () => {
      const text = elementRef.current?.firstElementChild;
      setTruncated(Boolean(text && text.scrollWidth > text.clientWidth));
    };
    return (
      <Tooltip
        onOpenChange={(open) => {
          if (open) measure();
        }}
      >
        <TooltipTrigger asChild>
          <FieldValue
            {...props}
            ref={(node) => {
              elementRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            title=""
            onPointerEnter={measure}
            onFocus={measure}
            tabIndex={0}
            aria-disabled="true"
            className={cn("ds-disabled-control border border-input", className)}
          >
            {reason}
          </FieldValue>
        </TooltipTrigger>
        {truncated ? <TooltipContent>{reason}</TooltipContent> : null}
      </Tooltip>
    );
  },
);
