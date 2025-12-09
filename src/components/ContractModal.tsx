import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
  preselectedUnitId: string | null;
}

export function ContractModal({ isOpen, onClose, contractId, preselectedUnitId }: ContractModalProps) {
  const { contracts, units, properties, addContract, updateContract } = useData();
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantPhone: '',
    propertyId: '',
    propertyName: '',
    unitId: '',
    unitNumber: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    status: 'active' as 'active' | 'pending' | 'expired',
    pdfUrl: '',
  });

  useEffect(() => {
    if (contractId) {
      const contract = contracts.find(c => c.id === contractId);
      if (contract) {
        setFormData(contract);
      }
    } else if (preselectedUnitId) {
      const unit = units.find(u => u.id === preselectedUnitId);
      if (unit) {
        setFormData({
          ...formData,
          propertyId: unit.propertyId,
          propertyName: unit.propertyName,
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          monthlyRent: unit.price,
        });
      }
    }
  }, [contractId, preselectedUnitId, contracts, units]);

  const handleUnitChange = (selectedUnitId: string) => {
    const unit = units.find(u => u.id === selectedUnitId);
    if (unit) {
      setFormData({
        ...formData,
        propertyId: unit.propertyId,
        propertyName: unit.propertyName,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        monthlyRent: unit.price,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contractId) {
      updateContract(contractId, formData);
    } else {
      addContract(formData);
    }
    
    onClose();
  };

  const handlePdfUpload = () => {
    // Mock PDF upload
    setFormData({
      ...formData,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
            {contractId ? 'تعديل العقد' : 'إنشاء عقد جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tenant Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستأجر
              </label>
              <input
                type="text"
                required
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="محمد أحمد"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال
              </label>
              <input
                type="tel"
                required
                value={formData.tenantPhone}
                onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="05xxxxxxxx"
              />
            </div>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوحدة
            </label>
            <select
              required
              value={formData.unitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">اختر الوحدة</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.propertyName} - {unit.unitNumber} ({unit.type})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ البداية
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ النهاية
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Rent and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الإيجار الشهري (ر.س)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة العقد
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="active">نشط</option>
                <option value="pending">معلق</option>
                <option value="expired">منتهي</option>
              </select>
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملف العقد (PDF)
            </label>
            
            {formData.pdfUrl ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <span className="text-green-700 text-sm">تم رفع ملف العقد بنجاح</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pdfUrl: '' })}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePdfUpload}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-5 h-5" />
                <span>رفع ملف PDF</span>
              </button>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {contractId ? 'تحديث العقد' : 'إنشاء العقد'}
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
