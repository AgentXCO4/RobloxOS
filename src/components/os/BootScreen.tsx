import { useEffect, useState } from "react";
import { RobloxMark } from "./RobloxMark";

const LINES = [
  "Initializing kernel...",
  "Loading system services...",
  "Mounting filesystem...",
  "Loading system applications...",
  "Loading Roblox...",
  "Starting desktop...",
  "System ready.",
];

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= LINES.length) {
      const t = window.setTimeout(onDone, 700);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCount((c) => c + 1), count === 0 ? 480 : 420);
    return () => window.clearTimeout(t);
  }, [count, onDone]);

  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [onDone]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-os-bg text-os-fg">
      <div className="flex flex-col items-center gap-8">
        <div className="text-os-accent diamond-spin">
          <RobloxMark className="size-16" glow />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.42em] text-os-muted">ROBLOX</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">OS</h1>
        </div>
        <div className="h-28 w-[min(86vw,320px)] font-mono text-xs leading-6 text-os-muted">
          {LINES.slice(0, count).map((line, i) => (
            <div key={line} className="boot-line" style={{ animationDelay: `${i * 20}ms` }}>
              {line}
            </div>
          ))}
        </div>
      </div>
      <p className="absolute bottom-6 text-[11px] tracking-wide text-os-subtle">Click to skip</p>
    </div>
  );
}
