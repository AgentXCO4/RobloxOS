import { useEffect, useState } from "react";
import { useOS, wallpaperSrc } from "@/lib/os/store";
import { formatClock, formatDateLong } from "@/lib/utils";
import { RobloxMark } from "./RobloxMark";

export function LockScreen({
  dimmed = false,
  onSignIn,
}: {
  dimmed?: boolean;
  onSignIn: () => void;
}) {
  const username = useOS((s) => s.username);
  const wallpaper = useOS((s) => s.settings.wallpaper);
  const clockFormat = useOS((s) => s.settings.clockFormat);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSignIn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSignIn]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={wallpaperSrc(wallpaper)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-os-bg/45" />
      {dimmed ? <div className="absolute inset-0 bg-os-bg/70" /> : null}
      <div className="relative flex h-full flex-col items-center justify-between px-6 py-16 text-os-fg">
        <div className="text-center">
          <p className="text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">
            {formatClock(now, clockFormat).replace(/ [AP]M/, "")}
          </p>
          <p className="mt-3 text-lg text-os-fg/80">{formatDateLong(now)}</p>
        </div>
        <div className="flex flex-col items-center gap-5">
          <div className="flex size-16 items-center justify-center rounded-full bg-os-surface/80 os-shadow-sm">
            <RobloxMark className="size-7 text-os-accent" />
          </div>
          <div className="text-center">
            <p className="text-sm text-os-muted">Welcome back</p>
            <p className="text-2xl font-semibold tracking-tight">{username}</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="mt-1 h-11 min-w-40 rounded-full bg-os-fg px-8 text-sm font-medium text-os-bg transition-transform duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
