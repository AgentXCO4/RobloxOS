import { useMemo, useState } from "react";
import { EXPERIENCES, type Experience } from "@/lib/os/apps";
import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import { RobloxMark } from "@/components/os/RobloxMark";
import { House, Compass, Shirt, Users, MessageSquare, Play, ArrowLeft, Search } from "lucide-react";

type Tab = "home" | "charts" | "avatar" | "friends" | "messages";

const FRIENDS = [
  { name: "PixelNova", status: "Playing Metro Life" },
  { name: "BuildMaster", status: "Online" },
  { name: "NeonKat", status: "Playing Sky Obby" },
  { name: "AgentZero", status: "Studio" },
  { name: "ForgeKit", status: "Offline" },
];

export default function RobloxApp() {
  const username = useOS((s) => s.username);
  const avatar = useOS((s) => s.settings.avatar);
  const update = useOS((s) => s.updateSettings);
  const notify = useOS((s) => s.pushNotification);
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<Experience | null>(null);
  const [joining, setJoining] = useState<Experience | null>(null);
  const [progress, setProgress] = useState(0);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERIENCES.filter(
      (g) => !q || g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q),
    );
  }, [query]);

  const play = (g: Experience) => {
    setJoining(g);
    setProgress(8);
    let p = 8;
    const id = window.setInterval(() => {
      p = Math.min(100, p + 10 + Math.random() * 18);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(id);
        setJoining(null);
        setPlaying(g);
        notify({
          appId: "roblox",
          title: g.name,
          body: "You joined a server.",
        });
      }
    }, 180);
  };

  if (playing) {
    return (
      <PlaySession
        game={playing}
        username={username}
        avatar={avatar}
        onLeave={() => setPlaying(null)}
      />
    );
  }

  return (
    <div className="flex h-full bg-os-bg text-os-fg">
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-os-border py-3 sm:w-48 sm:items-stretch sm:px-2">
        <div className="mb-3 flex items-center justify-center gap-2 px-2 sm:justify-start">
          <RobloxMark className="size-6 text-os-accent" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">Roblox</span>
        </div>
        {(
          [
            ["home", House, "Home"],
            ["charts", Compass, "Charts"],
            ["avatar", Shirt, "Avatar"],
            ["friends", Users, "Friends"],
            ["messages", MessageSquare, "Messages"],
          ] as const
        ).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-os-sm px-2 text-sm sm:justify-start sm:px-3",
              tab === id ? "bg-os-hover text-os-fg" : "text-os-muted hover:bg-os-hover hover:text-os-fg",
            )}
          >
            <Icon className="size-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center gap-2 border-b border-os-border px-4">
          <Search className="size-4 text-os-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-os-subtle"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto os-scroll p-4">
          {tab === "home" || tab === "charts" ? (
            <HomeGrid
              featured={EXPERIENCES[0]!}
              games={tab === "charts" ? [...list].sort((a, b) => b.rating - a.rating) : list}
              onPlay={play}
            />
          ) : null}
          {tab === "avatar" ? (
            <AvatarPane avatar={avatar} username={username} onChange={(a) => update({ avatar: a })} />
          ) : null}
          {tab === "friends" ? (
            <div className="space-y-1">
              {FRIENDS.map((f) => (
                <div key={f.name} className="flex items-center gap-3 rounded-os px-2 py-2 hover:bg-os-hover">
                  <BlockyMini />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-[12px] text-os-muted">{f.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {tab === "messages" ? (
            <p className="py-12 text-center text-sm text-os-muted">
              No messages yet. Friends can reach you while you play.
            </p>
          ) : null}
        </div>
      </div>
      {joining ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-os-bg/92">
          <RobloxMark className="size-10 text-os-accent diamond-spin" />
          <p className="mt-5 text-lg font-semibold">{joining.name}</p>
          <p className="mt-1 text-sm text-os-muted">Joining server...</p>
          <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-os-hover">
            <div
              className="h-full bg-os-accent transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HomeGrid({
  featured,
  games,
  onPlay,
}: {
  featured: Experience;
  games: Experience[];
  onPlay: (g: Experience) => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onPlay(featured)}
        className="relative block w-full overflow-hidden rounded-os-lg text-left"
      >
        <img src={featured.image} alt="" className="h-44 w-full object-cover sm:h-56" />
        <div className="absolute inset-0 bg-gradient-to-t from-os-bg via-os-bg/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] font-medium tracking-wide text-os-muted uppercase">Featured</p>
          <p className="text-xl font-semibold">{featured.name}</p>
          <p className="mt-1 max-w-md text-sm text-os-muted">{featured.description}</p>
          <span className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-os-accent px-4 text-sm font-medium text-os-accent-fg">
            <Play className="size-3.5 fill-current" />
            Play
          </span>
        </div>
      </button>
      <p className="mt-6 mb-3 text-[12px] font-medium text-os-muted">Recommended</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {games.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onPlay(g)}
            className="overflow-hidden rounded-os bg-os-elevated text-left hover:bg-os-hover"
          >
            <img src={g.image} alt="" className="h-24 w-full object-cover sm:h-28" />
            <div className="p-2.5">
              <p className="truncate text-[13px] font-medium">{g.name}</p>
              <p className="mt-0.5 text-[11px] text-os-subtle">
                {g.playing} playing · {g.genre}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AvatarPane({
  avatar,
  username,
  onChange,
}: {
  avatar: { head: string; torso: string; arms: string; legs: string };
  username: string;
  onChange: (a: typeof avatar) => void;
}) {
  const fields = [
    ["head", "Head"],
    ["torso", "Torso"],
    ["arms", "Arms"],
    ["legs", "Legs"],
  ] as const;
  return (
    <div className="flex flex-col items-center gap-6 py-4 sm:flex-row sm:items-start">
      <div className="flex w-48 flex-col items-center rounded-os-lg bg-os-elevated p-6">
        <BlockyAvatar colors={avatar} large />
        <p className="mt-4 text-sm font-medium">{username}</p>
        <p className="text-[12px] text-os-muted">Currently wearing</p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {fields.map(([key, label]) => (
          <label key={key} className="rounded-os bg-os-elevated p-3 text-sm">
            <span className="mb-2 block text-os-muted">{label}</span>
            <input
              type="color"
              value={avatar[key]}
              onChange={(e) => onChange({ ...avatar, [key]: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-os-xs bg-transparent"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function PlaySession({
  game,
  username,
  avatar,
  onLeave,
}: {
  game: Experience;
  username: string;
  avatar: { head: string; torso: string; arms: string; legs: string };
  onLeave: () => void;
}) {
  const [chat, setChat] = useState([
    { user: "System", text: `Welcome to ${game.name}` },
    { user: "PixelNova", text: "gg everyone" },
    { user: "BuildMaster", text: "new server feels smooth" },
  ]);
  const [draft, setDraft] = useState("");

  return (
    <div className="relative flex h-full flex-col bg-os-bg text-os-fg">
      <div className="flex h-10 items-center justify-between gap-2 bg-os-bg/70 px-3">
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-1 text-[12px] text-os-muted hover:text-os-fg"
        >
          <ArrowLeft className="size-3.5" />
          Leave
        </button>
        <p className="truncate text-[12px] font-medium">{game.name}</p>
        <p className="text-[11px] text-os-muted tabular-nums">12 / 20</p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <img src={game.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-os-bg/80 via-transparent to-os-bg/30" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <BlockyAvatar colors={avatar} large />
          <p className="mt-2 text-center text-[11px] font-medium drop-shadow">{username}</p>
        </div>
        <div className="absolute top-3 right-3 w-36 rounded-os bg-os-bg/60 p-2 text-[11px]">
          <p className="mb-1 font-medium">Players</p>
          {["PixelNova", "BuildMaster", username, "NeonKat"].map((n) => (
            <p key={n} className="truncate text-os-muted">
              {n}
            </p>
          ))}
        </div>
      </div>
      <div className="bg-os-bg/85 p-2">
        <div className="mb-2 max-h-16 overflow-y-auto os-scroll px-1 text-[11px]">
          {chat.map((c, i) => (
            <p key={i}>
              <span className="font-medium text-os-fg">{c.user}: </span>
              <span className="text-os-muted">{c.text}</span>
            </p>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            setChat((c) => [...c, { user: username, text: draft.trim() }]);
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Press Enter to chat"
            className="h-8 w-full rounded-os-sm bg-os-elevated px-2 text-[12px] outline-none"
          />
        </form>
      </div>
    </div>
  );
}

function BlockyAvatar({
  colors,
  large,
}: {
  colors: { head: string; torso: string; arms: string; legs: string };
  large?: boolean;
}) {
  const s = large ? 1.2 : 0.7;
  return (
    <div className="relative mx-auto" style={{ width: 72 * s, height: 108 * s }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[4px]"
        style={{ background: colors.head, width: 28 * s, height: 28 * s, top: 0 }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[3px]"
        style={{ background: colors.torso, width: 32 * s, height: 36 * s, top: 30 * s }}
      />
      <div
        className="absolute rounded-[3px]"
        style={{ background: colors.arms, width: 12 * s, height: 36 * s, top: 30 * s, left: 4 * s }}
      />
      <div
        className="absolute rounded-[3px]"
        style={{ background: colors.arms, width: 12 * s, height: 36 * s, top: 30 * s, right: 4 * s }}
      />
      <div
        className="absolute rounded-[3px]"
        style={{ background: colors.legs, width: 14 * s, height: 36 * s, top: 68 * s, left: 18 * s }}
      />
      <div
        className="absolute rounded-[3px]"
        style={{ background: colors.legs, width: 14 * s, height: 36 * s, top: 68 * s, right: 18 * s }}
      />
    </div>
  );
}

function BlockyMini() {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-os-hover">
      <span className="size-3 rounded-[2px] bg-os-accent" />
    </span>
  );
}
