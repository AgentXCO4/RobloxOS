import { RobloxMark } from "./RobloxMark";

export function PowerScreen({
  mode,
  onRestart,
}: {
  mode: "shutdown" | "sleep";
  onRestart: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-os-bg text-os-fg">
      <RobloxMark className="size-12 text-os-accent" />
      <p className="mt-6 text-lg font-medium tracking-tight">
        {mode === "sleep" ? "Sleeping" : "Shutting down"}
      </p>
      <p className="mt-2 text-sm text-os-muted">
        {mode === "sleep" ? "Roblox OS is idle." : "It's now safe to leave this machine."}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-8 h-11 rounded-full bg-os-elevated px-6 text-sm font-medium text-os-fg os-shadow-sm transition-transform duration-150 ease-out hover:bg-os-hover active:scale-[0.96]"
      >
        {mode === "sleep" ? "Wake" : "Restart"}
      </button>
    </div>
  );
}
