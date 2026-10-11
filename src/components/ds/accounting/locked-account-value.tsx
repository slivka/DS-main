/** Zamčený účet · vlastní důvod uvnitř pole · nesmí kreslit zámek ani měnit hodnoty. */
import { forwardRef } from "react";
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
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <FieldValue
            {...props}
            ref={ref}
            tabIndex={0}
            aria-disabled="true"
            className={cn("text-muted-foreground", className)}
          >
            {reason}
          </FieldValue>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    );
  },
);
