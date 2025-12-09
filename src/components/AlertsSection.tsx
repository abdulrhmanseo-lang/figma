import { AlertCircle, Clock, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

export function AlertsSection() {
  const alerts = [
    {
      icon: Clock,
      title: 'عقود تنتهي قريباً',
      description: '12 عقد تنتهي خلال 30 يوم',
      status: 'warning',
      color: 'from-amber-400 to-orange-400',
    },
    {
      icon: AlertCircle,
      title: 'دفعات متأخرة',
      description: '8 دفعات لم يتم تحصيلها',
      status: 'danger',
      color: 'from-red-400 to-pink-400',
    },
    {
      icon: Wrench,
      title: 'صيانة معلّقة',
      description: '5 طلبات بحاجة إلى متابعة',
      status: 'info',
      color: 'from-blue-400 to-cyan-400',
    },
  ];

  const statusColors = {
    warning: 'bg-amber-100 border-amber-300',
    danger: 'bg-red-100 border-red-300',
    info: 'bg-blue-100 border-blue-300',
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
          <div
            key={index}
            className={`p-4 rounded-xl border-r-4 ${statusColors[alert.status as keyof typeof statusColors]} transition-all duration-200 hover:shadow-md cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${alert.color} flex items-center justify-center flex-shrink-0`}>
                <alert.icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold mb-1" style={{ color: '#0A2A43' }}>
                  {alert.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
