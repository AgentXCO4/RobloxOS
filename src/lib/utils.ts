import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function formatClock(date: Date, format: "12" | "24") {
  const h24 = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  if (format === "24") {
    return `${h24.toString().padStart(2, "0")}:${m}`;
  }
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ampm}`;
}

export function formatDateLong(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
