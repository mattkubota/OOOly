// WHY: Complex PTO requests need a guided, multi-step process for better UX
// WHAT: A step-by-step form component for creating/editing PTO events
// NOTE: Uses a three-step wizard: name → dates → day configuration

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { PTOEvent, PTODay, DayType } from "../../types";
import { isWeekend } from "../../utils/dateCalculations";

// WHY: Component needs type-safe props to handle both creation and editing
interface EventFormProps {
  onSubmit: (event: PTOEvent) => void; // Handler for form submission
  onCancel: () => void; // Handler for cancellation
  initialEvent?: PTOEvent; // Optional event for edit mode
  existingEvents: PTOEvent[]; // For overlap detection
}

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onCancel,
  initialEvent,
  existingEvents = [],
}) => {
  // WHY: Multi-step form needs state management for each step
  // NOTE: Each state corresponds to a specific form step
  const [currentStep, setCurrentStep] = useState(1);
  const [eventName, setEventName] = useState(initialEvent?.name || "");
  const [dates, setDates] = useState({
    startDate: initialEvent?.startDate || "",
    endDate: initialEvent?.endDate || "",
  });
  const [days, setDays] = useState<PTODay[]>(initialEvent?.days || []);

  // WHY: Day types need user-friendly labels for the UI
  // NOTE: Maps technical types to display-friendly strings
  const dayTypeLabels: Record<DayType, string> = {
    full: "Full Day",
    half: "Half Day",
    holiday: "Holiday",
    weekend: "Weekend",
  };

  // WHY: Need validation before proceeding to next step
  // WHAT: Ensures event name is provided before date selection
  const handleNextStep = () => {
    if (eventName.trim()) {
      setCurrentStep(2);
    }
  };

  // WHY: Need to prevent scheduling conflicts between events
  // WHAT: Checks if a new/edited event overlaps with existing events
  // NOTE: Excludes the current event when editing
  const checkOverlap = (newEvent: PTOEvent, existingEvents: PTOEvent[]) => {
    const startDate = new Date(newEvent.startDate);
    const endDate = new Date(newEvent.endDate || newEvent.startDate);

    return existingEvents.some((event) => {
      if (event.created === initialEvent?.created) return false;
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate || event.startDate);
      return (
        (startDate >= eventStart && startDate <= eventEnd) ||
        (endDate >= eventStart && endDate <= eventEnd) ||
        (startDate <= eventStart && endDate >= eventEnd)
      );
    });
  };

  // WHY: Need to handle date selection and generate day entries
  // WHAT: Validates dates and creates initial day configurations
  // NOTE: Handles both single-day and multi-day events
  const handleDateSubmit = () => {
    if (dates.startDate) {
      const potentialEvent = {
        name: eventName,
        startDate: dates.startDate,
        endDate: dates.endDate || dates.startDate,
        days: [],
        totalHours: 0,
        created: initialEvent?.created || new Date().toISOString(),
      };

      // WHY: Prevent double-booking time off
      if (checkOverlap(potentialEvent, existingEvents)) {
        alert(
          "These dates overlap with an existing event. Please choose different dates."
        );
        return;
      }

      // WHY: Need precise date handling for correct day generation
      // NOTE: Explicitly handle month index (0-based in JS)
      const [year, month, day] = dates.startDate.split("-").map(Number);
      const start = new Date(year, month - 1, day);

      const end = dates.endDate
        ? (() => {
            const [endYear, endMonth, endDay] = dates.endDate
              .split("-")
              .map(Number);
            return new Date(endYear, endMonth - 1, endDay);
          })()
        : start;

      // WHY: Need to generate day entries for the entire date range
      // WHAT: Creates a PTODay entry for each day in the range
      const newDays: PTODay[] = [];
      const current = new Date(start);

      while (current <= end) {
        const dayIsWeekend = isWeekend(current);
        newDays.push({
          date: new Date(current),
          type: dayIsWeekend ? "weekend" : "full",
          isWeekend: dayIsWeekend,
        });

        current.setDate(current.getDate() + 1);
      }

      setDays(newDays);
      setCurrentStep(3);
    }
  };

  // WHY: Need to accurately calculate PTO hours based on day types
  // WHAT: Sums hours for non-weekend, non-holiday days
  // NOTE: Adjusts for timezone to ensure consistent date handling
  const calculateTotalHours = () => {
    return days.reduce((total, day) => {
      if (day.isWeekend || day.type === "holiday") return total;
      const adjustedDate = new Date(day.date);
      adjustedDate.setMinutes(
        adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset()
      );
      return total + (day.type === "full" ? 8 : 4);
    }, 0);
  };

  // WHY: Need to compile all form data for submission
  // WHAT: Creates final PTO event object with all required fields
  // NOTE: Preserves created timestamp when editing existing events
  const handleSubmitEvent = () => {
    const event: PTOEvent = {
      name: eventName,
      startDate: dates.startDate,
      endDate: dates.endDate || dates.startDate,
      days,
      totalHours: calculateTotalHours(),
      created: initialEvent?.created || new Date().toISOString(),
    };
    onSubmit(event);
  };

  // WHY: Form needs different views for each step
  // WHAT: Step 1 - Event name input
  if (currentStep === 1) {
    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
        {/* WHY: Header needs visual indicator of purpose */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Plan OOO</h2>
        </div>

        {/* WHY: Event name input needs clear labeling and validation */}
        <div>
          <label className="block text-gray-700 mb-2">Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Vacation, Appointment, etc."
          />
        </div>

        {/* WHY: Navigation needs clear actions with visual hierarchy */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleNextStep}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }

  // WHY: Date selection needs validation and range support
  // WHAT: Step 2 - Date range selection with validation
  if (currentStep === 2) {
    const today = new Date().toISOString().split("T")[0];
    const validEndDate = dates.startDate ? dates.startDate : today;
    const isEndDateValid = !dates.endDate || dates.endDate >= dates.startDate;

    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Select Dates</h2>
        <p className="text-gray-600">{eventName}</p>

        <div className="space-y-4">
          {/* WHY: Start date needs min-date validation */}
          <div>
            <label className="block text-gray-700 mb-2">Start Date:</label>
            <input
              type="date"
              value={dates.startDate}
              min={today}
              onChange={(e) => {
                setDates((prev) => ({
                  startDate: e.target.value,
                  endDate:
                    prev.endDate && e.target.value > prev.endDate
                      ? e.target.value
                      : prev.endDate,
                }));
              }}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* WHY: End date input needs validation against start date */}
          <div>
            <label className="block text-gray-700 mb-2">
              End Date (Optional):
            </label>
            <input
              type="date"
              value={dates.endDate}
              min={validEndDate}
              onChange={(e) =>
                setDates((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className={`w-full p-2 border rounded ${
                !isEndDateValid ? "border-red-500" : ""
              }`}
            />
            {!isEndDateValid && (
              <p className="text-red-500 text-sm mt-1">
                End date cannot be before start date
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
            >
              Back
            </button>
            <button
              onClick={handleDateSubmit}
              disabled={!isEndDateValid}
              className={`flex-1 p-2 rounded text-white ${
                isEndDateValid
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WHY: Final step needs day-by-day configuration
  // WHAT: Step 3 - Configure individual days and show total hours
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-semibold">Configure Days</h2>
      <p className="text-gray-600">{eventName}</p>

      <div className="space-y-4">
        {/* WHY: Each day needs individual configuration options
            NOTE: Different styling for weekends vs workdays */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded ${
              day.isWeekend
                ? "bg-gray-100"
                : day.type === "holiday"
                ? "bg-blue-50"
                : "bg-white border"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{day.date.toLocaleDateString()}</span>
              {day.isWeekend && (
                <span className="text-sm px-2 py-1 bg-gray-200 rounded text-gray-600">
                  Weekend
                </span>
              )}
            </span>
            {!day.isWeekend && (
              <select
                value={day.type}
                onChange={(e) => {
                  const newDays = [...days];
                  newDays[index].type = e.target.value as DayType;
                  setDays(newDays);
                }}
                className="ml-4 p-1 border rounded"
              >
                {(Object.keys(dayTypeLabels) as DayType[]).map((type) => (
                  <option key={type} value={type}>
                    {dayTypeLabels[type]}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* WHY: Users need to see total PTO hours being requested */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-gray-700">
            Total PTO Hours: {calculateTotalHours()}
          </p>
        </div>

        {/* WHY: Final step needs clear submission action */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Back
          </button>
          <button
            onClick={handleSubmitEvent}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded"
          >
            {initialEvent ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};
