import { useRef } from "react";
import { useOS } from "@/lib/os/store";
import { RECYCLE_ID } from "@/lib/os/filesystem";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { AppGlyph } from "./RobloxMark";

export function DesktopIcons() {
  const icons = useOS((s) => s.desktopIcons);
  const selected = useOS((s) => s.selectedIconId);
  const selectIcon = useOS((s) => s.selectIcon);
  const moveIcon = useOS((s) => s.moveIcon);
  const openNode = useOS((s) => s.openNode);
  const launchApp = useOS((s) => s.launchApp);
  const setContextMenu = useOS((s) => s.setContextMenu);
  const mobile = useIsMobile();
  const drag = useRef<{ id: string; ox: number; oy: number; x: number; y: number } | null>(null);

  const activate = (icon: (typeof icons)[number]) => {
    if (icon.kind === "app" && icon.appId) launchApp(icon.appId);
    else if (icon.kind === "recycle") launchApp("files", { folderId: RECYCLE_ID }, "Recycle Bin");
    else if (icon.fileId) openNode(icon.fileId);
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-[1]",
        mobile && "grid grid-cols-4 content-start gap-2 p-4",
      )}
    >
      {icons.map((icon) => {
        const glyphId =
          icon.kind === "recycle" ? "recycle" : icon.kind === "app" ? icon.appId : "notepad";
        return (
          <button
            key={icon.id}
            type="button"
            className={cn(
              "flex w-[84px] flex-col items-center gap-1 rounded-os-sm p-1.5 text-center no-select",
              mobile ? "relative" : "absolute",
              selected === icon.id ? "bg-os-fg/12" : "hover:bg-os-fg/8",
            )}
            style={mobile ? undefined : { left: icon.x, top: icon.y }}
            onClick={(e) => {
              e.stopPropagation();
              selectIcon(icon.id);
              if (mobile) activate(icon);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              activate(icon);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selectIcon(icon.id);
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                target: "icon",
                iconId: icon.id,
                fileId: icon.fileId,
              });
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (mobile || e.button !== 0) return;
              drag.current = {
                id: icon.id,
                ox: e.clientX,
                oy: e.clientY,
                x: icon.x,
                y: icon.y,
              };
              const onMove = (ev: PointerEvent) => {
                if (!drag.current) return;
                moveIcon(
                  drag.current.id,
                  drag.current.x + (ev.clientX - drag.current.ox),
                  drag.current.y + (ev.clientY - drag.current.oy),
                );
              };
              const onUp = () => {
                drag.current = null;
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
            }}
          >
            <span className="size-11 drop-shadow-md">
              <AppGlyph appId={glyphId ?? "files"} />
            </span>
            <span className="line-clamp-2 w-full text-[11px] font-medium leading-tight text-os-fg drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.8)]">
              {icon.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
