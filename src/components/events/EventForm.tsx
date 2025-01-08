import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { PTOEvent, PTODay, DayType } from "../../types";
import {
  toDateString,
  getTodayString,
  formatDate,
  isWeekend,
} from "../../utils/dateCalculations";

interface EventFormProps {
  onSubmit: (event: PTOEvent) => void;
  onCancel: () => void;
  initialEvent?: PTOEvent;
  existingEvents: PTOEvent[];
  startAtDateStep?: boolean; // New prop to control initial step
  isOpen: boolean; // New prop to control modal visibility
}

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onCancel,
  initialEvent,
  existingEvents = [],
  startAtDateStep = false,
  isOpen,
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState(startAtDateStep ? 2 : 1);
  const [eventName, setEventName] = useState(initialEvent?.name || "");
  const [dates, setDates] = useState({
    startDate: initialEvent?.startDate || "",
    endDate: initialEvent?.endDate || "",
  });
  const [days, setDays] = useState<PTODay[]>(initialEvent?.days || []);

  // Reset form state when initialEvent changes or form opens
  useEffect(() => {
    if (isOpen) {
      setEventName(initialEvent?.name || "");
      setDates({
        startDate: initialEvent?.startDate || "",
        endDate: initialEvent?.endDate || "",
      });
      setDays(initialEvent?.days || []);
      setCurrentStep(startAtDateStep ? 2 : 1);
    }
  }, [initialEvent, isOpen, startAtDateStep]);

  const dayTypeLabels: Record<DayType, string> = {
    full: "Full Day",
    half: "Half Day",
    holiday: "Holiday",
  };

  const handleNextStep = () => {
    if (eventName.trim()) {
      setCurrentStep(2);
    }
  };

  const checkOverlap = (newEvent: PTOEvent, existingEvents: PTOEvent[]) => {
    const start = new Date(newEvent.startDate);
    const end = new Date(newEvent.endDate || newEvent.startDate);

    return existingEvents.some((event) => {
      if (event.created === initialEvent?.created) return false;
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate || event.startDate);
      return (
        (start >= eventStart && start <= eventEnd) ||
        (end >= eventStart && end <= eventEnd) ||
        (start <= eventStart && end >= eventEnd)
      );
    });
  };

  const handleDateSubmit = () => {
    if (dates.startDate) {
      const potentialEvent = {
        name: eventName,
        startDate: dates.startDate,
        endDate: dates.endDate || dates.startDate,
        days: [],
        totalHours: 0,
        created: initialEvent?.created || getTodayString(),
      };

      if (checkOverlap(potentialEvent, existingEvents)) {
        alert(
          "These dates overlap with an existing event. Please choose different dates."
        );
        return;
      }

      const start = new Date(dates.startDate);
      const end = dates.endDate ? new Date(dates.endDate) : start;
      const newDays: PTODay[] = [];

      const current = new Date(start);
      while (current <= end) {
        const currentDateString = toDateString(current);
        const dayIsWeekend = isWeekend(currentDateString);
        newDays.push({
          date: currentDateString,
          type: "full",
          isWeekend: dayIsWeekend,
        });
        current.setDate(current.getDate() + 1);
      }

      setDays(newDays);
      setCurrentStep(3);
    }
  };

  const calculateTotalHours = () => {
    return days.reduce((total, day) => {
      if (day.isWeekend || day.type === "holiday") return total;
      return total + (day.type === "full" ? 8 : 4);
    }, 0);
  };

  const handleSubmitEvent = () => {
    const event: PTOEvent = {
      name: eventName,
      startDate: dates.startDate,
      endDate: dates.endDate || dates.startDate,
      days,
      totalHours: calculateTotalHours(),
      created: initialEvent?.created || getTodayString(),
    };
    onSubmit(event);
  };

  // Modal wrapper component
  const FormWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );

  if (!isOpen) return null;

  // Render appropriate step content
  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <div className="p-6 max-w-sm mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Plan Time Off</h2>
          </div>

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

    if (currentStep === 2) {
      const today = getTodayString();
      const validEndDate = dates.startDate ? dates.startDate : today;
      const isEndDateValid = !dates.endDate || dates.endDate >= dates.startDate;

      return (
        <div className="p-6 max-w-sm mx-auto space-y-4">
          <h2 className="text-xl font-semibold">Select Dates</h2>
          <p className="text-gray-600">{eventName}</p>

          <div className="space-y-4">
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

    return (
      <div className="p-6 max-w-sm mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Configure Days</h2>
        <p className="text-gray-600">{eventName}</p>

        <div className="space-y-4">
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
                <span>{formatDate(day.date)}</span>
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

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-gray-700">
              Total PTO Hours: {calculateTotalHours()}
            </p>
          </div>

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

  return <FormWrapper>{renderContent()}</FormWrapper>;
};
