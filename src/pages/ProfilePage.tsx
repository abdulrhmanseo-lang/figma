import React from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export const ProfilePage = () => {
    const { user, subscription, logout } = useAuth();

    if (!user) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className="min-h-screen pt-24 pb-12 bg-slate-50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl font-bold text-brand-dark mb-8">الملف الشخصي</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* User Info Card */}
                        <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mb-4 text-brand-blue">
                                    <User className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-bold text-brand-dark">{user.displayName || 'مستخدم أركان'}</h2>
                                <p className="text-gray-500 text-sm mb-6">{user.email}</p>

                                <Button onClick={logout} variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600">
                                    تسجيل الخروج
                                </Button>
                            </div>
                        </div>

                        {/* Subscription Info Card */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-brand-blue" />
                                        تفاصيل الاشتراك
                                    </h3>
                                    {subscription?.status === 'active' ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            نشط
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                            غير نشط / منتهي
                                        </span>
                                    )}
                                </div>

                                {subscription ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-xs text-gray-400 mb-1">الباقة الحالية</p>
                                                <p className="font-bold text-brand-dark text-lg">{subscription.planName}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-xs text-gray-400 mb-1">رمز الاشتراك</p>
                                                <p className="font-bold text-brand-blue font-mono text-lg">{subscription.code || '---'}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-xs text-gray-400 mb-1">تاريخ البدء</p>
                                                <p className="font-bold text-gray-700">{formatDate(subscription.startDate)}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-xs text-gray-400 mb-1">تاريخ الانتهاء</p>
                                                <p className="font-bold text-gray-700">{formatDate(subscription.endDate)}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Link to="/pricing">
                                                <Button className="w-full">
                                                    تجديد أو ترقية الباقة
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">لا يوجد اشتراك نشط حالياً</p>
                                        <Link to="/pricing">
                                            <Button variant="primary">اشترك الآن</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2 mb-4">
                                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                                    الأمان
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-700">كلمة المرور</p>
                                        <p className="text-sm text-gray-400">************</p>
                                    </div>
                                    <Link to="/forgot-password">
                                        <Button variant="outline" size="sm">تغيير</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
