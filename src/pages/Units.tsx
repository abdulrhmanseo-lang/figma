import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Home, FileText, Wrench } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UnitModal } from '../components/UnitModal';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

import { toast } from 'sonner';
import { formatSAR } from '../lib/format';
import type { UnitStatus } from '../types/database';

export function Units() {
  const { units, properties, contracts, deleteUnit, updateUnit } = useData();
  const [searchParams] = useSearchParams();
  const propertyFilter = searchParams.get('property') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const matchesSearch =
        unit.unitNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
      const matchesProperty = propertyFilter === 'all' || unit.propertyId === propertyFilter;
      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [units, searchTerm, statusFilter, propertyFilter]);

  // Stats
  const stats = useMemo(() => {
    const filtered = propertyFilter === 'all' ? units : units.filter(u => u.propertyId === propertyFilter);
    return {
      total: filtered.length,
      rented: filtered.filter(u => u.status === 'rented').length,
      vacant: filtered.filter(u => u.status === 'vacant').length,
      maintenance: filtered.filter(u => u.status === 'maintenance').length,
    };
  }, [units, propertyFilter]);

  const handleEdit = (id: string) => {
    setEditingUnit(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const unit = units.find(u => u.id === id);
    const hasContract = contracts.some(c => c.unitId === id && c.status === 'active');

    if (hasContract) {
      toast.error(`لا يمكن حذف الوحدة "${unit?.unitNo}" لأنها مرتبطة بعقد نشط`);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الوحدة "${unit?.unitNo}"؟`)) {
      deleteUnit(id);
      toast.success('تم حذف الوحدة بنجاح');
    }
  };

  const handleStatusChange = (unitId: string, newStatus: UnitStatus) => {
    updateUnit(unitId, { status: newStatus });
    toast.success('تم تحديث حالة الوحدة');
  };

  const getStatusBadge = (status: UnitStatus) => {
    const badges = {
      rented: { bg: 'bg-green-100', text: 'text-green-700', label: 'مؤجرة' },
      vacant: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'شاغرة' },
      maintenance: { bg: 'bg-red-100', text: 'text-red-700', label: 'صيانة' },
    };
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const selectedProperty = properties.find(p => p.id === propertyFilter);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm lg:text-base text-gray-600">
            إدارة الوحدات السكنية ({filteredUnits.length} من {stats.total})
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingUnit(null);
            setIsModalOpen(true);
          }}
          variant="gradient"
          className="w-full sm:w-auto text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
          إضافة وحدة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="bg-white rounded-xl shadow p-3 lg:p-4 text-center">
          <div className="text-xl lg:text-2xl font-bold text-brand-dark">{stats.total}</div>
          <div className="text-xs lg:text-sm text-gray-500">إجمالي الوحدات</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 lg:p-4 text-center">
          <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.rented}</div>
          <div className="text-xs lg:text-sm text-gray-500">مؤجرة</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 lg:p-4 text-center">
          <div className="text-xl lg:text-2xl font-bold text-amber-600">{stats.vacant}</div>
          <div className="text-xs lg:text-sm text-gray-500">شاغرة</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 lg:p-4 text-center">
          <div className="text-xl lg:text-2xl font-bold text-red-600">{stats.maintenance}</div>
          <div className="text-xs lg:text-sm text-gray-500">صيانة</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-3 lg:p-4">
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
            <input
              type="text"
              placeholder="البحث عن وحدة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 lg:pr-10 pl-3 lg:pl-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-sm lg:text-base"
            />
          </div>

          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={(e) => window.location.href = `/app/units?property=${e.target.value}`}
            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white text-sm lg:text-base"
          >
            <option value="all">جميع العقارات</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-1">
            {(['all', 'vacant', 'rented', 'maintenance'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 min-w-fit py-2 px-2 lg:px-3 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${statusFilter === status
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? 'الكل' :
                  status === 'vacant' ? 'شاغرة' :
                    status === 'rented' ? 'مؤجرة' : 'صيانة'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filteredUnits.map((unit, index) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="bg-white rounded-xl shadow p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                  <Home className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <span className="font-bold text-gray-900">{unit.unitNo}</span>
                  {unit.floor && <span className="text-xs text-gray-400 block">الطابق {unit.floor}</span>}
                </div>
              </div>
              {getStatusBadge(unit.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">العقار:</span>
                <span className="text-gray-700">{unit.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">التفاصيل:</span>
                <span className="text-gray-700">
                  {unit.bedrooms && `${unit.bedrooms} غرف`}
                  {unit.bathrooms && ` • ${unit.bathrooms} حمام`}
                  {unit.areaSqm && ` • ${unit.areaSqm} م²`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الإيجار:</span>
                <span className="font-bold text-brand-dark">{formatSAR(unit.rentAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <select
                value={unit.status}
                onChange={(e) => handleStatusChange(unit.id, e.target.value as UnitStatus)}
                className={`text-xs font-medium rounded-lg px-2 py-1.5 border-0 ${unit.status === 'rented' ? 'bg-green-100 text-green-700' :
                  unit.status === 'vacant' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}
              >
                <option value="vacant">شاغرة</option>
                <option value="rented">مؤجرة</option>
                <option value="maintenance">صيانة</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(unit.id)}
                  className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {unit.status === 'vacant' && (
                  <Link to={`/app/contracts?unit=${unit.id}`}>
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="إنشاء عقد"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(unit.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم الوحدة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العقار</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التفاصيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإيجار</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUnits.map((unit, index) => (
                <motion.tr
                  key={unit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                        <Home className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{unit.unitNo}</span>
                        {unit.floor && <span className="text-xs text-gray-400 block">الطابق {unit.floor}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{unit.propertyName}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="text-sm">
                      {unit.bedrooms && <span>{unit.bedrooms} غرف</span>}
                      {unit.bathrooms && <span className="mr-2">• {unit.bathrooms} حمام</span>}
                      {unit.areaSqm && <span className="mr-2">• {unit.areaSqm} م²</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-dark">{formatSAR(unit.rentAmount)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={unit.status}
                      onChange={(e) => handleStatusChange(unit.id, e.target.value as UnitStatus)}
                      className={`text-xs font-medium rounded-lg px-2 py-1 border-0 ${unit.status === 'rented' ? 'bg-green-100 text-green-700' :
                        unit.status === 'vacant' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}
                    >
                      <option value="vacant">شاغرة</option>
                      <option value="rented">مؤجرة</option>
                      <option value="maintenance">صيانة</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(unit.id)}
                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {unit.status === 'vacant' && (
                        <Link to={`/app/contracts?unit=${unit.id}`}>
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="إنشاء عقد"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">لا توجد وحدات</p>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-gray-400 text-sm mt-1">جرب تغيير معايير البحث</p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {filteredUnits.length === 0 && (
        <div className="lg:hidden text-center py-12 bg-white rounded-xl shadow">
          <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">لا توجد وحدات</p>
          {(searchTerm || statusFilter !== 'all') && (
            <p className="text-gray-400 text-sm mt-1">جرب تغيير معايير البحث</p>
          )}
        </div>
      )}

      {/* Unit Modal */}
      <UnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        propertyId={propertyFilter !== 'all' ? propertyFilter : ''}
        unitId={editingUnit}
      />
    </div>
  );
}
