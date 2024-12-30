import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { PTOEvent, PTOSettings } from '../../types';
import { EventCard } from '../events/EventCard';
import { validateEventBalance } from '../../utils/ptoValidations';

interface EventsListProps {
  events: PTOEvent[];
  settings: PTOSettings;
  onAddFirst: () => void;
  onEdit: (event: PTOEvent) => void;
  onDelete: (event: PTOEvent) => void;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  settings,
  onAddFirst,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<PTOEvent | null>(null);

  const handleDelete = (event: PTOEvent) => {
    setShowDeleteConfirm(event);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDelete(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Upcoming OOO</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No upcoming OOO planned</p>
          <button
            onClick={onAddFirst}
            className="mt-4 text-blue-500 hover:text-blue-600"
          >
            Plan your first OOO
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Upcoming OOO</h2>
        </div>
        <div className="divide-y">
          {events.map((event) => (
            <EventCard 
              key={event.created}
              event={event}
              onEdit={() => onEdit(event)}
              onDelete={() => handleDelete(event)}
              balanceValidation={validateEventBalance(event, settings, events)}
            />
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex gap-2 items-start text-red-600 mb-4">
              <AlertCircle />
              <div>
                <h3 className="font-semibold mb-2">Delete OOO Event</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete "{showDeleteConfirm.name}"? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};