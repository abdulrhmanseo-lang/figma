import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MaintenanceTicketCard } from '../components/MaintenanceTicketCard';
import { MaintenanceModal } from '../components/MaintenanceModal';

export function Maintenance() {
  const { maintenanceTickets } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);

  const columns = [
    { id: 'pending', title: 'معلّقة', color: 'from-yellow-400 to-orange-400' },
    { id: 'in-progress', title: 'جارية', color: 'from-blue-400 to-cyan-400' },
    { id: 'completed', title: 'مكتملة', color: 'from-green-400 to-emerald-400' },
    { id: 'overdue', title: 'متأخرة', color: 'from-red-400 to-pink-400' },
  ];

  const getTicketsForStatus = (status: string) => {
    return maintenanceTickets.filter(t => t.status === status);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A2A43' }}>
            الصيانة
          </h1>
          <p className="text-gray-600">
            إدارة طلبات الصيانة والمتابعة
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingTicket(null);
            setIsModalOpen(true);
          }}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>طلب صيانة جديد</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {columns.map(column => (
          <div key={column.id} className="bg-white rounded-xl shadow-lg p-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${column.color} mb-2`} />
            <p className="text-sm text-gray-600 mb-1">{column.title}</p>
            <p className="text-2xl font-bold" style={{ color: '#0A2A43' }}>
              {getTicketsForStatus(column.id).length}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${column.color}`} />
              <h3 className="font-bold" style={{ color: '#0A2A43' }}>
                {column.title}
              </h3>
              <span className="mr-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {getTicketsForStatus(column.id).length}
              </span>
            </div>

            <div className="space-y-3">
              {getTicketsForStatus(column.id).map(ticket => (
                <MaintenanceTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onEdit={() => {
                    setEditingTicket(ticket.id);
                    setIsModalOpen(true);
                  }}
                />
              ))}

              {getTicketsForStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  لا توجد مهام
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
