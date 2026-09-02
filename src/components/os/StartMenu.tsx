import { useMemo, useState } from "react";
import { APPS, START_APPS } from "@/lib/os/apps";
import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { AppGlyph, RobloxMark } from "./RobloxMark";
import { Power, Search, Settings as SettingsIcon, User } from "lucide-react";
import type { AppId } from "@/lib/os/types";

export function StartMenu() {
  const open = useOS((s) => s.popup === "start");
  const username = useOS((s) => s.username);
  const launchApp = useOS((s) => s.launchApp);
  const setPopup = useOS((s) => s.setPopup);
  const closePopups = useOS((s) => s.closePopups);
  const lock = useOS((s) => s.lock);
  const shutdown = useOS((s) => s.shutdown);
  const reboot = useOS((s) => s.reboot);
  const sleep = useOS((s) => s.sleep);
  const [query, setQuery] = useState("");
  const [powerOpen, setPowerOpen] = useState(false);
  const mobile = useIsMobile();

  const apps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return START_APPS.filter((id) => {
      const app = APPS[id];
      if (!q) return true;
      return app.name.toLowerCase().includes(q) || app.id.includes(q);
    });
  }, [query]);

  if (!open) return null;

  const openApp = (id: AppId) => {
    launchApp(id);
    closePopups();
    setQuery("");
    setPowerOpen(false);
  };

  return (
    <div
      className={cn(
        "absolute z-[90] overflow-hidden bg-os-surface text-os-fg os-shadow start-in",
        mobile
          ? "inset-x-2 bottom-16 top-8 rounded-os-xl"
          : "bottom-14 left-1/2 w-[min(92vw,580px)] -translate-x-1/2 rounded-os-xl",
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-os-border px-4 py-3">
        <Search className="size-4 text-os-subtle" strokeWidth={1.8} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps, files, settings"
          className="h-9 w-full bg-transparent text-sm text-os-fg outline-none placeholder:text-os-subtle"
        />
      </div>
      <div className="max-h-[min(62vh,460px)] overflow-y-auto os-scroll px-4 py-4">
        <p className="mb-3 text-[11px] font-medium tracking-wide text-os-subtle uppercase">
          {query ? "Results" : "Pinned"}
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {apps.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => openApp(id)}
              className="flex flex-col items-center gap-2 rounded-os p-3 transition-colors duration-150 hover:bg-os-hover active:scale-[0.98]"
            >
              <span className="size-11">
                <AppGlyph appId={id} />
              </span>
              <span className="text-[12px] font-medium">{APPS[id].name}</span>
              {id === "roblox" ? (
                <span className="text-[10px] text-os-subtle">System</span>
              ) : null}
            </button>
          ))}
        </div>
        {!query ? (
          <>
            <p className="mt-6 mb-3 text-[11px] font-medium tracking-wide text-os-subtle uppercase">
              All applications
            </p>
            <div className="space-y-0.5">
              {START_APPS.map((id) => (
                <button
                  key={`all-${id}`}
                  type="button"
                  onClick={() => openApp(id)}
                  className="flex w-full items-center gap-3 rounded-os-sm px-2 py-2 text-left hover:bg-os-hover"
                >
                  <span className="size-8">
                    <AppGlyph appId={id} />
                  </span>
                  <span className="flex-1 text-sm">{APPS[id].name}</span>
                  {APPS[id].system ? (
                    <span className="text-[11px] text-os-subtle">System</span>
                  ) : null}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {apps.length === 0 ? (
          <p className="py-8 text-center text-sm text-os-muted">No matching applications.</p>
        ) : null}
      </div>
      <div className="relative flex items-center justify-between border-t border-os-border px-3 py-2">
        <button
          type="button"
          onClick={() => {
            launchApp("settings", { section: "accounts" });
            closePopups();
          }}
          className="flex items-center gap-2 rounded-os-sm px-2 py-1.5 hover:bg-os-hover"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-os-hover">
            <User className="size-4 text-os-muted" />
          </span>
          <span className="text-sm font-medium">{username}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Settings"
            onClick={() => {
              launchApp("settings");
              closePopups();
            }}
            className="flex size-9 items-center justify-center rounded-os-sm text-os-muted hover:bg-os-hover hover:text-os-fg"
          >
            <SettingsIcon className="size-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Power"
            onClick={() => setPowerOpen((v) => !v)}
            className={cn(
              "flex size-9 items-center justify-center rounded-os-sm text-os-muted hover:bg-os-hover hover:text-os-fg",
              powerOpen && "bg-os-hover text-os-fg",
            )}
          >
            <Power className="size-4" strokeWidth={1.8} />
          </button>
        </div>
        {powerOpen ? (
          <div className="absolute right-3 bottom-12 w-40 overflow-hidden rounded-os bg-os-elevated os-shadow-sm">
            {[
              { label: "Sleep", fn: sleep },
              { label: "Lock", fn: lock },
              { label: "Restart", fn: reboot },
              { label: "Shut down", fn: shutdown },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.fn}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-os-hover"
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2 px-4 pb-3 text-[11px] text-os-subtle">
        <RobloxMark className="size-3 text-os-accent" />
        Roblox is preinstalled
      </div>
    </div>
  );
}
