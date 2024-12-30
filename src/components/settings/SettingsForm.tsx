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
  const [formData, setFormData] = useState<PTOSettings>(() => {
    if (initialSettings) {
      return {
        ...initialSettings,
        // Convert Infinity to undefined but preserve 0
        maxRollover: initialSettings.maxRollover === Infinity ? undefined : initialSettings.maxRollover,
        maxBalance: initialSettings.maxBalance === Infinity ? undefined : initialSettings.maxBalance
      };
    }
    return {
      currentBalance: 0,
      accrualRate: 0,
      accrualPeriodType: 'biweekly',
      lastAccrualDate: new Date().toISOString().split('T')[0],
      hasMaxRollover: false,
      maxRollover: undefined,
      hasMaxBalance: false,
      maxBalance: undefined
    };
  });

  const [displayValues, setDisplayValues] = useState({
    currentBalance: formData.currentBalance === 0 ? '' : formData.currentBalance.toString(),
    accrualRate: formData.accrualRate === 0 ? '' : formData.accrualRate.toString()
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

    // Only validate against maxBalance if it's not empty string (meaning it has a set value)
    if (formData.maxBalance !== '' && formData.maxBalance !== undefined && formData.currentBalance > formData.maxBalance) {
      newErrors.currentBalance = 'Current balance cannot exceed maximum balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      // Convert empty strings to undefined, then undefined to Infinity
      const processedData = {
        ...formData,
        maxRollover: formData.maxRollover === '' ? undefined : formData.maxRollover,
        maxBalance: formData.maxBalance === '' ? undefined : formData.maxBalance
      };

      onSave({
        ...processedData,
        maxRollover: processedData.maxRollover ?? Infinity,
        maxBalance: processedData.maxBalance ?? Infinity
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
              type="text"
              inputMode="decimal"
              placeholder="e.g. 13.85"
              value={displayValues.currentBalance}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setDisplayValues(prev => ({
                    ...prev,
                    currentBalance: value
                  }));
                  setFormData(prev => ({
                    ...prev,
                    currentBalance: value === '' ? 0 : parseFloat(value || '0')
                  }));
                  if (errors.currentBalance) {
                    setErrors(prev => ({ ...prev, currentBalance: undefined }));
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setFormData(prev => ({
                    ...prev,
                    currentBalance: 0
                  }));
                }
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.currentBalance ? 'border-red-500' : ''}`}
            />
            {errors.currentBalance && (
              <p className="text-red-500 text-sm mt-1">{errors.currentBalance}</p>
            )}
          </div>

          <div>
            <label className="block mb-2">Accrual Rate (hours per period)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 2.77"
              value={displayValues.accrualRate}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setDisplayValues(prev => ({
                    ...prev,
                    accrualRate: value
                  }));
                  setFormData(prev => ({
                    ...prev,
                    accrualRate: value === '' ? 0 : parseFloat(value || '0')
                  }));
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setFormData(prev => ({
                    ...prev,
                    accrualRate: 0
                  }));
                }
              }}
              onFocus={(e) => e.target.select()}
              className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block mb-2">Accrual Period Type</label>
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
            <label className="block mb-2">Maximum Rollover Hours</label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.maxRollover === undefined ? '' : formData.maxRollover}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*$/.test(value)) {
                  const parsedValue = value === '' ? undefined : parseInt(value);
                  setFormData(prev => ({
                    ...prev,
                    maxRollover: parsedValue,
                    hasMaxRollover: parsedValue !== undefined && parsedValue > 0
                  }));
                }
              }}
              onFocus={(e) => e.target.select()}
              className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="No maximum"
            />
          </div>

          <div>
            <label className="block mb-2">Maximum Balance</label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.maxBalance === undefined ? '' : formData.maxBalance}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*$/.test(value)) {
                  const parsedValue = value === '' ? undefined : parseInt(value);
                  setFormData(prev => ({
                    ...prev,
                    maxBalance: parsedValue,
                    hasMaxBalance: parsedValue !== undefined
                  }));
                  // Validate current balance against new max balance
                  if (parsedValue !== undefined && formData.currentBalance > parsedValue) {
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
                }
              }}
              onFocus={(e) => e.target.select()}
              className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="No maximum"
            />
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