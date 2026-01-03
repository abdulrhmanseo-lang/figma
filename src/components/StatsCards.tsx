import { Building2, Users, TrendingUp, AlertTriangle, Percent, FileText, Banknote } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../context/DataContext';
import { formatSAR, formatNumber, formatPercent } from '../lib/format';

export function StatsCards() {
  const { getKPI, properties } = useData();
  const kpi = getKPI();

  const stats = [
    {
      icon: Building2,
      title: 'إجمالي الوحدات',
      value: formatNumber(kpi.totalUnits),
      subtitle: `${properties.length} عقار`,
      bgGradient: 'from-blue-400 to-cyan-400',
    },
    {
      icon: Percent,
      title: 'نسبة الإشغال',
      value: formatPercent(kpi.occupancyRate),
      subtitle: `${kpi.rentedUnits} مؤجرة من ${kpi.totalUnits}`,
      bgGradient: 'from-green-400 to-emerald-400',
    },
    {
      icon: Banknote,
      title: 'الدخل الشهري المتوقع',
      value: formatSAR(kpi.expectedMonthlyIncome),
      subtitle: 'من العقود النشطة',
      bgGradient: 'from-purple-400 to-pink-400',
    },
    {
      icon: AlertTriangle,
      title: 'المتأخرات',
      value: formatSAR(kpi.overdueAmount),
      subtitle: `${kpi.overdueCount} دفعة متأخرة`,
      bgGradient: kpi.overdueCount > 0 ? 'from-red-400 to-orange-400' : 'from-gray-300 to-gray-400',
      isWarning: kpi.overdueCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${stat.isWarning ? 'ring-2 ring-red-200' : ''}`}
        >
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />

          <div className="relative p-6">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>

            {/* Value */}
            <p className="text-2xl font-bold mb-1" style={{ color: '#0A2A43' }}>
              {stat.value}
            </p>

            {/* Subtitle */}
            <p className="text-xs text-gray-400">{stat.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
