// WHY: The dashboard header provides top-level navigation and main actions
// WHAT: A responsive header component with branding and primary action buttons
// NOTE: Uses Lucide icons for consistent visual language across the app

import React from "react";
import { Plus, Settings } from "lucide-react";

// WHY: Components need type-safe props to prevent runtime errors
// WHAT: Defines required callback functions for user interactions
interface DashboardHeaderProps {
  onOpenSettings: () => void; // Callback for opening settings modal
  onAddEvent: () => void; // Callback for initiating new PTO request
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenSettings,
  onAddEvent,
}) => {
  // WHY: Header needs consistent spacing and alignment
  // WHAT: Uses Flexbox for responsive layout with proper spacing
  // NOTE: mb-8 provides consistent vertical rhythm with other components
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">🌴 OOOly</h1>

      {/* WHY: Action buttons need proper spacing and hover states
          WHAT: Container for action buttons with consistent spacing
          NOTE: gap-4 provides uniform spacing between buttons */}
      <div className="flex gap-4">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Settings size={20} />
          Settings
        </button>

        {/* WHY: Primary action needs visual emphasis
            NOTE: Uses blue color scheme to indicate primary action */}
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
