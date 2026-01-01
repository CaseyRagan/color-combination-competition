import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { GameState, GamePhase, ChatMessage, GraffitiItem, Player } from '../types';

interface GameContextType {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    isHost: boolean;
    setIsHost: (isHost: boolean) => void;
    myId: string | null;
    setMyId: (id: string) => void;
    peerRef: React.MutableRefObject<any>;
    connectionsRef: React.MutableRefObject<any[]>;
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    graffiti: GraffitiItem[];
    addGraffitiLocally: (item: GraffitiItem) => void;
    playMode: 'local' | 'random' | 'friends';
    setPlayMode: (mode: 'local' | 'random' | 'friends') => void;
    roomCode: string;
    setRoomCode: (code: string) => void;
    myPlayer: Player | undefined;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // Core Game State
    const [gameState, setGameState] = useState<GameState>({
        phase: GamePhase.HOME,
        players: [],
        messages: [],
        settings: {
            roundTime: 60,
            rounds: 3,
            currentRound: 1,
            roomCode: ''
        },
        timeLeft: 0,
        combinedImage: undefined,
        trivia: null,
        judgeRoast: null
    });

    // Networking Refs
    const peerRef = useRef<any>(null);
    const connectionsRef = useRef<any[]>([]);

    // Local Client State
    const [isHost, setIsHost] = useState(false);
    const [myId, setMyId] = useState<string | null>(null);
    const [playMode, setPlayMode] = useState<'local' | 'random' | 'friends'>('friends');
    const [roomCode, setRoomCode] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [graffiti, setGraffiti] = useState<GraffitiItem[]>([]);

    const addGraffitiLocally = (item: GraffitiItem) => {
        setGraffiti(prev => [...prev, item]);
        setTimeout(() => {
            setGraffiti(prev => prev.filter(g => g.id !== item.id));
        }, 4000);
    };

    const myPlayer = gameState.players.find(p => p.id === (isHost ? 'host' : myId));

    const value: GameContextType = {
        gameState,
        setGameState,
        isHost,
        setIsHost,
        myId,
        setMyId,
        peerRef,
        connectionsRef,
        chatMessages,
        setChatMessages,
        graffiti,
        addGraffitiLocally,
        playMode,
        setPlayMode,
        roomCode,
        setRoomCode,
        myPlayer
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
};
