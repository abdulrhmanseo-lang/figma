import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import type { PropertyType } from '../types/database';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string | null;
}

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف'];
const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'building', label: 'مبنى سكني' },
  { value: 'villa', label: 'فيلا' },
  { value: 'complex', label: 'مجمع سكني' },
  { value: 'land', label: 'أرض' },
];

export function PropertyModal({ isOpen, onClose, propertyId }: PropertyModalProps) {
  const { properties, addProperty, updateProperty } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: 'الرياض',
    address: '',
    type: 'building' as PropertyType,
    images: [] as string[],
  });

  useEffect(() => {
    if (propertyId) {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        setFormData({
          name: property.name,
          city: property.city,
          address: property.address,
          type: property.type,
          images: property.images || [],
        });
      }
    } else {
      setFormData({
        name: '',
        city: 'الرياض',
        address: '',
        type: 'building',
        images: [],
      });
    }
  }, [propertyId, properties, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال اسم العقار');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('الرجاء إدخال عنوان العقار');
      return;
    }

    setIsSubmitting(true);
    try {
      if (propertyId) {
        await updateProperty(propertyId, formData);
        toast.success('تم تحديث العقار بنجاح');
      } else {
        await addProperty(formData);
        toast.success('تم إضافة العقار بنجاح');
      }
      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('حدث خطأ أثناء حفظ العقار. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleImageUpload = () => {
    // Mock image upload - in real app would handle file upload
    const mockImages = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setFormData({ ...formData, images: [...formData.images, randomImage] });
    toast.success('تم رفع الصورة');
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {propertyId ? 'تعديل العقار' : 'إضافة عقار جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم العقار <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              placeholder="مثال: برج الياسمين"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع العقار <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
            >
              {PROPERTY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المدينة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
            >
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العنوان <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              placeholder="مثال: حي النرجس، شارع التخصصي"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الصور
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleImageUpload}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-blue transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-brand-blue text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>رفع صورة</span>
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : (propertyId ? 'حفظ التعديلات' : 'إضافة العقار')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
