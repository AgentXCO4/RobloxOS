import { APPS } from "./apps";
import {
  childrenOf,
  findByPath,
  pathOf,
  resolvePath,
  ROOT_ID,
  userHomePath,
} from "./filesystem";
import { useOS } from "./store";
import { formatUptime } from "@/lib/utils";
import type { AppId } from "./types";

export type TermLine = { kind: "in" | "out" | "err" | "sys"; text: string };

export type TermSession = {
  cwdId: string;
  lines: TermLine[];
};

function out(text: string): TermLine[] {
  return [{ kind: "out", text }];
}
function err(text: string): TermLine[] {
  return [{ kind: "err", text }];
}

function tokenArgs(input: string) {
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  const args: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    args.push(m[1] ?? m[2] ?? m[3] ?? "");
  }
  return args;
}

export function runCommand(session: TermSession, raw: string): { session: TermSession; extra?: "reboot" | "shutdown" | "clear" | "lock" } {
  const trimmed = raw.trim();
  const os = useOS.getState();
  const echo: TermLine = { kind: "in", text: `${pathOf(os.nodes, session.cwdId)}> ${raw}` };
  if (!trimmed) {
    return { session: { ...session, lines: [...session.lines, echo] } };
  }

  const [cmd, ...rest] = tokenArgs(trimmed);
  const command = (cmd ?? "").toLowerCase();
  const argstr = rest.join(" ");
  const nodes = () => useOS.getState().nodes;

  const apply = (lines: TermLine[], cwdId = session.cwdId, extra?: "reboot" | "shutdown" | "clear" | "lock") => {
    if (extra === "clear") {
      return { session: { cwdId, lines: [] }, extra };
    }
    return { session: { cwdId, lines: [...session.lines, echo, ...lines] }, extra };
  };

  switch (command) {
    case "help":
      return apply(
        out(
          [
            "Roblox OS Terminal",
            "  help            Show this list",
            "  clear, cls      Clear the screen",
            "  dir, ls         List directory",
            "  cd              Change directory",
            "  pwd             Print working directory",
            "  mkdir, md       Create a folder",
            "  touch           Create a file",
            "  type, cat       Print a file",
            "  echo            Print text  (echo hi > file.txt)",
            "  delete, del, rm Delete a file or folder",
            "  rename, ren     Rename  (rename old new)",
            "  tree            Show folder tree",
            "  whoami          Current user",
            "  hostname        Machine name",
            "  systeminfo, ver System information",
            "  date            Current date",
            "  time            Current time",
            "  start           Launch an app  (start roblox)",
            "  lock            Lock the session",
            "  reboot          Restart Roblox OS",
            "  shutdown        Power off",
          ].join("\n"),
        ),
      );
    case "clear":
    case "cls":
      return apply([], session.cwdId, "clear");
    case "pwd":
      return apply(out(pathOf(nodes(), session.cwdId)));
    case "whoami":
      return apply(out(os.username));
    case "hostname":
      return apply(out("ROBLOX-OS"));
    case "date":
      return apply(out(new Date().toDateString()));
    case "time":
      return apply(out(new Date().toLocaleTimeString()));
    case "ver":
    case "systeminfo":
      return apply(
        out(
          [
            "Roblox OS 1.0",
            "Kernel: RobloxOS Kernel",
            `User: ${os.username}`,
            "Memory: Virtual Memory",
            `Uptime: ${formatUptime(Date.now() - os.bootedAt)}`,
            "Hostname: ROBLOX-OS",
            "Shell: rbxsh 1.0",
            "Roblox: preinstalled (protected)",
          ].join("\n"),
        ),
      );
    case "dir":
    case "ls": {
      const target = rest[0] ? resolvePath(nodes(), session.cwdId, rest[0]) : nodes()[session.cwdId];
      if (!target) return apply(err("Path not found."));
      if (target.kind !== "dir") return apply(out(target.name));
      const kids = childrenOf(nodes(), target.id);
      if (kids.length === 0) return apply(out("  (empty)"));
      const listing = kids
        .map((k) => {
          const mark = k.kind === "dir" ? "<DIR>" : "     ";
          return `  ${mark}  ${k.name}`;
        })
        .join("\n");
      return apply(out(`${pathOf(nodes(), target.id)}\n${listing}`));
    }
    case "cd": {
      if (!rest[0] || rest[0] === "~") {
        const home = findByPath(nodes(), userHomePath(os.username));
        return apply([], home?.id ?? session.cwdId);
      }
      const target = resolvePath(nodes(), session.cwdId, rest[0]);
      if (!target) return apply(err("The system cannot find the path specified."));
      if (target.kind !== "dir") return apply(err("Not a directory."));
      return apply([], target.id);
    }
    case "mkdir":
    case "md": {
      if (!rest[0]) return apply(err("Usage: mkdir <name>"));
      const error = useOS.getState().mkdir(session.cwdId, rest[0]);
      return apply(error ? err(error) : out(`Created ${rest[0]}`));
    }
    case "touch": {
      if (!rest[0]) return apply(err("Usage: touch <name>"));
      const error = useOS.getState().createFile(session.cwdId, rest[0], "");
      return apply(error ? err(error) : out(`Created ${rest[0]}`));
    }
    case "type":
    case "cat": {
      if (!rest[0]) return apply(err("Usage: type <file>"));
      const target = resolvePath(nodes(), session.cwdId, rest[0]);
      if (!target) return apply(err("File not found."));
      if (target.kind === "dir") return apply(err("Is a directory."));
      return apply(out(target.content ?? ""));
    }
    case "echo": {
      const redirect = trimmed.match(/^echo\s+([\s\S]*?)\s*>\s*(\S+)$/i);
      if (redirect) {
        const text = redirect[1] ?? "";
        const file = redirect[2] ?? "file.txt";
        const existing = resolvePath(nodes(), session.cwdId, file);
        if (existing && existing.kind === "file") {
          const error = useOS.getState().writeFile(existing.id, text);
          return apply(error ? err(error) : out(""));
        }
        const error = useOS.getState().createFile(session.cwdId, file, text);
        return apply(error ? err(error) : out(""));
      }
      return apply(out(argstr));
    }
    case "delete":
    case "del":
    case "rm":
    case "rd":
    case "rmdir": {
      if (!rest[0]) return apply(err("Usage: delete <name>"));
      const target = resolvePath(nodes(), session.cwdId, rest[0]);
      if (!target) return apply(err("Not found."));
      const error = useOS.getState().deleteNodes([target.id], command === "rmdir" || rest.includes("/s"));
      return apply(error ? err(error) : out(`Deleted ${target.name}`));
    }
    case "rename":
    case "ren": {
      if (rest.length < 2) return apply(err("Usage: rename <old> <new>"));
      const target = resolvePath(nodes(), session.cwdId, rest[0] ?? "");
      if (!target) return apply(err("Not found."));
      const error = useOS.getState().renameNode(target.id, rest[1] ?? "");
      return apply(error ? err(error) : out(`Renamed to ${rest[1]}`));
    }
    case "tree": {
      const render = (id: string, prefix: string): string[] => {
        const kids = childrenOf(nodes(), id);
        return kids.flatMap((k, i) => {
          const last = i === kids.length - 1;
          const branch = last ? "└── " : "├── ";
          const more = last ? "    " : "│   ";
          const line = `${prefix}${branch}${k.name}${k.kind === "dir" ? "\\" : ""}`;
          return k.kind === "dir" ? [line, ...render(k.id, prefix + more)] : [line];
        });
      };
      const rootLine = pathOf(nodes(), session.cwdId);
      return apply(out([rootLine, ...render(session.cwdId, "")].join("\n")));
    }
    case "start": {
      const key = (rest[0] ?? "").toLowerCase();
      const map: Record<string, AppId> = {
        roblox: "roblox",
        files: "files",
        explorer: "files",
        settings: "settings",
        terminal: "terminal",
        notepad: "notepad",
        calc: "calculator",
        calculator: "calculator",
      };
      const appId = map[key];
      if (!appId || !APPS[appId]) return apply(err("Unknown application."));
      useOS.getState().launchApp(appId);
      return apply(out(`Starting ${APPS[appId].name}...`));
    }
    case "lock":
      return apply(out("Locking..."), session.cwdId, "lock");
    case "reboot":
      return apply(out("Restarting Roblox OS..."), session.cwdId, "reboot");
    case "shutdown":
      return apply(out("Shutting down..."), session.cwdId, "shutdown");
    case "cd\\":
    case "cd/":
      return apply([], ROOT_ID);
    default:
      return apply(err(`'${cmd}' is not recognized as a command. Type help.`));
  }
}
