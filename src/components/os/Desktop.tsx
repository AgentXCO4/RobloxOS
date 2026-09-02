import { useOS, wallpaperSrc } from "@/lib/os/store";
import { DesktopIcons } from "./DesktopIcons";
import { WindowManager } from "./WindowManager";
import { Taskbar } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationCenter, ToastStack } from "./NotificationCenter";
import { QuickSettings } from "./QuickSettings";
import { ContextMenu } from "./ContextMenu";

export function Desktop() {
  const wallpaper = useOS((s) => s.settings.wallpaper);
  const brightness = useOS((s) => s.settings.brightness);
  const nightLight = useOS((s) => s.settings.nightLight);
  const closePopups = useOS((s) => s.closePopups);
  const setContextMenu = useOS((s) => s.setContextMenu);
  const selectIcon = useOS((s) => s.selectIcon);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onPointerDown={() => {
        closePopups();
        selectIcon(null);
      }}
      onContextMenu={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("button") || t.closest("[data-window]")) return;
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, target: "desktop" });
      }}
    >
      <img
        src={wallpaperSrc(wallpaper)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-os-bg/20" />
      <DesktopIcons />
      <WindowManager />
      <StartMenu />
      <SearchOverlay />
      <NotificationCenter />
      <QuickSettings />
      <ToastStack />
      <ContextMenu />
      <Taskbar />
      {brightness < 100 ? (
        <div
          className="pointer-events-none absolute inset-0 z-[70] bg-black"
          style={{ opacity: (100 - brightness) / 160 }}
        />
      ) : null}
      {nightLight ? (
        <div className="pointer-events-none absolute inset-0 z-[71] bg-os-warn/20 mix-blend-multiply" />
      ) : null}
    </div>
  );
}
