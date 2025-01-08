import React, { useState, useRef, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Pencil } from "lucide-react";
import { PTOEvent } from "../../types";
import { formatDate } from "../../utils/dateCalculations";

interface EventCardProps {
  event: PTOEvent;
  onDelete?: (event: PTOEvent) => void;
  onEditName: (event: PTOEvent, newName: string) => void;
  onEditDates: (event: PTOEvent) => void;
  balanceValidation: {
    availableHours: number;
    hasEnough: boolean;
    difference: number;
  };
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onDelete,
  onEditName,
  onEditDates,
  balanceValidation,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(event.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle name edit submission
  const handleNameSubmit = () => {
    if (newName.trim() !== "") {
      onEditName(event, newName.trim());
      setIsEditingName(false);
    }
  };

  // Handle keyboard events for name editing
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setNewName(event.name);
      setIsEditingName(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const workDayCount = event.days
    .filter((d) => !d.isWeekend && d.type !== "holiday")
    .reduce((total, day) => total + (day.type === "half" ? 0.5 : 1), 0);

  const pluralize = (num: number, word: string) =>
    `${num} ${word}${num === 1 ? "" : "s"}`;

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {/* Editable event name */}
          <div className="group relative">
            {isEditingName ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="w-full font-semibold bg-white border-b border-blue-500 focus:outline-none"
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center cursor-pointer"
              >
                <h3 className="font-semibold">{event.name}</h3>
                <Pencil
                  size={14}
                  className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400"
                />
              </div>
            )}
          </div>

          {/* Editable date range */}
          <div
            onClick={() => onEditDates(event)}
            className="group relative cursor-pointer mt-1"
          >
            <p className="text-gray-600">
              {formatDate(event.startDate)}
              {event.endDate !== event.startDate &&
                ` - ${formatDate(event.endDate)}`}
            </p>
            <Pencil
              size={14}
              className="absolute -right-5 top-1 opacity-0 group-hover:opacity-100 text-gray-400"
            />
          </div>
        </div>

        {/* Delete button */}
        <div className="flex items-center">
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

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>
            {pluralize(workDayCount, "day")} (
            {pluralize(event.totalHours, "hour")})
          </span>
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
