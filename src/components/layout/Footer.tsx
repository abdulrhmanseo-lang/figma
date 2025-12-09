import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-white pt-24 pb-12 border-t border-gray-100 mt-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Logo & Desc */}
                    <div className="space-y-6">
                        <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent inline-block mb-4">
                            أركان
                        </Link>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            الحل الأمثل لإدارة العقارات والمجمعات السكنية. نوفر لك الأدوات التي تحتاجها لزيادة أرباحك وراحة بالك.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="font-bold text-brand-dark mb-6 text-lg">المنتج</h3>
                        <ul className="space-y-4 text-sm font-medium text-gray-500">
                            <li><Link to="/features" className="hover:text-brand-blue transition-colors">المميزات</Link></li>
                            <li><Link to="/pricing" className="hover:text-brand-blue transition-colors">الأسعار</Link></li>
                            <li><Link to="/units" className="hover:text-brand-blue transition-colors">الوحدات</Link></li>
                            <li><Link to="/about" className="hover:text-brand-blue transition-colors">عن النظام</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="font-bold text-brand-dark mb-6 text-lg">الدعم</h3>
                        <ul className="space-y-4 text-sm font-medium text-gray-500">
                            <li><Link to="/contact" className="hover:text-brand-blue transition-colors">مركز المساعدة</Link></li>
                            <li><Link to="#" className="hover:text-brand-blue transition-colors">شروط الاستخدام</Link></li>
                            <li><Link to="#" className="hover:text-brand-blue transition-colors">سياسة الخصوصية</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-brand-dark mb-6 text-lg">تواصل معنا</h3>
                        <ul className="space-y-4 text-sm font-medium text-gray-500">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-brand-blue shrink-0" />
                                <span>الرياض، طريق الملك فهد</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-brand-blue shrink-0" />
                                <span dir="ltr">+966 50 000 0000</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-brand-blue shrink-0" />
                                <span>help@arkan.app</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 text-center">
                    <p className="text-gray-400 text-sm">© {new Date().getFullYear()} منصة أركان. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
};
