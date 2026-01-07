import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import {
  Building2, Home, Users, FileText, CreditCard, Wrench,
  BarChart3, ShoppingCart, ClipboardList, ShieldCheck, CheckCircle2,
  AlertCircle, DollarSign, PieChart
} from 'lucide-react';
import { SuperAdminPanel } from '../components/SuperAdminPanel';

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
  const { getKPI, properties } = useData();
  const kpi = getKPI();

  // Format currency
  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ر.س';
  };

  // KPI Cards data
  const kpiCards = [
    {
      label: 'إجمالي العقارات',
      value: properties.length,
      icon: Building2,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'إجمالي الوحدات',
      value: kpi.totalUnits,
      icon: Home,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'نسبة الإشغال',
      value: `${Math.round(kpi.occupancyRate)}%`,
      icon: PieChart,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      progress: kpi.occupancyRate,
    },
    {
      label: 'الدخل الشهري المتوقع',
      value: formatSAR(kpi.expectedMonthlyIncome),
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'المتأخرات',
      value: formatSAR(kpi.overdueAmount),
      subValue: `${kpi.overdueCount} دفعة`,
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      isWarning: kpi.overdueAmount > 0,
    },
  ];

  return (
    <motion.div
      className="space-y-6 lg:space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-dark mb-1">
            مرحباً، <span className="text-brand-blue">{user?.displayName?.split(' ')[0] || 'أدمن'}</span>!
          </h1>
          <p className="text-sm lg:text-base text-gray-500">لوحة التحكم الخاصة بك</p>
        </div>
      </motion.div>

      {/* Super Admin Panel - Only visible to authorized Super Admins */}
      <SuperAdminPanel />

      {/* Glassmorphism KPI Stats Bar */}
      <motion.div variants={itemAnim}>
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-[1px] bg-gradient-to-r from-brand-blue/30 via-purple-500/30 to-brand-blue/30">
          {/* Glass Background */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-brand-blue/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl" />

            {/* KPI Cards Grid */}
            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {kpiCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`relative overflow-hidden rounded-xl lg:rounded-2xl p-3 lg:p-4 bg-gradient-to-br ${card.bgGradient} border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 group`}
                  >
                    {/* Gradient Accent Line */}
                    <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${card.gradient} opacity-80`} />

                    {/* Content */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] lg:text-xs text-gray-500 font-medium mb-1 truncate">{card.label}</p>
                        <p className={`text-base lg:text-xl font-bold text-gray-800 truncate ${card.isWarning ? 'text-red-600' : ''}`}>
                          {card.value}
                        </p>
                        {card.subValue && (
                          <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5">{card.subValue}</p>
                        )}

                        {/* Progress Bar for Occupancy */}
                        {card.progress !== undefined && (
                          <div className="mt-2 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${card.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Permissions Overview */}
      <motion.div variants={itemAnim} className="space-y-3 lg:space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-brand-blue" />
          <h2 className="text-lg lg:text-xl font-bold text-brand-dark">حالة الصلاحيات</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {adminPermissions.map((perm) => {
            const config = moduleConfig[perm.module];
            const Icon = config?.icon || BarChart3;
            const isFullControl = perm.actions.length >= 4;

            return (
              <motion.div
                key={perm.module}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white hover:bg-gradient-to-br hover:from-purple-500 hover:to-indigo-600 rounded-xl shadow-sm border border-gray-100 hover:border-purple-400 p-3 lg:p-4 flex items-center justify-between group overflow-hidden relative transition-all duration-300 cursor-pointer"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-50 group-hover:bg-white/20 flex items-center justify-center text-gray-400 group-hover:text-white transition-all duration-300 flex-shrink-0">
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 group-hover:text-white text-xs lg:text-sm truncate transition-colors duration-300">{config?.label}</h3>
                    <p className="text-[10px] lg:text-xs text-gray-400 group-hover:text-white/80 mt-0.5 truncate transition-colors duration-300">
                      {isFullControl ? 'تحكم كامل' : 'صلاحيات محدودة'}
                    </p>
                  </div>
                </div>

                {isFullControl && (
                  <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-green-50 group-hover:bg-white/20 flex items-center justify-center text-green-600 group-hover:text-white flex-shrink-0 transition-all duration-300">
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Access Grid */}
      <motion.div variants={itemAnim} className="space-y-3 lg:space-y-4">
        <h2 className="text-lg lg:text-xl font-bold text-brand-dark px-1">الوصول السريع</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
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
                  className="h-full bg-white p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-blue/20 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2 lg:gap-3"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gray-50 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-500 group-hover:text-brand-blue transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-gray-700 group-hover:text-brand-dark transition-colors text-xs sm:text-sm lg:text-base">{item.name}</h3>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

