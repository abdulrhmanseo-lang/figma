import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, QrCode, FileText, Home, Bed, Bath, Maximize } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ContractModal } from '../components/ContractModal';
import QRCodeLib from 'qrcode';
import { useEffect } from 'react';

export function UnitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { units } = useData();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const unit = units.find(u => u.id === id);

  useEffect(() => {
    if (unit) {
      // Generate QR code with unit information
      const unitData = JSON.stringify({
        id: unit.id,
        unitNumber: unit.unitNumber,
        property: unit.propertyName,
        type: unit.type,
        price: unit.price,
      });

      QRCodeLib.toDataURL(unitData, { width: 200 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err));
    }
  }, [unit]);

  if (!unit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الوحدة غير موجودة</p>
        <button
          onClick={() => navigate('/units')}
          className="mt-4 text-blue-600 hover:underline"
        >
          العودة إلى قائمة الوحدات
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/units')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة إلى الوحدات</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-96">
              <img
                src={unit.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
                alt={unit.unitNumber}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A2A43' }}>
                    الوحدة {unit.unitNumber}
                  </h1>
                  <p className="text-gray-600">{unit.propertyName}</p>
                </div>
                
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  unit.status === 'rented'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {unit.status === 'rented' ? 'مؤجر' : 'متوفر'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Home className="w-5 h-5" />
                    <span className="text-sm">النوع</span>
                  </div>
                  <p className="font-bold" style={{ color: '#0A2A43' }}>{unit.type}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Maximize className="w-5 h-5" />
                    <span className="text-sm">المساحة</span>
                  </div>
                  <p className="font-bold" style={{ color: '#0A2A43' }}>{unit.area} م²</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Bed className="w-5 h-5" />
                    <span className="text-sm">الغرف</span>
                  </div>
                  <p className="font-bold" style={{ color: '#0A2A43' }}>{unit.bedrooms}</p>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-cyan-600 mb-2">
                    <Bath className="w-5 h-5" />
                    <span className="text-sm">الحمامات</span>
                  </div>
                  <p className="font-bold" style={{ color: '#0A2A43' }}>{unit.bathrooms}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">السعر الشهري</p>
                <p className="text-3xl font-bold" style={{ color: '#0A2A43' }}>
                  {unit.price.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5" style={{ color: '#0A2A43' }} />
              <h3 className="text-lg font-bold" style={{ color: '#0A2A43' }}>
                رمز الاستجابة السريع
              </h3>
            </div>
            
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" />
              </div>
            )}
            
            <p className="text-sm text-gray-600 text-center">
              امسح الكود للحصول على معلومات الوحدة
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0A2A43' }}>
              الإجراءات
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setIsContractModalOpen(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>إنشاء عقد جديد</span>
              </button>

              <button
                onClick={() => navigate(`/properties/${unit.propertyId}`)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                عرض تفاصيل العقار
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        contractId={null}
        preselectedUnitId={unit.id}
      />
    </div>
  );
}
