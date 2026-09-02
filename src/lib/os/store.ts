import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APPS } from "./apps";
import {
  copyNodes as fsCopy,
  createDefaultFilesystem,
  createFile as fsCreateFile,
  deleteNodes as fsDelete,
  DESKTOP_ID,
  ensureSystemNodes,
  findByPath,
  mkdir as fsMkdir,
  moveNodes as fsMove,
  renameNode as fsRename,
  USER_DIR_ID,
  writeFile as fsWrite,
} from "./filesystem";
import {
  DEFAULT_SETTINGS,
  DEFAULT_USERNAME,
  type AppId,
  type ClipboardPayload,
  type ContextMenuState,
  type DesktopIcon,
  type FsNode,
  type OsNotification,
  type OsPhase,
  type OsSettings,
  type OsWindow,
} from "./types";
import { clamp, uid } from "@/lib/utils";

type ShellPopup = "start" | "search" | "notifications" | "quick" | "calendar" | "power" | null;

type OSState = {
  hydrated: boolean;
  bootedAt: number;
  phase: OsPhase;
  username: string;
  settings: OsSettings;
  nodes: Record<string, FsNode>;
  windows: Record<string, OsWindow>;
  windowOrder: string[];
  zCounter: number;
  desktopIcons: DesktopIcon[];
  notifications: OsNotification[];
  clipboard: ClipboardPayload | null;
  contextMenu: ContextMenuState;
  popup: ShellPopup;
  selectedIconId: string | null;
  toasts: OsNotification[];
  setHydrated: (v: boolean) => void;
  setPhase: (p: OsPhase) => void;
  signIn: () => void;
  lock: () => void;
  sleep: () => void;
  shutdown: () => void;
  reboot: () => void;
  setUsername: (name: string) => void;
  updateSettings: (patch: Partial<OsSettings>) => void;
  launchApp: (appId: AppId, payload?: Record<string, string>, title?: string) => string | null;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, x: number, y: number, width: number, height: number) => void;
  toggleTaskbarApp: (appId: AppId) => void;
  setPopup: (p: ShellPopup) => void;
  closePopups: () => void;
  pushNotification: (n: Omit<OsNotification, "id" | "time" | "read">) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  markNotificationsRead: () => void;
  dismissToast: (id: string) => void;
  setContextMenu: (m: ContextMenuState) => void;
  selectIcon: (id: string | null) => void;
  moveIcon: (id: string, x: number, y: number) => void;
  mkdir: (parentId: string, name: string) => string | null;
  createFile: (parentId: string, name: string, content?: string) => string | null;
  renameNode: (id: string, name: string) => string | null;
  deleteNodes: (ids: string[], permanent?: boolean) => string | null;
  moveNodes: (ids: string[], destId: string) => string | null;
  copyNodes: (ids: string[], destId: string) => string | null;
  writeFile: (id: string, content: string) => string | null;
  setClipboard: (c: ClipboardPayload | null) => void;
  pasteInto: (destId: string) => string | null;
  openNode: (id: string) => void;
};

function defaultIcons(): DesktopIcon[] {
  return [
    { id: "icon-roblox", kind: "app", appId: "roblox", label: "Roblox", x: 18, y: 18 },
    { id: "icon-files", kind: "app", appId: "files", label: "Files", x: 18, y: 118 },
    { id: "icon-recycle", kind: "recycle", label: "Recycle Bin", x: 18, y: 218 },
    { id: "icon-settings", kind: "app", appId: "settings", label: "Settings", x: 18, y: 318 },
    { id: "icon-terminal", kind: "app", appId: "terminal", label: "Terminal", x: 18, y: 418 },
    {
      id: "icon-welcome",
      kind: "file",
      fileId: "file-notes",
      label: "Getting Started.txt",
      x: 118,
      y: 18,
    },
  ];
}

function cascadeOrigin(count: number, vw: number, vh: number, w: number, h: number) {
  const offset = (count % 6) * 22;
  const x = clamp(72 + offset, 16, Math.max(16, vw - w - 16));
  const y = clamp(48 + offset, 16, Math.max(16, vh - h - 64));
  return { x, y };
}

export const useOS = create<OSState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      bootedAt: Date.now(),
      phase: "boot",
      username: DEFAULT_USERNAME,
      settings: DEFAULT_SETTINGS,
      nodes: createDefaultFilesystem(DEFAULT_USERNAME),
      windows: {},
      windowOrder: [],
      zCounter: 10,
      desktopIcons: defaultIcons(),
      notifications: [],
      clipboard: null,
      contextMenu: null,
      popup: null,
      selectedIconId: null,
      toasts: [],
      setHydrated: (v) => set({ hydrated: v }),
      setPhase: (p) => set({ phase: p }),
      signIn: () =>
        set((s) => {
          const welcome: OsNotification = {
            id: uid("ntf"),
            appId: "roblox",
            title: "Roblox",
            body: "Your game is ready to launch.",
            time: Date.now(),
            read: false,
          };
          const hello: OsNotification = {
            id: uid("ntf"),
            appId: "system",
            title: "Roblox OS",
            body: `Welcome back, ${s.username}.`,
            time: Date.now(),
            read: false,
          };
          return {
            phase: "desktop",
            popup: null,
            notifications: s.settings.notificationsEnabled
              ? [hello, welcome, ...s.notifications].slice(0, 40)
              : s.notifications,
            toasts: s.settings.notificationsEnabled ? [hello, welcome] : [],
          };
        }),
      lock: () =>
        set({
          phase: "lock",
          popup: null,
          contextMenu: null,
        }),
      sleep: () => set({ phase: "sleep", popup: null, contextMenu: null }),
      shutdown: () =>
        set({
          phase: "shutdown",
          popup: null,
          windows: {},
          windowOrder: [],
          contextMenu: null,
        }),
      reboot: () =>
        set({
          phase: "boot",
          bootedAt: Date.now(),
          popup: null,
          windows: {},
          windowOrder: [],
          contextMenu: null,
          toasts: [],
        }),
      setUsername: (name) => {
        const trimmed = name.trim().slice(0, 24) || DEFAULT_USERNAME;
        set((s) => {
          const userDir = s.nodes[USER_DIR_ID];
          return {
            username: trimmed,
            nodes: userDir
              ? { ...s.nodes, [USER_DIR_ID]: { ...userDir, name: trimmed, modifiedAt: Date.now() } }
              : s.nodes,
          };
        });
      },
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      launchApp: (appId, payload, title) => {
        const app = APPS[appId];
        if (!app) return null;
        const state = get();
        if (app.singleton) {
          const existing = Object.values(state.windows).find((w) => w.appId === appId);
          if (existing) {
            const z = state.zCounter + 1;
            set({
              zCounter: z,
              popup: null,
              contextMenu: null,
              windowOrder: [
                ...state.windowOrder.filter((id) => id !== existing.id),
                existing.id,
              ],
              windows: {
                ...state.windows,
                [existing.id]: {
                  ...existing,
                  minimized: false,
                  zIndex: z,
                  payload: payload ?? existing.payload,
                  title: title ?? existing.title,
                },
              },
            });
            return existing.id;
          }
        }
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const mobile = vw < 720;
        const width = mobile ? Math.max(app.minWidth, vw - 16) : Math.min(app.defaultWidth, vw - 24);
        const height = mobile
          ? Math.max(app.minHeight, vh - 72)
          : Math.min(app.defaultHeight, vh - 72);
        const pos = cascadeOrigin(state.windowOrder.length, vw, vh, width, height);
        const id = uid("win");
        const z = state.zCounter + 1;
        const win: OsWindow = {
          id,
          appId,
          title: title ?? app.name,
          x: mobile ? 8 : pos.x,
          y: mobile ? 8 : pos.y,
          width,
          height,
          prev: null,
          minimized: false,
          maximized: mobile,
          zIndex: z,
          payload,
        };
        set({
          zCounter: z,
          popup: null,
          contextMenu: null,
          windows: { ...state.windows, [id]: win },
          windowOrder: [...state.windowOrder, id],
        });
        return id;
      },
      closeWindow: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.windows;
          return {
            windows: rest,
            windowOrder: s.windowOrder.filter((w) => w !== id),
          };
        }),
      minimizeWindow: (id) =>
        set((s) => {
          const w = s.windows[id];
          if (!w) return s;
          return { windows: { ...s.windows, [id]: { ...w, minimized: true } } };
        }),
      toggleMaximize: (id) =>
        set((s) => {
          const w = s.windows[id];
          if (!w) return s;
          if (w.maximized) {
            const prev = w.prev ?? { x: 80, y: 60, width: w.width, height: w.height };
            return {
              windows: {
                ...s.windows,
                [id]: { ...w, maximized: false, minimized: false, ...prev, prev: null },
              },
            };
          }
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...w,
                maximized: true,
                minimized: false,
                prev: { x: w.x, y: w.y, width: w.width, height: w.height },
              },
            },
          };
        }),
      focusWindow: (id) =>
        set((s) => {
          const w = s.windows[id];
          if (!w) return s;
          const z = s.zCounter + 1;
          return {
            zCounter: z,
            popup: null,
            contextMenu: null,
            windowOrder: [...s.windowOrder.filter((x) => x !== id), id],
            windows: { ...s.windows, [id]: { ...w, zIndex: z, minimized: false } },
          };
        }),
      moveWindow: (id, x, y) =>
        set((s) => {
          const w = s.windows[id];
          if (!w) return s;
          return { windows: { ...s.windows, [id]: { ...w, x, y } } };
        }),
      resizeWindow: (id, x, y, width, height) =>
        set((s) => {
          const w = s.windows[id];
          if (!w) return s;
          const app = APPS[w.appId];
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...w,
                x,
                y,
                width: Math.max(app.minWidth, width),
                height: Math.max(app.minHeight, height),
              },
            },
          };
        }),
      toggleTaskbarApp: (appId) => {
        const s = get();
        const top = [...s.windowOrder].reverse().find((id) => s.windows[id]?.appId === appId);
        if (!top) {
          get().launchApp(appId);
          return;
        }
        const w = s.windows[top];
        if (!w) return;
        const focused = s.windowOrder[s.windowOrder.length - 1] === top;
        if (w.minimized || !focused) get().focusWindow(top);
        else get().minimizeWindow(top);
      },
      setPopup: (p) =>
        set((s) => ({
          popup: s.popup === p ? null : p,
          contextMenu: null,
        })),
      closePopups: () => set({ popup: null, contextMenu: null }),
      pushNotification: (n) =>
        set((s) => {
          if (!s.settings.notificationsEnabled) return s;
          const item: OsNotification = {
            ...n,
            id: uid("ntf"),
            time: Date.now(),
            read: false,
          };
          return {
            notifications: [item, ...s.notifications].slice(0, 40),
            toasts: [item, ...s.toasts].slice(0, 3),
          };
        }),
      dismissNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
          toasts: s.toasts.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [], toasts: [] }),
      markNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((n) => n.id !== id) })),
      setContextMenu: (m) => set({ contextMenu: m, popup: m ? null : get().popup }),
      selectIcon: (id) => set({ selectedIconId: id }),
      moveIcon: (id, x, y) =>
        set((s) => ({
          desktopIcons: s.desktopIcons.map((ic) =>
            ic.id === id ? { ...ic, x: Math.max(8, x), y: Math.max(8, y) } : ic,
          ),
        })),
      mkdir: (parentId, name) => {
        const res = fsMkdir(get().nodes, parentId, name);
        if ("error" in res) return res.error;
        set({ nodes: res.nodes });
        if (parentId === DESKTOP_ID) {
          set((s) => ({
            desktopIcons: [
              ...s.desktopIcons,
              {
                id: uid("icon"),
                kind: "file",
                fileId: res.id,
                label: s.nodes[res.id]?.name ?? name,
                x: 118,
                y: 118,
              },
            ],
          }));
        }
        return null;
      },
      createFile: (parentId, name, content = "") => {
        const res = fsCreateFile(get().nodes, parentId, name, content);
        if ("error" in res) return res.error;
        set({ nodes: res.nodes });
        if (parentId === DESKTOP_ID) {
          set((s) => ({
            desktopIcons: [
              ...s.desktopIcons,
              {
                id: uid("icon"),
                kind: "file",
                fileId: res.id,
                label: s.nodes[res.id]?.name ?? name,
                x: 118,
                y: 218,
              },
            ],
          }));
        }
        return null;
      },
      renameNode: (id, name) => {
        const res = fsRename(get().nodes, id, name);
        if ("error" in res) return res.error;
        set((s) => ({
          nodes: res.nodes,
          desktopIcons: s.desktopIcons.map((ic) =>
            ic.fileId === id ? { ...ic, label: name } : ic,
          ),
        }));
        return null;
      },
      deleteNodes: (ids, permanent = false) => {
        const res = fsDelete(get().nodes, ids, permanent);
        if ("error" in res) return res.error;
        set((s) => ({
          nodes: res.nodes,
          desktopIcons: s.desktopIcons.filter((ic) => !ic.fileId || !ids.includes(ic.fileId)),
        }));
        return null;
      },
      moveNodes: (ids, destId) => {
        const res = fsMove(get().nodes, ids, destId);
        if ("error" in res) return res.error;
        set({ nodes: res.nodes });
        return null;
      },
      copyNodes: (ids, destId) => {
        const res = fsCopy(get().nodes, ids, destId);
        if ("error" in res) return res.error;
        set({ nodes: res.nodes });
        return null;
      },
      writeFile: (id, content) => {
        const res = fsWrite(get().nodes, id, content);
        if ("error" in res) return res.error;
        set({ nodes: res.nodes });
        return null;
      },
      setClipboard: (c) => set({ clipboard: c }),
      pasteInto: (destId) => {
        const clip = get().clipboard;
        if (!clip) return "Clipboard is empty.";
        const fn = clip.mode === "cut" ? fsMove : fsCopy;
        const res = fn(get().nodes, clip.nodeIds, destId);
        if ("error" in res) return res.error;
        set({
          nodes: res.nodes,
          clipboard: clip.mode === "cut" ? null : clip,
        });
        return null;
      },
      openNode: (id) => {
        const n = get().nodes[id];
        if (!n) return;
        if (n.kind === "dir") {
          get().launchApp("files", { folderId: n.id }, n.name);
          return;
        }
        if (n.mime === "application/x-roblox") {
          get().launchApp("roblox");
          return;
        }
        if (n.mime?.startsWith("image/")) {
          get().launchApp("viewer", { fileId: n.id }, n.name);
          return;
        }
        get().launchApp("notepad", { fileId: n.id }, n.name);
      },
    }),
    {
      name: "roblox-os-v1",
      partialize: (s) => ({
        username: s.username,
        settings: s.settings,
        nodes: s.nodes,
        desktopIcons: s.desktopIcons,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<OSState>;
        const username = p.username ?? DEFAULT_USERNAME;
        const nodes =
          p.nodes && Object.keys(p.nodes).length > 8
            ? ensureSystemNodes(p.nodes, username)
            : createDefaultFilesystem(username);
        return {
          ...current,
          ...p,
          nodes,
          settings: {
            ...DEFAULT_SETTINGS,
            ...p.settings,
            avatar: { ...DEFAULT_SETTINGS.avatar, ...p.settings?.avatar },
          },
          desktopIcons: p.desktopIcons?.length ? p.desktopIcons : current.desktopIcons,
          phase: "boot",
          windows: {},
          windowOrder: [],
          popup: null,
          contextMenu: null,
          toasts: [],
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function wallpaperSrc(id: string) {
  const map: Record<string, string> = {
    obsidian: "/wallpapers/obsidian.jpg",
    crimson: "/wallpapers/crimson.jpg",
    northlake: "/wallpapers/northlake.jpg",
    daycourt: "/wallpapers/daycourt.jpg",
  };
  return map[id] ?? map.obsidian;
}

export function findFolder(path: string) {
  return findByPath(useOS.getState().nodes, path);
}
