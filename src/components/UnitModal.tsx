import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import type { UnitStatus, UnitType } from '../types/database';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  unitId: string | null;
}

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'apartment', label: 'شقة' },
  { value: 'studio', label: 'ستوديو' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل تجاري' },
  { value: 'warehouse', label: 'مستودع' },
  { value: 'villa', label: 'فيلا' },
];

export function UnitModal({ isOpen, onClose, propertyId, unitId }: UnitModalProps) {
  const { units, properties, addUnit, updateUnit } = useData();
  const [formData, setFormData] = useState({
    propertyId: propertyId || '',
    unitNo: '',
    type: 'apartment' as UnitType,
    floor: '',
    rentAmount: 0,
    status: 'vacant' as UnitStatus,
    areaSqm: 0,
    bedrooms: 0,
    bathrooms: 0,
  });

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  useEffect(() => {
    if (unitId) {
      const unit = units.find(u => u.id === unitId);
      if (unit) {
        setFormData({
          propertyId: unit.propertyId,
          unitNo: unit.unitNo,
          type: unit.type,
          floor: unit.floor || '',
          rentAmount: unit.rentAmount,
          status: unit.status,
          areaSqm: unit.areaSqm || 0,
          bedrooms: unit.bedrooms || 0,
          bathrooms: unit.bathrooms || 0,
        });
      }
    } else if (propertyId) {
      setFormData(prev => ({
        ...prev,
        propertyId: propertyId,
      }));
    }
  }, [unitId, propertyId, units, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.unitNo) {
      toast.error('الرجاء إدخال جميع الحقول المطلوبة');
      return;
    }

    const submitData = {
      propertyId: formData.propertyId,
      propertyName: selectedProperty?.name || '',
      unitNo: formData.unitNo,
      type: formData.type,
      floor: formData.floor || undefined,
      rentAmount: formData.rentAmount,
      status: formData.status,
      areaSqm: formData.areaSqm,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      images: [] as string[],
    };

    if (unitId) {
      updateUnit(unitId, submitData);
      toast.success('تم تحديث الوحدة بنجاح');
    } else {
      addUnit(submitData);
      toast.success('تم إضافة الوحدة بنجاح');
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {unitId ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العقار <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              disabled={!!propertyId}
            >
              <option value="">اختر العقار</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.city}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Number and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الوحدة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unitNo}
                onChange={(e) => setFormData({ ...formData, unitNo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                placeholder="A-101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النوع <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as UnitType })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                {UNIT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Floor and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الطابق
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                placeholder="الأول"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UnitStatus })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                <option value="vacant">شاغرة</option>
                <option value="rented">مؤجرة</option>
                <option value="maintenance">صيانة</option>
              </select>
            </div>
          </div>

          {/* Price and Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الإيجار (ر.س) <span className="text-red-500">*</span>
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
                المساحة (م²)
              </label>
              <input
                type="number"
                min="0"
                value={formData.areaSqm}
                onChange={(e) => setFormData({ ...formData, areaSqm: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                غرف النوم
              </label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                دورات المياه
              </label>
              <input
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="gradient" className="flex-1">
              {unitId ? 'حفظ التعديلات' : 'إضافة الوحدة'}
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
