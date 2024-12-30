import React from 'react';
import { Plus, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  onOpenSettings: () => void;
  onAddEvent: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenSettings,
  onAddEvent
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">OOOly</h1>
      <div className="flex gap-4">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Settings size={20} />
          Settings
        </button>
        <button
          onClick={onAddEvent}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus size={20} />
          Plan OOO
        </button>
      </div>
    </div>
  );
};