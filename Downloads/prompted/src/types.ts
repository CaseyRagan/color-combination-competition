
export enum GamePhase {
    HOME = 'HOME',
    PROFILE_SETUP = 'PROFILE_SETUP',
    MODE_SELECTION = 'MODE_SELECTION',
    JOIN_ROOM = 'JOIN_ROOM',
    LOBBY_WAITING = 'LOBBY_WAITING',
    PROMPT_SELECTION = 'PROMPT_SELECTION',
    DRAWING = 'DRAWING',
    COMBINING = 'COMBINING', // AI Generation happen here
    TRIVIA = 'TRIVIA',
    REVEAL = 'REVEAL',
    VOTING = 'VOTING', // Sub-phase of Reveal usually
    RESULTS = 'RESULTS',
    PASS_DEVICE = 'PASS_DEVICE', // For local pass & play
    GRAND_FINALE = 'GRAND_FINALE'
}

export interface Player {
    id: string;
    name: string;
    avatar: string; // URL or emoji
    avatarColor: string; // Tailwind class
    isHost: boolean;
    score: number;
    drawing?: string; // Base64 data URL
    slots?: PromptSlots; // The prompt they are drawing
    votesReceived: number;
    votedTargetId?: string | null;
}

export interface PromptSlots {
    emotion: string;
    style: string;
    noun: string;
    locked: boolean;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
}

export interface TriviaQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

// Global Game State
export interface GameState {
    phase: GamePhase;
    players: Player[];
    messages: ChatMessage[];
    settings: {
        roundTime: number;
        rounds: number;
        currentRound: number;
        roomCode: string;
    };
    timeLeft: number; // For timers
    combinedImage?: string; // The AI generated result
    trivia?: TriviaQuestion | null;
    judgeRoast?: string | null;
}

export interface GraffitiItem {
    id: string;
    x: number;
    y: number;
    emoji: string;
    rotation: number;
    scale: number;
    senderId: string;
}
