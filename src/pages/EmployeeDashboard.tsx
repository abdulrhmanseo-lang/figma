import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Building2, Home, Users, FileText, CreditCard, Wrench,
    BarChart3, LogOut, ShoppingCart, ClipboardList,
    Lock, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import type { PermissionModule } from '../types/database';

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

const moduleLabels: Record<PermissionModule, string> = {
    properties: 'العقارات',
    units: 'الوحدات',
    tenants: 'المستأجرين',
    contracts: 'العقود',
    payments: 'الدفعات',
    maintenance: 'الصيانة',
    reports: 'التقارير',
    settings: 'الإعدادات',
    sales: 'المبيعات',
    employees: 'الموظفين',
    tasks: 'المهام',
};

export function EmployeeDashboard() {
    const { currentEmployee, employeeLogout } = useAuth();
    const { employees } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    // Get LIVE employee data from DataContext (syncs with admin changes)
    const liveEmployee = useMemo(() => {
        if (!currentEmployee) return null;
        return employees.find(emp => emp.id === currentEmployee.id) || null;
    }, [currentEmployee, employees]);

    // Check if employee is deactivated or deleted
    useEffect(() => {
        if (!currentEmployee) {
            navigate('/employee/login');
            return;
        }

        // Check if employee was deactivated by admin
        if (liveEmployee && !liveEmployee.isActive) {
            employeeLogout();
            navigate('/employee/login');
            return;
        }

        // Check if employee was deleted
        if (currentEmployee && !liveEmployee) {
            employeeLogout();
            navigate('/employee/login');
        }
    }, [currentEmployee, liveEmployee, navigate, employeeLogout]);

    if (!currentEmployee || !liveEmployee) {
        return null;
    }

    const handleLogout = () => {
        employeeLogout();
        navigate('/employee/login');
    };

    // Use LIVE permissions from DataContext
    const hasPermission = (module: string, action: string): boolean => {
        const permission = liveEmployee.permissions.find(p => p.module === module);
        return permission ? permission.actions.includes(action as any) : false;
    };

    // Filter nav items based on LIVE permissions for Quick Access
    const allowedNavItems = navItems.filter(item =>
        hasPermission(item.module, 'view') && item.path !== '/employee/dashboard'
    );

    return (
        <div className="space-y-6">
            {/* Validated Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark mb-1">مرحباً، {liveEmployee.fullName.split(' ')[0]}!</h1>
                    <p className="text-gray-500">لوحة التحكم الخاصة بك</p>
                </div>
            </div>

            {/* Permissions Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
            >
                <h2 className="text-xl font-bold text-brand-dark mb-4">صلاحياتك</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveEmployee.permissions.map((perm) => (
                        <div key={perm.module} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                                {moduleLabels[perm.module]}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {perm.actions.map((action) => (
                                    <span
                                        key={action}
                                        className={`px-2 py-1 rounded-lg text-xs font-medium ${action === 'view' ? 'bg-blue-100 text-blue-700' :
                                            action === 'create' ? 'bg-green-100 text-green-700' :
                                                action === 'edit' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {action === 'view' ? 'عرض' :
                                            action === 'create' ? 'إضافة' :
                                                action === 'edit' ? 'تعديل' : 'حذف'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Access Grid */}
            <div>
                <h2 className="text-xl font-bold text-brand-dark mb-4">الوصول السريع</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allowedNavItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={item.path}
                                    className="block bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-brand-blue/20"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-blue/10 transition-colors">
                                        <Icon className="w-6 h-6 text-gray-600 group-hover:text-brand-blue transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-brand-dark">{item.name}</h3>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

