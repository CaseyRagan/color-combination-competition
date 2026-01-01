import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameHost } from '../../hooks/useGameHost';
import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';

export const RevealStage = () => {
    const { gameState, myPlayer, isHost } = useGame();
    const { castVote } = useGameHost();
    const [hasVoted, setHasVoted] = useState(false);

    // Vote logic
    const handleVote = (targetId: string) => {
        if (hasVoted || targetId === myPlayer?.id) return;
        setHasVoted(true);
        castVote(targetId);
    };

    if (!gameState.combinedImage) return <div className="p-10 font-black text-center">GENERATING MASTERPIECE...</div>;

    return (
        <div className="min-h-screen relative flex flex-col">
            {/* Main Image Area */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center pb-32">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative w-full max-w-4xl aspect-[16/9] bg-black rounded-3xl shadow-2xl overflow-hidden group"
                >
                    <img
                        src={gameState.combinedImage}
                        className="w-full h-full object-cover"
                        alt="Masterpiece"
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-24 text-white">
                        <h2 className="text-3xl font-display font-black tracking-tighter uppercase mb-2">The Result</h2>
                        <p className="opacity-80 font-medium">Behold the chaos.</p>
                    </div>
                </motion.div>

                {/* Original Sketches (Mini) */}
                <div className="mt-8 flex gap-4 overflow-x-auto p-4 w-full max-w-4xl bg-white/50 backdrop-blur-md rounded-2xl border border-white/40">
                    {gameState.players.map(p => (
                        p.drawing && (
                            <div key={p.id} className="w-24 h-24 bg-white rounded-lg shadow-sm shrink-0 border border-gray-100 overflow-hidden relative">
                                <img src={p.drawing} className="w-full h-full object-contain opacity-50 hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 inset-x-0 bg-black/5 p-1 text-[8px] font-bold text-center truncate">
                                    {p.name}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Voting Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Vote for MVP</h3>
                        {hasVoted && <span className="text-green-600 font-bold text-xs flex items-center gap-1"><Heart className="w-4 h-4 fill-green-600" /> Vote Submitted</span>}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {gameState.players.map(p => (
                            <button
                                key={p.id}
                                disabled={hasVoted || p.id === myPlayer?.id}
                                onClick={() => handleVote(p.id)}
                                className={`
                                    flex items-center gap-3 p-3 pr-6 rounded-full border-2 transition-all shrink-0
                                    ${hasVoted && p.id === myPlayer?.votedTargetId ? 'bg-black text-white border-black' : 'bg-white border-gray-100 hover:border-black'}
                                    ${p.id === myPlayer?.id ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-full ${p.avatarColor} flex items-center justify-center font-bold text-xs`}>
                                    {p.name.charAt(0)}
                                </div>
                                <span className="font-bold text-sm">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
