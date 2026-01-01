import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Play, Copy, Share2 } from 'lucide-react';
import { useGameHost } from '../../hooks/useGameHost';

export const Lobby = () => {
    const { gameState, isHost, myPlayer, roomCode } = useGame();
    const { startGame } = useGameHost();

    // Display actual lobby code if available, fallback to settings
    const displayCode = roomCode || gameState.settings.roomCode || "WAIT";

    return (
        <div className="flex flex-col items-center min-h-screen p-6 pt-12 max-w-lg mx-auto">
            <div className="text-center space-y-2 mb-10 animate-in fade-in slide-in-from-top-4">
                <h1 className="text-5xl font-display font-black tracking-tighter uppercase">LOBBY</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Waiting for Agents
                </div>
            </div>

            {/* Room Code Card */}
            <Card className="w-full p-8 mb-8 text-center bg-white/80 backdrop-blur-xl border-dashed border-2 border-gray-300">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">ROOM CODE</p>
                <div className="text-6xl font-display font-black tracking-widest text-black mb-6 select-all">
                    {displayCode}
                </div>
                <div className="flex gap-2 justify-center">
                    <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(displayCode)}>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button variant="secondary" size="sm">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                </div>
            </Card>

            {/* Players Grid */}
            <div className="w-full mb-12">
                <div className="flex justify-between items-end mb-4 px-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Agents Connected ({gameState.players.length})</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {gameState.players.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 animate-in zoom-in-50">
                            <div className={`w-10 h-10 rounded-full ${p.avatarColor} flex items-center justify-center shrink-0`}>
                                <img src={p.avatar} className="w-8 h-8 object-contain" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{p.name}</p>
                                {p.isHost && <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">👑 Host</span>}
                            </div>
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, 4 - gameState.players.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex items-center justify-center h-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 text-xs font-bold uppercase tracking-widest">
                            Waiting...
                        </div>
                    ))}
                </div>
            </div>

            {/* Host Controls */}
            {isHost ? (
                <div className="fixed bottom-8 w-full max-w-md px-6 z-50">
                    <Button
                        className="w-full h-16 text-xl rounded-full shadow-2xl shadow-green-900/20"
                        onClick={startGame}
                    >
                        Initialize Mission ({gameState.players.length}/8)
                    </Button>
                </div>
            ) : (
                <div className="fixed bottom-8 w-full max-w-md px-6 text-center text-gray-400 font-medium animate-pulse">
                    Waiting for Host to start...
                </div>
            )}
        </div>
    );
};
