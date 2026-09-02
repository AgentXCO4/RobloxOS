import { cn } from "@/lib/utils";

export function RobloxMark({
  className,
  glow = false,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      aria-hidden
      fill="none"
    >
      {glow ? (
        <defs>
          <filter id="rbx-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      ) : null}
      <g transform="rotate(20 12 12)" filter={glow ? "url(#rbx-glow)" : undefined}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2.2" fill="currentColor" />
        <rect x="8.4" y="8.4" width="7.2" height="7.2" rx="1" className="fill-os-bg" />
      </g>
    </svg>
  );
}

export function AppGlyph({
  appId,
  className,
}: {
  appId: string;
  className?: string;
}) {
  const wrap = cn(
    "flex size-full items-center justify-center rounded-[22%] text-os-fg",
    className,
  );
  switch (appId) {
    case "roblox":
      return (
        <span className={cn(wrap, "bg-os-accent text-os-accent-fg")}>
          <RobloxMark className="size-[62%]" />
        </span>
      );
    case "files":
      return (
        <span className={cn(wrap, "bg-app-files")}>
          <FolderGlyph />
        </span>
      );
    case "settings":
      return (
        <span className={cn(wrap, "bg-app-settings")}>
          <GearGlyph />
        </span>
      );
    case "terminal":
      return (
        <span className={cn(wrap, "bg-app-terminal")}>
          <TermGlyph />
        </span>
      );
    case "notepad":
      return (
        <span className={cn(wrap, "bg-app-notepad")}>
          <NoteGlyph />
        </span>
      );
    case "calculator":
      return (
        <span className={cn(wrap, "bg-app-calc")}>
          <CalcGlyph />
        </span>
      );
    case "viewer":
      return (
        <span className={cn(wrap, "bg-app-photos")}>
          <PhotoGlyph />
        </span>
      );
    case "recycle":
      return (
        <span className={cn(wrap, "bg-app-bin")}>
          <BinGlyph />
        </span>
      );
    default:
      return (
        <span className={cn(wrap, "bg-os-hover")}>
          <span className="text-[10px] font-medium">{appId[0]?.toUpperCase()}</span>
        </span>
      );
  }
}

function FolderGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" fill="currentColor" aria-hidden>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2c.4 0 .8.2 1 .5l1 1.2c.2.3.6.5 1 .5H18.5A2.5 2.5 0 0 1 21 9.7v7.8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
    </svg>
  );
}
function GearGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" aria-hidden>
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 12.8a7.6 7.6 0 0 0 .06-1.6l2-1.2-1.8-3.2-2.3.6a7.7 7.7 0 0 0-1.4-1L15.7 3h-3.4l-.28 2.4a7.7 7.7 0 0 0-1.4 1l-2.3-.6L4.5 10l2 1.2a7.6 7.6 0 0 0 0 1.6l-2 1.2 1.8 3.2 2.3-.6a7.7 7.7 0 0 0 1.4 1l.28 2.4h3.4l.28-2.4a7.7 7.7 0 0 0 1.4-1l2.3.6 1.8-3.2-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function TermGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%] text-os-success" fill="none" aria-hidden>
      <path d="M5 8.5 9.5 12 5 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function NoteGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" fill="currentColor" aria-hidden>
      <path d="M7 3.5h7.2L19 8.2V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5H7Zm7 1.2V8h3.4L14 4.7ZM8.5 11h7v1.4h-7V11Zm0 3h7v1.4h-7V14Zm0 3h5v1.4h-5V17Z" />
    </svg>
  );
}
function CalcGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" fill="currentColor" aria-hidden>
      <path d="M7 3.5h10A2.5 2.5 0 0 1 19.5 6v12A2.5 2.5 0 0 1 17 20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Zm1 3v3h8v-3H8Zm0 5v2h2v-2H8Zm3.5 0v2h2v-2h-2Zm3.5 0v2h2v-2h-2ZM8 16v2h2v-2H8Zm3.5 0v2h2v-2h-2Zm3.5 0v2h2v-2h-2Z" />
    </svg>
  );
}
function PhotoGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="10.2" r="1.3" fill="currentColor" />
      <path d="M6.5 16.2 10 13l3 3 2.2-2.2 3.3 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BinGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" aria-hidden>
      <path d="M8 8.5h8l-.7 10.2a1.5 1.5 0 0 1-1.5 1.4h-3.6a1.5 1.5 0 0 1-1.5-1.4L8 8.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 8.2V6.4A1.4 1.4 0 0 1 11.4 5h1.2A1.4 1.4 0 0 1 14 6.4v1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
