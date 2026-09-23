import { useState } from "react";
import { Bell, CheckCircle2, CircleAlert, CircleX, Info, LoaderCircle } from "lucide-react";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  type?: NotificationType;
  createdAt: Date | string;
  readAt?: Date | string | null;
  href?: string;
}

export interface NotificationBellTexts {
  label: string;
  title: string;
  markAllRead: string;
  empty: string;
  showAll: string;
  loading: string;
}

export const DEFAULT_NOTIFICATION_BELL_TEXTS: NotificationBellTexts = {
  label: "Oznámení",
  title: "Oznámení",
  markAllRead: "Označit vše jako přečtené",
  empty: "Žádná oznámení",
  showAll: "Zobrazit vše",
  loading: "Načítání oznámení",
};

export interface NotificationBellProps {
  items: NotificationItem[];
  unreadCount?: number;
  loading?: boolean;
  onItemClick: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
  onShowAll?: () => void;
  texts?: Partial<NotificationBellTexts>;
  className?: string;
}

const typeIcons = {
  info: { icon: Info, className: "text-info" },
  success: { icon: CheckCircle2, className: "text-success" },
  warning: { icon: CircleAlert, className: "text-warning" },
  error: { icon: CircleX, className: "text-destructive" },
} as const;

function relativeTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("cs", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

/** Prezentační seznam oznámení pro horní lištu aplikace. */
export function NotificationBell({
  items,
  unreadCount,
  loading = false,
  onItemClick,
  onMarkAllRead,
  onShowAll,
  texts,
  className,
}: NotificationBellProps) {
  const t = { ...DEFAULT_NOTIFICATION_BELL_TEXTS, ...texts };
  const [locallyRead, setLocallyRead] = useState<string[]>([]);
  const derivedUnread = items.filter((item) => !item.readAt && !locallyRead.includes(item.id)).length;
  const newlyReadCount = items.filter((item) => !item.readAt && locallyRead.includes(item.id)).length;
  const count = unreadCount === undefined ? derivedUnread : Math.max(0, unreadCount - newlyReadCount);
  const badge = count > 9 ? "9+" : String(count);

  const selectItem = (item: NotificationItem) => {
    if (!item.readAt) setLocallyRead((ids) => ids.includes(item.id) ? ids : [...ids, item.id]);
    onItemClick(item);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className={cn("relative text-muted-foreground", className)} aria-label={t.label}>
          <Bell className="size-4" />
          {count > 0 ? <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">{badge}</span> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(380px,calc(100vw-24px))] p-0">
        <div className="flex min-h-12 items-center gap-3 border-b px-4">
          <h2 className="font-semibold">{t.title}</h2>
          {count > 0 ? <Button type="button" variant="link" size="sm" className="ml-auto h-auto p-0" onClick={onMarkAllRead}>{t.markAllRead}</Button> : null}
        </div>
        {loading ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t.loading}</div>
        ) : items.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground"><Bell className="size-5" />{t.empty}</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {items.map((item) => {
              const unread = !item.readAt && !locallyRead.includes(item.id);
              const iconConfig = typeIcons[item.type ?? "info"];
              const Icon = iconConfig.icon;
              return (
                <Button key={item.id} type="button" variant="ghost" className="h-auto w-full justify-start gap-3 rounded-none border-b px-4 py-3 text-left last:border-b-0" onClick={() => selectItem(item)}>
                  <Icon className={cn("mt-0.5 size-4 shrink-0", iconConfig.className)} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm", unread && "font-semibold")}>{item.title}</span>
                    {item.body ? <span className="line-clamp-2 text-sm text-muted-foreground">{item.body}</span> : null}
                    <span className="mt-1 block text-xs text-muted-foreground">{relativeTime(item.createdAt)}</span>
                  </span>
                  {unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                </Button>
              );
            })}
          </div>
        )}
        {onShowAll ? <div className="border-t p-2"><Button type="button" variant="ghost" className="w-full" onClick={onShowAll}>{t.showAll}</Button></div> : null}
      </PopoverContent>
    </Popover>
  );
}