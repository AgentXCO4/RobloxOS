import { useOS } from "@/lib/os/store";
import { childrenOf, DESKTOP_ID, RECYCLE_ID } from "@/lib/os/filesystem";
import { cn } from "@/lib/utils";

export function ContextMenu() {
  const menu = useOS((s) => s.contextMenu);
  const setContextMenu = useOS((s) => s.setContextMenu);
  const launchApp = useOS((s) => s.launchApp);
  const mkdir = useOS((s) => s.mkdir);
  const createFile = useOS((s) => s.createFile);
  const deleteNodes = useOS((s) => s.deleteNodes);
  const openNode = useOS((s) => s.openNode);
  const icons = useOS((s) => s.desktopIcons);
  const updateSettings = useOS((s) => s.updateSettings);
  const wallpaper = useOS((s) => s.settings.wallpaper);

  if (!menu) return null;

  const icon = icons.find((i) => i.id === menu.iconId);
  const items: Array<{ label: string; action: () => void; danger?: boolean }> = [];

  if (menu.target === "desktop") {
    items.push(
      { label: "New folder", action: () => mkdir(DESKTOP_ID, "New Folder") },
      { label: "New text file", action: () => createFile(DESKTOP_ID, "New File.txt", "") },
      { label: "Open Files", action: () => launchApp("files", { folderId: DESKTOP_ID }) },
      { label: "Open Terminal", action: () => launchApp("terminal") },
      { label: "Settings", action: () => launchApp("settings", { section: "personalization" }) },
      {
        label: wallpaper === "obsidian" ? "Wallpaper: Crimson" : "Wallpaper: Obsidian",
        action: () =>
          updateSettings({ wallpaper: wallpaper === "obsidian" ? "crimson" : "obsidian" }),
      },
    );
  } else if (menu.target === "icon") {
    if (icon?.kind === "app" && icon.appId) {
      items.push({ label: "Open", action: () => launchApp(icon.appId!) });
    } else if (icon?.kind === "recycle") {
      items.push(
        { label: "Open", action: () => launchApp("files", { folderId: RECYCLE_ID }, "Recycle Bin") },
        {
          label: "Empty Recycle Bin",
          action: () => {
            const kids = childrenOf(useOS.getState().nodes, RECYCLE_ID);
            if (kids.length) deleteNodes(
              kids.map((k) => k.id),
              true,
            );
          },
          danger: true,
        },
      );
    } else if (icon?.fileId) {
      items.push(
        { label: "Open", action: () => openNode(icon.fileId!) },
        {
          label: "Delete",
          action: () => deleteNodes([icon.fileId!]),
          danger: true,
        },
      );
    }
  }

  return (
    <div
      className="fixed z-[120] min-w-44 overflow-hidden rounded-os bg-os-elevated py-1 os-shadow-sm"
      style={{ left: Math.min(menu.x, window.innerWidth - 200), top: Math.min(menu.y, window.innerHeight - 220) }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            item.action();
            setContextMenu(null);
          }}
          className={cn(
            "block w-full px-3 py-2 text-left text-[13px] hover:bg-os-hover",
            item.danger && "text-os-danger",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
