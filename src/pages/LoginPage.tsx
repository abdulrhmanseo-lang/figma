import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout/Layout';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Custom success/error logic here? 
    // Usually login is just email in this mock
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // Navigate to dashboard after successful login
            navigate(location.state?.from?.pathname || '/app');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'حدث خطأ في تسجيل الدخول');
        } finally {
            setLoading(false);
        }
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
                                <Link to="/forgot-password" className="text-xs text-brand-blue hover:underline">
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

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button variant="gradient" className="w-full py-4 text-lg" disabled={loading}>
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
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

                    {/* Employee Portal Link */}
                    <div className="text-center mt-4 pt-4 border-t border-gray-100">
                        <p className="text-gray-500 text-sm">
                            موظف؟{' '}
                            <Link to="/employee/login" className="text-brand-purple font-bold hover:underline">
                                الدخول من بوابة الموظفين ←
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
