
import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { Home } from './home/Home';
import { UserProfile } from './lobby/UserProfile';
import { RoomSetup } from './lobby/RoomSetup';
import { Lobby } from './game/Lobby';
import { PromptSelection } from './game/PromptSelection';
import { DrawingCanvas } from './game/DrawingCanvas';
import { TriviaRound } from './game/Trivia';
import { RevealStage } from './game/Reveal';
import { ResultsLeaderboard } from './game/Results';
import { generateRoomCode } from '../lib/gameUtils';
import { GamePhase } from '../types';

export const GameOrchestrator = () => {
    const { gameState, setGameState, isHost, setMyId, setRoomCode } = useGame();
    const { handleCreateRoom, handleJoinRoom } = useMultiplayer();

    // Setup Handlers
    const startProfileSetup = () => setGameState(prev => ({ ...prev, phase: GamePhase.PROFILE_SETUP }));

    // 1. Profile Complete -> Go to Room Setup
    const handleProfileComplete = (name: string, avatarIdx: number, color: string) => {
        // Temp store user details in a way, or just pass to next step?
        // Let's store in a temp local object or just closure for now, 
        // effectively we need to know these when we create/join.
        // For simplicity, let's attach to 'myPlayer' placeholder or just hold in state here?
        // Better: Update GameState phase, but keep data? 
        // Actually, let's just pass them to the next component or store in refs.
        // Hack for now: Store in window or URL? No.
        // Let's usestate here.
        setLocalProfile({ name, avatarIdx, color });
        setGameState(prev => ({ ...prev, phase: GamePhase.JOIN_ROOM }));
    };

    const [localProfile, setLocalProfile] = React.useState<{ name: string, avatarIdx: number, color: string } | null>(null);

    // 2. Room Setup Actions
    const onCreate = () => {
        if (!localProfile) return;
        const code = generateRoomCode();
        setRoomCode(code); // Update context
        handleCreateRoom(code, localProfile.name, localProfile.avatarIdx, localProfile.color);
    };

    const onJoin = (code: string) => {
        if (!localProfile) return;
        setRoomCode(code); // Update context
        handleJoinRoom(code, localProfile.name, localProfile.avatarIdx, localProfile.color);

        // Optimistic update to lobby waiting, usually handled by peer connect event but for UX:
        setGameState(prev => ({ ...prev, phase: GamePhase.LOBBY_WAITING }));
    };

    const renderContent = () => {
        switch (gameState.phase) {
            case GamePhase.HOME:
                return <Home onStart={startProfileSetup} />;
            case GamePhase.PROFILE_SETUP:
                return <UserProfile onComplete={handleProfileComplete} onBack={() => setGameState(prev => ({ ...prev, phase: GamePhase.HOME }))} />;
            case GamePhase.JOIN_ROOM:
                return <RoomSetup onCreateRoom={onCreate} onJoinRoom={onJoin} onBack={() => setGameState(prev => ({ ...prev, phase: GamePhase.PROFILE_SETUP }))} />;
            case GamePhase.LOBBY_WAITING:
                return <Lobby />;
            case GamePhase.PROMPT_SELECTION:
                return <PromptSelection />;
            case GamePhase.DRAWING:
                return <DrawingCanvas />;
            case GamePhase.COMBINING:
                // Show a loading screen or keep DrawingCanvas with "Transmitted" state?
                // Or maybe Trivia Round handles the waiting?
                // Let's show Trivia Round immediately, it handles the "Analyzing" state.
                return <TriviaRound />;
            case GamePhase.TRIVIA:
                return <TriviaRound />;
            case GamePhase.REVEAL:
                return <RevealStage />;
            case GamePhase.RESULTS:
                return <ResultsLeaderboard />;
            default:
                return null;
        }
    };

    return (
        <>
            {renderContent()}
        </>
    );
};
