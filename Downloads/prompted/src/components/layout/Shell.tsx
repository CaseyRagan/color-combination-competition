import React from 'react';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-[#F2F1F6]">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

            {/* Glass Overlay Texture */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none z-0" />

            {/* Content Info Badge */}
            <div className="absolute top-4 left-4 z-50">
                <div className="px-3 py-1 bg-black/5 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                    Prompted v2.5
                </div>
            </div>

            {/* Online Status */}
            <div className="absolute top-4 right-4 z-50">
                <div className="px-3 py-1 bg-white/40 backdrop-blur-md rounded-full border border-white/40 text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
