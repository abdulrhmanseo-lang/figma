import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Building2, Plus, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UnitModal } from '../components/UnitModal';
import { ContractModal } from '../components/ContractModal';

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, units } = useData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const property = properties.find(p => p.id === id);
  const propertyUnits = units.filter(u => u.propertyId === id);

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">العقار غير موجود</p>
        <button
          onClick={() => navigate('/properties')}
          className="mt-4 text-blue-600 hover:underline"
        >
          العودة إلى قائمة العقارات
        </button>
      </div>
    );
  }

  const handleCreateContract = (unitId: string) => {
    setSelectedUnit(unitId);
    setIsContractModalOpen(true);
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/properties')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة إلى العقارات</span>
      </button>

      {/* Property Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Image Carousel */}
        <div className="relative h-96">
          <img
            src={property.images[currentImageIndex]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          
          {/* Carousel Controls */}
          {property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#0A2A43' }}>
            {property.name}
          </h1>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{property.city} - {property.address}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-5 h-5" />
              <span>{property.units} وحدة</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{property.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">عدد الوحدات</p>
              <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
                {property.units}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">نسبة الإشغال</p>
              <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
                {property.occupancyRate}%
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">الوحدات المؤجرة</p>
              <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
                {propertyUnits.filter(u => u.status === 'rented').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
            الوحدات المرتبطة
          </h2>
          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء وحدة جديدة</span>
          </button>
        </div>

        {propertyUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertyUnits.map(unit => (
              <div
                key={unit.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#0A2A43' }}>
                      {unit.unitNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{unit.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    unit.status === 'rented'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {unit.status === 'rented' ? 'مؤجر' : 'متوفر'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">السعر:</span> {unit.price.toLocaleString()} ر.س
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">المساحة:</span> {unit.area} م²
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">الغرف:</span> {unit.bedrooms} غرفة نوم
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/units/${unit.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => handleCreateContract(unit.id)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عقد</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            لا توجد وحدات مضافة لهذا العقار بعد
          </div>
        )}
      </div>

      {/* Modals */}
      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        propertyId={id || ''}
        unitId={null}
      />
      
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedUnit(null);
        }}
        contractId={null}
        preselectedUnitId={selectedUnit}
      />
    </div>
  );
}
