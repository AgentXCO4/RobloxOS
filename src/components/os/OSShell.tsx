import { useCallback, useEffect } from "react";
import { useOS } from "@/lib/os/store";
import { BootScreen } from "./BootScreen";
import { LockScreen } from "./LockScreen";
import { PowerScreen } from "./PowerScreen";
import { Desktop } from "./Desktop";

export function OSShell() {
  const phase = useOS((s) => s.phase);
  const theme = useOS((s) => s.settings.theme);
  const accent = useOS((s) => s.settings.accent);
  const setPhase = useOS((s) => s.setPhase);
  const signIn = useOS((s) => s.signIn);
  const reboot = useOS((s) => s.reboot);
  const closePopups = useOS((s) => s.closePopups);
  const setPopup = useOS((s) => s.setPopup);
  const lock = useOS((s) => s.lock);

  const finishBoot = useCallback(() => setPhase("lock"), [setPhase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopups();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l" && phase === "desktop") {
        e.preventDefault();
        lock();
      }
      if (e.key === "Meta" || (e.ctrlKey && e.key === "Escape")) {
        if (phase === "desktop") setPopup("start");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePopups, lock, phase, setPopup]);

  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    return () => document.removeEventListener("contextmenu", prevent);
  }, []);

  return (
    <div
      className="h-dvh w-full overflow-hidden"
      data-os-theme={theme}
      data-os-accent={accent}
    >
      {phase === "boot" ? <BootScreen onDone={finishBoot} /> : null}
      {phase === "lock" ? <LockScreen onSignIn={signIn} /> : null}
      {phase === "sleep" ? (
        <PowerScreen mode="sleep" onRestart={signIn} />
      ) : null}
      {phase === "shutdown" ? (
        <PowerScreen mode="shutdown" onRestart={reboot} />
      ) : null}
      {phase === "desktop" ? <Desktop /> : null}
    </div>
  );
}
