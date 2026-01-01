
import { useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GamePhase } from '../types';
import { generateCombinedImage, generateTrivia, generateRoast } from '../services/geminiService';
import { useMultiplayer } from './useMultiplayer';
import { DRAWING_TIME, TRIVIA_TIME } from '../lib/constants';

export const useGameHost = () => {
    const { gameState, setGameState, isHost, myPlayer } = useGame();
    const { broadcastState } = useMultiplayer();

    // Timer Logic
    useEffect(() => {
        if (!isHost) return;

        let interval: NodeJS.Timeout;
        if (gameState.timeLeft > 0) {
            interval = setInterval(() => {
                setGameState(prev => {
                    const newTime = prev.timeLeft - 1;
                    const newState = { ...prev, timeLeft: newTime };

                    // Phase Transitions on Timeout
                    if (newTime === 0) {
                        if (prev.phase === GamePhase.DRAWING) {
                            // Force move to combining if time runs out
                            return { ...newState, phase: GamePhase.COMBINING };
                        }
                        if (prev.phase === GamePhase.TRIVIA) {
                            return { ...newState, phase: GamePhase.REVEAL };
                        }
                    }

                    broadcastState(newState); // Optimisation: maybe don't broadcast every second?
                    // For transparency/sync, broadcasting every second is easiest for mvp.
                    return newState;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isHost, gameState.timeLeft, gameState.phase]);

    // Phase Logic: COMBINING -> TRIVIA -> RESULTS
    useEffect(() => {
        if (!isHost) return;

        const runAI = async () => {
            if (gameState.phase === GamePhase.COMBINING && !gameState.combinedImage) {
                try {
                    // 1. Generate Image
                    const drawings = gameState.players
                        .filter(p => p.drawing)
                        .map(p => ({ image: p.drawing!, slots: p.slots! }));

                    if (drawings.length === 0) {
                        // No one drew? Skip
                        setGameState(prev => ({ ...prev, phase: GamePhase.RESULTS }));
                        return;
                    }

                    const image = await generateCombinedImage(drawings);

                    // 2. Generate Trivia (Parallel or Sequential?)
                    const trivia = await generateTrivia(image);

                    // 3. Update State
                    setGameState(prev => {
                        const updated = {
                            ...prev,
                            combinedImage: image,
                            trivia: trivia,
                            phase: GamePhase.TRIVIA, // Move to Trivia
                            timeLeft: TRIVIA_TIME
                        };
                        broadcastState(updated);
                        return updated;
                    });

                } catch (e) {
                    console.error("AI Gen Failed", e);
                    setGameState(prev => ({ ...prev, phase: GamePhase.RESULTS }));
                }
            }
        };

        runAI();

    }, [isHost, gameState.phase]);

    // Roast Logic at Results
    useEffect(() => {
        if (!isHost) return;

        const doRoast = async () => {
            if (gameState.phase === GamePhase.RESULTS && !gameState.judgeRoast && gameState.combinedImage) {
                const prompts = gameState.players.map(p => p.slots?.noun || 'Nothing');
                const roast = await generateRoast(gameState.combinedImage, 'roast', prompts);
                setGameState(prev => {
                    const updated = { ...prev, judgeRoast: roast };
                    broadcastState(updated);
                    return updated;
                });
            }
        };
        doRoast();
    }, [isHost, gameState.phase]);


    // Host Actions
    const startGame = () => {
        if (isHost) {
            setGameState(prev => {
                const updated = {
                    ...prev,
                    phase: GamePhase.PROMPT_SELECTION,
                    settings: { ...prev.settings } // Reset round logic if needed
                };
                broadcastState(updated);
                return updated;
            });
        }
    };

    const confirmPrompt = () => {
        if (isHost) {
            setGameState(prev => {
                const updated = { ...prev, phase: GamePhase.DRAWING, timeLeft: DRAWING_TIME };
                broadcastState(updated);
                return updated;
            });
        }
    };

    const handleDrawingComplete = (dataUrl?: string) => {
        if (isHost && myPlayer) {
            setGameState(prev => {
                const players = prev.players.map(p => p.id === 'host' ? { ...p, drawing: dataUrl } : p);

                // host updates self, check for all done
                const allDone = players.every(p => !!p.drawing);

                if (allDone) {
                    const updated = { ...prev, players, phase: GamePhase.COMBINING, timeLeft: 0 };
                    broadcastState(updated);
                    return updated;
                }

                const updated = { ...prev, players };
                // broadcastState(updated); // Wait, handleData loop does broadcast for clients... 
                // Host updating local state doesn't trigger handleData listener.
                // WE MUST BROADCAST HERE.
                broadcastState(updated);
                return updated;
            });
        }
    };

    const castVote = (targetId: string) => {
        if (isHost && myPlayer) {
            setGameState(prev => {
                // Host voting logic similar to handleData
                // ... (simplified for brevity, logic shared via handleData mainly for clients)
                // For host, we just update local state and broadcast
                const updatedPlayers = prev.players.map(p => {
                    if (p.id === 'host') return { ...p, votedTargetId: targetId };
                    if (p.id === targetId) return { ...p, votesReceived: p.votesReceived + 1, score: p.score + 100 };
                    return p;
                });

                const updated = { ...prev, players: updatedPlayers };
                broadcastState(updated);
                return updated;
            });
        }
    };

    const handleNextRound = () => {
        // Reset for new round or end game
        setGameState(prev => {
            const updated = {
                ...prev,
                phase: GamePhase.PROMPT_SELECTION,
                combinedImage: undefined,
                trivia: null,
                judgeRoast: null,
                players: prev.players.map(p => ({ ...p, drawing: undefined, slots: undefined, votesReceived: 0, votedTargetId: null }))
            };
            // Re-roll slots for everyone? 
            // Ideally we do that on transition.

            broadcastState(updated);
            return updated;
        });
    };

    return {
        startGame,
        confirmPrompt,
        handleDrawingComplete,
        castVote,
        handleNextRound
    };
};
