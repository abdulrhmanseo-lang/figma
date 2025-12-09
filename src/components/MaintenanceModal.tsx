import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
}

export function MaintenanceModal({ isOpen, onClose, ticketId }: MaintenanceModalProps) {
  const { maintenanceTickets, units, addMaintenanceTicket, updateMaintenanceTicket } = useData();
  const [formData, setFormData] = useState({
    propertyId: '',
    propertyName: '',
    unitId: '',
    unitNumber: '',
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'overdue',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    createdDate: new Date().toISOString().split('T')[0],
    images: [] as string[],
  });

  useEffect(() => {
    if (ticketId) {
      const ticket = maintenanceTickets.find(t => t.id === ticketId);
      if (ticket) {
        setFormData(ticket);
      }
    } else {
      setFormData({
        propertyId: '',
        propertyName: '',
        unitId: '',
        unitNumber: '',
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        createdDate: new Date().toISOString().split('T')[0],
        images: [],
      });
    }
  }, [ticketId, maintenanceTickets]);

  const handleUnitChange = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setFormData({
        ...formData,
        propertyId: unit.propertyId,
        propertyName: unit.propertyName,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ticketId) {
      updateMaintenanceTicket(ticketId, formData);
    } else {
      addMaintenanceTicket(formData);
    }
    
    onClose();
  };

  const handleImageUpload = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      'https://images.unsplash.com/photo-1504253492562-afccb8053add?w=400',
    ];
    setFormData({ ...formData, images: [...formData.images, mockImages[Math.floor(Math.random() * mockImages.length)]] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
            {ticketId ? 'تعديل طلب الصيانة' : 'طلب صيانة جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  {unit.propertyName} - {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان المشكلة
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="مثال: تسريب في الحمام"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="وصف تفصيلي للمشكلة..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="low">عادي</option>
                <option value="medium">متوسط</option>
                <option value="high">عاجل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="pending">معلّقة</option>
                <option value="in-progress">جارية</option>
                <option value="completed">مكتملة</option>
                <option value="overdue">متأخرة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المسؤول عن الصيانة
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="اسم الفني أو الفريق"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصور
            </label>
            
            <div className="grid grid-cols-4 gap-3 mb-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img src={image} alt={`صورة ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })}
                    className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleImageUpload}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <Upload className="w-5 h-5" />
              <span>رفع صورة</span>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {ticketId ? 'تحديث الطلب' : 'إنشاء الطلب'}
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
