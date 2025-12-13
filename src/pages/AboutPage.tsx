import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/card';
import { Target, Heart, Users, ShieldCheck } from 'lucide-react';

export const AboutPage = () => {
    return (
        <Layout>
            <div className="pt-20">
                {/* Intro */}
                <section className="bg-brand-dark text-white py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20" />
                    <div className="container relative z-10 text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">عن سكن</h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            نحن شركة تقنية عقارية سعودية، نسعى لإحداث ثورة في مفهوم إدارة وتأجير العقارات من خلال حلول رقمية ذكية تبسط الحياة على الملاك والمستأجرين.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section className="py-24 bg-white">
                    <div className="container">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: Target, title: "رؤيتنا", desc: "أن نكون المنصة الأولى لإدارة العقارات في الشرق الأوسط." },
                                { icon: Users, title: "مهمتنا", desc: "تمكين الملاك من إدارة أصولهم بكفاءة عالية وبأقل جهد." },
                                { icon: Heart, title: "قيمنا", desc: "الشفافية، الابتكار، وخدمة العميل هي جوهر كل ما نقوم به." },
                                { icon: ShieldCheck, title: "وعدنا", desc: "أمان بياناتك وموثوقية النظام هي أولويتنا القصوى." },
                            ].map((item, idx) => (
                                <Card key={idx} className="text-center group hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-16 h-16 rounded-full bg-brand-light text-brand-blue flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-3">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="py-24 bg-slate-50">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center text-brand-dark mb-16">رحلة التطور</h2>
                        <div className="relative max-w-4xl mx-auto">
                            <div className="absolute top-0 bottom-0 right-1/2 w-0.5 bg-brand-blue/20" />
                            {[
                                { year: "2020", title: "الانطلاقة", desc: "تأسيس سكن وبدء تطوير النظام الأساسي." },
                                { year: "2021", title: "أول 1000 وحدة", desc: "النجاح في إدارة أكثر من 1000 وحدة سكنية عبر النظام." },
                                { year: "2022", title: "بوابة الدفع", desc: "إطلاق بوابة الدفع الإلكتروني ونظام العقود الموحد." },
                                { year: "2023", title: "الذكاء الاصطناعي", desc: "تكامل تقنيات الذكاء الاصطناعي لتحليل البيانات والأسعار." },
                            ].map((item, idx) => (
                                <div key={idx} className="relative flex items-center justify-between mb-12">
                                    <div className={`w-1/2 px-8 ${idx % 2 === 0 ? 'text-left lg:order-1' : 'text-right lg:order-2'}`}>
                                        {/* Empty for spacing on opposite side */}
                                    </div>
                                    <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-blue border-4 border-white shadow-lg z-10" />
                                    <div className={`w-1/2 px-8 ${idx % 2 === 0 ? 'text-right lg:order-2' : 'text-left lg:order-1'}`}>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <span className="text-brand-blue font-bold text-xl block mb-2">{item.year}</span>
                                            <h3 className="font-bold text-brand-dark text-lg mb-2">{item.title}</h3>
                                            <p className="text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};
