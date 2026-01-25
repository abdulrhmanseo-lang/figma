import { Calendar, Wrench, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function MaintenanceTimeline() {
    const timelineEvents = [
        {
            date: 'فبراير 2026',
            title: 'صيامة دورية - التكييف',
            property: 'برج الياسمين',
            status: 'scheduled',
            priority: 'medium',
            impact: 'تحسين كفاءة استهلاك الطاقة بنسبة 15%',
        },
        {
            date: 'مارس 2026',
            title: 'فحص أنظمة السلامة',
            property: 'مجمع النرجس',
            status: 'upcoming',
            priority: 'high',
            impact: 'الالتزام بمعايير الدفاع المدني الجديدة',
        },
        {
            date: 'أبريل 2026',
            title: 'تنظيف الواجهات الزجاجية',
            property: 'برج الياسمين',
            status: 'upcoming',
            priority: 'low',
            impact: 'الحفاظ على المظهر الجمالي للعقار',
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold" style={{ color: '#0A2A43' }}>
                        الجدول الزمني التوقعي للصيانة
                    </h3>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                    توقعات 90 يوم
                </div>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {timelineEvents.map((event, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-200 group-hover:bg-blue-600">
                            <Wrench className="w-5 h-5 text-blue-600 group-hover:text-white" />
                        </div>

                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-1">
                                <time className="text-sm font-bold text-blue-600">{event.date}</time>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${event.priority === 'high' ? 'bg-red-100 text-red-600' :
                                        event.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                                            'bg-green-100 text-green-600'
                                    }`}>
                                    {event.priority === 'high' ? 'عالي الأولوية' :
                                        event.priority === 'medium' ? 'متوسط' : 'عادي'}
                                </span>
                            </div>
                            <div className="text-slate-900 font-bold mb-1">{event.title}</div>
                            <div className="text-sm text-gray-500 mb-2">{event.property}</div>
                            <div className="flex items-start gap-2 p-2 bg-blue-50/50 rounded-lg">
                                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-xs text-blue-800 leading-relaxed italic">
                                    الأثر المتوقع: {event.impact}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-900">
                        <strong>نصيحة الذكاء الاصطناعي:</strong> تم جدولة الصيانة الدورية للتكييف في فبراير لتجنب ازدحام المواعيد في موسم الصيف الحاد، مما يوفر حوالي 20% من تكاليف العقود الطارئة.
                    </p>
                </div>
            </div>
        </div>
    );
}
