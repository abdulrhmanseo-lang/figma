import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ContractModal } from '../components/ContractModal';
import { motion } from 'motion/react';

export function Contracts() {
  const { contracts } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate remaining days
  const getRemainingDays = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A2A43' }}>
            العقود
          </h1>
          <p className="text-gray-600">
            إدارة عقود الإيجار والاتفاقيات
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة عقد جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن عقد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="expired">منتهي</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستأجر</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العقار</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوحدة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ البداية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ النهاية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المدة المتبقية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract, index) => {
                const remainingDays = getRemainingDays(contract.endDate);
                return (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{contract.tenantName}</p>
                        <p className="text-sm text-gray-500">{contract.tenantPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{contract.propertyName}</td>
                    <td className="px-6 py-4 text-gray-600">{contract.unitNumber}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(contract.startDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        remainingDays < 30 ? 'text-red-600' :
                        remainingDays < 90 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {remainingDays > 0 ? `${remainingDays} يوم` : 'منتهي'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'active' ? 'bg-green-100 text-green-700' :
                        contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {contract.status === 'active' ? 'نشط' :
                         contract.status === 'pending' ? 'معلق' : 'منتهي'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">عرض</span>
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد عقود متطابقة مع البحث
          </div>
        )}
      </div>

      {/* Contract Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contractId={null}
        preselectedUnitId={null}
      />
    </div>
  );
}
