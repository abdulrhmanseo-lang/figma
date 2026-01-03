import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { motion } from 'motion/react';
import {
    BarChart3, Building2, Home, Users, FileText, CreditCard, Wrench,
    Settings, ClipboardList, LogOut, ChevronRight, Bell, ShoppingCart, Lock
} from 'lucide-react';
import type { PermissionModule } from '../../types/database';
import { useMemo } from 'react';

interface NavItem {
    name: string;
    path: string;
    icon: any;
    module: PermissionModule;
}

const navItems: NavItem[] = [
    { name: 'نظرة عامة', path: '/employee/dashboard', icon: BarChart3, module: 'properties' },
    { name: 'العقارات', path: '/employee/properties', icon: Building2, module: 'properties' },
    { name: 'الوحدات', path: '/employee/units', icon: Home, module: 'units' },
    { name: 'المستأجرين', path: '/employee/tenants', icon: Users, module: 'tenants' },
    { name: 'العقود', path: '/employee/contracts', icon: FileText, module: 'contracts' },
    { name: 'الدفعات', path: '/employee/payments', icon: CreditCard, module: 'payments' },
    { name: 'الصيانة', path: '/employee/maintenance', icon: Wrench, module: 'maintenance' },
    { name: 'المبيعات', path: '/employee/sales', icon: ShoppingCart, module: 'sales' },
    { name: 'المهام', path: '/employee/tasks', icon: ClipboardList, module: 'tasks' },
    { name: 'التقارير', path: '/employee/reports', icon: BarChart3, module: 'reports' },
];

interface EmployeeLayoutProps {
    children: React.ReactNode;
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
    const { pathname } = useLocation();
    const { currentEmployee, employeeLogout } = useAuth();
    const { employees } = useData();
    const navigate = useNavigate();

    // Get LIVE employee data
    const liveEmployee = useMemo(() => {
        if (!currentEmployee) return null;
        return employees.find(emp => emp.id === currentEmployee.id) || null;
    }, [currentEmployee, employees]);

    if (!currentEmployee || !liveEmployee) {
        return null; // Should redirect in logic or show loading
    }

    const hasPermission = (module: string, action: string): boolean => {
        const permission = liveEmployee.permissions.find(p => p.module === module);
        return permission ? permission.actions.includes(action as any) : false;
    };

    const handleLogout = () => {
        employeeLogout();
        navigate('/employee/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 font-cairo" dir="rtl">
            {/* Sidebar */}
            <aside className="fixed right-0 top-0 h-screen w-64 bg-white shadow-xl z-40 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <Link to="/employee/dashboard" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-purple rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-l from-brand-blue to-brand-purple bg-clip-text text-transparent block">
                                أركان
                            </span>
                            <span className="text-xs text-gray-400">بوابة الموظفين</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1 px-3">
                        {/* Allowed Items */}
                        {navItems.filter(item => hasPermission(item.module, 'view')).map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-gradient-to-l from-brand-blue to-brand-purple text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'
                                            }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        <span className="font-medium">{link.name}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* Locked Divider */}
                        <div className="my-4 border-t border-gray-100" />
                        <p className="px-4 text-xs text-gray-400 mb-2">غير مصرح</p>

                        {/* Locked Items */}
                        {navItems.filter(item => !hasPermission(item.module, 'view')).map((link) => (
                            <li key={link.path}>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 cursor-not-allowed">
                                    <link.icon className="w-5 h-5" />
                                    <span className="font-medium flex-1">{link.name}</span>
                                    <Lock className="w-4 h-4" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full flex items-center justify-center text-white font-bold">
                            {liveEmployee.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-brand-dark truncate">{liveEmployee.fullName}</p>
                            <p className="text-xs text-gray-400 truncate">{liveEmployee.department}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="mr-64">
                {/* Top Bar */}
                <header className="bg-white shadow-sm sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-bold text-brand-dark">
                                {navItems.find(l => l.path === pathname)?.name || 'لوحة التحكم'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <Bell className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
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
