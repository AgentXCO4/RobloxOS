import { useMemo, useState } from "react";
import { APPS, START_APPS } from "@/lib/os/apps";
import { childrenOf } from "@/lib/os/filesystem";
import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media";
import { AppGlyph } from "./RobloxMark";
import { Search } from "lucide-react";

export function SearchOverlay() {
  const open = useOS((s) => s.popup === "search");
  const nodes = useOS((s) => s.nodes);
  const launchApp = useOS((s) => s.launchApp);
  const openNode = useOS((s) => s.openNode);
  const closePopups = useOS((s) => s.closePopups);
  const [query, setQuery] = useState("");
  const mobile = useIsMobile();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const apps = START_APPS.filter((id) => !q || APPS[id].name.toLowerCase().includes(q));
    const files = Object.values(nodes).filter(
      (n) => n.kind === "file" && (!q || n.name.toLowerCase().includes(q)),
    );
    const folders = Object.values(nodes).filter(
      (n) => n.kind === "dir" && n.parentId && (!q || n.name.toLowerCase().includes(q)),
    );
    return { apps, files: files.slice(0, 8), folders: folders.slice(0, 6) };
  }, [query, nodes]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-[90] overflow-hidden bg-os-surface text-os-fg os-shadow start-in",
        mobile
          ? "inset-x-2 bottom-16 top-8 rounded-os-xl"
          : "bottom-14 left-1/2 w-[min(92vw,520px)] -translate-x-1/2 rounded-os-xl",
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <Search className="size-4 text-os-subtle" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type here to search"
          className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-os-subtle"
        />
      </div>
      <div className="max-h-[min(58vh,420px)] overflow-y-auto os-scroll px-2 pb-3">
        <Section title="Applications">
          {results.apps.map((id) => (
            <Row
              key={id}
              icon={<span className="size-7"><AppGlyph appId={id} /></span>}
              label={APPS[id].name}
              meta={id === "roblox" ? "System" : "App"}
              onClick={() => {
                launchApp(id);
                closePopups();
              }}
            />
          ))}
        </Section>
        {results.folders.length ? (
          <Section title="Folders">
            {results.folders.map((n) => (
              <Row
                key={n.id}
                icon={<span className="size-7"><AppGlyph appId="files" /></span>}
                label={n.name}
                meta={`${childrenOf(nodes, n.id).length} items`}
                onClick={() => {
                  openNode(n.id);
                  closePopups();
                }}
              />
            ))}
          </Section>
        ) : null}
        {results.files.length ? (
          <Section title="Files">
            {results.files.map((n) => (
              <Row
                key={n.id}
                icon={<span className="size-7"><AppGlyph appId="notepad" /></span>}
                label={n.name}
                meta="File"
                onClick={() => {
                  openNode(n.id);
                  closePopups();
                }}
              />
            ))}
          </Section>
        ) : null}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="px-2 py-1 text-[11px] font-medium tracking-wide text-os-subtle uppercase">{title}</p>
      {children}
    </div>
  );
}

function Row({
  icon,
  label,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-os-sm px-2 py-2 text-left hover:bg-os-hover"
    >
      {icon}
      <span className="flex-1 truncate text-sm">{label}</span>
      <span className="text-[11px] text-os-subtle">{meta}</span>
    </button>
  );
}
