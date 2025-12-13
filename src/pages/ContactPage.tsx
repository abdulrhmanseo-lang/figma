import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    return (
        <Layout>
            <div className="bg-slate-50 py-24 min-h-screen">
                <div className="container">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-4">تواصل معنا</h1>
                        <p className="text-gray-600 text-lg">نحن هنا للإجابة على جميع استفساراتك ومساعدتك في البدء.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <Card className="p-8">
                                <h3 className="text-2xl font-bold text-brand-dark mb-6">معلومات التواصل</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-blue flex items-center justify-center shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-dark mb-1">العنوان</h4>
                                            <p className="text-gray-600">الرياض، المملكة العربية السعودية<br />طريق الملك فهد، برج الفيصلية</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-blue flex items-center justify-center shrink-0">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-dark mb-1">الهاتف</h4>
                                            <p className="text-gray-600" dir="ltr">+966 50 123 4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-blue flex items-center justify-center shrink-0">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-dark mb-1">البريد الإلكتروني</h4>
                                            <p className="text-gray-600">contact@sakan.app</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-0 overflow-hidden h-[300px] bg-slate-200 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    {/* Placeholder for Map. If key is available, use Google Maps Embed */}
                                    <div className="text-center">
                                        <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                        <p>خريطة الموقع</p>
                                    </div>
                                </div>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14494.613867086827!2d46.72185005!3d24.738875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh!5e0!3m2!1sen!2ssa!4v1625064562819!5m2!1sen!2ssa"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    className="opacity-70 hover:opacity-100 transition-opacity duration-300"
                                ></iframe>
                            </Card>
                        </div>

                        {/* Form */}
                        <Card className="p-8 relative overflow-hidden">
                            <AnimatePresence>
                                {isSubmitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -50 }}
                                        className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-8"
                                    >
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-brand-dark mb-2">تم الإرسال بنجاح!</h3>
                                        <p className="text-gray-600">شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <h2 className="text-2xl font-bold text-brand-dark mb-6">أرسل لنا رسالة</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" placeholder="محمد عبدالله" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                    <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" placeholder="name@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الاستفسار</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
                                        <option>استفسار عام</option>
                                        <option>مبيعات</option>
                                        <option>دعم فني</option>
                                        <option>شراكات</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
                                    <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" placeholder="كيف يمكننا مساعدتك؟"></textarea>
                                </div>
                                <Button type="submit" variant="gradient" className="w-full flex items-center gap-2 justify-center">
                                    إرسال الرسالة <Send className="w-4 h-4 mt-1" />
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
