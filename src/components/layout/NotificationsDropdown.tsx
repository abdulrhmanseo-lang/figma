import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'alert';
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'تم إنشاء الاشتراك بنجاح',
        message: 'تم تفعيل باقتك التجريبية لمدة 40 دقيقة',
        time: 'منذ دقيقة',
        read: false,
        type: 'success'
    },
    {
        id: '2',
        title: 'تذكير بالمهام',
        message: 'لديك 3 مهام جديدة تتطلب المراجعة اليوم',
        time: 'منذ 15 دقيقة',
        read: false,
        type: 'info'
    },
    {
        id: '3',
        title: 'تحديث النظام',
        message: 'تم تحديث لوحة التحكم وإضافة ميزات جديدة',
        time: 'منذ ساعة',
        read: true,
        type: 'info'
    }
];

export function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check className="w-4 h-4 text-green-500" />;
            case 'warning': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return <ShieldCheck className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'text-brand-blue' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-left"
                    >
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-800">الإشعارات</h3>
                                <p className="text-xs text-gray-500 mt-0.5">لديك {unreadCount} إشعارات غير مقروءة</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-brand-blue hover:text-brand-purple transition-colors"
                                >
                                    تحديد الكل كمقروء
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">لا توجد إشعارات حالياً</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!notification.read ? 'bg-blue-50/30' : ''
                                                }`}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                                ${!notification.read ? 'bg-white shadow-sm' : 'bg-gray-100'}
                                            `}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 rounded-full bg-brand-blue mt-2 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                            <button className="text-xs font-medium text-gray-600 hover:text-brand-blue py-1 px-3 rounded-lg hover:bg-white transition-all">
                                عرض كل الإشعارات
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
