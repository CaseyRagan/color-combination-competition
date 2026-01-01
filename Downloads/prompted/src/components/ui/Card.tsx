import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'glass' | 'flat';
}

export const Card: React.FC<CardProps> = ({
    className,
    variant = 'default',
    children,
    ...props
}) => {
    const variants = {
        default: "bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/50",
        glass: "bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg shadow-black/5",
        flat: "bg-gray-50 rounded-2xl border border-gray-100"
    };

    return (
        <motion.div
            className={twMerge(variants[variant], className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};
