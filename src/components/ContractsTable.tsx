import { FileText, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

export function ContractsTable() {
    const contracts = [
        {
            id: "CNT-2024-001",
            tenant: "شركة التقنية المتقدمة",
            unit: "برج العليا - مكتب 402",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            amount: "45,000 ر.س",
            status: "active",
            statusLabel: "ساري",
        },
        {
            id: "CNT-2024-002",
            tenant: "مؤسسة الأفق الجديد",
            unit: "مجمع النخيل - فيلا 12",
            startDate: "2024-02-15",
            endDate: "2025-02-14",
            amount: "85,000 ر.س",
            status: "active",
            statusLabel: "ساري",
        },
        {
            id: "CNT-2023-089",
            tenant: "عبدالله محمد السالم",
            unit: "شقة سكنية - حي الملقا",
            startDate: "2023-06-01",
            endDate: "2024-05-30",
            amount: "35,000 ر.س",
            status: "expiring",
            statusLabel: "ينتهي قريباً",
        },
        {
            id: "CNT-2023-075",
            tenant: "مطاعم الذواقة",
            unit: "معرض تجاري - طريق الملك فهد",
            startDate: "2023-03-01",
            endDate: "2024-02-28",
            amount: "120,000 ر.س",
            status: "expired",
            statusLabel: "منتهي",
        },
        {
            id: "CNT-2024-005",
            tenant: "خالد بن عبدالعزيز",
            unit: "شقة دورين - حي النرجس",
            startDate: "2024-03-10",
            endDate: "2025-03-09",
            amount: "55,000 ر.س",
            status: "pending",
            statusLabel: "في الانتظار",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'expiring': return 'bg-amber-100 text-amber-700';
            case 'expired': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-blue" />
                        أحدث العقود
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">آخر العقود المسجلة في النظام</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    عرض الكل
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-right pb-4 text-sm font-medium text-gray-400">رقم العقد</th>
                            <th className="text-right pb-4 text-sm font-medium text-gray-400">المستأجر</th>
                            <th className="text-right pb-4 text-sm font-medium text-gray-400">الوحدة</th>
                            <th className="text-right pb-4 text-sm font-medium text-gray-400">تاريخ الانتهاء</th>
                            <th className="text-right pb-4 text-sm font-medium text-gray-400">القيمة</th>
                            <th className="text-center pb-4 text-sm font-medium text-gray-400">الحالة</th>
                            <th className="pb-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {contracts.map((contract) => (
                            <tr key={contract.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-mono text-sm text-brand-blue font-medium">{contract.id}</td>
                                <td className="py-4 text-sm text-gray-700 font-medium">{contract.tenant}</td>
                                <td className="py-4 text-sm text-gray-500">{contract.unit}</td>
                                <td className="py-4 text-sm text-gray-500">
                                    {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                                </td>
                                <td className="py-4 text-sm font-bold text-gray-700">{contract.amount}</td>
                                <td className="py-4 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                                        {contract.statusLabel}
                                    </span>
                                </td>
                                <td className="py-4 text-left">
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
