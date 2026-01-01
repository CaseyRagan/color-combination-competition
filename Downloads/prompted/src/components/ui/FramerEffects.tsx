import React, { useState, useEffect } from 'react';
import { motion, useAnimation, TargetAndTransition, Transition } from 'framer-motion';

// --- Typewriter Effect ---
// Re-implmentation of https://framer.com/m/TypewriterEffect-BJ1p.js@1AITomapiVi0hbIN3aB3
// Logic: Cycle through words, typing char by char, waiting, then deleting.

interface TypewriterProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    cursorColor?: string;
    className?: string; // For text styling
}

export const TypewriterEffect: React.FC<TypewriterProps> = ({
    words,
    typingSpeed = 100,
    deletingSpeed = 60,
    pauseDuration = 1000,
    cursorColor = '#000000',
    className = ""
}) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        const currentWord = words[currentWordIndex];
        let timer: NodeJS.Timeout;

        if (isWaiting) {
            timer = setTimeout(() => {
                setIsWaiting(false);
                setIsDeleting(true);
            }, pauseDuration);
        } else if (isDeleting) {
            timer = setTimeout(() => {
                setText(prev => prev.slice(0, -1));
                if (text.length <= 1) { // Will be empty next tick
                    setIsDeleting(false);
                    setCurrentWordIndex(prev => (prev + 1) % words.length);
                }
            }, deletingSpeed);
        } else {
            // Typing
            if (text.length < currentWord.length) {
                timer = setTimeout(() => {
                    setText(currentWord.slice(0, text.length + 1));
                }, typingSpeed);
            } else {
                // Finished typing word
                setIsWaiting(true);
            }
        }

        return () => clearTimeout(timer);
    }, [text, isDeleting, isWaiting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={`inline-flex items-center ${className}`}>
            {text}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="w-[2px] h-[1em] ml-1 rounded-sm inline-block"
                style={{ backgroundColor: cursorColor }}
            />
        </span>
    );
};


// --- Rolling Text Effect ---
// Re-implementation of https://framer.com/m/RollingText-aQN0.js@b7hUeSfqS1qjsOKu4xyg
// Logic: Character columns with repeated characters scrolling up.

interface RollingTextProps {
    text: string;
    trigger?: any; // Change this prop to trigger re-animation
    duration?: number;
    stagger?: number;
    className?: string;
    lineHeight?: number; // Needed to calculate scroll distance
}

const CharacterColumn = ({ char, delay, duration, lineHeight }: { char: string, delay: number, duration: number, lineHeight: number }) => {
    // Determine if char is a space (don't animate spaces usually, or just leave as is)
    // For visual interest, we often replace the "roll" content with random chars or the same char repeated.
    // Framer's implementation often just repeats the target char to make it look like a seamless loop or spin.

    // We will create a "tape" of characters: [random, random, target]
    // Or simpler: [target, target, target] for a "slot" spin look? 
    // The user request is for "Prompt Words", which implies a slot machine feel.
    // Let's generate a column of random characters ending in the target char.

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    // Construct a "strip" of 10 characters, ending with the target 'char'
    const stripLength = 10;
    const strip = Array.from({ length: stripLength - 1 }).map(() => chars[Math.floor(Math.random() * chars.length)]);
    strip.push(char);

    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            y: `-${(stripLength - 1) * lineHeight}px`, // Scroll to the last character
            transition: {
                duration: duration,
                ease: [.25, .46, .45, .94], // Custom cubic-bezier from Framer
                delay: delay
            }
        });

        // Motion Blur simulation
        // Start blur, hold, end blur
        controls.start({
            filter: ["blur(0px)", "blur(4px)", "blur(4px)", "blur(0px)"],
            transition: {
                times: [0, 0.2, 0.8, 1],
                duration: duration,
                delay: delay
            }
        });
    }, [char, delay, duration, controls, lineHeight]);

    return (
        <motion.div
            className="flex flex-col select-none pointer-events-none"
            initial={{ y: "0px", filter: "blur(0px)" }}
            animate={controls}
        >
            {strip.map((c, i) => (
                <div key={i} style={{ height: lineHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c === ' ' ? '\u00A0' : c}
                </div>
            ))}
        </motion.div>
    );
};

export const RollingText: React.FC<RollingTextProps> = ({
    text,
    trigger,
    duration = 2,
    stagger = 0.05,
    className = "",
    lineHeight = 1.5 // Multiplier of font size usually, but here we might need px. Let's assume em or pass styling.
    // Actually, to animate Y in px, we need a known pixel height. 
    // Best strategy: Allow passing height in specific units or measured. 
    // For simplicity in a dynamic app, let's assume the passed 'lineHeight' is a number representing REM or EM converted to PX approx, 
    // OR we just use style with explicit height.
}) => {
    // For this specific implementation, we'll try to rely on ems if possible, but y-transform in % is easier for responsive.
    // However, rolling text usually requires fixed heights to align perfecty.
    // Let's force a fixed height container based on a prop, say `height: 60px`.

    const heightPx = 60; // We will likely need to adjust this based on where it's used.

    return (
        <div className={`flex overflow-hidden ${className}`} style={{ height: heightPx }}>
            {text.split('').map((char, i) => (
                <div key={i} style={{ width: char === ' ' ? '0.3em' : 'auto' }} className="relative overflow-hidden">
                    <CharacterColumn
                        char={char}
                        delay={i * stagger}
                        duration={duration}
                        lineHeight={heightPx}
                    />
                </div>
            ))}
        </div>
    );
};
