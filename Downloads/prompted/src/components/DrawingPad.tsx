import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Undo, Trash2, CheckCircle, Pen, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawingPadProps {
    onComplete: (dataUrl: string) => void;
    timeLeft: number;
    initialData?: string;
    readOnly?: boolean;
}

export const DrawingPad: React.FC<DrawingPadProps> = ({
    onComplete,
    timeLeft,
    initialData,
    readOnly = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'fill'>('pen');
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);

    // Initial Setup
    // ... (keep usage of useEffect for resize) ...

    // ... (keep saveState and undo) ...

    // Flood Fill Algorithm
    const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Get target color
        const targetColorPos = (y * width + x) * 4;
        const targetR = data[targetColorPos];
        const targetG = data[targetColorPos + 1];
        const targetB = data[targetColorPos + 2];
        const targetA = data[targetColorPos + 3];

        // Parse fill color
        const dummy = document.createElement('div');
        dummy.style.color = fillColor;
        document.body.appendChild(dummy);
        const fillStyle = window.getComputedStyle(dummy).color;
        document.body.removeChild(dummy);
        const [fillR, fillG, fillB] = fillStyle.match(/\d+/g)!.map(Number);
        const fillA = 255;

        if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) return;

        const stack = [[x, y]];

        while (stack.length) {
            const [cx, cy] = stack.pop()!;
            let pos = (cy * width + cx) * 4;

            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;

            // Check if current pixel matches target color
            if (data[pos] === targetR && data[pos + 1] === targetG && data[pos + 2] === targetB && data[pos + 3] === targetA) {
                // Fill current pixel
                data[pos] = fillR;
                data[pos + 1] = fillG;
                data[pos + 2] = fillB;
                data[pos + 3] = fillA;

                stack.push([cx + 1, cy]);
                stack.push([cx - 1, cy]);
                stack.push([cx, cy + 1]);
                stack.push([cx, cy - 1]);
            }
        }

        ctx.putImageData(imageData, 0, 0);
        saveState();
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);

        if (tool === 'fill') {
            floodFill(ctx, Math.floor(x), Math.floor(y), color);
            return;
        }

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || readOnly || tool === 'fill') return; // Don't draw if fill mode
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        e.preventDefault(); // Prevent scrolling on touch

        const { x, y } = getCoordinates(e, canvas);

        ctx.lineWidth = tool === 'eraser' ? 20 : brushSize;
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveState();
        }
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
        }
    };

    const handleSubmit = () => {
        if (canvasRef.current) {
            onComplete(canvasRef.current.toDataURL('image/png'));
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative">
            {/* Toolbar */}
            {!readOnly && (
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-black/5">
                        <button
                            onClick={() => setTool('pen')}
                            className={`p-3 rounded-full transition-all ${tool === 'pen' ? 'bg-black text-white scale-110' : 'text-gray-400 hover:text-black'}`}
                        >
                            <Pen className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-3 rounded-full transition-all ${tool === 'eraser' ? 'bg-gray-200 text-black scale-110' : 'text-gray-400 hover:text-black'}`}
                        >
                            <Eraser className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setTool('fill')}
                            className={`p-3 rounded-full transition-all ${tool === 'fill' ? 'bg-purple-100 text-purple-600 scale-110' : 'text-gray-400 hover:text-black'}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                                <path d="M62.232 127.779C47.707 120.732 32.577 112.666 21.115 102.152C12.982 94.692 7.805 84.792 3.657 75.144C0.818 68.541 -0.151 61.403 0.019 54.35C0.354 40.413 5.475 26.091 16.838 16.314C28.2 6.539 46.435 2.359 60.789 8.423C70.092 12.352 76.72 19.839 82.345 27.42C95.241 44.805 104.733 64.117 110.285 84.263C109.793 70.196 111.339 56.131 114.875 42.506C117.457 32.53 121.219 22.554 128.291 14.405C135.363 6.257 146.214 0.123 157.91 0.002C172.319 -0.146 185.338 8.938 191.763 20.218C198.189 31.497 199.048 44.585 198.147 57.161C197.228 69.999 194.436 83.124 186.443 93.921C178.45 104.717 164.374 112.766 149.711 111.779C163.971 113.627 178.798 115.664 190.642 122.852C210.18 134.708 216.636 157.632 215.951 178.421C215.635 188.039 213.855 198.18 206.879 205.622C197.147 216.007 179.146 218.324 164.692 213.796C150.237 209.267 138.933 199.147 130.169 188.121C121.931 177.757 115.345 165.951 114.411 153.355C107.861 174.245 89.617 193.149 65.509 198.116C41.399 203.082 12.88 190.819 6.781 169.825C3.017 156.863 8.29 142.22 19.87 133.483C31.447 124.746 48.783 122.331 62.233 127.781Z" fill="currentColor" transform="translate(20 20) scale(0.85)" />
                            </svg>
                        </button>
                        <div className="w-px h-8 bg-gray-200 mx-1 self-center" />
                        {['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'].map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setTool('pen'); }}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c && tool === 'pen' ? 'border-black scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                        <button onClick={undo} className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-black/5 hover:bg-white transition-colors">
                            <Undo className="w-5 h-5" />
                        </button>
                        <button onClick={handleClear} className="p-3 bg-red-50/80 backdrop-blur-md text-red-500 rounded-full shadow-lg border border-red-100 hover:bg-red-100 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas Container */}
            <div ref={containerRef} className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-black/5 touch-none relative cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full"
                />
            </div>

            {/* Submit Bar */}
            {!readOnly && (
                <div className="mt-6 flex justify-between items-center px-2">
                    <div className="font-display font-black text-gray-400 text-sm tracking-widest">
                        TIMER: <span className="text-black text-xl ml-2">{timeLeft}s</span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-black/20 flex items-center gap-2"
                    >
                        Transmit Data <CheckCircle className="w-5 h-5" />
                    </motion.button>
                </div>
            )}
        </div>
    );
};
