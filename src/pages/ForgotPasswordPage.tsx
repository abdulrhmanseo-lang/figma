import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/layout/Layout';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setIsSubmitted(true);
    };

    return (
        <Layout>
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative z-10 transition-all duration-300">
                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-blue">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <h1 className="text-2xl font-bold text-brand-dark mb-2">نسيت كلمة المرور؟</h1>
                                <p className="text-gray-500 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة كلمة المرور</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-dark">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <Button disabled={loading} variant="gradient" className="w-full py-4 text-lg">
                                    {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                                </Button>
                            </form>

                            <div className="text-center mt-6">
                                <Link to="/login" className="text-gray-500 hover:text-brand-dark flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-in zoom-in duration-300">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-brand-dark mb-3">تم الإرسال بنجاح!</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                لقد أرسلنا تعليمات استعادة كلمة المرور إلى البريد الإلكتروني:<br />
                                <span className="font-semibold text-brand-dark">{email}</span>
                            </p>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">
                                    العودة لتسجيل الدخول
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
