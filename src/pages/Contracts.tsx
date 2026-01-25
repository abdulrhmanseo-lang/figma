import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, Edit, Trash2, CreditCard } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ContractModal } from '../components/ContractModal';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { formatSAR, formatDateShort, daysRemaining } from '../lib/format';
import type { ContractStatus } from '../types/database';

export function Contracts() {
  const { contracts, deleteContract, updateContract } = useData();
  const [searchParams] = useSearchParams();
  const tenantFilter = searchParams.get('tenant') || 'all';
  const unitFilter = searchParams.get('unit') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<string | null>(null);
  const [preselectedUnitId, setPreselectedUnitId] = useState<string | null>(unitFilter !== 'all' ? unitFilter : null);

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch =
        contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.unitNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      const matchesTenant = tenantFilter === 'all' || contract.tenantId === tenantFilter;
      const matchesUnit = unitFilter === 'all' || contract.unitId === unitFilter;
      return matchesSearch && matchesStatus && matchesTenant && matchesUnit;
    });
  }, [contracts, searchTerm, statusFilter, tenantFilter, unitFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      expiringSoon: contracts.filter(c => {
        const days = daysRemaining(c.endDate);
        return c.status === 'active' && days >= 0 && days <= 30;
      }).length,
      totalMonthlyRent: contracts
        .filter(c => c.status === 'active')
        .reduce((sum, c) => {
          let monthlyAmount = c.rentAmount;
          if (c.paymentFrequency === 'quarterly') monthlyAmount /= 3;
          if (c.paymentFrequency === 'semi_annual') monthlyAmount /= 6;
          if (c.paymentFrequency === 'monthly') monthlyAmount /= 12;
          return sum + monthlyAmount;
        }, 0)
    };
  }, [contracts]);

  const handleEndContract = async (id: string) => {
    if (window.confirm('هل أنت متأكد من إنهاء هذا العقد؟ سيتم تحويل حالته إلى منتهي.')) {
      try {
        await updateContract(id, { status: 'ended' });
        toast.success('تم إنهاء العقد بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء إنهاء العقد');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العقد نهائياً؟')) {
      try {
        await deleteContract(id);
        toast.success('تم حذف العقد بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف العقد');
      }
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm lg:text-base text-gray-600">
            إدارة عقود الإيجار ({contracts.length} عقد)
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingContract(null);
            setPreselectedUnitId(unitFilter !== 'all' ? unitFilter : null);
            setIsModalOpen(true);
          }}
          variant="gradient"
          className="w-full sm:w-auto text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
          إضافة عقد جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border border-gray-100">
          <div className="text-xl lg:text-2xl font-bold text-brand-dark">{stats.total}</div>
          <div className="text-xs lg:text-sm text-gray-500">إجمالي العقود</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border border-gray-100">
          <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs lg:text-sm text-gray-500">عقود نشطة</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border border-gray-100">
          <div className="text-xl lg:text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
          <div className="text-xs lg:text-sm text-gray-500">تنتهي قريباً</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border border-gray-100">
          <div className="text-sm lg:text-lg font-bold text-brand-dark">{formatSAR(stats.totalMonthlyRent)}</div>
          <div className="text-xs lg:text-sm text-gray-500">الدخل الشهري</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border border-gray-100">
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
            <input
              type="text"
              placeholder="البحث بالمستأجر أو العقار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 lg:pr-10 pl-3 lg:pl-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm lg:text-base"
            />
          </div>

          <div className="flex gap-1.5 lg:gap-2">
            {(['all', 'active', 'ended'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${statusFilter === status
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {status === 'all' ? 'الكل' :
                  status === 'active' ? 'نشط' : 'منتهي'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filteredContracts.map((contract, index) => {
          const days = daysRemaining(contract.endDate);
          return (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-sm">
                    {contract.tenantName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{contract.tenantName}</p>
                    <p className="text-xs text-gray-500">{contract.propertyName} - {contract.unitNo}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${contract.status === 'active' ? 'bg-green-100 text-green-700' :
                  contract.status === 'ended' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {contract.status === 'active' ? 'نشط' : contract.status === 'ended' ? 'منتهي' : 'معلق'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <p className="text-gray-500">مدة العقد</p>
                  <p className="font-medium">{formatDateShort(contract.startDate)}</p>
                  <p className="text-gray-400">إلى {formatDateShort(contract.endDate)}</p>
                  {contract.status === 'active' && (
                    <span className={`${days < 30 ? 'text-red-600' : days < 90 ? 'text-amber-600' : 'text-green-600'}`}>
                      {days > 0 ? `متبقي ${days} يوم` : 'منتهي'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-gray-500">الإيجار</p>
                  <p className="font-bold text-brand-dark">{formatSAR(contract.rentAmount)}</p>
                  <p className="text-gray-400">
                    {contract.paymentFrequency === 'monthly' ? 'شهري' :
                      contract.paymentFrequency === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Link to={`/app/payments?contract=${contract.id}`}>
                    <button className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg">
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setEditingContract(contract.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {contract.status === 'active' && (
                    <button
                      onClick={() => handleEndContract(contract.id)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(contract.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link to={`/app/payments?contract=${contract.id}`}>
                  <Button variant="outline" size="sm" className="text-xs px-2">
                    <CreditCard className="w-3 h-3 ml-1" />
                    الدفعات
                  </Button>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستأجر</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العقار / الوحدة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">مدة العقد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإيجار</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract, index) => {
                const days = daysRemaining(contract.endDate);

                return (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold">
                          {contract.tenantName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contract.tenantName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{contract.propertyName}</p>
                      <p className="text-sm text-gray-500">وحدة {contract.unitNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDateShort(contract.startDate)}</p>
                      <p className="text-sm text-gray-600">إلى {formatDateShort(contract.endDate)}</p>
                      {contract.status === 'active' && (
                        <span className={`text-xs ${days < 30 ? 'text-red-600' : days < 90 ? 'text-amber-600' : 'text-green-600'}`}>
                          {days > 0 ? `متبقي ${days} يوم` : 'منتهي'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-brand-dark">{formatSAR(contract.rentAmount)}</p>
                      <p className="text-xs text-gray-400">
                        {contract.paymentFrequency === 'monthly' ? 'شهري' :
                          contract.paymentFrequency === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${contract.status === 'active' ? 'bg-green-100 text-green-700' :
                        contract.status === 'ended' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {contract.status === 'active' ? 'نشط' : contract.status === 'ended' ? 'منتهي' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/app/payments?contract=${contract.id}`}>
                          <button className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg" title="الدفعات">
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setEditingContract(contract.id);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {contract.status === 'active' && (
                          <button
                            onClick={() => handleEndContract(contract.id)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="إنهاء العقد"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">لا توجد عقود</p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {filteredContracts.length === 0 && (
        <div className="lg:hidden text-center py-12 bg-white rounded-xl shadow border border-gray-100">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">لا توجد عقود</p>
        </div>
      )}

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContract(null);
          setPreselectedUnitId(null);
        }}
        contractId={editingContract}
        preselectedUnitId={preselectedUnitId}
      />
    </div>
  );
}
