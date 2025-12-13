import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout/Layout';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, subscription } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Custom success/error logic here? 
    // Usually login is just email in this mock
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email);

        // Redirect logic
        // Check if there's a stored active subscription? 
        // The context updates asynchronously or synchronously? 
        // We'll rely on the updated state if possible, or just force check localStorage/next render
        // For simplicity:
        // We can navigate to dashboard, and let Dashboard protect route handle the check?
        // OR explicit check:
        const storedSub = localStorage.getItem('arkan_subscription');
        if (storedSub) {
            const sub = JSON.parse(storedSub);
            if (new Date(sub.endDate) > new Date()) {
                navigate('/dashboard');
                return;
            }
        }

        // Default callback
        navigate(location.state?.from?.pathname || '/dashboard');
    };

    return (
        <Layout>
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-dark mb-2">تسجيل الدخول</h1>
                        <p className="text-gray-500">أهلاً بك مجدداً في أركان</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark">البريد الإلكتروني</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-brand-dark">كلمة المرور</label>
                                <Link to="/forgot-password" class="text-xs text-brand-blue hover:underline">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                            />
                        </div>

                        <Button variant="gradient" className="w-full py-4 text-lg">
                            تسجيل الدخول
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            ليس لديك حساب؟{' '}
                            <Link to="/register" className="text-brand-blue font-bold hover:underline">
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
