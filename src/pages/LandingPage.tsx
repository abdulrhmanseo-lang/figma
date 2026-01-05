import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { SubscriptionModal } from '../components/ui/SubscriptionModal';
import { FileText, Wrench, Receipt, Brain, Building, PieChart, ArrowRight, CheckCircle, Star, Zap, Building2, Check, ExternalLink, Mail, Phone, Send, TrendingUp } from 'lucide-react';

export const LandingPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const handleSubscribe = (plan: any) => {
        // Normalized plan object for modal
        const planData = {
            name: plan.name,
            price: plan.price,
            features: plan.feat || plan.features || [],
            period: 'شهرياً'
        };
        setSelectedPlan(planData);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          🎨 HERO SECTION (FULL WIDTH & GRADIENT)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="relative h-[750px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2670"
                        alt="City Skyline"
                        className="w-full h-full object-cover"
                    />
                    {/* Primary Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-brand-dark/40" />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Column (Text) */}
                        <div className="text-center lg:text-right">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8 text-white">
                                    إدارة عقاراتك أصبحت <br />
                                    <span className="text-brand-accent bg-clip-text text-transparent bg-gradient-to-l from-brand-blue to-brand-light">أسهل وأذكى</span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                    منصة أركان.. الحل السحابي الشامل لإدارة الأملاك، العقود، الصيانة، والتحصيل المالي. تحكم بمحفظتك العقارية من مكان واحد.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                                    <Button size="lg" variant="gradient" className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40 text-lg py-4">
                                        ابدأ الآن
                                    </Button>
                                    <Link to="/features" className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="w-full min-w-[200px] text-white border-white/30 hover:bg-white hover:text-brand-dark hover:border-white text-lg py-4 backdrop-blur-sm">
                                            استعراض المميزات
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column (Visual/Stats) - Only visible on LG screens */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="hidden lg:block relative"
                        >
                            {/* Glassmorphism Card */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md mr-auto transform rotate-2 hover:rotate-0 transition-all duration-500 ease-out group cursor-default">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-purple rounded-2xl flex items-center justify-center shadow-lg">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-brand-light font-medium tracking-wide">إجمالي الأصول المدارة</p>
                                        <p className="text-3xl font-bold text-white tracking-tight">124 وحدة</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-3 bg-brand-dark/50 rounded-full overflow-hidden mb-4 border border-white/5">
                                    <motion.div
                                        className="absolute h-full bg-brand-accent rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "85%" }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                    />
                                </div>

                                <div className="flex justify-between items-end text-white">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-brand-light mb-1">نسبة الإشغال</span>
                                        <span className="text-xl font-bold">85%</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+12% نمو</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          ✨ FEATURES SECTION (2-Column Grid)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-light text-brand-blue text-sm font-bold tracking-wide uppercase mb-4">
                            مميزات أركان
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark">أدوات احترافية لإدارة متكاملة</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: FileText, title: "عقود إلكترونية", text: "ربط مباشر مع شبكة إيجار لإصدار وتوثيق العقود فورياً دون جهد.", color: "text-blue-600", bg: "bg-blue-50" },
                            { icon: Receipt, title: "فواتير وتحصيل", text: "إصدار الفواتير وإرسال رسائل تذكير تلقائية للمستأجرين.", color: "text-green-600", bg: "bg-green-50" },
                            { icon: Wrench, title: "نظام الصيانة", text: "إدارة طلبات الصيانة وتعيين الفنيين ومتابعة حالة الطلب.", color: "text-orange-600", bg: "bg-orange-50" },
                            { icon: Building, title: "سجل العقارات", text: "قاعدة بيانات شاملة لجميع وحداتك وتاريخها الإيجاري.", color: "text-purple-600", bg: "bg-purple-50" },
                            { icon: Brain, title: "الذكاء الاصطناعي", text: "تحليلات متقدمة للسوق وتوقعات الأسعار باستخدام AI.", color: "text-pink-600", bg: "bg-pink-50" },
                            { icon: PieChart, title: "التقارير المالية", text: "تقارير مفصلة عن الدخل والمصروفات والأرباح الصافية.", color: "text-indigo-600", bg: "bg-indigo-50" },
                        ].map((f, i) => (
                            <Card key={i} className="group p-8 border border-gray-100 hover:border-brand-blue/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-xl shrink-0 transition-transform group-hover:scale-110 duration-300 ${f.bg} ${f.color}`}>
                                    <f.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-4 group-hover:text-brand-blue transition-colors">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{f.text}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          💸 PRICING SECTION (4 Tiers)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-24 bg-slate-50 border-t border-gray-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-brand-dark mb-6">باقات تناسب جميع الأحجام</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            اختر الخطة التي تناسب احتياجاتك. يمكنك الترقية أو الإلغاء في أي وقت.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "الأساسية", price: "629", role: "للملاك الأفراد", feat: ["إدارة حتى 30 وحدة", "3 مستخدمين", "إدارة العقود وإصدار PDF", "دفع إلكتروني", "تنبيهات تجديد العقود", "لوحة تحكم عصرية"], rec: false },
                            { name: "المتقدمة", price: "1,329", role: "للشركات العقارية", feat: ["120 وحدة عقارية", "10 مستخدمين", "نظام صيانة متكامل", "تحليلات AI (تسعير+إشغال)", "تقارير مالية شهرية", "فواتير تلقائية PDF", "دعم فني ذو أولوية"], rec: true },
                            { name: "الشركات", price: "2,449", role: "للمؤسسات الكبرى", feat: ["وحدات غير محدودة", "مستخدمين غير محدودين", "ربط برمجي (API)", "نظام صلاحيات متقدم", "إدارة الفنيين والصيانة", "تحليلات مالية شاملة", "دعم فني Premium"], rec: false },
                            { name: "Arkan AI", price: "419", role: "إضافة ذكية", feat: ["محرك تسعير ذكي", "توقعات نسب الإشغال", "تحليل مخاطر المستأجرين", "تنبيهات مالية ذكية"], rec: false, addon: true }
                        ].map((p, i) => (
                            <div
                                key={i}
                                className={`flex flex-col p-8 rounded-3xl transition-all duration-300 relative ${p.rec
                                    ? 'bg-white shadow-2xl scale-105 z-10 border-2 border-brand-blue'
                                    : 'bg-white shadow-lg border border-gray-100 hover:scale-105 hover:shadow-xl'}`}
                            >
                                {p.rec && <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1.5 rounded-b-xl shadow-md">الأكثر طلباً</div>}

                                <h3 className="text-2xl font-bold text-brand-dark mb-2">{p.name}</h3>
                                <p className="text-sm text-gray-400 mb-8 font-medium">{p.role}</p>

                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-brand-dark">{p.price}</span>
                                    <span className="text-gray-500 text-sm mr-2">ر.س /شهر</span>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    {p.feat.map((f, fi) => (
                                        <div key={fi} className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-brand-blue" />
                                            </div>
                                            <span className="font-medium">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleSubscribe(p)}
                                    variant={p.rec ? "gradient" : "outline"}
                                    className={`w-full py-6 font-bold text-base ${p.addon ? 'border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white' : ''}`}
                                >
                                    {p.addon ? "أضف للباقة" : "اشترك الآن"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 UNITS PREVIEW SECTION (Grid)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl font-bold text-brand-dark mb-4">وحدات مميزة للإيجار</h2>
                            <p className="text-xl text-gray-500">تصفح قائمة بأحدث العقارات المتاحة في السوق.</p>
                        </div>
                        <Link to="/units">
                            <Button variant="ghost" className="hidden md:flex items-center gap-2 group text-brand-blue hover:bg-brand-light px-6 py-3 rounded-xl transition-all">
                                <span className="font-bold">عرض جميع الوحدات</span>
                                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            { img: "https://images.unsplash.com/photo-1600596542815-2a4fe053155e", title: "فيلا مودرن - حي الملقا", price: "85,000", area: "450م²", loc: "شمال الرياض", type: "فيلا" },
                            { img: "https://images.unsplash.com/photo-1600607686527-6fb886090705", title: "شقة فاخرة - حي الشاطئ", price: "45,000", area: "180م²", loc: "جدة - الكورنيش", type: "شقة" },
                            { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750", title: "تاون هاوس - الفيصلية", price: "60,000", area: "320م²", loc: "الدمام", type: "تاون هاوس" },
                        ].map((u, i) => (
                            <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 flex flex-col">
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={`${u.img}?auto=format&fit=crop&q=80&w=800`}
                                        alt={u.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className="bg-white/95 backdrop-blur shadow-sm px-4 py-1.5 rounded-full text-brand-dark font-bold text-xs">{u.type}</span>
                                        <span className="bg-green-500/90 backdrop-blur shadow-sm px-4 py-1.5 rounded-full text-white font-bold text-xs animate-pulse">متاح</span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-xl text-brand-dark mb-2 group-hover:text-brand-blue transition-colors line-clamp-1">{u.title}</h3>
                                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                                <ExternalLink className="w-3.5 h-3.5" /> {u.loc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-brand-dark">{u.price} <span className="text-xs text-gray-400 font-normal">ر.س</span></p>
                                        </div>
                                        <Button size="sm" variant="secondary" className="hover:bg-brand-blue hover:text-white transition-colors">عرض التفاصيل</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          📞 CONTACT SECTION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-24 bg-white relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-light/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

                        {/* Visual Side */}
                        <div className="bg-brand-dark relative w-full md:w-2/5 p-12 text-white flex flex-col justify-between overflow-hidden">
                            <div className="absolute inset-0 bg-brand-blue/20" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-purple/50 rounded-full blur-[80px]" />

                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-6">تواصل معنا</h3>
                                <p className="text-brand-light/80 leading-relaxed mb-8">
                                    فريقنا جاهز للإجابة على جميع استفساراتك.
                                    <br />نحن هنا لمساعدتك في النجاح مع أركان.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-brand-accent" />
                                        </div>
                                        <span className="font-bold text-lg" dir="ltr">+966 50 123 4567</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-brand-accent" />
                                        </div>
                                        <span>hello@arkan.app</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="w-full md:w-3/5 p-12 bg-white">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-brand-dark">الاسم الأول</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-brand-dark">اسم العائلة</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-dark">البريد الإلكتروني</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-brand-dark">الرسالة</label>
                                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all bg-gray-50 focus:bg-white resize-none"></textarea>
                                </div>

                                <Button size="lg" variant="gradient" className="w-full justify-center text-lg font-bold shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40">
                                    إرسال رسالتك
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
            />
        </Layout>
    );
};
