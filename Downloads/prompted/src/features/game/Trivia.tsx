
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';
import { useGameHost } from '../../hooks/useGameHost';
import { Button } from '../../components/ui/Button'; // Assuming Button is available
import { Card } from '../../components/ui/Card';     // Assuming Card is available

export const TriviaRound = () => {
    const { gameState, myPlayer } = useGame();
    // In a real app, we'd have logic to submit answers and score
    // For MVP v2.5, it's a visual "Intermission" while we generate images, 
    // or concurrent.

    // Simplification: Client side logic for answering
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // If no trivia generated yet (AI lag), show loading state
    if (!gameState.trivia) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-pulse">
                <h2 className="text-2xl font-display font-black tracking-tighter mb-4">ANALYZING ARTIFACTS...</h2>
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-8 text-gray-500 font-bold uppercase tracking-widest text-xs">AI IS GENERATING TRIVIA</p>
            </div>
        );
    }

    const handleSelect = (idx: number) => {
        if (selectedIdx !== null) return;
        setSelectedIdx(idx);
        // Reveal immediately for instant gratification
        setTimeout(() => setIsRevealed(true), 1500);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-xl mx-auto">
            <div className="w-full space-y-8">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Trivia Intermission</span>
                    <span>{gameState.timeLeft}s</span>
                </div>

                <h2 className="text-3xl font-display font-black tracking-tighter text-center leading-tight">
                    {gameState.trivia.question}
                </h2>

                <div className="grid gap-4">
                    {gameState.trivia.options.map((option, i) => {
                        let stateStyles = "bg-white border-transparent hover:border-black/10";

                        if (selectedIdx === i) stateStyles = "bg-black text-white scale-[1.02]";
                        if (isRevealed) {
                            if (i === gameState.trivia?.correctIndex) stateStyles = "bg-green-500 text-white border-green-600";
                            else if (selectedIdx === i) stateStyles = "bg-red-500 text-white border-red-600";
                            else stateStyles = "opacity-50";
                        }

                        return (
                            <Card
                                key={i}
                                onClick={() => handleSelect(i)}
                                className={`p-6 cursor-pointer font-bold transition-all duration-300 border-2 ${stateStyles}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-black">
                                        {['A', 'B', 'C', 'D'][i]}
                                    </div>
                                    <span className="text-lg">{option}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {isRevealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center font-bold text-gray-500 uppercase tracking-widest"
                    >
                        {selectedIdx === gameState.trivia.correctIndex ? "Correct!" : "Hardware Malfunction Detected"}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
