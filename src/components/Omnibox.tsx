import { useState, useEffect } from 'react';
import { Search, X, Users, Home, FileText, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export function Omnibox() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const { tenants, units, properties, contracts } = useData();
    const navigate = useNavigate();

    // Handle shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Search logic
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const searchResults = [
            ...tenants.filter(t => t.fullName.includes(query)).map(t => ({ ...t, type: 'tenant', icon: Users, label: t.fullName, category: 'المستأجرين' })),
            ...units.filter(u => u.unitNo.includes(query)).map(u => ({ ...u, type: 'unit', icon: Home, label: `وحدة ${u.unitNo}`, category: 'الوحدات العقارية' })),
            ...properties.filter(p => p.name.includes(query)).map(p => ({ ...p, type: 'property', icon: Home, label: p.name, category: 'العقارات' })),
            ...contracts.filter(c => c.tenantName.includes(query)).map(c => ({ ...c, type: 'contract', icon: FileText, label: `عقد: ${c.tenantName}`, category: 'العقود' })),
        ];

        setResults(searchResults.slice(0, 8));
    }, [query, tenants, units, properties, contracts]);

    const handleSelect = (result: any) => {
        setIsOpen(false);
        setQuery('');
        if (result.type === 'tenant') navigate(`/app/tenants?id=${result.id}`);
        if (result.type === 'unit') navigate(`/app/units?id=${result.id}`);
        if (result.type === 'property') navigate(`/app/properties?id=${result.id}`);
        if (result.type === 'contract') navigate(`/app/contracts?id=${result.id}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                    >
                        {/* Input Header */}
                        <div className="flex items-center p-4 border-b border-slate-100">
                            <Search className="w-5 h-5 text-slate-400 ml-3" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="ابحث عن مستأجر، وحدة، أو عقد... (أو اسأل الذكاء الاصطناعي)"
                                className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder:text-slate-400"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                dir="rtl"
                            />
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                    <Command className="w-3 h-3" /> K
                                </span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Results Body */}
                        <div className="max-h-[60vh] overflow-y-auto p-2" dir="rtl">
                            {query && results.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Sparkles className="w-10 h-10 text-brand-purple/20 mx-auto mb-3" />
                                    <p className="text-slate-500">لم نجد نتائج مطابقة، هل تريد سؤال الذكاء الاصطناعي؟</p>
                                    <button className="mt-4 px-4 py-2 bg-brand-purple text-white rounded-lg text-sm hover:shadow-lg transition-all">
                                        تفعيل البحث الذكي
                                    </button>
                                </div>
                            ) : query ? (
                                <div className="space-y-4">
                                    {results.map((result, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(result)}
                                            className="w-full text-right p-3 rounded-xl hover:bg-slate-50 flex items-center gap-4 group transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-200 shrink-0">
                                                <result.icon className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 truncate">{result.label}</p>
                                                <p className="text-xs text-slate-500">{result.category}</p>
                                            </div>
                                            <div className="text-xs text-slate-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                                انقر للانتقال
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">اقتراحات البحث</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['المستأجرين المتأخرين', 'الوحدات الشاغرة', 'عقود تنتهي قريباً', 'تقرير الصيانة'].map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setQuery(s)}
                                                className="p-3 rounded-lg border border-slate-100 text-right text-sm text-slate-600 hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400" dir="rtl">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1"><Command className="w-3 h-3" /> + K للتمرير</span>
                                <span className="flex items-center gap-1"><span className="px-1 border border-slate-200 rounded">ESC</span> للإغلاق</span>
                            </div>
                            <p>نظام أركان الذكي v1.0</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
