import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Star, Building2, Info, MessageCircle, CreditCard, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المميزات', path: '/features', icon: Star },
    { name: 'الوحدات', path: '/units', icon: Building2 },
    { name: 'الأسعار', path: '/pricing', icon: CreditCard },
    { name: 'عن النظام', path: '/about', icon: Info },
    { name: 'تواصل معنا', path: '/contact', icon: MessageCircle },
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-[80px]">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-gray-100" />
            <div className="max-w-7xl mx-auto px-8 relative h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-3xl font-extrabold tracking-tight flex items-center gap-1">
                    <span className="bg-gradient-to-tr from-brand-purple to-brand-blue bg-clip-text text-transparent">أركان</span>
                    <div className="w-2 h-2 rounded-full bg-brand-accent mt-3"></div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="text-brand-dark hover:text-brand-blue font-medium transition-colors flex items-center gap-2"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* CTA & Mobile Menu Toggle */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 pl-2">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-brand-dark">{user.displayName}</span>
                                <span className="text-xs text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full">مشترك</span>
                            </div>

                            <Link to="/dashboard">
                                <Button size="sm" variant="outline" className="hidden md:inline-flex border-gray-200 hover:border-brand-blue hover:text-brand-blue">
                                    <UserIcon className="w-4 h-4 ml-2" />
                                    لوحة التحكم
                                </Button>
                            </Link>

                            <button
                                onClick={logout}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                title="تسجيل الخروج"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="hidden md:block text-brand-dark font-medium hover:text-brand-blue">
                                تسجيل الدخول
                            </Link>
                            <Link to="/register">
                                <Button size="sm" variant="gradient" className="hidden md:inline-flex">
                                    ابـدأ مجاناً
                                </Button>
                            </Link>
                        </div>
                    )}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-xl"
                    >
                        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-brand-dark"
                                >
                                    <link.icon className="w-5 h-5 text-brand-blue" />
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            ))}

                            {user ? (
                                <>
                                    <Link to="/dashboard">
                                        <Button className="w-full mb-3" variant="outline">لوحة التحكم</Button>
                                    </Link>
                                    <Button onClick={logout} className="w-full text-red-500 border-red-200 hover:bg-red-50" variant="ghost">تسجيل الخروج</Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button className="w-full mb-3" variant="ghost">تسجيل الدخول</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button className="w-full" variant="gradient">
                                            ابـدأ مجاناً
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
