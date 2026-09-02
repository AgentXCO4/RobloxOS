export type OsPhase = "boot" | "lock" | "desktop" | "sleep" | "shutdown";

export type FsKind = "file" | "dir";
export type FsPerm = "rw" | "r" | "system";

export type FsNode = {
  id: string;
  name: string;
  kind: FsKind;
  parentId: string | null;
  content?: string;
  mime?: string;
  createdAt: number;
  modifiedAt: number;
  perm: FsPerm;
};

export type AppId =
  | "roblox"
  | "files"
  | "settings"
  | "terminal"
  | "notepad"
  | "calculator"
  | "viewer";

export type AppDefinition = {
  id: AppId;
  name: string;
  version: string;
  system: boolean;
  pinned: boolean;
  singleton: boolean;
  hidden?: boolean;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
};

export type OsWindow = {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prev: { x: number; y: number; width: number; height: number } | null;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  payload?: Record<string, string>;
};

export type DesktopIcon = {
  id: string;
  kind: "app" | "file" | "recycle";
  appId?: AppId;
  fileId?: string;
  label: string;
  x: number;
  y: number;
};

export type OsNotification = {
  id: string;
  appId: AppId | "system";
  title: string;
  body: string;
  time: number;
  read: boolean;
};

export type ThemeMode = "dark" | "light";
export type AccentId = "red" | "silver" | "steel";
export type IconSize = "sm" | "md" | "lg";

export type AvatarColors = {
  head: string;
  torso: string;
  arms: string;
  legs: string;
};

export type OsSettings = {
  theme: ThemeMode;
  wallpaper: string;
  accent: AccentId;
  iconSize: IconSize;
  volume: number;
  muted: boolean;
  brightness: number;
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  notificationsEnabled: boolean;
  nightLight: boolean;
  displayScale: 100 | 125 | 150;
  gameMode: boolean;
  clockFormat: "12" | "24";
  autoLock: boolean;
  avatar: AvatarColors;
};

export type ClipboardPayload = {
  mode: "copy" | "cut";
  nodeIds: string[];
};

export type ContextMenuState = {
  x: number;
  y: number;
  target: "desktop" | "icon" | "file";
  iconId?: string;
  fileId?: string;
} | null;

export const DEFAULT_USERNAME = "AgentXCO2";

export const DEFAULT_AVATAR: AvatarColors = {
  head: "#f5c16c",
  torso: "#e2231a",
  arms: "#f5c16c",
  legs: "#2f4a8c",
};

export const DEFAULT_SETTINGS: OsSettings = {
  theme: "dark",
  wallpaper: "obsidian",
  accent: "red",
  iconSize: "md",
  volume: 70,
  muted: false,
  brightness: 100,
  wifi: true,
  bluetooth: true,
  airplane: false,
  notificationsEnabled: true,
  nightLight: false,
  displayScale: 100,
  gameMode: false,
  clockFormat: "12",
  autoLock: false,
  avatar: DEFAULT_AVATAR,
};

export const WALLPAPERS = [
  { id: "obsidian", name: "Obsidian", src: "/wallpapers/obsidian.jpg" },
  { id: "crimson", name: "Crimson Core", src: "/wallpapers/crimson.jpg" },
  { id: "northlake", name: "North Lake", src: "/wallpapers/northlake.jpg" },
  { id: "daycourt", name: "Day Court", src: "/wallpapers/daycourt.jpg" },
] as const;

export const TASKBAR_H = 48;
export const TASKBAR_H_MOBILE = 56;
