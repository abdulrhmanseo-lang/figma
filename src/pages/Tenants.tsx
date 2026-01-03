import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Phone, Mail, User, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import type { Tenant } from '../types/database';

export function Tenants() {
    const { tenants, contracts, payments, addTenant, updateTenant, deleteTenant } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        nationalId: '',
    });

    const filteredTenants = tenants.filter(tenant =>
        tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phone.includes(searchTerm) ||
        (tenant.nationalId && tenant.nationalId.includes(searchTerm))
    );

    // Get tenant stats
    const getTenantStats = (tenantId: string) => {
        const tenantContracts = contracts.filter(c => c.tenantId === tenantId);
        const activeContracts = tenantContracts.filter(c => c.status === 'active');
        const tenantPayments = payments.filter(p =>
            tenantContracts.some(c => c.id === p.contractId)
        );
        const overduePayments = tenantPayments.filter(p => p.status === 'overdue');
        const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

        return {
            activeContracts: activeContracts.length,
            totalContracts: tenantContracts.length,
            overdueCount: overduePayments.length,
            overdueAmount,
        };
    };

    const handleOpenModal = (tenant?: Tenant) => {
        if (tenant) {
            setEditingTenant(tenant);
            setFormData({
                fullName: tenant.fullName,
                phone: tenant.phone,
                email: tenant.email || '',
                nationalId: tenant.nationalId || '',
            });
        } else {
            setEditingTenant(null);
            setFormData({ fullName: '', phone: '', email: '', nationalId: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone) {
            toast.error('الرجاء إدخال الاسم ورقم الهاتف');
            return;
        }

        if (editingTenant) {
            updateTenant(editingTenant.id, formData);
            toast.success('تم تحديث بيانات المستأجر');
        } else {
            addTenant(formData);
            toast.success('تم إضافة المستأجر بنجاح');
        }

        setIsModalOpen(false);
        setEditingTenant(null);
    };

    const handleDelete = (tenant: Tenant) => {
        const stats = getTenantStats(tenant.id);
        if (stats.activeContracts > 0) {
            toast.error(`لا يمكن حذف "${tenant.fullName}" لأنه لديه عقود نشطة`);
            return;
        }

        if (confirm(`هل أنت متأكد من حذف "${tenant.fullName}"؟`)) {
            deleteTenant(tenant.id);
            toast.success('تم حذف المستأجر بنجاح');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-gray-600">
                        إدارة بيانات المستأجرين ({tenants.length} مستأجر)
                    </p>
                </div>

                <Button onClick={() => handleOpenModal()} variant="gradient" className="mt-4 md:mt-0">
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة مستأجر جديد
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="البحث بالاسم أو رقم الهاتف أو الهوية..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                    />
                </div>
            </div>

            {/* Tenants Grid */}
            {filteredTenants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant, index) => {
                        const stats = getTenantStats(tenant.id);
                        return (
                            <motion.div
                                key={tenant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-lg">
                                            {tenant.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-dark">{tenant.fullName}</h3>
                                            {tenant.nationalId && (
                                                <p className="text-xs text-gray-400">الهوية: {tenant.nationalId}</p>
                                            )}
                                        </div>
                                    </div>

                                    {stats.overdueCount > 0 && (
                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                            {stats.overdueCount} متأخرة
                                        </span>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span dir="ltr">{tenant.phone}</span>
                                    </div>
                                    {tenant.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{tenant.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-100">
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-brand-dark">{stats.activeContracts}</div>
                                        <div className="text-xs text-gray-500">عقد نشط</div>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-brand-dark">{stats.totalContracts}</div>
                                        <div className="text-xs text-gray-500">إجمالي العقود</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(tenant)}
                                            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tenant)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <Link to={`/app/contracts?tenant=${tenant.id}`}>
                                        <Button variant="outline" size="sm">
                                            <FileText className="w-4 h-4 ml-1" />
                                            العقود
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد مستأجرين</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'ابدأ بإضافة مستأجرك الأول'}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => handleOpenModal()} variant="gradient">
                            <Plus className="w-5 h-5 ml-2" />
                            إضافة مستأجر جديد
                        </Button>
                    )}
                </div>
            )}

            {/* Add/Edit Tenant Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTenant ? 'تعديل بيانات المستأجر' : 'إضافة مستأجر جديد'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الاسم الكامل <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                                placeholder="مثال: محمد أحمد السعيد"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الهاتف <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                                placeholder="05XXXXXXXX"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                                placeholder="example@email.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الهوية الوطنية
                            </label>
                            <input
                                type="text"
                                value={formData.nationalId}
                                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                                placeholder="11XXXXXXXX"
                                dir="ltr"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="gradient" className="flex-1">
                                {editingTenant ? 'حفظ التعديلات' : 'إضافة المستأجر'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

    );
}
