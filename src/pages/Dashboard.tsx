import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import {
  Building2, Home, Users, FileText, CreditCard, Wrench,
  BarChart3, ShoppingCart, ClipboardList, ShieldCheck, CheckCircle2
} from 'lucide-react';

const navItems = [
  { name: 'نظرة عامة', path: '/app', icon: BarChart3 },
  { name: 'العقارات', path: '/app/properties', icon: Building2 },
  { name: 'الوحدات', path: '/app/units', icon: Home },
  { name: 'المستأجرين', path: '/app/tenants', icon: Users },
  { name: 'العقود', path: '/app/contracts', icon: FileText },
  { name: 'الدفعات', path: '/app/payments', icon: CreditCard },
  { name: 'الصيانة', path: '/app/maintenance', icon: Wrench },
  { name: 'المبيعات', path: '/app/sales', icon: ShoppingCart },
  { name: 'المهام', path: '/app/tasks', icon: ClipboardList },
  { name: 'التقارير', path: '/app/reports', icon: BarChart3 },
  { name: 'الموظفين', path: '/app/employees', icon: Users },
];

const moduleConfig: Record<string, { label: string; icon: any }> = {
  properties: { label: 'العقارات', icon: Building2 },
  units: { label: 'الوحدات', icon: Home },
  tenants: { label: 'المستأجرين', icon: Users },
  contracts: { label: 'العقود', icon: FileText },
  payments: { label: 'الدفعات', icon: CreditCard },
  maintenance: { label: 'الصيانة', icon: Wrench },
  reports: { label: 'التقارير', icon: BarChart3 },
  sales: { label: 'المبيعات', icon: ShoppingCart },
  employees: { label: 'الموظفين', icon: Users },
  tasks: { label: 'المهام', icon: ClipboardList },
};

// Admin has all permissions
const adminPermissions = [
  { module: 'properties', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'units', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'tenants', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'contracts', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'maintenance', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'sales', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'reports', actions: ['view'] },
  { module: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const { user } = useAuth();
  const isFullAdmin = true; // Assuming admin for now

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemAnim} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-1">
            مرحباً، <span className="text-brand-blue">{user?.displayName?.split(' ')[0] || 'أدمن'}</span>!
          </h1>
          <p className="text-gray-500">لوحة التحكم الخاصة بك</p>
        </div>
      </motion.div>

      {/* Permissions Overview */}
      <motion.div variants={itemAnim} className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-5 h-5 text-brand-blue" />
          <h2 className="text-xl font-bold text-brand-dark">حالة الصلاحيات</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminPermissions.map((perm) => {
            const config = moduleConfig[perm.module];
            const Icon = config?.icon || BarChart3;
            const isFullControl = perm.actions.length >= 4;

            return (
              <motion.div
                key={perm.module}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between group overflow-hidden relative"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{config?.label}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isFullControl ? 'تحكم كامل' : 'صلاحيات محدودة'}
                    </p>
                  </div>
                </div>

                {isFullControl ? (
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {/* Simplified dots/indicators for partial access could go here if needed */}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Access Grid */}
      <motion.div variants={itemAnim} className="space-y-4">
        <h2 className="text-xl font-bold text-brand-dark px-1">الوصول السريع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {navItems.filter(item => item.path !== '/app').map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-blue/20 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-3"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-gray-500 group-hover:text-brand-blue transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-gray-700 group-hover:text-brand-dark transition-colors">{item.name}</h3>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
