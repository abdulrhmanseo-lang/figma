import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QrCode, FileText, Home, Bed, Bath, Maximize, Edit, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ContractModal } from '../components/ContractModal';
import { UnitModal } from '../components/UnitModal';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { formatSAR } from '../lib/format';

// Type label mapping
const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: 'شقة',
  studio: 'ستوديو',
  office: 'مكتب',
  shop: 'محل تجاري',
  warehouse: 'مستودع',
  villa: 'فيلا',
};

export function UnitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { units, contracts } = useData();
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const unit = units.find(u => u.id === id);
  const unitContract = unit ? contracts.find(c => c.unitId === unit.id && c.status === 'active') : null;

  if (!unit) {
    return (
      <Layout>
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500">الوحدة غير موجودة</p>
          <Link to="/app/units" className="mt-4 text-brand-blue hover:underline">
            العودة إلى قائمة الوحدات
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/app" className="hover:text-brand-blue">لوحة التحكم</Link>
          <span>/</span>
          <Link to="/app/units" className="hover:text-brand-blue">الوحدات</Link>
          <span>/</span>
          <span className="text-brand-dark font-medium">{unit.unitNo}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-80 relative">
                <img
                  src={unit.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
                  alt={unit.unitNo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${unit.status === 'rented' ? 'bg-green-500 text-white' :
                      unit.status === 'vacant' ? 'bg-blue-500 text-white' :
                        'bg-amber-500 text-white'
                    }`}>
                    {unit.status === 'rented' ? 'مؤجرة' :
                      unit.status === 'vacant' ? 'شاغرة' : 'صيانة'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-brand-dark">
                      الوحدة {unit.unitNo}
                    </h1>
                    <p className="text-gray-600">{unit.propertyName}</p>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Home className="w-5 h-5" />
                      <span className="text-sm">النوع</span>
                    </div>
                    <p className="font-bold text-brand-dark">{UNIT_TYPE_LABELS[unit.type] || unit.type}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Maximize className="w-5 h-5" />
                      <span className="text-sm">المساحة</span>
                    </div>
                    <p className="font-bold text-brand-dark">{unit.areaSqm || 0} م²</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Bed className="w-5 h-5" />
                      <span className="text-sm">الغرف</span>
                    </div>
                    <p className="font-bold text-brand-dark">{unit.bedrooms || 0}</p>
                  </div>

                  <div className="bg-cyan-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-cyan-600 mb-2">
                      <Bath className="w-5 h-5" />
                      <span className="text-sm">الحمامات</span>
                    </div>
                    <p className="font-bold text-brand-dark">{unit.bathrooms || 0}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-brand-blue/10 to-cyan-500/10 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">الإيجار</p>
                  <p className="text-3xl font-bold text-brand-dark">
                    {formatSAR(unit.rentAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Contract */}
            {unitContract && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4">العقد الحالي</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{unitContract.tenantName}</p>
                    <p className="text-sm text-gray-500">
                      ينتهي في: {new Date(unitContract.endDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <Link to={`/app/contracts/${unitContract.id}`}>
                    <Button variant="outline" size="sm">
                      عرض العقد
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">
                الإجراءات
              </h3>

              <div className="space-y-3">
                {unit.status === 'vacant' && (
                  <Button
                    onClick={() => setIsContractModalOpen(true)}
                    variant="gradient"
                    className="w-full"
                  >
                    <FileText className="w-5 h-5 ml-2" />
                    إنشاء عقد جديد
                  </Button>
                )}

                <Link to={`/app/properties`}>
                  <Button variant="outline" className="w-full">
                    عرض العقار
                  </Button>
                </Link>

                <Link to={`/app/maintenance?unit=${unit.id}`}>
                  <Button variant="outline" className="w-full">
                    طلبات الصيانة
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floor Info */}
            {unit.floor && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-2">الطابق</h3>
                <p className="text-2xl font-bold text-brand-blue">{unit.floor}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          contractId={null}
          preselectedUnitId={unit.id}
        />

        <UnitModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          propertyId={unit.propertyId}
          unitId={unit.id}
        />
      </div>
    </Layout>
  );
}
