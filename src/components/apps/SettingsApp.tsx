import { useState } from "react";
import { APPS, START_APPS } from "@/lib/os/apps";
import { useOS } from "@/lib/os/store";
import { WALLPAPERS } from "@/lib/os/types";
import { cn } from "@/lib/utils";
import { AppGlyph } from "@/components/os/RobloxMark";
import {
  Monitor,
  Palette,
  Volume2,
  Wifi,
  User,
  Shield,
  Info,
  Gamepad2,
  LayoutGrid,
  Lock,
} from "lucide-react";

const SECTIONS = [
  ["personalization", "Personalization", Palette],
  ["display", "Display", Monitor],
  ["sound", "Sound", Volume2],
  ["network", "Network", Wifi],
  ["accounts", "Accounts", User],
  ["privacy", "Privacy", Shield],
  ["system", "System", Info],
  ["gaming", "Gaming", Gamepad2],
  ["applications", "Applications", LayoutGrid],
] as const;

export default function SettingsApp({ windowId }: { windowId: string }) {
  const payload = useOS((s) => s.windows[windowId]?.payload);
  const [section, setSection] = useState<(typeof SECTIONS)[number][0]>(
    (payload?.section as (typeof SECTIONS)[number][0]) ?? "personalization",
  );
  const settings = useOS((s) => s.settings);
  const update = useOS((s) => s.updateSettings);
  const username = useOS((s) => s.username);
  const setUsername = useOS((s) => s.setUsername);
  const lock = useOS((s) => s.lock);
  const nodes = useOS((s) => s.nodes);
  const [nameDraft, setNameDraft] = useState(username);

  return (
    <div className="flex h-full bg-os-surface text-os-fg">
      <aside className="w-[min(42%,220px)] shrink-0 overflow-y-auto border-r border-os-border os-scroll p-2">
        {SECTIONS.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={cn(
              "mb-0.5 flex w-full items-center gap-2 rounded-os-sm px-2 py-2 text-left text-[13px] hover:bg-os-hover",
              section === id && "bg-os-hover",
            )}
          >
            <Icon className="size-4 text-os-muted" strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </aside>
      <div className="min-w-0 flex-1 overflow-y-auto os-scroll p-5">
        <h2 className="text-xl font-semibold tracking-tight">
          {SECTIONS.find((s) => s[0] === section)?.[1]}
        </h2>

        {section === "personalization" ? (
          <div className="mt-4 space-y-6">
            <Field label="Clock">
              <Seg
                value={settings.clockFormat}
                options={[
                  ["12", "12-hour"],
                  ["24", "24-hour"],
                ]}
                onChange={(v) => update({ clockFormat: v as "12" | "24" })}
              />
            </Field>
            <Field label="Theme">
              <Seg
                value={settings.theme}
                options={[
                  ["dark", "Dark"],
                  ["light", "Light"],
                ]}
                onChange={(v) => update({ theme: v as "dark" | "light" })}
              />
            </Field>
            <Field label="Accent">
              <Seg
                value={settings.accent}
                options={[
                  ["red", "Roblox"],
                  ["silver", "Silver"],
                  ["steel", "Steel"],
                ]}
                onChange={(v) => update({ accent: v as "red" | "silver" | "steel" })}
              />
            </Field>
            <Field label="Wallpaper">
              <div className="grid grid-cols-2 gap-2">
                {WALLPAPERS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => update({ wallpaper: w.id })}
                    className={cn(
                      "overflow-hidden rounded-os text-left",
                      settings.wallpaper === w.id && "ring-2 ring-os-accent",
                    )}
                  >
                    <img src={w.src} alt="" className="h-20 w-full object-cover" />
                    <span className="block px-2 py-1.5 text-[12px]">{w.name}</span>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        ) : null}

        {section === "display" ? (
          <div className="mt-4 space-y-6">
            <Field label="Brightness">
              <input
                type="range"
                min={40}
                max={100}
                value={settings.brightness}
                onChange={(e) => update({ brightness: Number(e.target.value) })}
                className="w-full accent-[var(--color-os-accent)]"
              />
            </Field>
            <Field label="Scale">
              <Seg
                value={String(settings.displayScale)}
                options={[
                  ["100", "100%"],
                  ["125", "125%"],
                  ["150", "150%"],
                ]}
                onChange={(v) => update({ displayScale: Number(v) as 100 | 125 | 150 })}
              />
            </Field>
            <Field label="Night light">
              <Toggle
                on={settings.nightLight}
                onChange={(v) => update({ nightLight: v })}
              />
            </Field>
          </div>
        ) : null}

        {section === "sound" ? (
          <div className="mt-4 space-y-6">
            <Field label="Volume">
              <input
                type="range"
                min={0}
                max={100}
                value={settings.muted ? 0 : settings.volume}
                onChange={(e) => update({ volume: Number(e.target.value), muted: false })}
                className="w-full accent-[var(--color-os-accent)]"
              />
            </Field>
            <Field label="Mute">
              <Toggle on={settings.muted} onChange={(v) => update({ muted: v })} />
            </Field>
          </div>
        ) : null}

        {section === "network" ? (
          <div className="mt-4 space-y-6">
            <Field label="Wi-Fi">
              <Toggle
                on={settings.wifi && !settings.airplane}
                onChange={(v) => update({ wifi: v, airplane: false })}
              />
            </Field>
            <Field label="Bluetooth">
              <Toggle on={settings.bluetooth} onChange={(v) => update({ bluetooth: v })} />
            </Field>
            <Field label="Airplane mode">
              <Toggle on={settings.airplane} onChange={(v) => update({ airplane: v })} />
            </Field>
            <p className="text-sm text-os-muted">
              {settings.airplane
                ? "Wireless radios are off."
                : settings.wifi
                  ? "Connected to ROBLOX-OS-NET"
                  : "Wi-Fi is off."}
            </p>
          </div>
        ) : null}

        {section === "accounts" ? (
          <div className="mt-4 space-y-6">
            <p className="text-sm text-os-muted">
              This device uses your Roblox OS identity. The default account matches the player name.
            </p>
            <Field label="Username">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setUsername(nameDraft);
                }}
              >
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-10 flex-1 rounded-os-sm bg-os-elevated px-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="h-10 rounded-os-sm bg-os-fg px-3 text-sm font-medium text-os-bg"
                >
                  Save
                </button>
              </form>
            </Field>
            <button
              type="button"
              onClick={lock}
              className="flex h-10 items-center gap-2 rounded-os-sm bg-os-elevated px-3 text-sm hover:bg-os-hover"
            >
              <Lock className="size-4" />
              Lock this device
            </button>
          </div>
        ) : null}

        {section === "privacy" ? (
          <div className="mt-4 space-y-6">
            <Field label="Notifications">
              <Toggle
                on={settings.notificationsEnabled}
                onChange={(v) => update({ notificationsEnabled: v })}
              />
            </Field>
            <p className="text-sm text-os-muted">
              Filesystem and settings are stored locally in this experience. Roblox OS never reads
              your real computer files.
            </p>
          </div>
        ) : null}

        {section === "system" ? (
          <div className="mt-4 space-y-3 text-sm">
            <Row k="Edition" v="Roblox OS 1.0" />
            <Row k="Kernel" v="RobloxOS Kernel" />
            <Row k="User" v={username} />
            <Row k="Memory" v="Virtual Memory" />
            <Row k="Storage" v={`${Object.keys(nodes).length} virtual objects`} />
            <Row k="Hostname" v="ROBLOX-OS" />
          </div>
        ) : null}

        {section === "gaming" ? (
          <div className="mt-4 space-y-6">
            <Field label="Game mode">
              <Toggle on={settings.gameMode} onChange={(v) => update({ gameMode: v })} />
            </Field>
            <p className="text-sm text-os-muted">
              Game mode keeps Roblox in the foreground and reduces desktop animations.
            </p>
          </div>
        ) : null}

        {section === "applications" ? (
          <div className="mt-4 space-y-1">
            {START_APPS.map((id) => {
              const app = APPS[id];
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-os px-2 py-2 hover:bg-os-hover"
                >
                  <span className="size-8">
                    <AppGlyph appId={id} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{app.name}</p>
                    <p className="text-[11px] text-os-subtle">
                      {app.version}
                      {app.system ? " · System" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={app.system}
                    className="h-8 rounded-os-sm px-3 text-[12px] text-os-muted disabled:opacity-40"
                    title={app.system ? "Protected system application" : "Uninstall"}
                  >
                    {id === "roblox" ? "Protected" : app.system ? "Required" : "Uninstall"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-os-muted">{label}</p>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-os bg-os-elevated px-3 py-2">
      <span className="text-os-muted">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors duration-150",
        on ? "bg-os-accent" : "bg-os-hover",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform duration-150",
          on && "translate-x-5",
        )}
      />
    </button>
  );
}

function Seg({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-os bg-os-elevated p-1">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-os-sm px-3 py-1.5 text-[12px] font-medium",
            value === id ? "bg-os-hover text-os-fg" : "text-os-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
