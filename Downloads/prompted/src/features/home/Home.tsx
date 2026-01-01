import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { APP_VERSION } from '../../lib/constants';
import { TypewriterEffect } from '../../components/ui/FramerEffects';

// Simple text rotation animation for "Chaotic" feel
const FloatingEmoji = ({ emoji, delay }: { emoji: string, delay: string }) => (
    <div className={`absolute text-6xl animate-bounce`} style={{ animationDelay: delay, animationDuration: '3s', top: `${Math.random() * 80}%`, left: `${Math.random() * 90}%`, opacity: 0.2, zIndex: 0 }}>
        {emoji}
    </div>
);

export const Home: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Chaos */}
            <FloatingEmoji emoji="🎨" delay="0s" />
            <FloatingEmoji emoji="🤖" delay="1s" />
            <FloatingEmoji emoji="🔥" delay="0.5s" />
            <FloatingEmoji emoji="🥔" delay="2s" />

            <div className="relative z-10 w-full max-w-md space-y-12 text-center">
                {/* Logo / Title */}
                <div className="space-y-4 animate-in slide-in-from-bottom duration-700">
                    <div className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-4">
                        Version {APP_VERSION}
                    </div>
                    <h1 className="text-7xl font-display font-black tracking-tighter leading-[0.8] min-h-[1.2em]">
                        <TypewriterEffect
                            words={["PROMPTED", "CHAOTIC", "CURSED", "GIFTED"]}
                            cursorColor="#9333ea"
                            typingSpeed={150}
                            className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
                        />
                    </h1>
                    <p className="text-xl text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                        The party game where bad drawings become AI masterpieces.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-4 animate-in slide-in-from-bottom duration-1000 delay-200">
                    <Button
                        size="lg"
                        onClick={onStart}
                        className="w-full h-20 text-2xl rounded-3xl shadow-2xl shadow-purple-500/20 hover:scale-105 transition-transform"
                    >
                        Play with Friends
                    </Button>

                    <div className="pt-4 flex justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>• Free to Play</span>
                        <span>• No Signup</span>
                        <span>• Pure Chaos</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-[10px] text-gray-400 font-medium">
                Powered by Gemini 1.5 Flash
            </div>
        </div>
    );
};
