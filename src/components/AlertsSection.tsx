import { AlertCircle, Clock, Wrench, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatSAR, daysRemaining } from '../lib/format';
import { useMemo } from 'react';

export function AlertsSection() {
  const { contracts, payments, maintenanceRequests, getKPI } = useData();
  const kpi = getKPI();

  // Contracts expiring within 30 days
  const expiringContracts = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return contracts
      .filter(c => {
        const endDate = new Date(c.endDate);
        return c.status === 'active' && endDate <= thirtyDaysFromNow;
      })
      .slice(0, 3);
  }, [contracts]);

  // Overdue payments
  const overduePayments = useMemo(() => {
    return payments
      .filter(p => p.status === 'overdue')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [payments]);

  // Urgent/new maintenance requests
  const urgentMaintenance = useMemo(() => {
    return maintenanceRequests
      .filter(m => m.status === 'new' || (m.status === 'in_progress' && m.priority === 'urgent'))
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 3);
  }, [maintenanceRequests]);

  const alerts = [
    {
      icon: Clock,
      title: 'عقود تنتهي قريباً',
      count: kpi.contractsExpiringSoon,
      items: expiringContracts.map(c => ({
        text: `${c.tenantName} - وحدة ${c.unitNo}`,
        subtext: `ينتهي في ${daysRemaining(c.endDate)} يوم`,
      })),
      status: 'warning',
      color: 'from-amber-400 to-orange-400',
      link: '/app/contracts',
    },
    {
      icon: AlertCircle,
      title: 'دفعات متأخرة',
      count: kpi.overdueCount,
      items: overduePayments.map(p => ({
        text: `${p.tenantName} - ${formatSAR(p.amount)}`,
        subtext: `وحدة ${p.unitNo}`,
      })),
      status: 'danger',
      color: 'from-red-400 to-pink-400',
      link: '/app/payments',
    },
    {
      icon: Wrench,
      title: 'صيانة تحتاج متابعة',
      count: urgentMaintenance.length,
      items: urgentMaintenance.map(m => ({
        text: m.title,
        subtext: `${m.propertyName} - ${m.unitNo || 'عام'}`,
      })),
      status: 'info',
      color: 'from-blue-400 to-cyan-400',
      link: '/app/maintenance',
    },
  ];

  const statusColors = {
    warning: 'bg-amber-50 border-amber-300 hover:bg-amber-100',
    danger: 'bg-red-50 border-red-300 hover:bg-red-100',
    info: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 h-full"
    >
      <h3 className="text-xl font-bold mb-6" style={{ color: '#0A2A43' }}>
        التنبيهات
      </h3>

      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <Link
            key={index}
            to={alert.link}
            className={`block p-4 rounded-xl border-r-4 ${statusColors[alert.status as keyof typeof statusColors]} transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${alert.color} flex items-center justify-center flex-shrink-0`}>
                <alert.icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: '#0A2A43' }}>
                    {alert.title}
                  </h4>
                  <span className="text-sm font-bold text-gray-500">
                    {alert.count}
                  </span>
                </div>

                {alert.items.length > 0 ? (
                  <div className="space-y-1">
                    {alert.items.map((item, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        <span className="font-medium">{item.text}</span>
                        <span className="text-gray-400 mr-2">{item.subtext}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">لا توجد تنبيهات</p>
                )}
              </div>

              <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
