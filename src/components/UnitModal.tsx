import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  unitId: string | null;
}

export function UnitModal({ isOpen, onClose, propertyId, unitId }: UnitModalProps) {
  const { units, properties, addUnit, updateUnit } = useData();
  const [formData, setFormData] = useState({
    propertyId: propertyId || '',
    propertyName: '',
    unitNumber: '',
    type: '',
    price: 0,
    status: 'available' as 'available' | 'rented',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    images: [] as string[],
  });

  useEffect(() => {
    if (unitId) {
      const unit = units.find(u => u.id === unitId);
      if (unit) {
        setFormData({
          propertyId: unit.propertyId,
          propertyName: unit.propertyName,
          unitNumber: unit.unitNumber,
          type: unit.type,
          price: unit.price,
          status: unit.status,
          area: unit.area,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          images: unit.images,
        });
      }
    } else if (propertyId) {
      const property = properties.find(p => p.id === propertyId);
      setFormData({
        ...formData,
        propertyId: propertyId,
        propertyName: property?.name || '',
      });
    }
  }, [unitId, propertyId, units, properties]);

  const handlePropertyChange = (selectedPropertyId: string) => {
    const property = properties.find(p => p.id === selectedPropertyId);
    setFormData({
      ...formData,
      propertyId: selectedPropertyId,
      propertyName: property?.name || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (unitId) {
      updateUnit(unitId, formData);
    } else {
      addUnit(formData);
    }
    
    onClose();
  };

  const handleImageUpload = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ];
    setFormData({ ...formData, images: [...formData.images, mockImages[Math.floor(Math.random() * mockImages.length)]] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
            {unitId ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العقار
            </label>
            <select
              required
              value={formData.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">اختر العقار</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Number and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الوحدة
              </label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="A-101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النوع
              </label>
              <input
                type="text"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="شقة 3 غرف"
              />
            </div>
          </div>

          {/* Price and Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (ر.س)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المساحة (م²)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                غرف النوم
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                دورات المياه
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'rented' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="available">متوفر</option>
              <option value="rented">مؤجر</option>
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صور الوحدة
            </label>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
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

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {unitId ? 'تحديث الوحدة' : 'إضافة الوحدة'}
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
