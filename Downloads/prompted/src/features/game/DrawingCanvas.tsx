import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameHost } from '../../hooks/useGameHost';
import { DrawingPad } from '../../components/DrawingPad';

export const DrawingCanvas = () => {
    const { gameState, isHost } = useGame();
    const { handleDrawingComplete } = useGameHost();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const onComplete = (dataUrl: string) => {
        setIsSubmitted(true);
        handleDrawingComplete(dataUrl);
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 animate-in zoom-in-50">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-display font-black tracking-tighter mb-2">DATA TRANSMITTED</h2>
                <p className="text-gray-500 font-medium">Awaiting other agents...</p>

                {isHost && (
                    <div className="mt-8 p-4 bg-white/50 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">NETWORK STATUS</p>
                        <div className="flex gap-2 justify-center">
                            {gameState.players.map(p => (
                                <div
                                    key={p.id}
                                    title={p.name}
                                    className={`w-3 h-3 rounded-full transition-colors ${p.drawing ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] p-4 pb-8 touch-none overflow-hidden">
            <div className="text-center mb-2 space-y-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">CURRENT OBJECTIVE</h3>
                {/* We need the local player's prompt here. Passed in context or from gameState if secure? */}
                {/* For simplicity assuming we can read our own slot from gameState or if not passed, generic. */}
                {/* Ideally PromptSelection passed it? MyPlayer has it. */}
                {/* Check MyPlayer logic in GameContext. */}
            </div>

            <DrawingPad
                timeLeft={gameState.timeLeft}
                onComplete={onComplete}
            />
        </div>
    );
};
