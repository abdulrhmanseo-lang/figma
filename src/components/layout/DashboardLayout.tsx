import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    BarChart3, Building2, Home, Users, FileText, CreditCard, Wrench,
    Settings, ClipboardList, LogOut, ChevronRight, ShoppingCart, Menu, X
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

const sidebarLinks = [
    { name: 'نظرة عامة', path: '/app', icon: BarChart3 },
    { name: 'العقارات', path: '/app/properties', icon: Building2 },
    { name: 'الوحدات', path: '/app/units', icon: Home },
    { name: 'المستأجرين', path: '/app/tenants', icon: Users },
    { name: 'العقود', path: '/app/contracts', icon: FileText },
    { name: 'الدفعات', path: '/app/payments', icon: CreditCard },
    { name: 'الصيانة', path: '/app/maintenance', icon: Wrench },
    { name: 'المبيعات', path: '/app/sales', icon: ShoppingCart },
    { name: 'الموظفين', path: '/app/employees', icon: Users },
    { name: 'المهام', path: '/app/tasks', icon: ClipboardList },
    { name: 'التقارير', path: '/app/reports', icon: BarChart3 },
    { name: 'الإعدادات', path: '/app/settings', icon: Settings },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="min-h-screen bg-slate-100 font-cairo" dir="rtl">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed right - 0 top - 0 h - screen w - 72 lg: w - 64 bg - white shadow - xl z - 50 flex flex - col
                transform transition - transform duration - 300 ease -in -out
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
`}>
                {/* Logo */}
                <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
                    <Link to="/app" className="flex items-center gap-2" onClick={closeSidebar}>
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-purple rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl lg:text-2xl font-bold bg-gradient-to-l from-brand-blue to-brand-purple bg-clip-text text-transparent">
                            أركان
                        </span>
                    </Link>
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <p className="px-4 py-2 text-xs text-gray-400 lg:hidden">بوابة الموظفين</p>

                {/* Navigation */}
                <nav className="flex-1 py-2 lg:py-4 overflow-y-auto">
                    <ul className="space-y-1 px-2 lg:px-3">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        onClick={closeSidebar}
                                        className={`flex items - center gap - 3 px - 3 lg: px - 4 py - 2.5 lg: py - 3 rounded - xl transition - all text - sm lg: text - base ${isActive
                                            ? 'bg-gradient-to-l from-brand-blue to-brand-purple text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'
                                            } `}
                                    >
                                        <link.icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{link.name}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info & Logout */}
                <div className="p-3 lg:p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 lg:w-10 h-9 lg:h-10 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base flex-shrink-0">
                            {user?.displayName?.charAt(0) || 'أ'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-brand-dark truncate text-sm lg:text-base">{user?.displayName || 'مستخدم'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:mr-64">
                {/* Top Bar */}
                <header className="bg-white shadow-sm sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <h1 className="text-lg lg:text-xl font-bold text-brand-dark">
                                {sidebarLinks.find(l => l.path === pathname)?.name || 'لوحة التحكم'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <NotificationsDropdown />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-3 lg:p-6">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
