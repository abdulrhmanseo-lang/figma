import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import type { MaintenanceStatus, MaintenancePriority } from '../types/database';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
}

export function MaintenanceModal({ isOpen, onClose, ticketId }: MaintenanceModalProps) {
  const { maintenanceRequests, units, properties, addMaintenanceRequest, updateMaintenanceRequest } = useData();
  const [formData, setFormData] = useState({
    propertyId: '',
    unitId: '',
    title: '',
    description: '',
    status: 'new' as MaintenanceStatus,
    priority: 'medium' as MaintenancePriority,
    assignedTo: '',
    cost: 0,
  });

  useEffect(() => {
    if (ticketId) {
      const ticket = maintenanceRequests.find(t => t.id === ticketId);
      if (ticket) {
        setFormData({
          propertyId: ticket.propertyId,
          unitId: ticket.unitId || '',
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assignedTo: ticket.assignedTo || '',
          cost: ticket.cost || 0,
        });
      }
    } else {
      setFormData({
        propertyId: '',
        unitId: '',
        title: '',
        description: '',
        status: 'new',
        priority: 'medium',
        assignedTo: '',
        cost: 0,
      });
    }
  }, [ticketId, maintenanceRequests, isOpen]);

  const handlePropertyChange = (propertyId: string) => {
    setFormData({
      ...formData,
      propertyId,
      unitId: '', // Reset unit when property changes
    });
  };

  const getPropertyUnits = (propertyId: string) => {
    return units.filter(u => u.propertyId === propertyId);
  };

  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || '';
  };

  const getUnitNo = (unitId: string) => {
    return units.find(u => u.id === unitId)?.unitNo;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.title) {
      toast.error('الرجاء إدخال العقار وعنوان المشكلة');
      return;
    }

    const submitData = {
      propertyId: formData.propertyId,
      propertyName: getPropertyName(formData.propertyId),
      unitId: formData.unitId || undefined,
      unitNo: formData.unitId ? getUnitNo(formData.unitId) : undefined,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo || undefined,
      cost: formData.cost,
      requestedBy: 'admin' as const,
    };

    if (ticketId) {
      updateMaintenanceRequest(ticketId, submitData);
      toast.success('تم تحديث طلب الصيانة');
    } else {
      addMaintenanceRequest(submitData);
      toast.success('تم إنشاء طلب الصيانة');
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ticketId ? 'تعديل طلب الصيانة' : 'طلب صيانة جديد'}
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
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
            >
              <option value="">اختر العقار</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.city}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Selection (Optional) */}
          {formData.propertyId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوحدة (اختياري)
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                <option value="">صيانة عامة للعقار</option>
                {getPropertyUnits(formData.propertyId).map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitNo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عنوان المشكلة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              placeholder="مثال: تسريب في الحمام"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              placeholder="وصف تفصيلي للمشكلة..."
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الأولوية
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">مرتفع</option>
                <option value="urgent">عاجل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                <option value="new">جديد</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="done">مكتمل</option>
                <option value="canceled">ملغي</option>
              </select>
            </div>
          </div>

          {/* Assigned To and Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المسؤول
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                placeholder="اسم الفني"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                التكلفة (ر.س)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="gradient" className="flex-1">
              {ticketId ? 'حفظ التعديلات' : 'إنشاء الطلب'}
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
