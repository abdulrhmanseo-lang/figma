import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Calendar, Building2, TrendingUp, AlertTriangle, Wrench } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatSAR, formatDateShort, formatNumber } from '../lib/format';
import { toast } from 'sonner';

export function Reports() {
    const { properties, units, contracts, payments, maintenanceRequests } = useData();
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedProperty, setSelectedProperty] = useState('all');

    // Overdue Payments Report
    const overdueReport = useMemo(() => {
        return payments
            .filter(p => p.status === 'overdue')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [payments]);

    // Occupancy Report
    const occupancyReport = useMemo(() => {
        return properties.map(prop => {
            const propUnits = units.filter(u => u.propertyId === prop.id);
            const total = propUnits.length;
            const rented = propUnits.filter(u => u.status === 'rented').length;
            const vacant = propUnits.filter(u => u.status === 'vacant').length;
            const maintenance = propUnits.filter(u => u.status === 'maintenance').length;
            const occupancy = total > 0 ? Math.round((rented / total) * 100) : 0;
            const monthlyIncome = contracts
                .filter(c => c.propertyId === prop.id && c.status === 'active')
                .reduce((sum, c) => {
                    if (c.paymentFrequency === 'monthly') return sum + c.rentAmount;
                    if (c.paymentFrequency === 'quarterly') return sum + c.rentAmount / 3;
                    if (c.paymentFrequency === 'yearly') return sum + c.rentAmount / 12;
                    return sum;
                }, 0);

            return {
                ...prop,
                total,
                rented,
                vacant,
                maintenance,
                occupancy,
                monthlyIncome,
            };
        });
    }, [properties, units, contracts]);

    // Income Report
    const incomeReport = useMemo(() => {
        const paidPayments = payments.filter(p => p.status === 'paid' && p.paidAt);
        const monthlyData: Record<string, number> = {};

        paidPayments.forEach(p => {
            const date = new Date(p.paidAt!);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = (monthlyData[key] || 0) + p.amount;
        });

        return Object.entries(monthlyData)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 12)
            .map(([month, amount]) => ({ month, amount }));
    }, [payments]);

    // Maintenance Report
    const maintenanceReport = useMemo(() => {
        const byProperty: Record<string, { count: number; cost: number; name: string }> = {};

        maintenanceRequests.forEach(m => {
            if (!byProperty[m.propertyId]) {
                byProperty[m.propertyId] = { count: 0, cost: 0, name: m.propertyName };
            }
            byProperty[m.propertyId].count++;
            byProperty[m.propertyId].cost += m.cost;
        });

        return Object.entries(byProperty)
            .map(([id, data]) => ({ propertyId: id, ...data }))
            .sort((a, b) => b.cost - a.cost);
    }, [maintenanceRequests]);

    // Export to CSV
    const exportToCSV = (data: any[], filename: string, headers: string[]) => {
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => row[h] || '').join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('تم تصدير التقرير بنجاح');
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/app" className="hover:text-brand-blue">لوحة التحكم</Link>
                <span>/</span>
                <span className="text-brand-dark font-medium">التقارير</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A2A43' }}>
                    التقارير
                </h1>
                <p className="text-gray-600">
                    تقارير مفصلة عن أداء العقارات والدفعات والصيانة
                </p>
            </div>

            {/* Reports Tabs */}
            <Tabs defaultValue="overdue" className="space-y-6">
                <TabsList className="bg-white shadow rounded-xl p-1 w-full flex">
                    <TabsTrigger value="overdue" className="flex-1 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        المتأخرات
                    </TabsTrigger>
                    <TabsTrigger value="occupancy" className="flex-1 flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" />
                        الإشغال
                    </TabsTrigger>
                    <TabsTrigger value="income" className="flex-1 flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        الدخل
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="flex-1 flex items-center justify-center gap-2">
                        <Wrench className="w-4 h-4" />
                        الصيانة
                    </TabsTrigger>
                </TabsList>

                {/* Overdue Payments Report */}
                <TabsContent value="overdue">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-brand-dark">تقرير المتأخرات</h2>
                                <p className="text-sm text-gray-500">
                                    {overdueReport.length} دفعة متأخرة بإجمالي {formatSAR(overdueReport.reduce((s, p) => s + p.amount, 0))}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => exportToCSV(
                                    overdueReport.map(p => ({
                                        tenantName: p.tenantName,
                                        unitNo: p.unitNo,
                                        amount: p.amount,
                                        dueDate: p.dueDate,
                                    })),
                                    'overdue_payments',
                                    ['tenantName', 'unitNo', 'amount', 'dueDate']
                                )}
                            >
                                <Download className="w-4 h-4 ml-2" />
                                تصدير CSV
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المستأجر</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الوحدة</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">تاريخ الاستحقاق</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">أيام التأخير</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {overdueReport.map(payment => {
                                        const daysLate = Math.abs(Math.floor((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                                        return (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{payment.tenantName}</td>
                                                <td className="px-4 py-3 text-gray-600">{payment.unitNo}</td>
                                                <td className="px-4 py-3 font-bold text-red-600">{formatSAR(payment.amount)}</td>
                                                <td className="px-4 py-3 text-gray-600">{formatDateShort(payment.dueDate)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                        {daysLate} يوم
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {overdueReport.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>لا توجد دفعات متأخرة 🎉</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Occupancy Report */}
                <TabsContent value="occupancy">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-brand-dark">تقرير الإشغال</h2>
                                <p className="text-sm text-gray-500">نسبة إشغال كل عقار</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => exportToCSV(
                                    occupancyReport.map(p => ({
                                        name: p.name,
                                        city: p.city,
                                        total: p.total,
                                        rented: p.rented,
                                        vacant: p.vacant,
                                        occupancy: p.occupancy,
                                        monthlyIncome: p.monthlyIncome,
                                    })),
                                    'occupancy_report',
                                    ['name', 'city', 'total', 'rented', 'vacant', 'occupancy', 'monthlyIncome']
                                )}
                            >
                                <Download className="w-4 h-4 ml-2" />
                                تصدير CSV
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {occupancyReport.map(prop => (
                                <div key={prop.id} className="border border-gray-100 rounded-xl p-4">
                                    <h3 className="font-bold text-brand-dark mb-1">{prop.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{prop.city}</p>

                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>نسبة الإشغال</span>
                                            <span className="font-bold">{prop.occupancy}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                                style={{ width: `${prop.occupancy}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-green-50 rounded p-2">
                                            <div className="font-bold text-green-600">{prop.rented}</div>
                                            <div className="text-gray-500">مؤجرة</div>
                                        </div>
                                        <div className="bg-amber-50 rounded p-2">
                                            <div className="font-bold text-amber-600">{prop.vacant}</div>
                                            <div className="text-gray-500">شاغرة</div>
                                        </div>
                                        <div className="bg-gray-50 rounded p-2">
                                            <div className="font-bold text-gray-600">{prop.maintenance}</div>
                                            <div className="text-gray-500">صيانة</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">الدخل الشهري:</span>
                                            <span className="font-bold text-brand-dark">{formatSAR(prop.monthlyIncome)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Income Report */}
                <TabsContent value="income">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-brand-dark">تقرير الدخل الشهري</h2>
                                <p className="text-sm text-gray-500">ملخص الدفعات المحصلة شهرياً</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => exportToCSV(
                                    incomeReport,
                                    'income_report',
                                    ['month', 'amount']
                                )}
                            >
                                <Download className="w-4 h-4 ml-2" />
                                تصدير CSV
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الشهر</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">إجمالي المحصل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {incomeReport.map(row => (
                                        <tr key={row.month} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{row.month}</td>
                                            <td className="px-4 py-3 font-bold text-green-600">{formatSAR(row.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td className="px-4 py-3 font-bold">الإجمالي</td>
                                        <td className="px-4 py-3 font-bold text-brand-dark">
                                            {formatSAR(incomeReport.reduce((s, r) => s + r.amount, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Maintenance Report */}
                <TabsContent value="maintenance">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-brand-dark">تقرير الصيانة</h2>
                                <p className="text-sm text-gray-500">تكاليف الصيانة حسب العقار</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => exportToCSV(
                                    maintenanceReport,
                                    'maintenance_report',
                                    ['name', 'count', 'cost']
                                )}
                            >
                                <Download className="w-4 h-4 ml-2" />
                                تصدير CSV
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">العقار</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">عدد الطلبات</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">إجمالي التكلفة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {maintenanceReport.map(row => (
                                        <tr key={row.propertyId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{row.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{row.count}</td>
                                            <td className="px-4 py-3 font-bold text-brand-dark">{formatSAR(row.cost)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td className="px-4 py-3 font-bold">الإجمالي</td>
                                        <td className="px-4 py-3 font-bold">{maintenanceReport.reduce((s, r) => s + r.count, 0)}</td>
                                        <td className="px-4 py-3 font-bold text-brand-dark">
                                            {formatSAR(maintenanceReport.reduce((s, r) => s + r.cost, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

    );
}
