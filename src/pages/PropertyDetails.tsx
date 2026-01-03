import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, Plus, FileText, Edit, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UnitModal } from '../components/UnitModal';
import { ContractModal } from '../components/ContractModal';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { formatSAR } from '../lib/format';

const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: 'شقة',
  studio: 'ستوديو',
  office: 'مكتب',
  shop: 'محل تجاري',
  warehouse: 'مستودع',
  villa: 'فيلا',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  building: 'مبنى سكني',
  villa: 'فيلا',
  complex: 'مجمع سكني',
  land: 'أرض',
};

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
      <Layout>
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500">العقار غير موجود</p>
          <Link to="/app/properties" className="mt-4 text-brand-blue hover:underline">
            العودة إلى قائمة العقارات
          </Link>
        </div>
      </Layout>
    );
  }

  const handleCreateContract = (unitId: string) => {
    setSelectedUnit(unitId);
    setIsContractModalOpen(true);
  };

  const vacantCount = propertyUnits.filter(u => u.status === 'vacant').length;
  const rentedCount = propertyUnits.filter(u => u.status === 'rented').length;
  const occupancyRate = propertyUnits.length > 0
    ? Math.round((rentedCount / propertyUnits.length) * 100)
    : 0;

  return (
    <Layout>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/app" className="hover:text-brand-blue">لوحة التحكم</Link>
          <span>/</span>
          <Link to="/app/properties" className="hover:text-brand-blue">العقارات</Link>
          <span>/</span>
          <span className="text-brand-dark font-medium">{property.name}</span>
        </div>

        {/* Property Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Image Carousel */}
          <div className="relative h-80">
            <img
              src={property.images[currentImageIndex] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'}
              alt={property.name}
              className="w-full h-full object-cover"
            />

            {property.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-brand-dark">
                  {property.name}
                </h1>
                <span className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm">
                  {PROPERTY_TYPE_LABELS[property.type] || property.type}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{property.city} - {property.address}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-5 h-5" />
                <span>{propertyUnits.length} وحدة</span>
              </div>
            </div>

            {property.description && (
              <p className="text-gray-600 mb-6">{property.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">عدد الوحدات</p>
                <p className="text-2xl font-bold text-brand-dark">
                  {propertyUnits.length}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">نسبة الإشغال</p>
                <p className="text-2xl font-bold text-brand-dark">
                  {occupancyRate}%
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">الوحدات الشاغرة</p>
                <p className="text-2xl font-bold text-brand-dark">
                  {vacantCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Units Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-dark">
              الوحدات ({propertyUnits.length})
            </h2>
            <Button onClick={() => setIsUnitModalOpen(true)} variant="gradient">
              <Plus className="w-4 h-4 ml-2" />
              إضافة وحدة
            </Button>
          </div>

          {propertyUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyUnits.map(unit => (
                <div
                  key={unit.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark">
                        {unit.unitNo}
                      </h3>
                      <p className="text-sm text-gray-600">{UNIT_TYPE_LABELS[unit.type] || unit.type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${unit.status === 'rented' ? 'bg-green-100 text-green-700' :
                        unit.status === 'vacant' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>
                      {unit.status === 'rented' ? 'مؤجرة' :
                        unit.status === 'vacant' ? 'شاغرة' : 'صيانة'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">الإيجار:</span> {formatSAR(unit.rentAmount)}
                    </p>
                    {unit.areaSqm && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">المساحة:</span> {unit.areaSqm} م²
                      </p>
                    )}
                    {unit.bedrooms !== undefined && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">الغرف:</span> {unit.bedrooms} غرفة نوم
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/app/units/${unit.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        التفاصيل
                      </Button>
                    </Link>
                    {unit.status === 'vacant' && (
                      <Button
                        onClick={() => handleCreateContract(unit.id)}
                        variant="gradient"
                        size="sm"
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 ml-1" />
                        عقد
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد وحدات مضافة لهذا العقار بعد</p>
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
    </Layout>
  );
}
