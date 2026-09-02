import { useEffect, useRef, useState } from "react";
import { runCommand, type TermLine } from "@/lib/os/commands";
import { USER_DIR_ID, pathOf } from "@/lib/os/filesystem";
import { useOS } from "@/lib/os/store";

export default function TerminalApp() {
  const nodes = useOS((s) => s.nodes);
  const username = useOS((s) => s.username);
  const reboot = useOS((s) => s.reboot);
  const shutdown = useOS((s) => s.shutdown);
  const lock = useOS((s) => s.lock);
  const [cwdId, setCwdId] = useState(USER_DIR_ID);
  const [lines, setLines] = useState<TermLine[]>([
    { kind: "sys", text: "Roblox OS Terminal 1.0" },
    { kind: "sys", text: `Logged in as ${username}. Type help to begin.` },
  ]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const run = (raw: string) => {
    const result = runCommand({ cwdId, lines }, raw);
    setCwdId(result.session.cwdId);
    setLines(result.session.lines);
    if (raw.trim()) {
      setHist((h) => [...h, raw]);
      setHi(-1);
    }
    setInput("");
    if (result.extra === "reboot") window.setTimeout(reboot, 400);
    if (result.extra === "shutdown") window.setTimeout(shutdown, 400);
    if (result.extra === "lock") window.setTimeout(lock, 200);
    if (result.extra === "clear") setLines([]);
  };

  const cwd = pathOf(nodes, cwdId);

  return (
    <div
      className="flex h-full flex-col bg-os-bg px-3 py-2 font-mono text-[12.5px] leading-6 text-os-fg"
      onClick={() => field.current?.focus()}
    >
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto os-scroll whitespace-pre-wrap">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "err"
                ? "text-os-danger"
                : l.kind === "in"
                  ? "text-os-fg"
                  : l.kind === "sys"
                    ? "text-os-muted"
                    : "text-os-focus"
            }
          >
            {l.text}
          </div>
        ))}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
        >
          <span className="shrink-0 text-os-success">{`${cwd}>`}</span>
          <input
            ref={field}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
                if (hist[next] !== undefined) {
                  setHi(next);
                  setInput(hist[next]);
                }
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (hi < 0) return;
                const next = hi + 1;
                if (next >= hist.length) {
                  setHi(-1);
                  setInput("");
                } else {
                  setHi(next);
                  setInput(hist[next] ?? "");
                }
              }
            }}
            className="min-w-0 flex-1 bg-transparent outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}
