import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-wide rounded-2xl transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30",
        secondary: "bg-white text-black border-2 border-transparent hover:border-black/10 shadow-md hover:shadow-lg",
        ghost: "bg-transparent text-gray-600 hover:bg-black/5 hover:text-black",
        glass: "bg-white/20 backdrop-blur-md border border-white/40 text-black hover:bg-white/30 shadow-sm"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <motion.button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children as React.ReactNode}
        </motion.button>
    );
};
