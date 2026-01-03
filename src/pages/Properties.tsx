import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Building2, MapPin, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PropertyModal } from '../components/PropertyModal';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

import { toast } from 'sonner';

export function Properties() {
  const { properties, units, deleteProperty } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<string | null>(null);

  // Calculate units per property
  const getPropertyStats = (propertyId: string) => {
    const propertyUnits = units.filter(u => u.propertyId === propertyId);
    const total = propertyUnits.length;
    const rented = propertyUnits.filter(u => u.status === 'rented').length;
    const occupancy = total > 0 ? Math.round((rented / total) * 100) : 0;
    return { total, rented, occupancy };
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || property.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const cities = ['all', ...Array.from(new Set(properties.map(p => p.city)))];

  const handleEdit = (id: string) => {
    setEditingProperty(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const property = properties.find(p => p.id === id);
    const propertyUnits = units.filter(u => u.propertyId === id);

    if (propertyUnits.length > 0) {
      toast.error(`لا يمكن حذف "${property?.name}" لأنه يحتوي على ${propertyUnits.length} وحدة`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف "${property?.name}"؟`)) {
      deleteProperty(id);
      toast.success('تم حذف العقار بنجاح');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm lg:text-base text-gray-600">
            إدارة جميع العقارات والمباني ({properties.length} عقار)
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProperty(null);
            setIsModalOpen(true);
          }}
          variant="gradient"
          className="w-full sm:w-auto text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
          إضافة عقار جديد
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-3 lg:p-4">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
            <input
              type="text"
              placeholder="البحث عن عقار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 lg:pr-10 pl-3 lg:pl-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm lg:text-base"
            />
          </div>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white transition-all text-sm lg:text-base"
          >
            <option value="all">جميع المدن</option>
            {cities.filter(c => c !== 'all').map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredProperties.map((property, index) => {
            const stats = getPropertyStats(property.id);
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-36 sm:h-40 lg:h-48 overflow-hidden">
                  <img
                    src={property.images[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 left-3 lg:left-4">
                    <h3 className="text-white font-bold text-base lg:text-lg mb-1">{property.name}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-xs lg:text-sm">
                      <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>{property.city}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 lg:top-4 left-3 lg:left-4">
                    <span className="px-2 lg:px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] lg:text-xs font-medium text-brand-dark">
                      {property.type === 'building' ? 'مبنى' :
                        property.type === 'villa' ? 'فيلا' :
                          property.type === 'complex' ? 'مجمع' : 'أرض'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 lg:p-5">
                  <p className="text-gray-500 text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2">{property.address}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-3 lg:mb-4">
                    <div className="text-center p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                      <div className="text-base lg:text-lg font-bold text-brand-dark">{stats.total}</div>
                      <div className="text-[10px] lg:text-xs text-gray-500">وحدة</div>
                    </div>
                    <div className="text-center p-1.5 lg:p-2 bg-green-50 rounded-lg">
                      <div className="text-base lg:text-lg font-bold text-green-600">{stats.rented}</div>
                      <div className="text-[10px] lg:text-xs text-gray-500">مؤجرة</div>
                    </div>
                    <div className="text-center p-1.5 lg:p-2 bg-blue-50 rounded-lg">
                      <div className="text-base lg:text-lg font-bold text-brand-blue">{stats.occupancy}%</div>
                      <div className="text-[10px] lg:text-xs text-gray-500">إشغال</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(property.id)}
                        className="p-1.5 lg:p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-1.5 lg:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link to={`/app/units?property=${property.id}`}>
                      <Button variant="outline" size="sm" className="text-xs lg:text-sm px-2 lg:px-3">
                        <Home className="w-3 h-3 lg:w-4 lg:h-4 ml-1" />
                        الوحدات
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-8 lg:p-12 text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-gray-700 mb-2">لا توجد عقارات</h3>
          <p className="text-sm lg:text-base text-gray-500 mb-6">
            {searchTerm || cityFilter !== 'all'
              ? 'لا توجد نتائج تطابق البحث'
              : 'ابدأ بإضافة عقارك الأول'}
          </p>
          {!searchTerm && cityFilter === 'all' && (
            <Button
              onClick={() => {
                setEditingProperty(null);
                setIsModalOpen(true);
              }}
              variant="gradient"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة عقار جديد
            </Button>
          )}
        </div>
      )}

      {/* Property Modal */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        propertyId={editingProperty}
      />
    </div>
  );
}
