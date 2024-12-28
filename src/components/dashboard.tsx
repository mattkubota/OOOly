import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, AlertCircle, Settings } from 'lucide-react';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [settings, setSettings] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('timeOffSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const calculateNextAccrualDate = (lastAccrualDate, payPeriodType) => {
    const lastAccrual = new Date(lastAccrualDate);
    const nextAccrual = new Date(lastAccrual);

    if (payPeriodType === 'biweekly') {
      nextAccrual.setDate(lastAccrual.getDate() + 14);
    } else {
      if (lastAccrual.getDate() < 15) {
        nextAccrual.setDate(15);
      } else {
        nextAccrual.setDate(1);
        nextAccrual.setMonth(nextAccrual.getMonth() + 1);
      }
    }
    return nextAccrual;
  };

  const SettingsForm = ({ onSave, initialSettings }) => {
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Time Off Settings</h2>
          </div>

          <div className="space-y-4">
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
                className="w-full p-2 border rounded"
              />
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
                className="w-full p-2 border rounded"
              />
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
                <label>
                  <input
                    type="checkbox"
                    checked={!formData.hasMaxRollover}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      hasMaxRollover: !e.target.checked
                    }))}
                  />
                  {' '}No Maximum
                </label>
              </div>
              {formData.hasMaxRollover && (
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
                  className="w-full p-2 border rounded"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label>Maximum Balance</label>
                <label>
                  <input
                    type="checkbox"
                    checked={!formData.hasMaxBalance}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      hasMaxBalance: !e.target.checked
                    }))}
                  />
                  {' '}No Maximum
                </label>
              </div>
              {formData.hasMaxBalance && (
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
                  className="w-full p-2 border rounded"
                />
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
      </div>
    );
  };

  if (showSettings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Welcome to Time Off Planner</h2>
          <p className="mb-4">Please set up your time off settings to get started.</p>
          <SettingsForm 
            onSave={(newSettings) => {
              setSettings(newSettings);
              localStorage.setItem('timeOffSettings', JSON.stringify(newSettings));
            }}
          />
        </div>
      </div>
    );
  }

  const EventForm = ({ onCancel }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [eventName, setEventName] = useState('');
    const [dates, setDates] = useState({
      startDate: '',
      endDate: ''
    });

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Plan Time Off</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Vacation, Doctor's Appointment, etc."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showEventForm) {
    return <EventForm onCancel={() => setShowEventForm(false)} />;
  }
    return (
      <SettingsForm 
        initialSettings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          localStorage.setItem('timeOffSettings', JSON.stringify(newSettings));
          setShowSettings(false);
        }}
      />
    );
  }

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
      <div className="bg-white rounded-lg shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Upcoming Time Off</h2>
        </div>
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
      </div>
    </div>
  );
};

export default Dashboard;