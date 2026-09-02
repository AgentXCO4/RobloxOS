import { useEffect } from "react";
import { APPS } from "@/lib/os/apps";
import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { AppGlyph } from "./RobloxMark";

export function NotificationCenter() {
  const open = useOS((s) => s.popup === "notifications");
  const items = useOS((s) => s.notifications);
  const dismiss = useOS((s) => s.dismissNotification);
  const clear = useOS((s) => s.clearNotifications);
  const mark = useOS((s) => s.markNotificationsRead);
  const launchApp = useOS((s) => s.launchApp);
  const closePopups = useOS((s) => s.closePopups);
  const mobile = useIsMobile();

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-[90] flex flex-col overflow-hidden bg-os-surface text-os-fg os-shadow start-in",
        mobile
          ? "inset-x-2 bottom-16 top-8 rounded-os-xl"
          : "bottom-14 right-3 w-[min(92vw,360px)] max-h-[min(70vh,520px)] rounded-os-xl",
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onAnimationEnd={mark}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium">Notifications</p>
        {items.length ? (
          <button
            type="button"
            onClick={clear}
            className="text-[12px] text-os-muted hover:text-os-fg"
          >
            Clear all
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto os-scroll px-3 pb-3">
        {items.length === 0 ? (
          <p className="px-1 py-10 text-center text-sm text-os-muted">No new notifications</p>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (n.appId !== "system") launchApp(n.appId);
                dismiss(n.id);
                closePopups();
              }}
              className="mb-2 flex w-full gap-3 rounded-os bg-os-elevated p-3 text-left hover:bg-os-hover"
            >
              <span className="size-8 shrink-0">
                <AppGlyph appId={n.appId === "system" ? "settings" : n.appId} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium">
                    {n.appId === "system" ? "Roblox OS" : APPS[n.appId].name}
                  </span>
                  <span className="text-[10px] text-os-subtle tabular-nums">
                    {new Date(n.time).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
                <span className="mt-0.5 block text-[13px] font-medium">{n.title}</span>
                <span className="mt-0.5 block text-[12px] text-os-muted">{n.body}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function ToastStack() {
  const toasts = useOS((s) => s.toasts);
  const dismiss = useOS((s) => s.dismissToast);

  useEffect(() => {
    const first = toasts[0];
    if (!first) return;
    const t = window.setTimeout(() => dismiss(first.id), 4200);
    return () => window.clearTimeout(t);
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none absolute right-3 bottom-16 z-[95] flex w-[min(92vw,320px)] flex-col gap-2">
      {toasts.slice(0, 3).map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => dismiss(n.id)}
          className="pointer-events-auto flex gap-3 rounded-os bg-os-surface p-3 text-left os-shadow toast-in"
        >
          <span className="size-8 shrink-0">
            <AppGlyph appId={n.appId === "system" ? "settings" : n.appId} />
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-medium">{n.title}</span>
            <span className="block text-[12px] text-os-muted">{n.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
