import { useState, useMemo } from 'react';
import { Search, CheckCircle, Clock, AlertTriangle, CreditCard, Receipt } from 'lucide-react';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatSAR, formatDateShort, daysRemaining } from '../lib/format';
import type { Payment, PaymentStatus } from '../types/database';

export function Payments() {
    const { payments, recordPayment } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'online'>('bank');
    const [paymentReference, setPaymentReference] = useState('');

    // Filter and sort payments
    const filteredPayments = useMemo(() => {
        return payments
            .filter(payment => {
                const matchesSearch =
                    payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.unitNo.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                // Sort by status priority, then by due date
                const statusOrder = { overdue: 0, due: 1, paid: 2 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
    }, [payments, searchTerm, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const paid = payments.filter(p => p.status === 'paid');
        const due = payments.filter(p => p.status === 'due');
        const overdue = payments.filter(p => p.status === 'overdue');

        return {
            paidCount: paid.length,
            paidAmount: paid.reduce((s, p) => s + p.amount, 0),
            dueCount: due.length,
            dueAmount: due.reduce((s, p) => s + p.amount, 0),
            overdueCount: overdue.length,
            overdueAmount: overdue.reduce((s, p) => s + p.amount, 0),
        };
    }, [payments]);

    const handleRecordPayment = () => {
        if (!selectedPayment) return;

        recordPayment(selectedPayment.id, paymentMethod, paymentReference || undefined);
        toast.success('تم تسجيل الدفعة بنجاح');
        setIsPaymentModalOpen(false);
        setSelectedPayment(null);
        setPaymentReference('');
    };

    const openPaymentModal = (payment: Payment) => {
        setSelectedPayment(payment);
        setPaymentMethod('bank');
        setPaymentReference('');
        setIsPaymentModalOpen(true);
    };

    const getStatusBadge = (status: PaymentStatus) => {
        const badges = {
            paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'مدفوعة', icon: CheckCircle },
            due: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'مستحقة', icon: Clock },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'متأخرة', icon: AlertTriangle },
        };
        const badge = badges[status];
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <badge.icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm lg:text-base text-gray-600">متابعة وتسجيل دفعات الإيجار</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
                <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs lg:text-sm text-gray-500">مدفوعة</p>
                            <p className="text-sm lg:text-lg font-bold text-brand-dark">{formatSAR(stats.paidAmount)}</p>
                            <p className="text-[10px] lg:text-xs text-gray-400">{stats.paidCount} دفعة</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs lg:text-sm text-gray-500">مستحقة</p>
                            <p className="text-sm lg:text-lg font-bold text-brand-dark">{formatSAR(stats.dueAmount)}</p>
                            <p className="text-[10px] lg:text-xs text-gray-400">{stats.dueCount} دفعة</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-3 lg:p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs lg:text-sm text-gray-500">متأخرة</p>
                            <p className="text-sm lg:text-lg font-bold text-red-600">{formatSAR(stats.overdueAmount)}</p>
                            <p className="text-[10px] lg:text-xs text-gray-400">{stats.overdueCount} دفعة</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-3 lg:p-4">
                <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                        <input
                            type="text"
                            placeholder="البحث بالمستأجر أو الوحدة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-9 lg:pr-10 pl-3 lg:pl-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm lg:text-base"
                        />
                    </div>

                    <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-1">
                        {(['all', 'overdue', 'due', 'paid'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`flex-1 min-w-fit py-2 px-2 lg:px-3 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${statusFilter === status
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'الكل' :
                                    status === 'overdue' ? 'متأخرة' :
                                        status === 'due' ? 'مستحقة' : 'مدفوعة'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-3">
                {filteredPayments.slice(0, 50).map((payment, index) => (
                    <motion.div
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-white rounded-xl shadow p-4"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{payment.tenantName}</p>
                                <p className="text-xs text-gray-500">{payment.unitNo}</p>
                            </div>
                            {getStatusBadge(payment.status)}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-500">المبلغ</p>
                                <p className="font-bold text-brand-dark">{formatSAR(payment.amount)}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-500">تاريخ الاستحقاق</p>
                                <p className="text-sm text-gray-600">{formatDateShort(payment.dueDate)}</p>
                                {payment.status !== 'paid' && (
                                    <span className={`text-[10px] ${payment.status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>
                                        {daysRemaining(payment.dueDate) < 0
                                            ? `متأخرة ${Math.abs(daysRemaining(payment.dueDate))} يوم`
                                            : `بعد ${daysRemaining(payment.dueDate)} يوم`}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            {payment.status !== 'paid' ? (
                                <Button
                                    size="sm"
                                    variant="gradient"
                                    onClick={() => openPaymentModal(payment)}
                                    className="w-full text-sm"
                                >
                                    <CreditCard className="w-4 h-4 ml-1" />
                                    تسجيل دفعة
                                </Button>
                            ) : (
                                <span className="block text-center text-sm text-gray-400">
                                    {payment.method === 'cash' ? 'نقداً' :
                                        payment.method === 'bank' ? 'تحويل بنكي' : 'دفع إلكتروني'}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستأجر</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوحدة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ الاستحقاق</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPayments.slice(0, 50).map((payment, index) => (
                                <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{payment.tenantName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{payment.unitNo}</td>
                                    <td className="px-6 py-4 font-bold text-brand-dark">{formatSAR(payment.amount)}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className="text-gray-600">{formatDateShort(payment.dueDate)}</span>
                                            {payment.status !== 'paid' && (
                                                <span className={`block text-xs ${payment.status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>
                                                    {daysRemaining(payment.dueDate) < 0
                                                        ? `متأخرة ${Math.abs(daysRemaining(payment.dueDate))} يوم`
                                                        : `بعد ${daysRemaining(payment.dueDate)} يوم`}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                                    <td className="px-6 py-4">
                                        {payment.status !== 'paid' ? (
                                            <Button
                                                size="sm"
                                                variant="gradient"
                                                onClick={() => openPaymentModal(payment)}
                                            >
                                                <CreditCard className="w-4 h-4 ml-1" />
                                                تسجيل دفعة
                                            </Button>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                {payment.method === 'cash' ? 'نقداً' :
                                                    payment.method === 'bank' ? 'تحويل بنكي' : 'دفع إلكتروني'}
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>لا توجد دفعات تطابق البحث</p>
                    </div>
                )}
            </div>

            {/* Mobile Empty State */}
            {filteredPayments.length === 0 && (
                <div className="lg:hidden text-center py-12 bg-white rounded-xl shadow text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد دفعات تطابق البحث</p>
                </div>
            )}

            {/* Record Payment Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base lg:text-lg">تسجيل دفعة</DialogTitle>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-3 lg:space-y-4 mt-4">
                            <div className="bg-gray-50 rounded-xl p-3 lg:p-4">
                                <div className="grid grid-cols-2 gap-3 lg:gap-4 text-xs lg:text-sm">
                                    <div>
                                        <span className="text-gray-500">المستأجر:</span>
                                        <p className="font-medium">{selectedPayment.tenantName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الوحدة:</span>
                                        <p className="font-medium">{selectedPayment.unitNo}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">المبلغ:</span>
                                        <p className="font-bold text-brand-dark">{formatSAR(selectedPayment.amount)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">تاريخ الاستحقاق:</span>
                                        <p className="font-medium">{formatDateShort(selectedPayment.dueDate)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                                    طريقة الدفع
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                                    {[
                                        { value: 'bank', label: 'تحويل بنكي' },
                                        { value: 'cash', label: 'نقداً' },
                                        { value: 'online', label: 'دفع إلكتروني' },
                                    ].map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.value as any)}
                                            className={`py-2 px-2 lg:px-3 rounded-lg text-xs lg:text-sm font-medium transition-all ${paymentMethod === method.value
                                                ? 'bg-brand-blue text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                                    رقم المرجع (اختياري)
                                </label>
                                <input
                                    type="text"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm lg:text-base"
                                    placeholder="رقم الحوالة أو الإيصال"
                                    dir="ltr"
                                />
                            </div>

                            <div className="flex gap-2 lg:gap-3 pt-4">
                                <Button onClick={handleRecordPayment} variant="gradient" className="flex-1 text-sm lg:text-base">
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    تأكيد الدفعة
                                </Button>
                                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="text-sm lg:text-base">
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
