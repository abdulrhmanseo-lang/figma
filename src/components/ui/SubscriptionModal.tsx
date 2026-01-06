import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from './button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
    name: string;
    price: string;
    features: string[];
    period?: string;
}

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, plan }) => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const { subscribe, user } = useAuth();
    const navigate = useNavigate();

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setStep('form');
            setLoading(false);
            if (user?.email) setEmail(user.email);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Call subscribe from context
        if (plan) {
            subscribe({ name: plan.name, price: plan.price });
        }

        setLoading(false);
        setStep('success');
    };

    if (!plan) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {step === 'form' ? (
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-2">تأكيد الاشتراك</h3>
                                        <h2 className="text-3xl font-bold text-brand-dark mb-2">{plan.name}</h2>
                                        <div className="flex items-center justify-center gap-1 text-gray-500">
                                            <span className="text-2xl font-bold text-brand-dark">{plan.price}</span>
                                            <span className="text-sm">ر.س / {plan.period || 'شهرياً'}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                        <h4 className="font-bold text-brand-dark mb-4 text-sm">مميزات الباقة:</h4>
                                        <ul className="space-y-3">
                                            {plan.features.slice(0, 4).map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                                    <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 text-green-500">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                            {plan.features.length > 4 && (
                                                <li className="text-xs text-gray-400 pr-8">
                                                    +{plan.features.length - 4} مميزات أخرى...
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-brand-dark">البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                                            />
                                        </div>

                                        <Button
                                            variant="gradient"
                                            className="w-full text-lg py-4 shadow-lg shadow-brand-blue/20"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    جاري المعالجة...
                                                </>
                                            ) : (
                                                'إكمال الاشتراك'
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                                    >
                                        <Check className="w-10 h-10" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-brand-dark mb-2">تم الاشتراك بنجاح!</h2>
                                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                        شكراً لاشتراكك في باقة {plan.name}. تم إرسال تفاصيل التفعيل إلى بريدك الإلكتروني.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            onClose();
                                            navigate('/app');
                                        }}
                                        variant="gradient"
                                        className="w-full shadow-lg shadow-brand-blue/20"
                                    >
                                        الذهاب إلى لوحة التحكم
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
