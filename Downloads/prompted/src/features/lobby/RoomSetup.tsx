import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ArrowRight, Users, PlusCircle } from 'lucide-react';

interface RoomSetupProps {
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    onBack: () => void;
}

export const RoomSetup: React.FC<RoomSetupProps> = ({ onCreateRoom, onJoinRoom, onBack }) => {
    const [code, setCode] = useState('');
    const [mode, setMode] = useState<'select' | 'join'>('select');

    if (mode === 'join') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full max-w-md mx-auto animate-in slide-in-from-right duration-300">
                <div className="w-full space-y-8">
                    <Button variant="ghost" onClick={() => setMode('select')} className="pl-0 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black">
                        ← Back
                    </Button>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-display font-black tracking-tighter">JOIN OPERATIONS</h2>
                        <p className="text-gray-500 font-medium">Enter the secure frequency code.</p>
                    </div>

                    <Card className="p-2 bg-white border-2 border-black/5">
                        <input
                            className="w-full text-center text-5xl font-display font-black uppercase tracking-[0.2em] py-8 outline-none placeholder-gray-200"
                            placeholder="ABCD"
                            maxLength={4}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                        />
                    </Card>

                    <Button
                        className="w-full h-16 text-lg rounded-full"
                        onClick={() => onJoinRoom(code)}
                        disabled={code.length < 4}
                    >
                        Confirm Code <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full space-y-6">
                <Button variant="ghost" onClick={onBack} className="pl-0 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black">
                    ← Back
                </Button>

                <div className="space-y-2 mb-8">
                    <h2 className="text-4xl font-display font-black tracking-tighter">MISSION SELECT</h2>
                    <p className="text-gray-500 font-medium">Choose your protocol.</p>
                </div>

                <div className="grid gap-4">
                    <button
                        onClick={onCreateRoom}
                        className="group relative overflow-hidden bg-black text-white p-8 rounded-3xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/20"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                        <PlusCircle className="w-8 h-8 mb-4 text-white/80" />
                        <h3 className="text-2xl font-bold mb-1">Host Operations</h3>
                        <p className="text-white/60 text-sm font-medium">Create a new room and invite agents.</p>
                    </button>

                    <button
                        onClick={() => setMode('join')}
                        className="group relative overflow-hidden bg-white border border-gray-200 p-8 rounded-3xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98] hover:border-black/10 shadow-lg hover:shadow-xl"
                    >
                        <div className="absolute -bottom-10 -right-10 p-24 bg-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Users className="w-8 h-8 mb-4 text-black/80" />
                        <h3 className="text-2xl font-bold mb-1 text-black">Join Operations</h3>
                        <p className="text-gray-500 text-sm font-medium">Enter an existing room code.</p>
                    </button>
                </div>
            </div>
        </div>
    );
};
