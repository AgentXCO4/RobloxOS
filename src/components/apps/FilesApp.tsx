import { useMemo, useState } from "react";
import {
  childrenOf,
  DESKTOP_ID,
  DOCUMENTS_ID,
  DOWNLOADS_ID,
  isImage,
  isText,
  pathOf,
  PICTURES_ID,
  RECYCLE_ID,
  ROOT_ID,
  USER_DIR_ID,
} from "@/lib/os/filesystem";
import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import { AppGlyph } from "@/components/os/RobloxMark";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  FolderPlus,
  FilePlus,
  Trash2,
} from "lucide-react";

export default function FilesApp({ windowId }: { windowId: string }) {
  const payload = useOS((s) => s.windows[windowId]?.payload);
  const nodes = useOS((s) => s.nodes);
  const [cwd, setCwd] = useState(payload?.folderId ?? DESKTOP_ID);
  const [history, setHistory] = useState<string[]>([payload?.folderId ?? DESKTOP_ID]);
  const [hi, setHi] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [address, setAddress] = useState("");
  const mkdir = useOS((s) => s.mkdir);
  const createFile = useOS((s) => s.createFile);
  const renameNode = useOS((s) => s.renameNode);
  const deleteNodes = useOS((s) => s.deleteNodes);
  const openNode = useOS((s) => s.openNode);
  const setClipboard = useOS((s) => s.setClipboard);
  const pasteInto = useOS((s) => s.pasteInto);

  const folder = nodes[cwd] ?? nodes[ROOT_ID]!;
  const items = useMemo(() => childrenOf(nodes, folder.id), [nodes, folder.id]);
  const path = pathOf(nodes, folder.id);

  const go = (id: string) => {
    const next = history.slice(0, hi + 1).concat(id);
    setHistory(next);
    setHi(next.length - 1);
    setCwd(id);
    setSelected(null);
  };
  const back = () => {
    if (hi <= 0) return;
    setHi(hi - 1);
    setCwd(history[hi - 1] ?? ROOT_ID);
  };
  const forward = () => {
    if (hi >= history.length - 1) return;
    setHi(hi + 1);
    setCwd(history[hi + 1] ?? ROOT_ID);
  };
  const up = () => {
    if (folder.parentId) go(folder.parentId);
  };

  const openItem = (id: string) => {
    const n = nodes[id];
    if (!n) return;
    if (n.kind === "dir") go(n.id);
    else openNode(n.id);
  };

  const quick = [
    { id: USER_DIR_ID, label: "Home" },
    { id: DESKTOP_ID, label: "Desktop" },
    { id: DOCUMENTS_ID, label: "Documents" },
    { id: DOWNLOADS_ID, label: "Downloads" },
    { id: PICTURES_ID, label: "Pictures" },
    { id: ROOT_ID, label: "This PC" },
    { id: RECYCLE_ID, label: "Recycle Bin" },
  ];

  return (
    <div className="flex h-full bg-os-surface text-os-fg">
      <aside className="hidden w-44 shrink-0 border-r border-os-border p-2 sm:block">
        {quick.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => go(q.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-os-sm px-2 py-1.5 text-left text-[13px] hover:bg-os-hover",
              cwd === q.id && "bg-os-hover",
            )}
          >
            <span className="size-5">
              <AppGlyph appId={q.id === RECYCLE_ID ? "recycle" : "files"} />
            </span>
            {q.label}
          </button>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1 border-b border-os-border px-2 py-1.5">
          <IconBtn label="Back" onClick={back} disabled={hi <= 0}>
            <ArrowLeft className="size-4" />
          </IconBtn>
          <IconBtn label="Forward" onClick={forward} disabled={hi >= history.length - 1}>
            <ArrowRight className="size-4" />
          </IconBtn>
          <IconBtn label="Up" onClick={up} disabled={!folder.parentId}>
            <ArrowUp className="size-4" />
          </IconBtn>
          <form
            className="mx-1 min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const raw = address || path;
              const segs = raw.replace(/\//g, "\\").split("\\").filter(Boolean);
              let cur = nodes[ROOT_ID];
              for (const seg of segs.slice(1)) {
                const kid = childrenOf(nodes, cur?.id ?? ROOT_ID).find(
                  (k) => k.name.toLowerCase() === seg.toLowerCase(),
                );
                if (!kid) break;
                cur = kid;
              }
              if (cur) go(cur.id);
            }}
          >
            <input
              value={address || path}
              onFocus={() => setAddress(path)}
              onBlur={() => setAddress("")}
              onChange={(e) => setAddress(e.target.value)}
              className="h-8 w-full rounded-os-sm bg-os-elevated px-2 font-mono text-[12px] outline-none"
            />
          </form>
          <IconBtn label="New folder" onClick={() => mkdir(folder.id, "New Folder")}>
            <FolderPlus className="size-4" />
          </IconBtn>
          <IconBtn label="New file" onClick={() => createFile(folder.id, "New File.txt", "")}>
            <FilePlus className="size-4" />
          </IconBtn>
          <IconBtn
            label="Delete"
            onClick={() => selected && deleteNodes([selected])}
            disabled={!selected}
          >
            <Trash2 className="size-4" />
          </IconBtn>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto os-scroll p-2">
          {items.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-os-muted">This folder is empty</p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelected(n.id)}
                onDoubleClick={() => openItem(n.id)}
                className={cn(
                  "flex cursor-default items-center gap-3 rounded-os-sm px-2 py-1.5 text-[13px] hover:bg-os-hover",
                  selected === n.id && "bg-os-hover",
                )}
              >
                <span className="size-6 shrink-0">
                  <AppGlyph
                    appId={
                      n.kind === "dir"
                        ? "files"
                        : isImage(n)
                          ? "viewer"
                          : isText(n)
                            ? "notepad"
                            : n.mime === "application/x-roblox"
                              ? "roblox"
                              : "notepad"
                    }
                  />
                </span>
                {renaming === n.id ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                      if (draft.trim()) renameNode(n.id, draft.trim());
                      setRenaming(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    className="h-7 flex-1 rounded-os-xs bg-os-elevated px-2 outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    className="flex-1 truncate text-left"
                    onDoubleClick={() => openItem(n.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelected(n.id);
                      setRenaming(n.id);
                      setDraft(n.name);
                    }}
                  >
                    {n.name}
                  </button>
                )}
                <span className="hidden w-28 text-right text-[11px] text-os-subtle sm:block">
                  {n.kind === "dir" ? "Folder" : n.mime ?? "File"}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-os-border px-3 py-1.5 text-[11px] text-os-subtle">
          <span>
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <span className="flex gap-3">
            <button
              type="button"
              className="hover:text-os-fg"
              onClick={() => selected && setClipboard({ mode: "copy", nodeIds: [selected] })}
            >
              Copy
            </button>
            <button
              type="button"
              className="hover:text-os-fg"
              onClick={() => selected && setClipboard({ mode: "cut", nodeIds: [selected] })}
            >
              Cut
            </button>
            <button type="button" className="hover:text-os-fg" onClick={() => pasteInto(folder.id)}>
              Paste
            </button>
            <button
              type="button"
              className="hover:text-os-fg"
              onClick={() => {
                if (!selected) return;
                setRenaming(selected);
                setDraft(nodes[selected]?.name ?? "");
              }}
            >
              Rename
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-os-sm text-os-muted hover:bg-os-hover hover:text-os-fg disabled:opacity-30"
    >
      {children}
    </button>
  );
}
