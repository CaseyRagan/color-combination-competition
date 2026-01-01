import { Player } from "../types";
import { AVATAR_COLORS, AVATAR_OPTIONS, PEER_PREFIX } from "./constants";

export const generateRoomCode = (): string => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const createPlayer = (id: string, name: string, avatarIndex: number): Player => {
    return {
        id,
        name: name || `Agent ${id.substring(0, 3)}`,
        avatar: AVATAR_OPTIONS[avatarIndex % AVATAR_OPTIONS.length],
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        isHost: false,
        score: 0,
        votesReceived: 0,
        votedTargetId: null // Initialize as null
    };
};
