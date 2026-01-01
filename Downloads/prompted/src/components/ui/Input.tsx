import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                    {label}
                </label>
            )}
            <input
                className={twMerge(
                    "w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-transparent focus:border-black rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium",
                    className
                )}
                {...props}
            />
        </div>
    );
};
