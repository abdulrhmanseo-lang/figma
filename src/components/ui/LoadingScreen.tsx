import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark via-brand-dark to-brand-blue">
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold text-white">
                    أركان
                </h1>
            </motion.div>

            {/* Loading Spinner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
            >
                {/* Outer ring */}
                <div className="w-16 h-16 rounded-full border-4 border-white/10"></div>

                {/* Spinning ring */}
                <motion.div
                    className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brand-accent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
            </motion.div>

            {/* Loading Text */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-white/70 text-sm"
            >
                جاري التحميل...
            </motion.p>
        </div>
    );
};
