// Premium Glassmorphism Trial Timer for Arkan PMS
// Clean, transparent design with smooth animations
// Fully mobile responsive

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Crown, Sparkles } from 'lucide-react';

// Trial duration in minutes
const TRIAL_DURATION_MINUTES = 40;

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function TrialTimer() {
    const { user, subscription } = useAuth();
    const navigate = useNavigate();
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

    // Check if user is on trial subscription
    const isTrial = subscription?.planName?.includes('تجريبي') ||
        subscription?.planName?.includes('trial') ||
        subscription?.planName === 'تجريبي مجاني';

    // Timer effect - MUST be before any conditional returns
    useEffect(() => {
        if (!user?.uid || !isTrial) return;

        // Get or set trial start time
        const key = `trial_start_${user.uid}`;
        let startTime = localStorage.getItem(key);
        if (!startTime) {
            startTime = Date.now().toString();
            localStorage.setItem(key, startTime);
        }

        const trialEnd = parseInt(startTime, 10) + (TRIAL_DURATION_MINUTES * 60 * 1000);

        const tick = () => {
            const remaining = Math.max(0, Math.floor((trialEnd - Date.now()) / 1000));
            setRemainingSeconds(remaining);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [user?.uid, isTrial]);

    // Conditional returns AFTER all hooks
    if (!isTrial || !user || remainingSeconds === null) {
        return null;
    }

    const isLow = remainingSeconds <= 600; // Last 10 minutes
    const isExpired = remainingSeconds <= 0;

    return (
        <>
            {/* Glassmorphism Floating Timer */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed bottom-6 left-6 z-50"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`
            backdrop-blur-xl rounded-2xl p-4 shadow-2xl border cursor-pointer
            ${isLow
                            ? 'bg-red-500/20 border-red-400/30'
                            : 'bg-white/10 border-white/20'
                        }
          `}
                    onClick={() => navigate('/pricing')}
                >
                    {/* Glass glow effect */}
                    <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 ${isLow ? 'bg-red-500' : 'bg-brand-blue'
                        }`} />

                    <div className="relative flex items-center gap-3">
                        {/* Timer Icon */}
                        <motion.div
                            animate={isLow ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, -5, 5, 0]
                            } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                            className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${isLow
                                    ? 'bg-red-500/30 text-red-200'
                                    : 'bg-brand-blue/30 text-brand-blue'
                                }
              `}
                        >
                            <Clock className="w-5 h-5" />
                        </motion.div>

                        {/* Time Display */}
                        <div>
                            <p className={`text-xs font-medium ${isLow ? 'text-red-200' : 'text-gray-400'}`}>
                                الفترة التجريبية
                            </p>
                            <motion.p
                                key={remainingSeconds}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                className={`text-xl font-bold font-mono ${isLow ? 'text-red-100' : 'text-white'
                                    }`}
                            >
                                {formatTime(remainingSeconds)}
                            </motion.p>
                        </div>

                        {/* Upgrade Button */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                w-9 h-9 rounded-xl flex items-center justify-center
                ${isLow
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                }
              `}
                        >
                            <Crown className="w-4 h-4" />
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Expired Overlay Modal */}
            <AnimatePresence>
                {isExpired && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-white/10 shadow-2xl"
                        >
                            {/* Icon */}
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                            >
                                <Sparkles className="w-10 h-10 text-white" />
                            </motion.div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                انتهت التجربة! ⏰
                            </h2>
                            <p className="text-gray-400 mb-6">
                                استمر معنا واشترك الآن للحصول على جميع الميزات
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/pricing')}
                                className="w-full py-4 bg-gradient-to-r from-brand-blue to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                            >
                                <Crown className="w-5 h-5" />
                                اشترك الآن
                            </motion.button>

                            <p className="text-gray-500 text-xs mt-4">
                                باقات تبدأ من 99 ر.س/شهر
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default TrialTimer;
