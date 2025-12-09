import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { FileSignature, PenTool, Receipt, Upload, Brain, TrendingUp } from 'lucide-react';

export const FeaturesPage = () => {
    const features = [
        {
            title: "إدارة العقود والتوقيع الإلكتروني",
            desc: "قم بإعداد عقود إيجار موثقة ومتكاملة في دقائق. يدعم النظام التوقيع الإلكتروني المعتمد، ويرسل تنبيهات تلقائية قبل انتهاء العقد لضمان تجديده في الوقت المناسب.",
            icon: FileSignature,
            color: "text-blue-500",
            bg: "bg-blue-50",
            img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "نظام الصيانة وإدارة التذاكر",
            desc: "تخلص من فوضى اتصالات الصيانة. يمكن للمستأجرين رفع طلبات الصيانة عبر التطبيق، ويمكنك تعيين الفنيين ومتابعة حالة الطلب حتى الإغلاق مع تقييم جودة الخدمة.",
            icon: PenTool,
            color: "text-orange-500",
            bg: "bg-orange-50",
            img: "https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "إدارة الفواتير والمدفوعات",
            desc: "نظام مالي متكامل يقوم بإصدار الفواتير بشكل آلي، ويدعم الدفع الإلكتروني عبر مدى وفيزا وماستركارد، مع تسوية فورية للمستحقات في حسابك البنكي.",
            icon: Receipt,
            color: "text-green-500",
            bg: "bg-green-50",
            img: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "أرشفة المستندات والملفات",
            desc: "احتفظ بكل مستندات عقاراتك في مكان آمن. صور العقارات، المخططات، العقود القديمة، والهويات... كلها محفوظة سحابياً ويمكن الوصول إليها في أي وقت.",
            icon: Upload,
            color: "text-purple-500",
            bg: "bg-purple-50",
            img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "تحليلات الذكاء الاصطناعي",
            desc: "اتخذ قرارات مبنية على البيانات. يحلل نظامنا اتجاهات السوق في منطقتك ويقترح عليك أفضل سعر للإيجار، كما يتنبأ باحتمالية شغور الوحدات.",
            icon: Brain,
            color: "text-pink-500",
            bg: "bg-pink-50",
            img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "مراقبة الأداء المالي",
            desc: "لوحة تحكم شاملة تعرض لك الإيرادات، المصروفات، صافي الدخل، ونسب التحصيل بشكل لحظي. اعرف وضعك المالي بلمحة بصر.",
            icon: TrendingUp,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            img: "https://images.unsplash.com/photo-1543286386-713df548e9cc?auto=format&fit=crop&q=80&w=1000"
        }
    ];

    return (
        <Layout>
            <div className="bg-white pt-20 pb-32">
                <div className="container">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-brand-blue font-bold tracking-wider uppercase">مميزات سكن</span>
                        <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark mt-3 mb-6">حلول ذكية لإدارة عصرية</h1>
                        <p className="text-gray-600 text-lg">صمم نظام سكن ليغطي كافة جوانب الدورة العقارية، من التسويق وحتى التحصيل والصيانة.</p>
                    </div>

                    <div className="space-y-32">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7 }}
                                className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
                            >
                                <div className="lg:w-1/2 space-y-6 text-center lg:text-right">
                                    <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mx-auto lg:mx-0 shadow-lg`}>
                                        <feature.icon className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-brand-dark">{feature.title}</h2>
                                    <p className="text-gray-600 text-lg leading-relaxed">{feature.desc}</p>
                                </div>
                                <div className="lg:w-1/2 w-full">
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                                        <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                        <img
                                            src={feature.img}
                                            alt={feature.title}
                                            className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
