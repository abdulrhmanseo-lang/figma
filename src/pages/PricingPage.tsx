import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Check, Star, Zap, Building2, Brain } from 'lucide-react';
import { SubscriptionModal } from '../components/ui/SubscriptionModal';

export const PricingPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const handleSubscribe = (plan: any) => {
        setSelectedPlan({
            name: plan.name,
            price: plan.price,
            features: plan.features || [],
            period: 'شهرياً'
        });
        setIsModalOpen(true);
    };

    const plans = [
        {
            name: "الأساسية",
            price: "899",
            desc: "مثالية للملاك الأفراد",
            icon: Star,
            features: [
                "إدارة حتى 30 وحدة",
                "3 مستخدمين",
                "إدارة العقود وإصدار PDF",
                "دفع إلكتروني",
                "تنبيهات تجديد العقود",
                "لوحة تحكم عصرية"
            ]
        },
        {
            name: "المتقدمة",
            price: "1,899",
            desc: "للشركات العقارية المتوسطة",
            popular: true,
            icon: Zap,
            features: [
                "120 وحدة عقارية",
                "10 مستخدمين",
                "نظام صيانة متكامل",
                "تحليلات الذكاء الاصطناعي (تسعير + إشغال)",
                "تقارير مالية شهرية",
                "فواتير تلقائية PDF",
                "دعم فني ذو أولوية"
            ]
        },
        {
            name: "الشركات",
            price: "3,499",
            desc: "للمؤسسات الكبيرة والمجمعات",
            icon: Building2,
            features: [
                "وحدات عقارية غير محدودة",
                "مستخدمين غير محدودين",
                "ربط برمجي (API)",
                "نظام صلاحيات متقدم",
                "إدارة الفنيين والصيانة",
                "تحليلات مالية وتشغيلية شاملة",
                "دعم فني متميز (Premium)"
            ]
        }
    ];

    return (
        <Layout>
            <div className="bg-slate-50 py-20 min-h-screen">
                <div className="container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-6">خطط أسعار تناسب الجميع</h1>
                        <p className="text-gray-600 text-lg">اختر الباقة التي تناسب حجم أعمالك، وابدأ رحلة التحول الرقمي لعقاراتك اليوم.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {plans.map((plan, idx) => (
                            <Card
                                key={idx}
                                className={`relative flex flex-col ${plan.popular ? 'border-brand-blue shadow-2xl scale-105 z-10' : ''}`}
                                variant={plan.popular ? 'default' : 'default'}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-blue to-cyan-500 text-white px-4 py-1 rounded-b-xl text-sm font-bold">
                                        الأكثر طلباً
                                    </div>
                                )}
                                <div className="mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-brand-blue text-white' : 'bg-brand-light text-brand-dark'}`}>
                                        <plan.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-dark mb-2">{plan.name}</h3>
                                    <p className="text-gray-500">{plan.desc}</p>
                                </div>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-brand-dark">{plan.price}</span>
                                    <span className="text-gray-500 mr-2">ريال / شهرياً</span>
                                </div>
                                <div className="flex-grow mb-8 space-y-4">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3 text-gray-600">
                                            <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-brand-blue' : 'text-green-500'}`} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={() => handleSubscribe(plan)}
                                    variant={plan.popular ? 'gradient' : 'outline'}
                                    className="w-full"
                                >
                                    اشترك الآن
                                </Button>
                            </Card>
                        ))}
                    </div>

                    {/* AI Addon */}
                    <div className="max-w-4xl mx-auto">
                        <Card variant="gradient" className="flex flex-col md:flex-row items-center justify-between p-8 lg:p-12">
                            <div className="flex items-start gap-6 mb-6 md:mb-0">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                                    <Brain className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">باقة الذكاء الاصطناعي (إضافية)</h3>
                                    <p className="text-blue-100 mb-4">أضف قوة الذكاء الاصطناعي لأي باقة من الباقات أعلاه.</p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-blue-50 text-sm">
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4" /> محرك تسعير ذكي</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4" /> توقعات نسب الإشغال</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4" /> تحليل مخاطر المستأجرين</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4" /> تنبيهات مالية ذكية</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 shrink-0">
                                <div className="text-white text-right">
                                    <span className="text-3xl font-bold">599</span>
                                    <span className="text-blue-100 mr-2">ريال / شهرياً</span>
                                </div>
                                <Button
                                    onClick={() => handleSubscribe({ name: "باقة الذكاء الاصطناعي", price: "599", features: ["محرك تسعير ذكي", "توقعات نسب الإشغال", "تحليل مخاطر المستأجرين", "تنبيهات مالية ذكية"] })}
                                    className="bg-white text-brand-dark hover:bg-gray-100 w-full md:w-auto"
                                >
                                    إضافة للباقة
                                </Button>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
            />
        </Layout>
    );
};
