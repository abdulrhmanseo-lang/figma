import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Plus,
    Search,
    Filter,
    TrendingUp,
    DollarSign,
    Home,
    FileText,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Building2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useData } from '../context/DataContext';

// Types
interface SaleRecord {
    id: string;
    propertyName: string;
    unitNo: string;
    buyerName: string;
    buyerPhone: string;
    salePrice: number;
    saleDate: string;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'installment' | 'bank';
    notes?: string;
}

// LocalStorage Key
const SALES_STORAGE_KEY = 'arkan_sales_data';

// Demo data
const demoSales: SaleRecord[] = [
    {
        id: 'sale-1',
        propertyName: 'برج الأمل السكني',
        unitNo: 'A-101',
        buyerName: 'محمد أحمد العلي',
        buyerPhone: '0501234567',
        salePrice: 850000,
        saleDate: '2024-12-15',
        status: 'completed',
        paymentMethod: 'cash',
    },
    {
        id: 'sale-2',
        propertyName: 'مجمع النخيل التجاري',
        unitNo: 'B-203',
        buyerName: 'فهد سعد الحربي',
        buyerPhone: '0559876543',
        salePrice: 1200000,
        saleDate: '2024-12-20',
        status: 'completed',
        paymentMethod: 'bank',
    },
    {
        id: 'sale-3',
        propertyName: 'فلل الياسمين',
        unitNo: 'V-05',
        buyerName: 'عبدالله خالد المطيري',
        buyerPhone: '0544567890',
        salePrice: 2500000,
        saleDate: '2025-01-02',
        status: 'pending',
        paymentMethod: 'installment',
    },
];

// Helper functions for localStorage
const loadSalesFromStorage = (): SaleRecord[] => {
    try {
        const stored = localStorage.getItem(SALES_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading sales from localStorage:', error);
    }
    // If no stored data, save and return demo data
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(demoSales));
    return demoSales;
};

const saveSalesToStorage = (sales: SaleRecord[]) => {
    try {
        localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
        console.error('Error saving sales to localStorage:', error);
    }
};

export function Sales() {
    const { properties, units } = useData();
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Load sales from localStorage on mount
    useEffect(() => {
        const loadedSales = loadSalesFromStorage();
        setSales(loadedSales);
    }, []);

    // Save sales to localStorage whenever they change
    useEffect(() => {
        if (sales.length > 0) {
            saveSalesToStorage(sales);
        }
    }, [sales]);

    // Form state
    const [formData, setFormData] = useState({
        propertyName: '',
        unitNo: '',
        buyerName: '',
        buyerPhone: '',
        buyerId: '',
        buyerEmail: '',
        salePrice: '',
        saleDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash' as 'cash' | 'bank' | 'installment',
        status: 'pending' as 'pending' | 'completed',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            propertyName: '',
            unitNo: '',
            buyerName: '',
            buyerPhone: '',
            buyerId: '',
            buyerEmail: '',
            salePrice: '',
            saleDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            status: 'pending',
            notes: ''
        });
    };

    const handleAddSale = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.propertyName || !formData.unitNo || !formData.buyerName || !formData.salePrice) {
            alert('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }

        const newSale: SaleRecord = {
            id: `sale-${Date.now()}`,
            propertyName: formData.propertyName,
            unitNo: formData.unitNo,
            buyerName: formData.buyerName,
            buyerPhone: formData.buyerPhone,
            salePrice: parseFloat(formData.salePrice),
            saleDate: formData.saleDate,
            status: formData.status,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes
        };

        setSales(prev => [newSale, ...prev]);
        resetForm();
        setShowAddModal(false);
        alert('تم إضافة عملية البيع بنجاح! ✓');
    };

    // View sale details
    const handleViewSale = (sale: SaleRecord) => {
        alert(`تفاصيل البيع:\n\nالعقار: ${sale.propertyName}\nالوحدة: ${sale.unitNo}\nالمشتري: ${sale.buyerName}\nالهاتف: ${sale.buyerPhone}\nالسعر: ${sale.salePrice.toLocaleString()} ر.س\nالتاريخ: ${sale.saleDate}\nالحالة: ${sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}\n${sale.notes ? 'ملاحظات: ' + sale.notes : ''}`);
    };

    // Edit sale
    const handleEditSale = (sale: SaleRecord) => {
        setFormData({
            propertyName: sale.propertyName,
            unitNo: sale.unitNo,
            buyerName: sale.buyerName,
            buyerPhone: sale.buyerPhone,
            buyerId: '',
            buyerEmail: '',
            salePrice: sale.salePrice.toString(),
            saleDate: sale.saleDate,
            paymentMethod: sale.paymentMethod,
            status: sale.status as 'pending' | 'completed',
            notes: sale.notes || ''
        });
        // Remove the old sale and open modal to edit
        setSales(prev => prev.filter(s => s.id !== sale.id));
        setShowAddModal(true);
    };

    // Delete sale
    const handleDeleteSale = (sale: SaleRecord) => {
        if (confirm(`هل أنت متأكد من حذف عملية البيع للمشتري "${sale.buyerName}"؟`)) {
            setSales(prev => prev.filter(s => s.id !== sale.id));
            alert('تم حذف عملية البيع بنجاح');
        }
    };

    // Stats
    const totalSales = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.salePrice, 0);
    const pendingSales = sales.filter(s => s.status === 'pending').length;
    const completedSales = sales.filter(s => s.status === 'completed').length;

    const filteredSales = sales.filter(sale =>
        sale.propertyName.includes(searchTerm) ||
        sale.buyerName.includes(searchTerm) ||
        sale.unitNo.includes(searchTerm)
    );

    const getStatusBadge = (status: SaleRecord['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        const labels = {
            pending: 'قيد الانتظار',
            completed: 'مكتملة',
            cancelled: 'ملغية',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getPaymentBadge = (method: SaleRecord['paymentMethod']) => {
        const labels = {
            cash: 'نقداً',
            installment: 'أقساط',
            bank: 'تحويل بنكي',
        };
        return (
            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                {labels[method]}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark mb-1">المبيعات</h1>
                    <p className="text-gray-500">إدارة عمليات البيع والفواتير</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة عملية بيع
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
                            <p className="text-2xl font-bold text-brand-dark">
                                {totalSales.toLocaleString()} <span className="text-sm text-gray-400">ر.س</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">عمليات مكتملة</p>
                            <p className="text-2xl font-bold text-brand-dark">{completedSales}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">قيد الانتظار</p>
                            <p className="text-2xl font-bold text-brand-dark">{pendingSales}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">العقارات المتاحة</p>
                            <p className="text-2xl font-bold text-brand-dark">{properties.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث عن عملية بيع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        فلترة
                    </Button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">العقار</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">الوحدة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">المشتري</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">السعر</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">طريقة الدفع</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">التاريخ</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">الحالة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
                                                    <Home className="w-5 h-5 text-brand-blue" />
                                                </div>
                                                <span className="font-medium text-gray-800">{sale.propertyName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{sale.unitNo}</td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-gray-800">{sale.buyerName}</p>
                                                <p className="text-sm text-gray-500">{sale.buyerPhone}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-brand-dark">
                                            {sale.salePrice.toLocaleString()} ر.س
                                        </td>
                                        <td className="py-4 px-6">{getPaymentBadge(sale.paymentMethod)}</td>
                                        <td className="py-4 px-6 text-gray-600">{sale.saleDate}</td>
                                        <td className="py-4 px-6">{getStatusBadge(sale.status)}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewSale(sale)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSale(sale)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSale(sale)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500">لا توجد عمليات بيع</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        عرض {filteredSales.length} من {sales.length} عمليات
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                        <span className="px-3 py-1 bg-brand-blue text-white rounded-lg text-sm">1</span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Sale Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-brand-dark">إضافة عملية بيع جديدة</h2>
                            <button
                                onClick={() => { setShowAddModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddSale} className="space-y-6">
                            {/* Property Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">العقار *</label>
                                    <select
                                        value={formData.propertyName}
                                        onChange={(e) => setFormData({ ...formData, propertyName: e.target.selectedOptions[0]?.text || '' })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        required
                                    >
                                        <option value="">اختر العقار</option>
                                        {properties.map(prop => (
                                            <option key={prop.id} value={prop.name}>{prop.name}</option>
                                        ))}
                                        <option value="برج الأمل السكني">برج الأمل السكني</option>
                                        <option value="مجمع النخيل التجاري">مجمع النخيل التجاري</option>
                                        <option value="فلل الياسمين">فلل الياسمين</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">الوحدة *</label>
                                    <select
                                        value={formData.unitNo}
                                        onChange={(e) => setFormData({ ...formData, unitNo: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        required
                                    >
                                        <option value="">اختر الوحدة</option>
                                        {units.filter(u => u.status === 'vacant').map(unit => (
                                            <option key={unit.id} value={unit.unitNo}>{unit.unitNo}</option>
                                        ))}
                                        <option value="A-102">A-102</option>
                                        <option value="B-205">B-205</option>
                                        <option value="V-08">V-08</option>
                                    </select>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات المشتري</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">اسم المشتري *</label>
                                        <input
                                            type="text"
                                            placeholder="الاسم الكامل"
                                            value={formData.buyerName}
                                            onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                                        <input
                                            type="tel"
                                            placeholder="05XXXXXXXX"
                                            value={formData.buyerPhone}
                                            onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">رقم الهوية</label>
                                        <input
                                            type="text"
                                            placeholder="رقم الهوية الوطنية"
                                            value={formData.buyerId}
                                            onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={formData.buyerEmail}
                                            onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sale Details */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل البيع</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">سعر البيع *</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.salePrice}
                                                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                                className="w-full px-4 py-3 pl-16 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                                required
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ر.س</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">تاريخ البيع</label>
                                        <input
                                            type="date"
                                            value={formData.saleDate}
                                            onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">طريقة الدفع</label>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'bank' | 'installment' })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        >
                                            <option value="cash">نقداً</option>
                                            <option value="bank">تحويل بنكي</option>
                                            <option value="installment">أقساط</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">الحالة</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                        >
                                            <option value="pending">قيد الانتظار</option>
                                            <option value="completed">مكتملة</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <label className="text-sm font-medium text-gray-700">ملاحظات</label>
                                    <textarea
                                        rows={3}
                                        placeholder="أي ملاحظات إضافية..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                >
                                    حفظ عملية البيع
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
