import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { contracts } = useData();
  const [formData, setFormData] = useState({
    contractId: '',
    tenantName: '',
    amount: 0,
    tax: 0,
  });

  const handleContractChange = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      const tax = contract.rentAmount * 0.15; // 15% VAT
      setFormData({
        contractId,
        tenantName: contract.tenantName,
        amount: contract.rentAmount,
        tax,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement invoice creation when invoice feature is added
    onClose();
    alert('تم إنشاء الفاتورة بنجاح');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
            تسجيل دفعة جديدة
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العقد
            </label>
            <select
              required
              onChange={(e) => handleContractChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">اختر العقد</option>
              {contracts.filter(c => c.status === 'active').map(contract => (
                <option key={contract.id} value={contract.id}>
                  {contract.tenantName} - {contract.unitNo}
                </option>
              ))}
            </select>
          </div>

          {formData.tenantName && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستأجر
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.tenantName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    disabled
                    value={formData.amount}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الضريبة (15%)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={formData.tax}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الإجمالي</p>
                <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
                  {(formData.amount + formData.tax).toLocaleString()} ر.س
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!formData.contractId}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إنشاء الفاتورة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
