import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, Wrench } from 'lucide-react';
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
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const getStatusIcon = (status: MaintenanceStatus) => {
    const icons = {
      new: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      in_progress: <Clock className="w-4 h-4 text-blue-500" />,
      done: <CheckCircle className="w-4 h-4 text-green-500" />,
      canceled: <XCircle className="w-4 h-4 text-gray-400" />,
    };
    return icons[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-gray-600">
            إدارة ومتابعة طلبات الصيانة ({maintenanceRequests.length} طلب)
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingTicket(null);
            setIsModalOpen(true);
          }}
          variant="gradient"
          className="mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5 ml-2" />
          طلب صيانة جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-dark">{stats.new}</p>
              <p className="text-sm text-gray-500">جديدة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-dark">{stats.in_progress}</p>
              <p className="text-sm text-gray-500">قيد التنفيذ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-dark">{stats.done}</p>
              <p className="text-sm text-gray-500">مكتملة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-dark">{formatSAR(stats.totalCost)}</p>
              <p className="text-sm text-gray-500">إجمالي التكلفة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'new', 'in_progress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-all ${statusFilter === status
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
          <div className="flex gap-2">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-all ${priorityFilter === priority
                  ? 'bg-brand-dark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {priority === 'all' ? 'كل الأولويات' :
                  priority === 'urgent' ? 'عاجل' :
                    priority === 'high' ? 'مرتفع' :
                      priority === 'medium' ? 'متوسط' : 'منخفض'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`bg-white rounded-xl shadow-lg p-5 border-r-4 ${request.priority === 'urgent' ? 'border-red-500' :
              request.priority === 'high' ? 'border-orange-500' :
                request.priority === 'medium' ? 'border-amber-500' : 'border-gray-300'
              }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(request.status)}
                  <h3 className="font-bold text-brand-dark">{request.title}</h3>
                  {getPriorityBadge(request.priority)}
                </div>
                <p className="text-sm text-gray-500 mb-2">{request.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{request.propertyName}</span>
                  {request.unitNo && <span>• وحدة {request.unitNo}</span>}
                  <span>• {formatRelative(request.createdAt)}</span>
                  {request.assignedTo && <span>• المسؤول: {request.assignedTo}</span>}
                </div>
              </div>

              {/* Cost & Actions */}
              <div className="flex items-center gap-4">
                {request.cost > 0 && (
                  <div className="text-left">
                    <p className="text-xs text-gray-400">التكلفة</p>
                    <p className="font-bold text-brand-dark">{formatSAR(request.cost)}</p>
                  </div>
                )}

                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(request.id, e.target.value as MaintenanceStatus)}
                  className="text-sm rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
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
                >
                  تعديل
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">لا توجد طلبات صيانة</p>
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
