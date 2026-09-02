import { useEffect, useState } from "react";
import { useOS } from "@/lib/os/store";
import { DOCUMENTS_ID } from "@/lib/os/filesystem";

export default function NotepadApp({ windowId }: { windowId: string }) {
  const payload = useOS((s) => s.windows[windowId]?.payload);
  const nodes = useOS((s) => s.nodes);
  const writeFile = useOS((s) => s.writeFile);
  const createFile = useOS((s) => s.createFile);
  const fileId = payload?.fileId;
  const file = fileId ? nodes[fileId] : undefined;
  const [text, setText] = useState(file?.content ?? "");
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    setText(file?.content ?? "");
  }, [file?.id, file?.content]);

  const save = () => {
    if (fileId && nodes[fileId]) {
      const err = writeFile(fileId, text);
      setStatus(err ?? "Saved");
      return;
    }
    const name = `Note ${new Date().toLocaleTimeString()}.txt`;
    const err = createFile(DOCUMENTS_ID, name, text);
    setStatus(err ?? `Saved to Documents\\${name}`);
  };

  return (
    <div className="flex h-full flex-col bg-os-elevated text-os-fg">
      <div className="flex h-9 items-center gap-1 border-b border-os-border px-2 text-[12px]">
        <button
          type="button"
          onClick={save}
          className="rounded-os-xs px-2 py-1 hover:bg-os-hover"
        >
          Save
        </button>
        <span className="ml-auto text-os-subtle">{file?.name ?? "Untitled"}</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("Unsaved");
        }}
        className="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-[13px] leading-6 outline-none"
        spellCheck={false}
      />
      <div className="border-t border-os-border px-3 py-1 text-[11px] text-os-subtle">{status}</div>
    </div>
  );
}
