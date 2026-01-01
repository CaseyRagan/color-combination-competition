
import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameHost } from '../../hooks/useGameHost';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Crown, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResultsLeaderboard = () => {
    const { gameState, isHost } = useGame();
    const { handleNextRound } = useGameHost();
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
        <div className="min-h-screen flex flex-col items-center p-6 pb-24 relative overflow-y-auto">
            <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10">

                {/* Judge's Roast */}
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-display font-black tracking-tighter uppercase">THE VERDICT</h2>
                    {gameState.judgeRoast ? (
                        <div className="bg-black text-white p-6 rounded-tr-3xl rounded-bl-3xl shadow-xl transform -rotate-1">
                            <p className="font-display font-bold text-lg md:text-xl leading-relaxed">
                                "{gameState.judgeRoast}"
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-widest">
                                <Sparkles className="w-4 h-4 text-yellow-500" /> AI Judge
                            </div>
                        </div>
                    ) : (
                        <div className="animate-pulse bg-gray-200 h-24 rounded-2xl w-full" />
                    )}
                </div>

                {/* Leaderboard */}
                <div className="space-y-4">
                    {sortedPlayers.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`flex items-center gap-4 p-4 ${i === 0 ? 'border-yellow-400 bg-yellow-50/50 scale-105 shadow-yellow-200' : 'bg-white'}`}>
                                <div className="font-display font-black text-2xl w-8 text-center text-gray-300">#{i + 1}</div>
                                <div className={`w-12 h-12 rounded-full ${p.avatarColor} flex items-center justify-center shrink-0 relative`}>
                                    <img src={p.avatar} className="w-8 h-8 object-contain" />
                                    {i === 0 && <Crown className="absolute -top-4 -right-2 w-6 h-6 text-yellow-500 fill-yellow-500 animate-bounce" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-lg truncate">{p.name}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{p.score} Points</div>
                                </div>
                                {p.votesReceived > 0 && (
                                    <div className="bg-black text-white px-2 py-1 rounded-md text-xs font-bold">
                                        +{p.votesReceived} Votes
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {isHost && (
                    <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50">
                        <Button
                            className="w-full h-16 text-xl rounded-full shadow-2xl"
                            onClick={handleNextRound}
                            variant="primary"
                        >
                            Next Round <Trophy className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
