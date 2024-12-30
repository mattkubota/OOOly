import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { PTOSettings, AccrualPeriodType } from '../../types';

interface SettingsFormProps {
  onSave: (settings: PTOSettings) => void;
  initialSettings?: PTOSettings;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ 
  onSave, 
  initialSettings 
}) => {
  const [formData, setFormData] = useState<PTOSettings>(initialSettings || {
    currentBalance: 0,
    accrualRate: 0,
    accrualPeriodType: 'biweekly',
    lastAccrualDate: new Date().toISOString().split('T')[0],
    hasMaxRollover: true,
    maxRollover: 0,
    hasMaxBalance: true,
    maxBalance: 0
  });

  const [errors, setErrors] = useState<{
    currentBalance?: string;
    maxBalance?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      currentBalance?: string;
      maxBalance?: string;
    } = {};

    // Validate current balance against max balance
    if (formData.hasMaxBalance && formData.currentBalance > formData.maxBalance) {
      newErrors.currentBalance = 'Current balance cannot exceed maximum balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        maxRollover: formData.hasMaxRollover ? formData.maxRollover : Infinity,
        maxBalance: formData.hasMaxBalance ? formData.maxBalance : Infinity
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">OOOly Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Current Balance (hours)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.currentBalance}
              onChange={(e) => {
                const value = Number(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  currentBalance: value
                }));
                // Clear current balance error when value changes
                if (errors.currentBalance) {
                  setErrors(prev => ({ ...prev, currentBalance: undefined }));
                }
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full p-2 border rounded ${errors.currentBalance ? 'border-red-500' : ''}`}
            />
            {errors.currentBalance && (
              <p className="text-red-500 text-sm mt-1">{errors.currentBalance}</p>
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
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Pay Period Type</label>
            <select
              value={formData.accrualPeriodType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                accrualPeriodType: e.target.value as AccrualPeriodType
              }))}
              className="w-full p-2 border rounded"
            >
              <option value="weekly">Weekly</option>
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!formData.hasMaxBalance}
                  onChange={(e) => {
                    const newHasMaxBalance = !e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      hasMaxBalance: newHasMaxBalance,
                      // Clear any current balance error if no max balance
                      ...(newHasMaxBalance ? {} : { currentBalance: Math.min(prev.currentBalance, Infinity) })
                    }));
                    // Clear any previous errors
                    setErrors(prev => ({ ...prev, currentBalance: undefined }));
                  }}
                />
                No Maximum
              </label>
            </div>
            {formData.hasMaxBalance && (
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxBalance}
                onChange={(e) => {
                  const newMaxBalance = Number(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    maxBalance: newMaxBalance
                  }));
                  // Validate current balance against new max balance
                  if (formData.currentBalance > newMaxBalance) {
                    setErrors(prev => ({
                      ...prev,
                      currentBalance: 'Current balance cannot exceed maximum balance'
                    }));
                  } else {
                    setErrors(prev => ({
                      ...prev,
                      currentBalance: undefined
                    }));
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="w-full p-2 border rounded"
              />
            )}
          </div>

          <button 
            onClick={handleSaveClick}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!!errors.currentBalance || !!errors.maxBalance}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};