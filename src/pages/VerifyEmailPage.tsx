import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Mail, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

export const VerifyEmailPage = () => {
    const { user, resendVerificationEmail, isEmailVerified } = useAuth();
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResendEmail = async () => {
        setIsResending(true);
        setError('');
        setResendSuccess(false);
        try {
            await resendVerificationEmail();
            setResendSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إرسال رسالة التحقق');
        } finally {
            setIsResending(false);
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    // If email is already verified, redirect to dashboard
    if (isEmailVerified) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-light/30 flex items-center justify-center py-12 px-4">
                    <Card className="max-w-md w-full text-center p-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-brand-dark mb-4">تم التحقق من بريدك الإلكتروني!</h1>
                        <p className="text-gray-600 mb-8">يمكنك الآن الوصول إلى جميع مميزات أركان.</p>
                        <Button
                            variant="gradient"
                            className="w-full"
                            onClick={() => navigate('/app')}
                        >
                            الذهاب للوحة التحكم
                            <ArrowRight className="w-4 h-4 mr-2" />
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-light/30 flex items-center justify-center py-12 px-4">
                <Card className="max-w-md w-full text-center p-8">
                    {/* Email Icon */}
                    <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Mail className="w-10 h-10 text-brand-blue" />
                    </div>

                    <h1 className="text-2xl font-bold text-brand-dark mb-4">تحقق من بريدك الإلكتروني</h1>

                    <p className="text-gray-600 mb-2">
                        أرسلنا رسالة تحقق إلى:
                    </p>
                    <p className="text-brand-blue font-bold text-lg mb-6" dir="ltr">
                        {user?.email}
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <p className="text-amber-800 text-sm">
                            📧 يرجى فتح بريدك الإلكتروني والضغط على رابط التحقق لتفعيل حسابك.
                            <br />
                            <span className="text-amber-600 text-xs">تحقق من مجلد الرسائل غير المرغوب فيها (Spam) إذا لم تجد الرسالة.</span>
                        </p>
                    </div>

                    {resendSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                تم إعادة إرسال رسالة التحقق بنجاح!
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            variant="gradient"
                            className="w-full"
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="w-4 h-4 ml-2" />
                            لقد تحققت، تحديث الصفحة
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleResendEmail}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 ml-2" />
                                    إعادة إرسال رسالة التحقق
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-gray-400 text-xs mt-6">
                        هل تحتاج مساعدة؟ تواصل معنا على support@arkan.app
                    </p>
                </Card>
            </div>
        </Layout>
    );
};
