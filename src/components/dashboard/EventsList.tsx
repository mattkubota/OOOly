// WHY: Users need to see and manage their planned PTO events
// WHAT: Displays a list of PTO events with edit/delete capabilities
// NOTE: Includes empty state handling and delete confirmation

import React, { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { PTOEvent, PTOSettings } from "../../types";
import { EventCard } from "../events/EventCard";
import { validateEventBalance } from "../../utils/ptoValidations";

interface EventsListProps {
  events: PTOEvent[]; // List of PTO events to display
  settings: PTOSettings; // Current PTO settings for validation
  onAddFirst: () => void; // Callback for empty state CTA
  onEdit: (event: PTOEvent) => void; // Edit event callback
  onDelete: (event: PTOEvent) => void; // Delete event callback
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  settings,
  onAddFirst,
  onEdit,
  onDelete,
}) => {
  // WHY: Delete operations need confirmation to prevent accidents
  // WHAT: Tracks which event is being considered for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<PTOEvent | null>(
    null
  );

  // WHY: Two-step delete process for safety
  // WHAT: Opens confirmation modal before actual deletion
  const handleDelete = (event: PTOEvent) => {
    setShowDeleteConfirm(event);
  };

  // WHY: Need to close modal and notify parent of deletion
  // WHAT: Handles confirmed deletion and cleanup
  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDelete(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  // WHY: Empty state needs clear call-to-action
  // WHAT: Shows friendly empty state with action button
  // NOTE: Uses Calendar icon to reinforce purpose
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        {/* Component structure continues... */}
      </div>
    );
  }

  // WHY: Events need to be easily scannable and actionable
  // WHAT: Lists events with consistent styling and clear actions
  // NOTE: Uses divide-y for visual separation between events
  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Component structure continues... */}
      </div>

      {/* WHY: Delete confirmation needs to be prominent but not jarring
          WHAT: Modal dialog with clear warning and action buttons
          NOTE: Uses overlay to create modal focus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          {/* Modal content continues... */}
        </div>
      )}
    </>
  );
};
