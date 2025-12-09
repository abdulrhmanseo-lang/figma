import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export function AIInsights() {
  const priceRecommendation = {
    action: 'increase',
    percentage: 6,
    reason: 'ارتفاع الطلب في المنطقة بنسبة 12% مقارنة بالربع السابق',
    expectedRevenue: 144000,
  };

  const occupancyForecast = [
    { month: 'يناير', rate: 92 },
    { month: 'فبراير', rate: 94 },
    { month: 'مارس', rate: 93 },
    { month: 'أبريل', rate: 95 },
    { month: 'مايو', rate: 96 },
    { month: 'يونيو', rate: 94 },
  ];

  const riskAnalysis = [
    { category: 'دفعات متأخرة', score: 25, color: 'from-red-400 to-pink-400' },
    { category: 'عقود قريبة الانتهاء', score: 45, color: 'from-orange-400 to-amber-400' },
    { category: 'صيانة معلقة', score: 15, color: 'from-yellow-400 to-orange-400' },
    { category: 'وحدات شاغرة', score: 10, color: 'from-blue-400 to-cyan-400' },
  ];

  const insights = [
    {
      title: 'فرصة تحسين الإيرادات',
      description: 'يمكن زيادة الإيرادات بنسبة 8% من خلال تحسين أسعار 12 وحدة في برج الياسمين',
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-400',
    },
    {
      title: 'تنبيه المخاطر',
      description: '3 مستأجرين لديهم تاريخ دفعات متأخرة - يُنصح بالمتابعة المبكرة',
      icon: AlertTriangle,
      color: 'from-red-400 to-pink-400',
    },
    {
      title: 'توصية التسويق',
      description: 'موسم الإقبال على الإيجار في الربع القادم - اقتراح حملة تسويقية للوحدات الشاغرة',
      icon: Target,
      color: 'from-purple-400 to-pink-400',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A2A43' }}>
            الذكاء الاصطناعي
          </h1>
          <p className="text-gray-600">
            تحليلات متقدمة وتوصيات ذكية لتحسين أداء العقارات
          </p>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>تحليل العقار الآن</span>
        </button>
      </div>

      {/* Price Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {priceRecommendation.action === 'increase' ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">توصية الأسعار</h2>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>

            <p className="text-blue-50 mb-4">
              نقترح {priceRecommendation.action === 'increase' ? 'زيادة' : 'تخفيض'} الإيجار بنسبة {priceRecommendation.percentage}% بناءً على تحليل السوق. {priceRecommendation.reason}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-blue-100 text-xs mb-1">النسبة المقترحة</p>
                <p className="text-2xl font-bold">+{priceRecommendation.percentage}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-blue-100 text-xs mb-1">الإيراد الإضافي</p>
                <p className="text-2xl font-bold">{priceRecommendation.expectedRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-blue-100 text-xs mb-1">معدل القبول المتوقع</p>
                <p className="text-2xl font-bold">89%</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Occupancy Forecast */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold" style={{ color: '#0A2A43' }}>
              توقع الإشغال - 90 يوم
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={occupancyForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[85, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>توقع إيجابي:</strong> من المتوقع ارتفاع نسبة الإشغال إلى 96% خلال الأشهر القادمة
            </p>
          </div>
        </motion.div>

        {/* Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-bold" style={{ color: '#0A2A43' }}>
              تحليل المخاطر
            </h3>
          </div>

          <div className="space-y-4">
            {riskAnalysis.map((risk, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{risk.category}</span>
                  <span className="text-sm font-bold" style={{ color: '#0A2A43' }}>
                    {risk.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${risk.color}`}
                    style={{ width: `${risk.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>تنبيه:</strong> مستوى المخاطر المتعلقة بالدفعات أعلى من المعدل الطبيعي
            </p>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${insight.color} flex items-center justify-center mb-4`}>
              <insight.icon className="w-6 h-6 text-white" />
            </div>

            <h4 className="font-bold mb-2" style={{ color: '#0A2A43' }}>
              {insight.title}
            </h4>

            <p className="text-sm text-gray-600">
              {insight.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Market Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: '#0A2A43' }}>
          خريطة حرارية للسوق
        </h3>

        <div className="h-64 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              تصور بياني لأداء السوق في المناطق المختلفة
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (يتم عرض البيانات الفعلية في الإنتاج)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
