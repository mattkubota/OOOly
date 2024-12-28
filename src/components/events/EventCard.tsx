import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { PTOEvent } from '../../types';

interface EventCardProps {
  event: PTOEvent;
  onEdit?: (event: PTOEvent) => void;
  onDelete?: (event: PTOEvent) => void;
  balanceValidation: {
    availableHours: number;
    hasEnough: boolean;
    difference: number;
  };
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  balanceValidation
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const workDays = event.days.filter(d => !d.isWeekend && d.type !== 'holiday').length;

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{event.name}</h3>
          <p className="text-gray-600">
            {formatDate(event.startDate)}
            {event.endDate !== event.startDate && 
              ` - ${formatDate(event.endDate)}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {event.totalHours} hours
          </span>
          <div className="flex gap-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(event)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(event)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>{workDays} work days</span>
        </div>

        <div className="flex items-center gap-3">
          {balanceValidation.hasEnough ? (
            <>
              <CheckCircle className="text-green-500" size={18} />
              <span className="text-sm text-green-600">
                {balanceValidation.difference.toFixed(1)} hours remaining
              </span>
            </>
          ) : (
            <>
              <XCircle className="text-red-500" size={18} />
              <span className="text-sm text-red-600">
                {Math.abs(balanceValidation.difference).toFixed(1)} hours short
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};