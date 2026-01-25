import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import type { PaymentFrequency, ContractStatus } from '../types/database';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
  preselectedUnitId: string | null;
}

export function ContractModal({ isOpen, onClose, contractId, preselectedUnitId }: ContractModalProps) {
  const { contracts, units, tenants, addContract, updateContract } = useData();
  const [formData, setFormData] = useState({
    tenantId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    rentAmount: 0,
    paymentFrequency: 'monthly' as PaymentFrequency,
    status: 'active' as ContractStatus,
    depositAmount: 0,
    notes: '',
  });

  // Available units (vacant only for new contracts)
  const availableUnits = contractId
    ? units
    : units.filter(u => u.status === 'vacant');

  useEffect(() => {
    if (contractId) {
      const contract = contracts.find(c => c.id === contractId);
      if (contract) {
        setFormData({
          tenantId: contract.tenantId,
          unitId: contract.unitId,
          startDate: contract.startDate,
          endDate: contract.endDate,
          rentAmount: contract.rentAmount,
          paymentFrequency: contract.paymentFrequency,
          status: contract.status,
          depositAmount: contract.depositAmount,
          notes: contract.notes || '',
        });
      }
    } else {
      // Reset form for new contract
      const unit = preselectedUnitId ? units.find(u => u.id === preselectedUnitId) : null;
      setFormData({
        tenantId: '',
        unitId: preselectedUnitId || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rentAmount: unit?.rentAmount || 0,
        paymentFrequency: 'monthly',
        status: 'active',
        depositAmount: 0,
        notes: '',
      });
    }
  }, [contractId, preselectedUnitId, contracts, units, isOpen]);

  const handleUnitChange = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setFormData({
        ...formData,
        unitId,
        rentAmount: unit.rentAmount,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenantId || !formData.unitId) {
      toast.error('الرجاء اختيار المستأجر والوحدة');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('الرجاء تحديد تواريخ العقد');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    const unit = units.find(u => u.id === formData.unitId);
    const tenant = tenants.find(t => t.id === formData.tenantId);

    if (contractId) {
      updateContract(contractId, formData as any);
      toast.success('تم تحديث العقد بنجاح');
    } else {
      if (!unit || !tenant) return;

      const fullContractData = {
        ...formData,
        propertyId: unit.propertyId,
        propertyName: unit.propertyName,
        unitNo: unit.unitNo,
        tenantName: tenant.fullName,
      };

      addContract(fullContractData);
      toast.success('تم إنشاء العقد وجدول الدفعات');
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contractId ? 'تعديل العقد' : 'إنشاء عقد جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Tenant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستأجر <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
            >
              <option value="">اختر المستأجر</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.fullName} - {tenant.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوحدة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.unitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              disabled={!!contractId}
            >
              <option value="">اختر الوحدة</option>
              {availableUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.propertyName} - {unit.unitNo} ({unit.rentAmount.toLocaleString()} ر.س)
                </option>
              ))}
            </select>
            {!contractId && availableUnits.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">لا توجد وحدات شاغرة. أضف وحدات جديدة أولاً.</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ البداية <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ النهاية <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Rent and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                قيمة الإيجار (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                دورية الدفع <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentFrequency}
                onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value as PaymentFrequency })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                <option value="monthly">شهري</option>
                <option value="quarterly">ربع سنوي</option>
                <option value="yearly">سنوي</option>
              </select>
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              مبلغ التأمين (ر.س)
            </label>
            <input
              type="number"
              min="0"
              value={formData.depositAmount}
              onChange={(e) => setFormData({ ...formData, depositAmount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              placeholder="اختياري"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* Info Box */}
          {!contractId && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              💡 سيتم إنشاء جدول دفعات تلقائياً بناءً على دورية الدفع المختارة
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="gradient" className="flex-1">
              {contractId ? 'حفظ التعديلات' : 'إنشاء العقد'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
