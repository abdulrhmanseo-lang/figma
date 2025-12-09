import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Upload, RefreshCw, PenTool, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

export function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contracts, updateContract } = useData();
  const [showSignModal, setShowSignModal] = useState(false);

  const contract = contracts.find(c => c.id === id);

  if (!contract) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">العقد غير موجود</p>
        <button
          onClick={() => navigate('/contracts')}
          className="mt-4 text-blue-600 hover:underline"
        >
          العودة إلى قائمة العقود
        </button>
      </div>
    );
  }

  const handleRenewContract = () => {
    const endDate = new Date(contract.endDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    updateContract(contract.id, {
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
    });
    
    alert('تم تجديد العقد بنجاح لمدة سنة إضافية');
  };

  const handleSign = () => {
    updateContract(contract.id, { status: 'active' });
    setShowSignModal(false);
    alert('تم توقيع العقد إلكترونياً بنجاح');
  };

  const handleUploadPdf = () => {
    updateContract(contract.id, {
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    });
    alert('تم رفع ملف العقد بنجاح');
  };

  const getRemainingDays = () => {
    const today = new Date();
    const end = new Date(contract.endDate);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/contracts')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة إلى العقود</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">عقد الإيجار</h1>
              <p className="opacity-90">رقم العقد: {contract.id}</p>
            </div>

            {/* PDF Viewer */}
            <div className="p-6">
              {contract.pdfUrl ? (
                <iframe
                  src={contract.pdfUrl}
                  className="w-full h-[600px] border border-gray-300 rounded-lg"
                  title="عقد الإيجار"
                />
              ) : (
                <div className="h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500">
                  <FileText className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="text-lg mb-2">لم يتم رفع ملف العقد بعد</p>
                  <p className="text-sm">استخدم زر "رفع PDF جديد" لإضافة ملف العقد</p>
                </div>
              )}
            </div>

            {/* PDF Actions */}
            <div className="border-t p-6">
              <div className="flex flex-wrap gap-3">
                {contract.pdfUrl && (
                  <a
                    href={contract.pdfUrl}
                    download
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل PDF</span>
                  </a>
                )}
                
                <button
                  onClick={handleUploadPdf}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع PDF جديد</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info Sidebar */}
        <div className="space-y-6">
          {/* Contract Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0A2A43' }}>
              حالة العقد
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">الحالة</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  contract.status === 'active' ? 'bg-green-100 text-green-700' :
                  contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {contract.status === 'active' ? 'نشط' :
                   contract.status === 'pending' ? 'معلق' : 'منتهي'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">المدة المتبقية</p>
                <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
                  {getRemainingDays() > 0 ? `${getRemainingDays()} يوم` : 'منتهي'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">الإيجار الشهري</p>
                <p className="text-xl font-bold" style={{ color: '#0A2A43' }}>
                  {contract.monthlyRent.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0A2A43' }}>
              بيانات العقد
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">المستأجر</p>
                <p className="font-medium">{contract.tenantName}</p>
                <p className="text-sm text-gray-500">{contract.tenantPhone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">العقار</p>
                <p className="font-medium">{contract.propertyName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">الوحدة</p>
                <p className="font-medium">{contract.unitNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">تاريخ البداية</p>
                  <p className="font-medium text-sm">
                    {new Date(contract.startDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ النهاية</p>
                  <p className="font-medium text-sm">
                    {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0A2A43' }}>
              الإجراءات
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleRenewContract}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>تجديد العقد</span>
              </button>

              <button
                onClick={() => setShowSignModal(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <PenTool className="w-5 h-5" />
                <span>توقيع إلكتروني</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Electronic Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#0A2A43' }}>
              التوقيع الإلكتروني
            </h3>
            
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <PenTool className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  سيتم توقيع العقد إلكترونياً وتفعيله بشكل فوري
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSign}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                تأكيد التوقيع
              </button>
              <button
                onClick={() => setShowSignModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
