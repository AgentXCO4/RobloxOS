import RobloxApp from "@/components/apps/RobloxApp";
import FilesApp from "@/components/apps/FilesApp";
import SettingsApp from "@/components/apps/SettingsApp";
import TerminalApp from "@/components/apps/TerminalApp";
import NotepadApp from "@/components/apps/NotepadApp";
import CalculatorApp from "@/components/apps/CalculatorApp";
import ViewerApp from "@/components/apps/ViewerApp";
import { useOS } from "@/lib/os/store";
import type { AppId } from "@/lib/os/types";
import { WindowFrame } from "./WindowFrame";
import type { ComponentType } from "react";

const VIEWS: Record<AppId, ComponentType<{ windowId: string }>> = {
  roblox: RobloxApp,
  files: FilesApp,
  settings: SettingsApp,
  terminal: TerminalApp,
  notepad: NotepadApp,
  calculator: CalculatorApp,
  viewer: ViewerApp,
};

export function WindowManager() {
  const ids = useOS((s) => s.windowOrder);
  return (
    <>
      {ids.map((id) => (
        <ManagedWindow key={id} id={id} />
      ))}
    </>
  );
}

function ManagedWindow({ id }: { id: string }) {
  const appId = useOS((s) => s.windows[id]?.appId);
  if (!appId) return null;
  const View = VIEWS[appId];
  return (
    <WindowFrame id={id}>
      <View windowId={id} />
    </WindowFrame>
  );
}
