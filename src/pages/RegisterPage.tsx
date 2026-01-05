import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout/Layout';
import { UserPlus, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        if (formData.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);
        try {
            await register(formData.fullName, formData.email, formData.password);
            navigate('/verify-email');
        } catch (err: any) {
            console.error("Registration Error", err);
            // Handle generic firebase errors
            if (err.code === 'auth/email-already-in-use') {
                setError('البريد الإلكتروني مستخدم بالفعل');
            } else {
                setError('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-blue">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-brand-dark mb-2">إنشاء حساب جديد</h1>
                        <p className="text-gray-500 text-sm">ابدأ رحلتك مع أركان اليوم</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark">الاسم الكامل</label>
                            <div className="relative">
                                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                                    placeholder="مثال: محمد أحمد"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-dark">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button disabled={loading} variant="gradient" className="w-full py-4 text-lg mt-4" type="submit">
                            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" className="text-brand-blue font-bold hover:underline">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
