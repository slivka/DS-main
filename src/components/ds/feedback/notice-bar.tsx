import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";

export type NoticeBarTone = "info" | "warning" | "success" | "danger" | "neutral";

export interface NoticeBarProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  /** Význam pruhu; určuje ikonu a tokenové barvy. */
  tone: NoticeBarTone;
  title?: ReactNode;
  children: ReactNode;
  /** Volitelné textové akce; na úzkém panelu se přesunou pod text. */
  actions?: ReactNode;
  onClose?: () => void;
  /** Přístupnostní název zavíracího tlačítka; výchozí z DsTexts. */
  closeLabel?: string;
}

const TONES = {
  info: {
    icon: Info,
    className: "border-l-primary bg-primary/10 text-primary",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-l-warning bg-warning/15 text-warning-strong",
  },
  success: {
    icon: CheckCircle2,
    className: "border-l-success bg-success-soft text-success-strong",
  },
  neutral: {
    icon: Info,
    className: "border-l-border bg-muted text-muted-foreground",
  },
  danger: {
    icon: XCircle,
    className: "border-l-destructive bg-destructive-soft text-destructive-strong",
  },
} satisfies Record<NoticeBarTone, { icon: typeof Info; className: string }>;

/** Provozní informace nebo upozornění v kontextu formuláře, případně s navazující akcí. */
export function NoticeBar({
  tone,
  title,
  children,
  actions,
  onClose,
  closeLabel,
  className,
  ...props
}: NoticeBarProps) {
  const texts = useDsTexts();
  const config = TONES[tone];
  const Icon = config.icon;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      data-slot="notice-bar"
      data-tone={tone}
      className={cn(
        "@container flex items-start gap-3 border-l-4 px-4 py-3",
        config.className,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 @min-[32rem]:flex @min-[32rem]:items-center @min-[32rem]:gap-4">
        <div className="min-w-0 flex-1 text-sm text-foreground">
          {title ? <p className="font-bold text-current">{title}</p> : null}
          <div className={cn(title && "mt-0.5")}>{children}</div>
        </div>
        {actions ? (
          <div
            data-slot="notice-bar-actions"
            className="mt-2 flex shrink-0 flex-wrap items-center gap-2 @min-[32rem]:mt-0"
          >
            {actions}
          </div>
        ) : null}
      </div>
      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={closeLabel ?? texts.noticeBar.close}
          onClick={onClose}
          className="-mr-2 -mt-2 shrink-0 text-current"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
