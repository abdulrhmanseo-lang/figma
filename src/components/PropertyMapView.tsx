import { Home, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../context/DataContext';

export function PropertyMapView() {
    const { units, properties } = useData();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'rented': return 'bg-emerald-500 shadow-emerald-200';
            case 'vacant': return 'bg-slate-200 shadow-slate-100';
            case 'maintenance': return 'bg-amber-500 shadow-amber-200';
            default: return 'bg-slate-400';
        }
    };

    const currentProperty = properties[0]; // Just showing first property for demo

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Home className="w-5 h-5 text-brand-blue" />
                        منظور المخطط الذكي
                    </h3>
                    <p className="text-slate-400 text-sm">{currentProperty?.name || 'اختر مشروعاً'}</p>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> مؤجر</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200"></span> شاغر</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> صيانة</div>
                </div>
            </div>

            <div className="p-8 bg-slate-50 relative min-h-[400px]">
                {/* Schematic Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {units.map((unit, idx) => (
                        <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            className={`relative aspect-square rounded-xl p-3 flex flex-col justify-between border-2 border-white shadow-lg cursor-pointer transition-all ${getStatusColor(unit.status)}`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black opacity-40">#{unit.unitNo}</span>
                                {unit.status === 'rented' ? <CheckCircle2 className="w-4 h-4 text-white/60" /> : <AlertCircle className="w-4 h-4 text-slate-400" />}
                            </div>

                            <div>
                                <p className="font-bold text-slate-800 text-sm leading-tight">
                                    {unit.type === 'apartment' ? 'شقة' : 'فيلا'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Users className="w-3 h-3 opacity-30" />
                                    <span className="text-[8px] font-bold opacity-30">VIP UNIT</span>
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-transparent group" />
                        </motion.div>
                    ))}
                </div>

                {/* Blueprint watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                    <div className="w-[200%] h-[200%] -rotate-12 flex flex-wrap gap-4">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <span key={i} className="text-9xl font-black">ARKAN BLUEPRINT</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-center gap-8">
                <button className="text-sm font-bold text-slate-500 hover:text-brand-purple flex items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">1</div>
                    الطابق الأرضي
                </button>
                <button className="text-sm font-bold text-brand-purple flex items-center gap-2 transition-colors border-b-2 border-brand-purple pb-1">
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center">2</div>
                    الطابق الأول
                </button>
            </div>
        </div>
    );
}
