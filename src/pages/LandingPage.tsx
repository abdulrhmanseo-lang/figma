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
                            {
                                name: "الأساسية",
                                price: "999",
                                originalPrice: "1,599",
                                promoText: "خصم 40% لأول 3 أشهر",
                                role: "للملاك الأفراد",
                                feat: ["إدارة حتى 50 وحدة عقارية", "5 مستخدمين", "إدارة العقود وإصدار PDF", "دفع إلكتروني متعدد القنوات", "تنبيهات ذكية لتجديد العقود", "لوحة تحكم تفاعلية عصرية"],
                                rec: false
                            },
                            {
                                name: "المتقدمة",
                                price: "2,099",
                                originalPrice: "3,499",
                                promoText: "خصم 40% لأول 3 أشهر",
                                role: "للشركات العقارية",
                                feat: ["إدارة حتى 200 وحدة عقارية", "15 مستخدم مع صلاحيات", "نظام صيانة متكامل مع تتبع", "تحليلات AI (تسعير+إشغال)", "تقارير مالية تفصيلية", "فواتير تلقائية احترافية", "دعم فني ذو أولوية عالية"],
                                rec: true
                            },
                            {
                                name: "الشركات",
                                price: "3,899",
                                originalPrice: "6,499",
                                promoText: "خصم 40% لأول 3 أشهر",
                                role: "للمؤسسات الكبرى",
                                feat: ["وحدات غير محدودة", "مستخدمين غير محدودين", "ربط برمجي كامل (API)", "نظام صلاحيات متقدم ومرن", "إدارة صيانة متكاملة", "تحليلات مالية شاملة", "دعم فني Premium 24/7"],
                                rec: false
                            },
                            {
                                name: "Arkan AI",
                                price: "669",
                                role: "إضافة ذكية",
                                feat: ["محرك تسعير ذكي", "توقعات نسب الإشغال", "تحليل مخاطر المستأجرين", "تنبيهات مالية ذكية"],
                                rec: false,
                                addon: true
                            }
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
                                    {(p as any).originalPrice && (
                                        <div className="flex flex-col mb-2">
                                            <span className="text-[10px] text-green-600 font-bold bg-green-50 w-fit px-2 py-0.5 rounded-lg mb-1">{(p as any).promoText}</span>
                                            <span className="text-gray-400 line-through text-sm">{(p as any).originalPrice} ر.س</span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-brand-dark">{p.price}</span>
                                        <span className="text-gray-500 text-sm">ر.س /شهر</span>
                                    </div>
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

                    {/* طرق الدفع المدعومة */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-sm mb-4">طرق الدفع المدعومة</p>
                        <div className="flex items-center justify-center gap-6 opacity-50 hover:opacity-100 transition-opacity duration-300">
                            {/* Visa */}
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                                <svg className="h-6 w-auto" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M278.198 334.228L311.356 138.997H364.399L331.241 334.228H278.198Z" fill="#00579F" />
                                    <path d="M524.307 142.687C513.542 138.878 496.479 134.772 475.605 134.772C423.237 134.772 386.832 161.293 386.566 199.97C386.054 228.758 412.967 244.838 433.337 254.488C454.211 264.396 461.273 270.864 461.188 279.971C461.023 293.808 444.556 300.018 429.162 300.018C408.04 300.018 396.858 296.886 379.445 289.237L372.554 285.956L365.053 332.074C377.757 337.629 401.426 342.449 426.002 342.709C481.533 342.709 517.257 316.617 517.683 275.409C517.854 252.714 503.538 235.469 472.301 221.209C453.442 211.899 441.91 205.686 442.084 195.951C442.084 187.236 452.162 177.919 473.97 177.919C492.342 177.573 505.974 181.343 516.691 185.152L521.98 187.563L529.651 142.687H524.307Z" fill="#00579F" />
                                    <path d="M661.615 138.997H620.938C608.573 138.997 599.406 142.427 593.871 155.063L515.259 334.228H570.704C570.704 334.228 579.943 308.913 582.024 303.018C588.037 303.018 641.934 303.105 649.681 303.105C651.251 310.734 656.123 334.228 656.123 334.228H705L661.615 138.997ZM597.545 260.089C601.819 249.126 618.709 204.605 618.709 204.605C618.443 205.086 622.974 193.64 625.556 186.438L629.152 202.864C629.152 202.864 639.411 250.693 641.575 260.089H597.545Z" fill="#00579F" />
                                    <path d="M232.903 138.997L181.111 269.372L175.605 242.317C166.518 212.416 138.448 179.832 107.083 163.581L154.608 334.054L210.479 333.967L288.775 138.997H232.903Z" fill="#00579F" />
                                    <path d="M131.92 138.997H47.894L47 143.277C113.396 159.9 158.141 199.021 175.604 242.317L157.817 155.322C154.739 143.169 145.706 139.388 131.92 138.997Z" fill="#FAA61A" />
                                </svg>
                            </div>
                            {/* Mastercard */}
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                                <svg className="h-6 w-auto" viewBox="0 0 152 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="47" cy="50" r="40" fill="#EB001B" />
                                    <circle cx="105" cy="50" r="40" fill="#F79E1B" />
                                    <path d="M76 20.2C84.7 27.4 90 38.1 90 50C90 61.9 84.7 72.6 76 79.8C67.3 72.6 62 61.9 62 50C62 38.1 67.3 27.4 76 20.2Z" fill="#FF5F00" />
                                </svg>
                            </div>
                            {/* Mada */}
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                                <svg className="h-6 w-auto" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="200" height="80" rx="8" fill="#1A4393" />
                                    <text x="100" y="48" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial">mada</text>
                                </svg>
                            </div>
                        </div>
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
