import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';
import { useData } from '../context/DataContext';
import { formatSAR, formatNumber } from '../lib/format';

const COLORS = {
  rented: '#10b981',    // green
  vacant: '#f59e0b',    // amber
  maintenance: '#ef4444', // red
};

const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export function Charts() {
  const { units, payments } = useData();

  // Calculate unit status distribution
  const unitStatusData = useMemo(() => {
    const rented = units.filter(u => u.status === 'rented').length;
    const vacant = units.filter(u => u.status === 'vacant').length;
    const maintenance = units.filter(u => u.status === 'maintenance').length;

    return [
      { name: 'مؤجرة', value: rented, color: COLORS.rented },
      { name: 'شاغرة', value: vacant, color: COLORS.vacant },
      { name: 'صيانة', value: maintenance, color: COLORS.maintenance },
    ];
  }, [units]);

  // Calculate monthly income from payments
  const monthlyIncomeData = useMemo(() => {
    const now = new Date();
    const months: { month: string; income: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = ARABIC_MONTHS[date.getMonth()];

      const monthPayments = payments.filter(p => {
        if (p.status !== 'paid') return false;
        const payDate = new Date(p.paidAt || p.dueDate);
        return payDate.getMonth() === date.getMonth() && payDate.getFullYear() === date.getFullYear();
      });

      const totalIncome = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      months.push({ month: monthName, income: totalIncome });
    }

    return months;
  }, [payments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-xl font-bold mb-6" style={{ color: '#0A2A43' }}>
        نظرة عامة
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-4">الدخل الشهري (آخر 6 شهور)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyIncomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '11px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
              />
              <Tooltip
                formatter={(value: number) => [formatSAR(value), 'الدخل']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  direction: 'rtl',
                }}
              />
              <Bar
                dataKey="income"
                fill="#1CB5F3"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Unit Status Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-4">توزيع حالات الوحدات</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={unitStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {unitStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatNumber(value), name]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
