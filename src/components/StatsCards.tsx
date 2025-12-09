import { Building2, Users, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { motion } from 'motion/react';

export function StatsCards() {
  const stats = [
    {
      icon: Building2,
      title: 'إجمالي العقارات',
      value: '247',
      trend: 12,
      isPositive: true,
      bgGradient: 'from-blue-400 to-cyan-400',
    },
    {
      icon: Users,
      title: 'عدد المستأجرين',
      value: '1,834',
      trend: 8,
      isPositive: true,
      bgGradient: 'from-purple-400 to-pink-400',
    },
    {
      icon: TrendingUp,
      title: 'الدخل الشهري',
      value: '2.4M ر.س',
      trend: 15,
      isPositive: true,
      bgGradient: 'from-green-400 to-emerald-400',
    },
    {
      icon: Percent,
      title: 'نسبة الإشغال',
      value: '%92',
      trend: -3,
      isPositive: false,
      bgGradient: 'from-orange-400 to-red-400',
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
          className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
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

            {/* Value and Trend */}
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
                {stat.value}
              </p>
              
              <div className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(stat.trend)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
