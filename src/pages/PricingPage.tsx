import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
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
            price: "999",
            originalPrice: "1,599",
            promoText: "خصم 40% لأول 3 أشهر",
            desc: "مثالية للملاك الأفراد",
            icon: Star,
            features: [
                "إدارة حتى 50 وحدة عقارية",
                "5 مستخدمين",
                "إدارة العقود وإصدار PDF",
                "دفع إلكتروني متعدد القنوات",
                "تنبيهات ذكية لتجديد العقود",
                "لوحة تحكم تفاعلية عصرية",
                "تقارير أساسية PDF",
                "دعم فني عبر البريد"
            ]
        },
        {
            name: "المتقدمة",
            price: "2,099",
            originalPrice: "3,499",
            promoText: "خصم 40% لأول 3 أشهر",
            desc: "للشركات العقارية المتوسطة",
            popular: true,
            icon: Zap,
            features: [
                "إدارة حتى 200 وحدة عقارية",
                "15 مستخدم مع صلاحيات مخصصة",
                "نظام صيانة متكامل مع تتبع",
                "تحليلات الذكاء الاصطناعي (تسعير + إشغال)",
                "تقارير مالية تفصيلية شهرية",
                "فواتير تلقائية احترافية PDF",
                "نظام إشعارات متقدم (SMS + Email)",
                "تطبيق جوال للموظفين",
                "دعم فني ذو أولوية عالية"
            ]
        },
        {
            name: "الشركات",
            price: "3,899",
            originalPrice: "6,499",
            promoText: "خصم 40% لأول 3 أشهر",
            desc: "للمؤسسات الكبيرة والمجمعات",
            icon: Building2,
            features: [
                "وحدات عقارية غير محدودة",
                "مستخدمين غير محدودين",
                "ربط برمجي كامل (API)",
                "نظام صلاحيات متقدم ومرن",
                "إدارة الفنيين والصيانة المتكاملة",
                "تحليلات مالية وتشغيلية شاملة",
                "تقارير مخصصة حسب الطلب",
                "تكامل مع أنظمة المحاسبة",
                "مدير حساب مخصص",
                "دعم فني متميز 24/7 (Premium)"
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
                                    {plan.originalPrice && (
                                        <div className="flex flex-col mb-2">
                                            <span className="text-sm text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded-lg mb-1">{plan.promoText}</span>
                                            <span className="text-gray-400 line-through text-lg">{plan.originalPrice} ريال</span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-brand-dark">{plan.price}</span>
                                        <span className="text-gray-500">ريال / شهرياً</span>
                                    </div>
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
                                    <span className="text-3xl font-bold">669</span>
                                    <span className="text-blue-100 mr-2">ريال / شهرياً</span>
                                </div>
                                <Button
                                    onClick={() => handleSubscribe({ name: "باقة الذكاء الاصطناعي", price: "669", features: ["محرك تسعير ذكي", "توقعات نسب الإشغال", "تحليل مخاطر المستأجرين", "تنبيهات مالية ذكية"] })}
                                    className="bg-white text-brand-dark hover:bg-gray-100 w-full md:w-auto"
                                >
                                    إضافة للباقة
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* طرق الدفع المدعومة */}
                    <div className="mt-16 text-center">
                        <p className="text-gray-400 text-sm mb-6">طرق الدفع المدعومة</p>
                        <div className="flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-300">
                            {/* Visa */}
                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                                <svg className="h-8 w-auto" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M278.198 334.228L311.356 138.997H364.399L331.241 334.228H278.198Z" fill="#00579F" />
                                    <path d="M524.307 142.687C513.542 138.878 496.479 134.772 475.605 134.772C423.237 134.772 386.832 161.293 386.566 199.97C386.054 228.758 412.967 244.838 433.337 254.488C454.211 264.396 461.273 270.864 461.188 279.971C461.023 293.808 444.556 300.018 429.162 300.018C408.04 300.018 396.858 296.886 379.445 289.237L372.554 285.956L365.053 332.074C377.757 337.629 401.426 342.449 426.002 342.709C481.533 342.709 517.257 316.617 517.683 275.409C517.854 252.714 503.538 235.469 472.301 221.209C453.442 211.899 441.91 205.686 442.084 195.951C442.084 187.236 452.162 177.919 473.97 177.919C492.342 177.573 505.974 181.343 516.691 185.152L521.98 187.563L529.651 142.687H524.307Z" fill="#00579F" />
                                    <path d="M661.615 138.997H620.938C608.573 138.997 599.406 142.427 593.871 155.063L515.259 334.228H570.704C570.704 334.228 579.943 308.913 582.024 303.018C588.037 303.018 641.934 303.105 649.681 303.105C651.251 310.734 656.123 334.228 656.123 334.228H705L661.615 138.997ZM597.545 260.089C601.819 249.126 618.709 204.605 618.709 204.605C618.443 205.086 622.974 193.64 625.556 186.438L629.152 202.864C629.152 202.864 639.411 250.693 641.575 260.089H597.545Z" fill="#00579F" />
                                    <path d="M232.903 138.997L181.111 269.372L175.605 242.317C166.518 212.416 138.448 179.832 107.083 163.581L154.608 334.054L210.479 333.967L288.775 138.997H232.903Z" fill="#00579F" />
                                    <path d="M131.92 138.997H47.894L47 143.277C113.396 159.9 158.141 199.021 175.604 242.317L157.817 155.322C154.739 143.169 145.706 139.388 131.92 138.997Z" fill="#FAA61A" />
                                </svg>
                            </div>
                            {/* Mastercard */}
                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                                <svg className="h-8 w-auto" viewBox="0 0 152 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="47" cy="50" r="40" fill="#EB001B" />
                                    <circle cx="105" cy="50" r="40" fill="#F79E1B" />
                                    <path d="M76 20.2C84.7 27.4 90 38.1 90 50C90 61.9 84.7 72.6 76 79.8C67.3 72.6 62 61.9 62 50C62 38.1 67.3 27.4 76 20.2Z" fill="#FF5F00" />
                                </svg>
                            </div>
                            {/* Mada */}
                            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                                <svg className="h-8 w-auto" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="200" height="80" rx="8" fill="#1A4393" />
                                    <text x="100" y="48" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial">mada</text>
                                </svg>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-4">جميع المعاملات مؤمنة ومشفرة عبر بوابة ميسر للدفع</p>
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
