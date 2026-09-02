import { uid } from "@/lib/utils";
import type { FsNode, FsPerm } from "./types";

export const ROOT_ID = "root";
export const USERS_ID = "dir-users";
export const USER_DIR_ID = "dir-user";
export const DESKTOP_ID = "dir-desktop";
export const DOCUMENTS_ID = "dir-documents";
export const DOWNLOADS_ID = "dir-downloads";
export const PICTURES_ID = "dir-pictures";
export const MUSIC_ID = "dir-music";
export const SYSTEM_ID = "dir-system";
export const PROGRAM_FILES_ID = "dir-programfiles";
export const ROBLOX_DIR_ID = "dir-roblox";
export const RECYCLE_ID = "dir-recycle";

export const REQUIRED_IDS = [
  ROOT_ID,
  USERS_ID,
  USER_DIR_ID,
  DESKTOP_ID,
  DOCUMENTS_ID,
  DOWNLOADS_ID,
  PICTURES_ID,
  MUSIC_ID,
  SYSTEM_ID,
  PROGRAM_FILES_ID,
  ROBLOX_DIR_ID,
  RECYCLE_ID,
] as const;

function node(
  id: string,
  name: string,
  kind: FsNode["kind"],
  parentId: string | null,
  extra: Partial<FsNode> = {},
): FsNode {
  const now = extra.createdAt ?? Date.now();
  return {
    id,
    name,
    kind,
    parentId,
    perm: extra.perm ?? "rw",
    createdAt: now,
    modifiedAt: extra.modifiedAt ?? now,
    content: extra.content,
    mime: extra.mime,
  };
}

export function createDefaultFilesystem(username: string): Record<string, FsNode> {
  const now = Date.now();
  const nodes: Record<string, FsNode> = {
    [ROOT_ID]: node(ROOT_ID, "C:", "dir", null, { perm: "system", createdAt: now }),
    [USERS_ID]: node(USERS_ID, "Users", "dir", ROOT_ID, { perm: "system", createdAt: now }),
    [USER_DIR_ID]: node(USER_DIR_ID, username, "dir", USERS_ID, { perm: "rw", createdAt: now }),
    [DESKTOP_ID]: node(DESKTOP_ID, "Desktop", "dir", USER_DIR_ID, { createdAt: now }),
    [DOCUMENTS_ID]: node(DOCUMENTS_ID, "Documents", "dir", USER_DIR_ID, { createdAt: now }),
    [DOWNLOADS_ID]: node(DOWNLOADS_ID, "Downloads", "dir", USER_DIR_ID, { createdAt: now }),
    [PICTURES_ID]: node(PICTURES_ID, "Pictures", "dir", USER_DIR_ID, { createdAt: now }),
    [MUSIC_ID]: node(MUSIC_ID, "Music", "dir", USER_DIR_ID, { createdAt: now }),
    [SYSTEM_ID]: node(SYSTEM_ID, "System", "dir", ROOT_ID, { perm: "system", createdAt: now }),
    [PROGRAM_FILES_ID]: node(PROGRAM_FILES_ID, "Program Files", "dir", ROOT_ID, {
      perm: "system",
      createdAt: now,
    }),
    [ROBLOX_DIR_ID]: node(ROBLOX_DIR_ID, "Roblox", "dir", PROGRAM_FILES_ID, {
      perm: "system",
      createdAt: now,
    }),
    [RECYCLE_ID]: node(RECYCLE_ID, "Recycle Bin", "dir", SYSTEM_ID, {
      perm: "system",
      createdAt: now,
    }),
  };

  const files: Array<Partial<FsNode> & { id: string; name: string; parentId: string }> = [
    {
      id: "file-welcome",
      name: "Welcome.txt",
      parentId: DOCUMENTS_ID,
      mime: "text/plain",
      content:
        "Welcome to Roblox OS.\n\nRoblox is preinstalled as a protected system application.\nOpen it from the Start menu, the taskbar, or the desktop.\n\nThis computer uses a virtual filesystem. Your files stay on this device.",
    },
    {
      id: "file-notes",
      name: "Getting Started.txt",
      parentId: DESKTOP_ID,
      mime: "text/plain",
      content:
        "Getting started\n\n- Double-click icons to open them\n- Drag windows from the title bar\n- Search from the taskbar\n- Right-click the desktop for more options\n- Open Terminal and type help",
    },
    {
      id: "file-kernel",
      name: "kernel.log",
      parentId: SYSTEM_ID,
      mime: "text/plain",
      perm: "r",
      content:
        "[ok] RobloxOS Kernel\n[ok] WindowManager\n[ok] AppManager\n[ok] Filesystem mounted\n[ok] Roblox Player loaded\n[ok] Desktop ready",
    },
    {
      id: "file-roblox-player",
      name: "RobloxPlayer.exe",
      parentId: ROBLOX_DIR_ID,
      mime: "application/x-roblox",
      perm: "system",
      content: "Roblox Player — protected system binary",
    },
    {
      id: "file-version",
      name: "version.txt",
      parentId: ROBLOX_DIR_ID,
      mime: "text/plain",
      perm: "r",
      content: "Roblox 1.0.0 (system)\nChannel: production\nProtected: true",
    },
    {
      id: "pic-obsidian",
      name: "Obsidian.jpg",
      parentId: PICTURES_ID,
      mime: "image/jpeg",
      content: "/wallpapers/obsidian.jpg",
    },
    {
      id: "pic-crimson",
      name: "Crimson Core.jpg",
      parentId: PICTURES_ID,
      mime: "image/jpeg",
      content: "/wallpapers/crimson.jpg",
    },
  ];

  for (const f of files) {
    nodes[f.id] = node(f.id, f.name, "file", f.parentId, f);
  }
  return nodes;
}

export function ensureSystemNodes(
  nodes: Record<string, FsNode>,
  username: string,
): Record<string, FsNode> {
  const fresh = createDefaultFilesystem(username);
  const next = { ...nodes };
  for (const id of REQUIRED_IDS) {
    if (!next[id]) next[id] = fresh[id]!;
  }
  if (!next["file-roblox-player"]) next["file-roblox-player"] = fresh["file-roblox-player"]!;
  if (next[USER_DIR_ID]) {
    next[USER_DIR_ID] = { ...next[USER_DIR_ID], name: username };
  }
  return next;
}

export function childrenOf(nodes: Record<string, FsNode>, parentId: string) {
  return Object.values(nodes)
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function pathOf(nodes: Record<string, FsNode>, id: string): string {
  const parts: string[] = [];
  let cur: FsNode | undefined = nodes[id];
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    parts.push(cur.name);
    cur = cur.parentId ? nodes[cur.parentId] : undefined;
  }
  parts.reverse();
  if (parts.length === 0) return "C:\\";
  if (parts.length === 1) return `${parts[0]}\\`;
  return parts.join("\\");
}

export function normalizePath(input: string) {
  return input.replace(/\//g, "\\").replace(/\\+/g, "\\").replace(/\\$/, "") || "C:";
}

export function findByPath(nodes: Record<string, FsNode>, path: string): FsNode | undefined {
  const cleaned = normalizePath(path);
  const segs = cleaned.split("\\").filter(Boolean);
  if (segs.length === 0) return nodes[ROOT_ID];
  let cur: FsNode | undefined = nodes[ROOT_ID];
  const first = segs[0];
  if (!first) return cur;
  if (first.toUpperCase() !== "C:" && first.toUpperCase() !== "C") {
    return undefined;
  }
  for (const seg of segs.slice(1)) {
    if (!cur) return undefined;
    const kids = childrenOf(nodes, cur.id);
    cur = kids.find((k) => k.name.toLowerCase() === seg.toLowerCase());
  }
  return cur;
}

export function resolvePath(
  nodes: Record<string, FsNode>,
  cwdId: string,
  input: string,
): FsNode | undefined {
  const raw = input.trim();
  if (!raw || raw === ".") return nodes[cwdId];
  if (raw === "..") {
    const cwd = nodes[cwdId];
    return cwd?.parentId ? nodes[cwd.parentId] : cwd;
  }
  if (/^[cC]:/.test(raw) || raw.startsWith("\\")) {
    const p = raw.startsWith("\\") ? `C:${raw}` : raw;
    return findByPath(nodes, p);
  }
  const base = pathOf(nodes, cwdId);
  return findByPath(nodes, `${base}\\${raw}`);
}

export function uniqueName(nodes: Record<string, FsNode>, parentId: string, name: string) {
  const existing = new Set(childrenOf(nodes, parentId).map((n) => n.name.toLowerCase()));
  if (!existing.has(name.toLowerCase())) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 2;
  while (existing.has(`${stem} (${i})${ext}`.toLowerCase())) i += 1;
  return `${stem} (${i})${ext}`;
}

export function canMutate(node: FsNode) {
  return node.perm === "rw";
}

export function isProtectedPath(nodes: Record<string, FsNode>, id: string) {
  const n = nodes[id];
  if (!n) return true;
  if (n.perm === "system" || n.perm === "r") return true;
  if (n.id === ROBLOX_DIR_ID || n.id === RECYCLE_ID) return true;
  let cur: FsNode | undefined = n;
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    if (cur.id === ROBLOX_DIR_ID) return true;
    cur = cur.parentId ? nodes[cur.parentId] : undefined;
  }
  return false;
}

export function mkdir(
  nodes: Record<string, FsNode>,
  parentId: string,
  name: string,
  perm: FsPerm = "rw",
): { nodes: Record<string, FsNode>; id: string } | { error: string } {
  const parent = nodes[parentId];
  if (!parent || parent.kind !== "dir") return { error: "Not a directory." };
  if (!canMutate(parent) && parent.id !== RECYCLE_ID) return { error: "Access denied." };
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required." };
  if (/[\\/:*?"<>|]/.test(trimmed)) return { error: "Invalid name." };
  const finalName = uniqueName(nodes, parentId, trimmed);
  const id = uid("dir");
  return {
    id,
    nodes: {
      ...nodes,
      [id]: node(id, finalName, "dir", parentId, { perm }),
      [parentId]: { ...parent, modifiedAt: Date.now() },
    },
  };
}

export function createFile(
  nodes: Record<string, FsNode>,
  parentId: string,
  name: string,
  content = "",
  mime = "text/plain",
  perm: FsPerm = "rw",
): { nodes: Record<string, FsNode>; id: string } | { error: string } {
  const parent = nodes[parentId];
  if (!parent || parent.kind !== "dir") return { error: "Not a directory." };
  if (!canMutate(parent) && parent.id !== RECYCLE_ID) return { error: "Access denied." };
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required." };
  if (/[\\/:*?"<>|]/.test(trimmed)) return { error: "Invalid name." };
  const finalName = uniqueName(nodes, parentId, trimmed);
  const id = uid("file");
  return {
    id,
    nodes: {
      ...nodes,
      [id]: node(id, finalName, "file", parentId, { content, mime, perm }),
      [parentId]: { ...parent, modifiedAt: Date.now() },
    },
  };
}

export function renameNode(
  nodes: Record<string, FsNode>,
  id: string,
  name: string,
): { nodes: Record<string, FsNode> } | { error: string } {
  const n = nodes[id];
  if (!n) return { error: "Not found." };
  if (n.perm === "system") return { error: "Access denied." };
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required." };
  if (/[\\/:*?"<>|]/.test(trimmed)) return { error: "Invalid name." };
  if (!n.parentId) return { error: "Cannot rename root." };
  const siblings = childrenOf(nodes, n.parentId).filter((s) => s.id !== id);
  if (siblings.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "Name already exists." };
  }
  return { nodes: { ...nodes, [id]: { ...n, name: trimmed, modifiedAt: Date.now() } } };
}

function collectDescendants(nodes: Record<string, FsNode>, id: string): string[] {
  const out = [id];
  for (const child of childrenOf(nodes, id)) {
    out.push(...collectDescendants(nodes, child.id));
  }
  return out;
}

export function deleteNodes(
  nodes: Record<string, FsNode>,
  ids: string[],
  permanent: boolean,
): { nodes: Record<string, FsNode> } | { error: string } {
  const next = { ...nodes };
  for (const id of ids) {
    const n = next[id];
    if (!n) continue;
    if (n.id === ROOT_ID || n.id === ROBLOX_DIR_ID || n.id === RECYCLE_ID) {
      return { error: `Cannot delete ${n.name}.` };
    }
    if (n.perm !== "rw" && n.parentId !== RECYCLE_ID) {
      return { error: `Cannot delete ${n.name}: access denied.` };
    }
    const tree = collectDescendants(next, id);
    if (permanent || n.parentId === RECYCLE_ID) {
      for (const tid of tree) delete next[tid];
    } else {
      const moved = uniqueName(next, RECYCLE_ID, n.name);
      next[id] = { ...n, parentId: RECYCLE_ID, name: moved, modifiedAt: Date.now() };
    }
  }
  return { nodes: next };
}

export function moveNodes(
  nodes: Record<string, FsNode>,
  ids: string[],
  destId: string,
): { nodes: Record<string, FsNode> } | { error: string } {
  const dest = nodes[destId];
  if (!dest || dest.kind !== "dir") return { error: "Destination is not a directory." };
  if (!canMutate(dest) && dest.id !== RECYCLE_ID) return { error: "Access denied." };
  const next = { ...nodes };
  for (const id of ids) {
    const n = next[id];
    if (!n) continue;
    if (n.perm === "system") return { error: `Cannot move ${n.name}.` };
    const destTree = collectDescendants(next, id);
    if (destTree.includes(destId)) return { error: "Cannot move a folder into itself." };
    const name = uniqueName(
      Object.fromEntries(Object.entries(next).filter(([k]) => k !== id)) as Record<string, FsNode>,
      destId,
      n.name,
    );
    next[id] = { ...n, parentId: destId, name, modifiedAt: Date.now() };
  }
  return { nodes: next };
}

function cloneTree(
  nodes: Record<string, FsNode>,
  id: string,
  newParent: string,
): Record<string, FsNode> {
  const src = nodes[id];
  if (!src) return {};
  const newId = uid(src.kind === "dir" ? "dir" : "file");
  const name = uniqueName(nodes, newParent, src.name);
  const copy: FsNode = {
    ...src,
    id: newId,
    parentId: newParent,
    name,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    perm: src.perm === "system" ? "rw" : src.perm,
  };
  let extra: Record<string, FsNode> = { [newId]: copy };
  if (src.kind === "dir") {
    for (const child of childrenOf(nodes, id)) {
      extra = { ...extra, ...cloneTree({ ...nodes, ...extra }, child.id, newId) };
    }
  }
  return extra;
}

export function copyNodes(
  nodes: Record<string, FsNode>,
  ids: string[],
  destId: string,
): { nodes: Record<string, FsNode> } | { error: string } {
  const dest = nodes[destId];
  if (!dest || dest.kind !== "dir") return { error: "Destination is not a directory." };
  if (!canMutate(dest) && dest.id !== RECYCLE_ID) return { error: "Access denied." };
  let next = { ...nodes };
  for (const id of ids) {
    if (!next[id]) continue;
    const cloned = cloneTree(next, id, destId);
    next = { ...next, ...cloned };
  }
  return { nodes: next };
}

export function writeFile(nodes: Record<string, FsNode>, id: string, content: string) {
  const n = nodes[id];
  if (!n || n.kind !== "file") return { error: "Not a file." };
  if (n.perm !== "rw") return { error: "Access denied." };
  return { nodes: { ...nodes, [id]: { ...n, content, modifiedAt: Date.now() } } };
}

export function isImage(node: FsNode) {
  return Boolean(node.mime?.startsWith("image/"));
}

export function isText(node: FsNode) {
  return (
    node.mime === "text/plain" ||
    node.mime === "text/markdown" ||
    node.name.endsWith(".txt") ||
    node.name.endsWith(".log") ||
    node.name.endsWith(".md")
  );
}

export function userHomePath(username: string) {
  return `C:\\Users\\${username}`;
}
