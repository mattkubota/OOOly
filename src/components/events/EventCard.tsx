// WHY: PTO events need a clear, scannable display that shows key information and status
// WHAT: A card component that shows event details, actions, and balance validation
// NOTE: Uses a combination of icons and color-coding for quick visual understanding

import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { PTOEvent } from "../../types";

interface EventCardProps {
  event: PTOEvent; // The PTO event to display
  onEdit?: (event: PTOEvent) => void; // Optional edit callback
  onDelete?: (event: PTOEvent) => void; // Optional delete callback
  balanceValidation: {
    // Validation results for event hours
    availableHours: number; // Hours available when event starts
    hasEnough: boolean; // Whether there are sufficient hours
    difference: number; // Surplus or deficit of hours
  };
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  balanceValidation,
}) => {
  // WHY: Need consistent date formatting that handles timezone differences
  // WHAT: Formats dates while accounting for timezone offsets
  // NOTE: Adjusts for timezone to prevent off-by-one day errors
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString();
  };

  // WHY: Need to show total working days excluding weekends and holidays
  // WHAT: Calculates effective work days accounting for half days
  const workDayCount = event.days
    .filter((d) => !d.isWeekend && d.type !== "holiday")
    .reduce((total, day) => total + (day.type === "half" ? 0.5 : 1), 0);

  // WHY: Numbers need grammatically correct labels
  // WHAT: Handles singular/plural forms of words
  const pluralize = (num: number, word: string) =>
    `${num} ${word}${num === 1 ? "" : "s"}`;

  return (
    <div className="p-4 hover:bg-gray-50">
      {/* WHY: Event header needs to show key info and actions
          WHAT: Displays event name, dates, and action buttons */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{event.name}</h3>
          <p className="text-gray-600">
            {formatDate(event.startDate)}
            {event.endDate !== event.startDate &&
              ` - ${formatDate(event.endDate)}`}
          </p>
        </div>

        {/* WHY: Actions need to be easily accessible but not prominent
            WHAT: Right-aligned action buttons with appropriate colors */}
        <div className="flex items-center gap-4">
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

      {/* WHY: Event details and status need clear visual hierarchy
          WHAT: Shows duration and validation status with icons */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>
            {pluralize(workDayCount, "day")} (
            {pluralize(event.totalHours, "hour")})
          </span>
        </div>

        {/* WHY: Balance status needs clear visual feedback
            WHAT: Shows success/error state with appropriate icons and colors */}
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
