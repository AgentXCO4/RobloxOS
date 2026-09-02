import { useEffect, useMemo, useState } from "react";
import { APPS, TASKBAR_PINNED } from "@/lib/os/apps";
import { useOS } from "@/lib/os/store";
import { formatClock } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { AppGlyph, RobloxMark } from "./RobloxMark";
import { Bell, Search, Wifi, Volume2, VolumeX, ChevronUp } from "lucide-react";
import type { AppId } from "@/lib/os/types";

export function Taskbar() {
  const popup = useOS((s) => s.popup);
  const setPopup = useOS((s) => s.setPopup);
  const windows = useOS((s) => s.windows);
  const windowOrder = useOS((s) => s.windowOrder);
  const toggleTaskbarApp = useOS((s) => s.toggleTaskbarApp);
  const settings = useOS((s) => s.settings);
  const unread = useOS((s) => s.notifications.filter((n) => !n.read).length);
  const mobile = useIsMobile();

  const running = useMemo(() => {
    const seen = new Set<AppId>();
    const ids: AppId[] = [];
    for (const id of windowOrder) {
      const appId = windows[id]?.appId;
      if (appId && !seen.has(appId) && !TASKBAR_PINNED.includes(appId) && !APPS[appId].hidden) {
        seen.add(appId);
        ids.push(appId);
      }
    }
    return ids;
  }, [windowOrder, windows]);

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-[80] flex items-center justify-between gap-2 px-2 no-select taskbar-blur",
        mobile ? "h-14 pb-[env(safe-area-inset-bottom)]" : "h-12",
      )}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ boxShadow: "0 -1px 0 rgb(255 255 255 / 0.06)" }}
    >
      <div className="hidden w-24 sm:block" />
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <TaskBtn
          active={popup === "start"}
          label="Start"
          onClick={() => setPopup("start")}
        >
          <RobloxMark className="size-5 text-os-accent" />
        </TaskBtn>
        {!mobile ? (
          <TaskBtn
            active={popup === "search"}
            label="Search"
            onClick={() => setPopup("search")}
          >
            <Search className="size-4 text-os-fg" strokeWidth={1.8} />
          </TaskBtn>
        ) : null}
        {TASKBAR_PINNED.map((id) => (
          <TaskBtn
            key={id}
            label={APPS[id].name}
            running={Object.values(windows).some((w) => w.appId === id)}
            focused={
              windowOrder.length > 0 &&
              windows[windowOrder[windowOrder.length - 1] ?? ""]?.appId === id &&
              !windows[windowOrder[windowOrder.length - 1] ?? ""]?.minimized
            }
            onClick={() => toggleTaskbarApp(id)}
          >
            <span className="size-6 overflow-hidden rounded-[7px]">
              <AppGlyph appId={id} />
            </span>
          </TaskBtn>
        ))}
        {running.map((id) => (
          <TaskBtn
            key={id}
            label={APPS[id].name}
            running
            focused={
              windowOrder.length > 0 &&
              windows[windowOrder[windowOrder.length - 1] ?? ""]?.appId === id
            }
            onClick={() => toggleTaskbarApp(id)}
          >
            <span className="size-6 overflow-hidden rounded-[7px]">
              <AppGlyph appId={id} />
            </span>
          </TaskBtn>
        ))}
      </div>
      <div className="flex items-center gap-0.5">
        {!mobile ? (
          <TaskBtn label="Hidden icons" onClick={() => setPopup("quick")} slim>
            <ChevronUp className="size-3.5 text-os-muted" />
          </TaskBtn>
        ) : null}
        <button
          type="button"
          onClick={() => setPopup("quick")}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-os-sm px-2 text-os-muted transition-colors duration-150 hover:bg-os-hover hover:text-os-fg",
            popup === "quick" && "bg-os-hover text-os-fg",
          )}
          aria-label="Quick settings"
        >
          {settings.wifi && !settings.airplane ? (
            <Wifi className="size-3.5" strokeWidth={1.8} />
          ) : (
            <Wifi className="size-3.5 opacity-40" strokeWidth={1.8} />
          )}
          {settings.muted || settings.volume === 0 ? (
            <VolumeX className="size-3.5" strokeWidth={1.8} />
          ) : (
            <Volume2 className="size-3.5" strokeWidth={1.8} />
          )}
        </button>
        <ClockButton
          active={popup === "calendar"}
          onClick={() => setPopup("calendar")}
          format={settings.clockFormat}
        />
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setPopup("notifications")}
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-os-sm text-os-muted transition-colors duration-150 hover:bg-os-hover hover:text-os-fg",
            popup === "notifications" && "bg-os-hover text-os-fg",
          )}
        >
          <Bell className="size-4" strokeWidth={1.8} />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-os-accent" />
          ) : null}
        </button>
      </div>
    </div>
  );
}

function TaskBtn({
  children,
  onClick,
  label,
  active,
  running,
  focused,
  slim,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  running?: boolean;
  focused?: boolean;
  slim?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-os-sm transition-colors duration-150 hover:bg-os-hover",
        slim ? "h-8 w-7" : "h-10 w-10",
        (active || focused) && "bg-os-hover",
      )}
    >
      {children}
      {running ? (
        <span
          className={cn(
            "absolute bottom-1 h-0.5 rounded-full bg-os-fg/70 transition-[width] duration-150",
            focused ? "w-4" : "w-1.5",
          )}
        />
      ) : null}
    </button>
  );
}

function ClockButton({
  active,
  onClick,
  format,
}: {
  active: boolean;
  onClick: () => void;
  format: "12" | "24";
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "hidden h-10 flex-col items-end justify-center rounded-os-sm px-2 text-right transition-colors duration-150 hover:bg-os-hover sm:flex",
        active && "bg-os-hover",
      )}
    >
      <span className="text-[11px] font-medium leading-tight tabular-nums text-os-fg">
        {formatClock(now, format)}
      </span>
      <span className="text-[10px] leading-tight text-os-muted tabular-nums">
        {now.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" })}
      </span>
    </button>
  );
}
