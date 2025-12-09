import { Building2, AlertCircle, Clock } from 'lucide-react';
import { MaintenanceTicket } from '../context/DataContext';

interface MaintenanceTicketCardProps {
  ticket: MaintenanceTicket;
  onEdit: () => void;
}

export function MaintenanceTicketCard({ ticket, onEdit }: MaintenanceTicketCardProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={onEdit}
      className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
          {ticket.priority === 'high' ? 'عاجل' : ticket.priority === 'medium' ? 'متوسط' : 'عادي'}
        </span>
        <AlertCircle className="w-4 h-4 text-gray-400" />
      </div>

      <h4 className="font-bold mb-2" style={{ color: '#0A2A43' }}>
        {ticket.title}
      </h4>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {ticket.description}
      </p>

      <div className="space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Building2 className="w-3 h-3" />
          <span>{ticket.propertyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{new Date(ticket.createdDate).toLocaleDateString('ar-SA')}</span>
        </div>
        {ticket.assignedTo && (
          <div className="text-blue-600 font-medium">
            المسؤول: {ticket.assignedTo}
          </div>
        )}
      </div>

      {ticket.images.length > 0 && (
        <div className="mt-3 flex gap-1">
          {ticket.images.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="صورة"
              className="w-12 h-12 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
