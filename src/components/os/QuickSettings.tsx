import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { Bluetooth, Moon, Plane, Volume2, Wifi } from "lucide-react";

export function QuickSettings() {
  const open = useOS((s) => s.popup === "quick" || s.popup === "calendar");
  const popup = useOS((s) => s.popup);
  const settings = useOS((s) => s.settings);
  const update = useOS((s) => s.updateSettings);
  const launchApp = useOS((s) => s.launchApp);
  const closePopups = useOS((s) => s.closePopups);
  const mobile = useIsMobile();
  const showCal = popup === "calendar" || popup === "quick";

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-[90] overflow-hidden bg-os-surface text-os-fg os-shadow start-in",
        mobile
          ? "inset-x-2 bottom-16 rounded-os-xl p-4"
          : "bottom-14 right-3 w-[min(92vw,360px)] rounded-os-xl p-4",
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {showCal ? <MiniCalendar /> : null}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Tile
          label="Wi-Fi"
          active={settings.wifi && !settings.airplane}
          onClick={() => update({ wifi: !settings.wifi, airplane: false })}
        >
          <Wifi className="size-4" />
        </Tile>
        <Tile
          label="Bluetooth"
          active={settings.bluetooth && !settings.airplane}
          onClick={() => update({ bluetooth: !settings.bluetooth })}
        >
          <Bluetooth className="size-4" />
        </Tile>
        <Tile
          label="Airplane"
          active={settings.airplane}
          onClick={() =>
            update({
              airplane: !settings.airplane,
              wifi: settings.airplane,
              bluetooth: settings.airplane,
            })
          }
        >
          <Plane className="size-4" />
        </Tile>
        <Tile
          label="Night light"
          active={settings.nightLight}
          onClick={() => update({ nightLight: !settings.nightLight })}
        >
          <Moon className="size-4" />
        </Tile>
      </div>
      <label className="mt-4 flex items-center gap-3 text-xs text-os-muted">
        <Volume2 className="size-4" />
        <input
          type="range"
          min={0}
          max={100}
          value={settings.muted ? 0 : settings.volume}
          onChange={(e) => update({ volume: Number(e.target.value), muted: false })}
          className="h-1 w-full accent-[var(--color-os-accent)]"
        />
        <span className="w-8 text-right tabular-nums">{settings.muted ? 0 : settings.volume}</span>
      </label>
      <label className="mt-3 flex items-center gap-3 text-xs text-os-muted">
        <span className="w-4 text-center text-[11px]">Aa</span>
        <input
          type="range"
          min={40}
          max={100}
          value={settings.brightness}
          onChange={(e) => update({ brightness: Number(e.target.value) })}
          className="h-1 w-full accent-[var(--color-os-accent)]"
        />
        <span className="w-8 text-right tabular-nums">{settings.brightness}</span>
      </label>
      <button
        type="button"
        onClick={() => {
          launchApp("settings");
          closePopups();
        }}
        className="mt-4 w-full rounded-os-sm py-2 text-center text-[12px] text-os-muted hover:bg-os-hover hover:text-os-fg"
      >
        All settings
      </button>
    </div>
  );
}

function Tile({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 rounded-os p-3 text-left transition-colors duration-150",
        active ? "bg-os-accent text-os-accent-fg" : "bg-os-elevated text-os-fg hover:bg-os-hover",
      )}
    >
      {children}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: first + days }, (_, i) => (i < first ? null : i - first + 1));
  return (
    <div className="rounded-os bg-os-elevated p-3">
      <p className="text-sm font-medium">
        {now.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      </p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-os-subtle">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-[11px]",
              d === now.getDate() ? "bg-os-accent text-os-accent-fg" : "text-os-fg",
            )}
          >
            {d ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
