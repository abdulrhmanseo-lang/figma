import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, Wrench, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

import { toast } from 'sonner';
import { formatSAR, formatRelative } from '../lib/format';
import type { MaintenanceStatus, MaintenancePriority } from '../types/database';

export function Maintenance() {
  const { maintenanceRequests, updateMaintenanceRequest, deleteMaintenanceRequest, properties } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'all'>('all');

  // Stats
  const stats = useMemo(() => ({
    new: maintenanceRequests.filter(m => m.status === 'new').length,
    in_progress: maintenanceRequests.filter(m => m.status === 'in_progress').length,
    done: maintenanceRequests.filter(m => m.status === 'done').length,
    totalCost: maintenanceRequests.reduce((s, m) => s + m.cost, 0),
  }), [maintenanceRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return maintenanceRequests
      .filter(m => {
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || m.priority === priorityFilter;
        return matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // Sort by priority then by date
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [maintenanceRequests, statusFilter, priorityFilter]);

  const handleStatusChange = (id: string, newStatus: MaintenanceStatus) => {
    updateMaintenanceRequest(id, { status: newStatus });
    toast.success(newStatus === 'done' ? 'تم إتمام طلب الصيانة' : 'تم تحديث الحالة');
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    const badges = {
      urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'عاجل' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'مرتفع' },
      medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'متوسط' },
      low: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'منخفض' },
    };
    const badge = badges[priority];
    return <span className={`px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const getStatusIcon = (status: MaintenanceStatus) => {
    const icons = {
      new: <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-500" />,
      in_progress: <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-500" />,
      done: <CheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-500" />,
      canceled: <XCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400" />,
    };
    return icons[status];
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm lg:text-base text-gray-600">
            إدارة ومتابعة طلبات الصيانة ({maintenanceRequests.length} طلب)
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingTicket(null);
            setIsModalOpen(true);
          }}
          variant="gradient"
          className="w-full sm:w-auto text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
          طلب صيانة جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="bg-white rounded-xl shadow p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-brand-dark">{stats.new}</p>
              <p className="text-xs lg:text-sm text-gray-500">جديدة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-brand-dark">{stats.in_progress}</p>
              <p className="text-xs lg:text-sm text-gray-500">قيد التنفيذ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-brand-dark">{stats.done}</p>
              <p className="text-xs lg:text-sm text-gray-500">مكتملة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm lg:text-lg font-bold text-brand-dark">{formatSAR(stats.totalCost)}</p>
              <p className="text-xs lg:text-sm text-gray-500">إجمالي التكلفة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-3 lg:p-4">
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
          {/* Status Filter */}
          <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-1">
            {(['all', 'new', 'in_progress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 min-w-fit py-2 px-2 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${statusFilter === status
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? 'الكل' :
                  status === 'new' ? 'جديدة' :
                    status === 'in_progress' ? 'قيد التنفيذ' : 'مكتملة'}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-1">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`flex-1 min-w-fit py-2 px-2 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${priorityFilter === priority
                  ? 'bg-brand-dark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {priority === 'all' ? 'الأولويات' :
                  priority === 'urgent' ? 'عاجل' :
                    priority === 'high' ? 'مرتفع' :
                      priority === 'medium' ? 'متوسط' : 'منخفض'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3 lg:space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`bg-white rounded-xl shadow-lg p-3 lg:p-5 border-r-4 ${request.priority === 'urgent' ? 'border-red-500' :
              request.priority === 'high' ? 'border-orange-500' :
                request.priority === 'medium' ? 'border-amber-500' : 'border-gray-300'
              }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 lg:gap-3 mb-2">
                  {getStatusIcon(request.status)}
                  <h3 className="font-bold text-brand-dark text-sm lg:text-base">{request.title}</h3>
                  {getPriorityBadge(request.priority)}
                </div>
                <p className="text-xs lg:text-sm text-gray-500 mb-2 line-clamp-2">{request.description}</p>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-[10px] lg:text-xs text-gray-400">
                  <span>{request.propertyName}</span>
                  {request.unitNo && <span>• وحدة {request.unitNo}</span>}
                  <span>• {formatRelative(request.createdAt)}</span>
                  {request.assignedTo && <span className="hidden sm:inline">• المسؤول: {request.assignedTo}</span>}
                </div>
              </div>

              {/* Cost & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-4 pt-3 lg:pt-0 border-t lg:border-0 border-gray-100">
                {request.cost > 0 && (
                  <div className="text-right lg:text-left">
                    <p className="text-[10px] lg:text-xs text-gray-400">التكلفة</p>
                    <p className="font-bold text-brand-dark text-sm lg:text-base">{formatSAR(request.cost)}</p>
                  </div>
                )}

                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(request.id, e.target.value as MaintenanceStatus)}
                  className="text-xs lg:text-sm rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  <option value="new">جديد</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="done">مكتمل</option>
                  <option value="canceled">ملغي</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingTicket(request.id);
                    setIsModalOpen(true);
                  }}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  <Edit className="w-3 h-3 lg:w-4 lg:h-4 lg:ml-1" />
                  <span className="hidden lg:inline">تعديل</span>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 text-center">
          <Wrench className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm lg:text-base text-gray-500">لا توجد طلبات صيانة</p>
        </div>
      )}

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTicket(null);
        }}
        ticketId={editingTicket}
      />
    </div>
  );
}
