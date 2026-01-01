
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameHost } from '../../hooks/useGameHost';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { RefreshCw, Lock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PromptSelection = () => {
    const { myPlayer } = useGame();
    const { confirmPrompt } = useGameHost();
    const [isConfirmed, setIsConfirmed] = useState(false);

    // In a real app we'd allow re-rolling here, for now it's just display & confirm
    // Slot machine animation would go here

    const slots = myPlayer?.slots;

    if (!slots) return <div>Loading Protocol...</div>;

    const handleConfirm = () => {
        setIsConfirmed(true);
        confirmPrompt();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md text-center space-y-8">
                <div className="space-y-2">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your Assignment</h2>
                    <h1 className="text-4xl font-display font-black tracking-tighter">TARGET ACQUIRED</h1>
                </div>

                <div className="space-y-4">
                    {['emotion', 'style', 'noun'].map((key, i) => (
                        <Card key={key} className="p-6 bg-white flex items-center justify-between group hover:border-black/20 transition-colors">
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{key}</p>
                                <p className="text-2xl font-black uppercase text-black">
                                    {slots[key as keyof typeof slots]}
                                </p>
                            </div>
                            {/* Visual flair only for now */}
                            <Lock className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                        </Card>
                    ))}
                </div>

                <div className="pt-8">
                    <Button
                        onClick={handleConfirm}
                        disabled={isConfirmed}
                        className="w-full h-16 text-lg rounded-full"
                    >
                        {isConfirmed ? (
                            <>Protocol Accepted <Check className="ml-2" /></>
                        ) : (
                            <>Confirm Frequency <Check className="ml-2" /></>
                        )}
                    </Button>
                    <p className="mt-4 text-xs text-gray-400 font-medium">
                        You will have 60 seconds to visualize this target.
                    </p>
                </div>
            </div>
        </div>
    );
};
