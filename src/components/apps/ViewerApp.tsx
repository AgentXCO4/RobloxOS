import { useOS } from "@/lib/os/store";

export default function ViewerApp({ windowId }: { windowId: string }) {
  const fileId = useOS((s) => s.windows[windowId]?.payload?.fileId);
  const file = useOS((s) => (fileId ? s.nodes[fileId] : undefined));
  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-os-muted">
        No image selected.
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col bg-os-bg">
      <div className="flex h-9 items-center justify-center border-b border-os-border text-[12px] text-os-muted">
        {file.name}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <img
          src={file.content || ""}
          alt={file.name}
          className="max-h-full max-w-full rounded-os object-contain"
        />
      </div>
    </div>
  );
}
