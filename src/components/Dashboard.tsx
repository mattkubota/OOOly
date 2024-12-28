import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, AlertCircle, Settings } from 'lucide-react';

// TimeOffSettings Component
const TimeOffSettings = ({ onSave, initialSettings }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [settings, setSettings] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Load initial settings if provided
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const validateSettings = (settings) => {
    const errors = {};
    if (settings.currentBalance < 0) errors.currentBalance = 'Balance cannot be negative';
    if (settings.accrualRate < 0) errors.accrualRate = 'Accrual rate cannot be negative';
    if (settings.hasMaxRollover && settings.maxRollover < 0) {
      errors.maxRollover = 'Rollover limit cannot be negative';
    }
    if (settings.hasMaxBalance && settings.maxBalance < 0) {
      errors.maxBalance = 'Maximum balance cannot be negative';
    }
    if (settings.hasMaxBalance && settings.hasMaxRollover && 
        settings.maxBalance < settings.maxRollover) {
      errors.maxBalance = 'Maximum balance must be greater than or equal to rollover limit';
    }
    return errors;
  };

  const handleSave = (newSettings) => {
    const errors = validateSettings(newSettings);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSave(newSettings);
  };

  if (isEditing) {
    return <SettingsForm 
      onSave={handleSave} 
      initialSettings={settings || initialSettings}
      validationErrors={validationErrors}
    />;
  }

  return null;
};

// Settings Form Component
const SettingsForm = ({ onSave, initialSettings, validationErrors }) => {
  const [formData, setFormData] = useState(initialSettings || {
    currentBalance: 0,
    accrualRate: 0,
    payPeriodType: 'biweekly',
    lastAccrualDate: new Date().toISOString().split('T')[0],
    hasMaxRollover: true,
    maxRollover: 0,
    hasMaxBalance: true,
    maxBalance: 0
  });

  const handleSaveClick = () => {
    onSave({
      ...formData,
      maxRollover: formData.hasMaxRollover ? formData.maxRollover : Infinity,
      maxBalance: formData.hasMaxBalance ? formData.maxBalance : Infinity
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Time Off Settings</h2>
        </div>

        <div>
          <label className="block mb-2">Current Balance (hours)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.currentBalance}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              currentBalance: Number(e.target.value)
            }))}
            onFocus={(e) => e.target.select()}
            className={`w-full p-2 border rounded ${
              validationErrors.currentBalance ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.currentBalance && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.currentBalance}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">Accrual Rate (hours per period)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.accrualRate}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              accrualRate: Number(e.target.value)
            }))}
            onFocus={(e) => e.target.select()}
            className={`w-full p-2 border rounded ${
              validationErrors.accrualRate ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.accrualRate && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.accrualRate}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">Pay Period Type</label>
          <select
            value={formData.payPeriodType}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              payPeriodType: e.target.value
            }))}
            className="w-full p-2 border rounded"
          >
            <option value="biweekly">Biweekly</option>
            <option value="semi-monthly">Semi-monthly</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Last Accrual Date</label>
          <input
            type="date"
            value={formData.lastAccrualDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              lastAccrualDate: e.target.value
            }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label>Maximum Rollover Hours</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!formData.hasMaxRollover}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  hasMaxRollover: !e.target.checked
                }))}
              />
              No Maximum
            </label>
          </div>
          {formData.hasMaxRollover && (
            <>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxRollover}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxRollover: Number(e.target.value)
                }))}
                onFocus={(e) => e.target.select()}
                className={`w-full p-2 border rounded ${
                  validationErrors.maxRollover ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.maxRollover && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxRollover}</p>
              )}
            </>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label>Maximum Balance</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!formData.hasMaxBalance}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  hasMaxBalance: !e.target.checked
                }))}
              />
              No Maximum
            </label>
          </div>
          {formData.hasMaxBalance && (
            <>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxBalance}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxBalance: Number(e.target.value)
                }))}
                onFocus={(e) => e.target.select()}
                className={`w-full p-2 border rounded ${
                  validationErrors.maxBalance ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.maxBalance && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxBalance}</p>
              )}
            </>
          )}
        </div>

        <button 
          onClick={handleSaveClick}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};


const STORAGE_KEY = 'timeOffSettings';

// Event Form Component
const EventForm = ({ onCancel, onSubmit, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventName, setEventName] = useState(initialData ? initialData.name : '');
  const [dates, setDates] = useState({
    startDate: initialData ? initialData.startDate : '',
    endDate: initialData ? initialData.endDate : ''
  });
  const [allDays, setAllDays] = useState(initialData ? initialData.days : []);

  const handleNextStep = () => {
    if (eventName.trim()) {
      setCurrentStep(2);
    }
  };

  const handleDateSubmit = () => {
    if (dates.startDate) {
      const start = new Date(dates.startDate);
      const end = dates.endDate ? new Date(dates.endDate) : new Date(dates.startDate);
      const current = new Date(start);

      const days = [];
      while (current <= end) {
        const isWeekend = current.getDay() === 0 || current.getDay() === 6;
        days.push({
          date: new Date(current),
          isWeekend,
          type: isWeekend ? 'weekend' : 'full'
        });
        current.setDate(current.getDate() + 1);
      }

      setAllDays(days);
      setCurrentStep(3);
    }
  };

  if (currentStep === 1) {
    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Event Name:
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter event name"
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
    const today = new Date().toISOString().split('T')[0];
    const validEndDate = dates.startDate ? dates.startDate : today;
    const isEndDateValid = !dates.endDate || dates.endDate >= dates.startDate;

    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Select Dates</h2>
        <p className="text-gray-600">Event: {eventName}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Start Date:
            </label>
            <input
              type="date"
              value={dates.startDate}
              min={today}
              onChange={(e) => {
                setDates(prev => ({
                  startDate: e.target.value,
                  endDate: prev.endDate && e.target.value > prev.endDate ? e.target.value : prev.endDate
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
              onChange={(e) => setDates(prev => ({ ...prev, endDate: e.target.value }))}
              className={`w-full p-2 border rounded ${!isEndDateValid ? 'border-red-500' : ''}`}
            />
            {!isEndDateValid && (
              <p className="text-red-500 text-sm mt-1">End date cannot be before start date</p>
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
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    const totalHours = allDays.reduce((acc, day) => {
      if (day.isWeekend || day.type === 'holiday') return acc;
      return acc + (day.type === 'full' ? 8 : 4);
    }, 0);

    return (
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Configure Days</h2>
        <p className="text-gray-600">Event: {eventName}</p>

        <div className="space-y-4">
          {allDays.map((day, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-2 rounded ${
                day.isWeekend ? 'bg-gray-100' : 
                day.type === 'holiday' ? 'bg-blue-50' : 'bg-white border'
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
                    const newDays = [...allDays];
                    newDays[index] = {
                      ...newDays[index],
                      type: e.target.value
                    };
                    setAllDays(newDays);
                  }}
                  className="ml-4 p-1 border rounded"
                >
                  <option value="full">Full Day</option>
                  <option value="half">Half Day</option>
                  <option value="holiday">Holiday</option>
                </select>
              )}
            </div>
          ))}

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-gray-700">Total PTO Hours: {totalHours}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
            >
              Back
            </button>
            <button
              onClick={() => {
                const finalEvent = {
                  name: eventName,
                  startDate: dates.startDate,
                  endDate: dates.endDate || dates.startDate,
                  days: allDays,
                  totalHours,
                  created: new Date().toISOString()
                };
                onSubmit(finalEvent);
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>
    );
  }
};

const MainDashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const addNewEvent = (event) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => 
        e.created === editingEvent.created ? { ...event, created: e.created } : e
      ));
      setEditingEvent(null);
    } else {
      setEvents(prev => [...prev, event]);
    }
    setShowEventForm(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDelete = (event) => {
    setShowDeleteConfirm(event);
  };

  const confirmDelete = () => {
    setEvents(prev => prev.filter(e => e.created !== showDeleteConfirm.created));
    setShowDeleteConfirm(null);
  };

  if (showEventForm) {
    return (
      <EventForm 
        onCancel={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }} 
        onSubmit={addNewEvent}
        initialData={editingEvent}
      />
    );
  }
  
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const calculateAvailableHours = (event) => {
    if (!settings) return null;

    let availableHours = settings.currentBalance;
    const eventStart = new Date(event.startDate);
    const today = new Date();
    
    // Calculate accruals until event start
    const payPeriodsUntilEvent = calculatePayPeriodsBetweenDates(
      today,
      eventStart,
      settings.payPeriodType
    );
    
    availableHours += (payPeriodsUntilEvent * settings.accrualRate);
    
    // Subtract hours from any events before this one
    const priorEvents = events.filter(e => new Date(e.startDate) < eventStart);
    const priorHoursUsed = priorEvents.reduce((total, e) => total + e.totalHours, 0);
    
    availableHours -= priorHoursUsed;

    return {
      availableHours,
      hasEnough: availableHours >= event.totalHours,
      shortageAmount: Math.max(0, event.totalHours - availableHours)
    };
  };

  const calculatePayPeriodsBetweenDates = (startDate, endDate, payPeriodType) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDifference = (end - start) / (1000 * 60 * 60 * 24);

    if (payPeriodType === 'biweekly') {
      return Math.floor(daysDifference / 14);
    } else {
      // Semi-monthly: Approximate by dividing total days by 15.2 (365/24)
      return Math.floor(daysDifference / 15.2);
    }
  };

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Welcome to Time Off Planner</h2>
          <p className="mb-4">Please set up your time off settings to get started.</p>
          <TimeOffSettings 
            onSave={(newSettings) => {
              setSettings(newSettings);
              setShowSettings(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <TimeOffSettings 
        initialSettings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setShowSettings(false);
        }}
      />
    );
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Time Off Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <Settings size={20} />
            Settings
          </button>
          <button
            onClick={() => setShowEventForm(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Plus size={20} />
            Plan Time Off
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="grid grid-cols-3 divide-x">
          <div className="p-4">
            <h2 className="text-gray-600 mb-2">Available Balance</h2>
            <div className="text-2xl font-bold">{settings.currentBalance} hours</div>
          </div>
          <div className="p-4">
            <h2 className="text-gray-600 mb-2">Accrual Rate</h2>
            <div className="text-2xl font-bold">{settings.accrualRate} hours</div>
            <div className="text-sm text-gray-500">per {settings.payPeriodType} period</div>
          </div>
          <div className="p-4">
            <h2 className="text-gray-600 mb-2">Next Accrual</h2>
            <div className="text-2xl font-bold">
              {calculateNextAccrualDate(settings.lastAccrualDate, settings.payPeriodType)
                .toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Upcoming Time Off</h2>
        </div>
        
        {sortedEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No upcoming time off planned</p>
            <button
              onClick={() => setShowEventForm(true)}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Plan your first time off
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {sortedEvents.map((event, index) => {
              const availability = calculateAvailableHours(event);
              
              return (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      <p className="text-gray-600">
                        {formatDate(event.startDate)} 
                        {event.endDate !== event.startDate && 
                          ` - ${formatDate(event.endDate)}`}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm
                        ${availability.hasEnough 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                      >
                        {event.totalHours} hours
                      </span>
                      {!availability.hasEnough && (
                        <div className="text-red-600 text-sm">
                          Shortage: {availability.shortageAmount.toFixed(1)} hours
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>
                        {event.days.filter(d => !d.isWeekend && d.type !== 'holiday').length} work days
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(event)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warnings Section */}
      {settings.hasMaxRollover && settings.currentBalance > (settings.maxRollover * 0.8) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-800">Approaching Rollover Limit</h3>
              <p className="text-yellow-700">
                You have {settings.currentBalance} hours of time off.
                The maximum rollover is {settings.maxRollover} hours.
                Consider planning some time off to avoid losing hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate next accrual date
const calculateNextAccrualDate = (lastAccrualDate, payPeriodType) => {
  const lastAccrual = new Date(lastAccrualDate);
  const nextAccrual = new Date(lastAccrual);
  
  if (payPeriodType === 'biweekly') {
    nextAccrual.setDate(lastAccrual.getDate() + 14);
  } else {
    // Semi-monthly: 1st and 15th of each month
    if (lastAccrual.getDate() < 15) {
      nextAccrual.setDate(15);
    } else {
      nextAccrual.setDate(1);
      nextAccrual.setMonth(nextAccrual.getMonth() + 1);
    }
  }
  return nextAccrual;
};

// Helper function to format dates
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default MainDashboard;