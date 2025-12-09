import { Brain, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function AIRecommendation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 h-full"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">
                توصية الذكاء الاصطناعي
              </h3>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            
            <p className="text-blue-50 leading-relaxed">
              نقترح زيادة الإيجار بنسبة 6% لهذه الفترة بناءً على تحليلات السوق. التحليل يشير إلى ارتفاع الطلب في منطقتك بنسبة 12% مقارنة بالربع السابق.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-xs mb-1">الزيادة المتوقعة</p>
            <p className="text-white text-xl font-bold">+6%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-xs mb-1">الإيراد الإضافي</p>
            <p className="text-white text-xl font-bold">144K</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-xs mb-1">معدل القبول</p>
            <p className="text-white text-xl font-bold">%89</p>
          </div>
        </div>

        {/* Button */}
        <button className="w-full md:w-auto px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2">
          <span>عرض التفاصيل</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
