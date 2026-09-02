import type { AppDefinition, AppId } from "./types";

export const APPS: Record<AppId, AppDefinition> = {
  roblox: {
    id: "roblox",
    name: "Roblox",
    version: "1.0.0",
    system: true,
    pinned: true,
    singleton: true,
    defaultWidth: 980,
    defaultHeight: 640,
    minWidth: 520,
    minHeight: 380,
  },
  files: {
    id: "files",
    name: "Files",
    version: "1.0.0",
    system: true,
    pinned: true,
    singleton: false,
    defaultWidth: 860,
    defaultHeight: 560,
    minWidth: 480,
    minHeight: 360,
  },
  settings: {
    id: "settings",
    name: "Settings",
    version: "1.0.0",
    system: true,
    pinned: true,
    singleton: true,
    defaultWidth: 860,
    defaultHeight: 580,
    minWidth: 480,
    minHeight: 380,
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    version: "1.0.0",
    system: true,
    pinned: true,
    singleton: false,
    defaultWidth: 720,
    defaultHeight: 440,
    minWidth: 420,
    minHeight: 260,
  },
  notepad: {
    id: "notepad",
    name: "Notepad",
    version: "1.0.0",
    system: true,
    pinned: false,
    singleton: false,
    defaultWidth: 640,
    defaultHeight: 480,
    minWidth: 360,
    minHeight: 280,
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    version: "1.0.0",
    system: true,
    pinned: false,
    singleton: true,
    defaultWidth: 320,
    defaultHeight: 480,
    minWidth: 280,
    minHeight: 420,
  },
  viewer: {
    id: "viewer",
    name: "Photos",
    version: "1.0.0",
    system: true,
    pinned: false,
    singleton: false,
    hidden: true,
    defaultWidth: 720,
    defaultHeight: 520,
    minWidth: 360,
    minHeight: 280,
  },
};

export const START_APPS: AppId[] = [
  "roblox",
  "files",
  "settings",
  "terminal",
  "notepad",
  "calculator",
];

export const TASKBAR_PINNED: AppId[] = ["roblox", "files", "settings", "terminal"];

export type Experience = {
  id: string;
  name: string;
  creator: string;
  image: string;
  playing: string;
  visits: string;
  rating: number;
  genre: string;
  description: string;
  featured?: boolean;
};

export const EXPERIENCES: Experience[] = [
  {
    id: "pet-harbor",
    name: "Pet Harbor",
    creator: "Harbor Labs",
    image: "/experiences/pet-harbor.jpg",
    playing: "48.2K",
    visits: "910M",
    rating: 94,
    genre: "Simulation",
    description: "Adopt rare companions and build a waterfront sanctuary.",
    featured: true,
  },
  {
    id: "metro-life",
    name: "Metro Life",
    creator: "Civic Studio",
    image: "/experiences/metro-life.jpg",
    playing: "112K",
    visits: "2.1B",
    rating: 91,
    genre: "Roleplay",
    description: "Live, work, and wander a blocky megacity after dark.",
  },
  {
    id: "blade-odyssey",
    name: "Blade Odyssey",
    creator: "Iron Path",
    image: "/experiences/blade-odyssey.jpg",
    playing: "67.4K",
    visits: "640M",
    rating: 93,
    genre: "Action",
    description: "Climb the storm cliffs and master the wandering blade.",
  },
  {
    id: "sky-obby",
    name: "Sky Obby",
    creator: "Cloudline",
    image: "/experiences/sky-obby.jpg",
    playing: "29.1K",
    visits: "1.4B",
    rating: 88,
    genre: "Obby",
    description: "Race across floating isles. One mistimed jump ends the run.",
  },
  {
    id: "kart-circuit",
    name: "Kart Circuit",
    creator: "Redline Club",
    image: "/experiences/kart-circuit.jpg",
    playing: "18.6K",
    visits: "220M",
    rating: 90,
    genre: "Racing",
    description: "Twilight laps on a precision circuit. Draft, drift, repeat.",
  },
  {
    id: "block-tycoon",
    name: "Block Tycoon",
    creator: "Forgeworks",
    image: "/experiences/block-tycoon.jpg",
    playing: "33.8K",
    visits: "780M",
    rating: 87,
    genre: "Tycoon",
    description: "Spin up factories, droppers, and an empire of cubes.",
  },
];
