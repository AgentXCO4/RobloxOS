import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { APPS } from "@/lib/os/apps";
import { useOS } from "@/lib/os/store";
import { TASKBAR_H, TASKBAR_H_MOBILE } from "@/lib/os/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { AppGlyph } from "./RobloxMark";

const HANDLES = [
  { dir: "n", className: "inset-x-2 top-0 h-1.5 cursor-n-resize" },
  { dir: "s", className: "inset-x-2 bottom-0 h-1.5 cursor-s-resize" },
  { dir: "e", className: "inset-y-2 right-0 w-1.5 cursor-e-resize" },
  { dir: "w", className: "inset-y-2 left-0 w-1.5 cursor-w-resize" },
  { dir: "ne", className: "right-0 top-0 size-3 cursor-ne-resize" },
  { dir: "nw", className: "left-0 top-0 size-3 cursor-nw-resize" },
  { dir: "se", className: "bottom-0 right-0 size-3 cursor-se-resize" },
  { dir: "sw", className: "bottom-0 left-0 size-3 cursor-sw-resize" },
] as const;

export function WindowFrame({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const win = useOS((s) => s.windows[id]);
  const focusWindow = useOS((s) => s.focusWindow);
  const closeWindow = useOS((s) => s.closeWindow);
  const minimizeWindow = useOS((s) => s.minimizeWindow);
  const toggleMaximize = useOS((s) => s.toggleMaximize);
  const moveWindow = useOS((s) => s.moveWindow);
  const resizeWindow = useOS((s) => s.resizeWindow);
  const mobile = useIsMobile();
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const resize = useRef<{
    dir: string;
    px: number;
    py: number;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [live, setLive] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const liveRef = useRef(live);
  liveRef.current = live;
  const winRef = useRef(win);
  winRef.current = win;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = winRef.current;
      if (drag.current && w) {
        const dx = e.clientX - drag.current.px;
        const dy = e.clientY - drag.current.py;
        setLive({
          x: drag.current.x + dx,
          y: Math.max(0, drag.current.y + dy),
          w: w.width,
          h: w.height,
        });
      } else if (resize.current && w) {
        const d = resize.current;
        const app = APPS[w.appId];
        const dx = e.clientX - d.px;
        const dy = e.clientY - d.py;
        let x = d.x;
        let y = d.y;
        let width = d.w;
        let height = d.h;
        if (d.dir.includes("e")) width = Math.max(app.minWidth, d.w + dx);
        if (d.dir.includes("s")) height = Math.max(app.minHeight, d.h + dy);
        if (d.dir.includes("w")) {
          width = Math.max(app.minWidth, d.w - dx);
          x = d.x + (d.w - width);
        }
        if (d.dir.includes("n")) {
          height = Math.max(app.minHeight, d.h - dy);
          y = d.y + (d.h - height);
        }
        setLive({ x, y: Math.max(0, y), w: width, h: height });
      }
    };
    const onUp = () => {
      const w = winRef.current;
      const cur = liveRef.current;
      if (cur && w) {
        if (drag.current) moveWindow(id, cur.x, cur.y);
        if (resize.current) resizeWindow(id, cur.x, cur.y, cur.w, cur.h);
      }
      drag.current = null;
      resize.current = null;
      setLive(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [id, moveWindow, resizeWindow]);

  if (!win || win.minimized) return null;

  const tb = mobile ? TASKBAR_H_MOBILE : TASKBAR_H;
  const maximized = win.maximized || mobile;
  const x = live?.x ?? win.x;
  const y = live?.y ?? win.y;
  const w = live?.w ?? win.width;
  const h = live?.h ?? win.height;

  const style: CSSProperties = maximized
    ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${tb}px)`, borderRadius: 0 }
    : { left: x, top: y, width: w, height: h, zIndex: win.zIndex };

  if (maximized) style.zIndex = win.zIndex;

  return (
    <div
      data-window="true"
      className={cn(
        "absolute flex flex-col overflow-hidden bg-os-window text-os-fg window-in",
        maximized ? "rounded-none" : "rounded-os-lg os-shadow",
      )}
      style={style}
      onPointerDown={() => focusWindow(id)}
    >
      <div
        className="flex h-9 shrink-0 items-center gap-2 px-2 no-select"
        onPointerDown={(e) => {
          if (maximized || mobile) return;
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y };
        }}
        onDoubleClick={() => {
          if (!mobile) toggleMaximize(id);
        }}
      >
        <span className="size-4 overflow-hidden rounded-[5px]">
          <AppGlyph appId={win.appId} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-os-muted">
          {win.title}
        </span>
        <div className="flex items-center">
          <TitleBtn label="Minimize" onClick={() => minimizeWindow(id)}>
            <span className="mb-1 block h-px w-2.5 bg-current" />
          </TitleBtn>
          {!mobile ? (
            <TitleBtn label={maximized ? "Restore" : "Maximize"} onClick={() => toggleMaximize(id)}>
              <span className="block size-2 rounded-[1px] border border-current" />
            </TitleBtn>
          ) : null}
          <TitleBtn label="Close" danger onClick={() => closeWindow(id)}>
            <span className="relative block size-2.5">
              <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
              <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
            </span>
          </TitleBtn>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-os-surface">{children}</div>
      {!maximized && !mobile
        ? HANDLES.map((hnd) => (
            <div
              key={hnd.dir}
              className={cn("absolute z-10", hnd.className)}
              onPointerDown={(e) => {
                e.stopPropagation();
                resize.current = {
                  dir: hnd.dir,
                  px: e.clientX,
                  py: e.clientY,
                  x: win.x,
                  y: win.y,
                  w: win.width,
                  h: win.height,
                };
              }}
            />
          ))
        : null}
    </div>
  );
}

function TitleBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-10 items-center justify-center text-os-muted transition-colors duration-150",
        danger ? "hover:bg-os-danger hover:text-os-accent-fg" : "hover:bg-os-hover hover:text-os-fg",
      )}
    >
      {children}
    </button>
  );
}
