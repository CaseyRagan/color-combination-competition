import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Game Constants
export const APP_VERSION = '2.5.0';
export const PEER_PREFIX = 'prompted-v2-';
export const PUBLIC_LOBBY_ID = 'PUBLIC_LOBBY';

export const DRAWING_TIME = 60; // seconds
export const TRIVIA_TIME = 15; // seconds

export const AVATAR_COLORS = [
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-sky-100 text-sky-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
];

export const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Milo',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Sora',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Bola',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Zack',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Lilly',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Leo',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Bella',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Loki',
];

export const GRAFFITI_EMOJIS = ["🔥", "😂", "💀", "💩", "🎨", "🚀", "❤️", "👎", "👀", "🍆", "🍑", "🤡"];

