import { useState, useCallback } from 'react';
import { PTOSettings } from '../types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SETTINGS: PTOSettings = {
  currentBalance: 0,
  accrualRate: 0,
  accrualPeriodType: 'biweekly',
  lastAccrualDate: new Date().toISOString().split('T')[0],
  hasMaxRollover: true,
  maxRollover: 0,
  hasMaxBalance: true,
  maxBalance: 0
};

export function usePTOSettings() {
  const [settings, setSettings] = useLocalStorage<PTOSettings>('timeOffSettings', DEFAULT_SETTINGS);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateSettings = useCallback((settings: PTOSettings) => {
    const errors: Record<string, string> = {};
    
    if (settings.currentBalance < 0) {
      errors.currentBalance = 'Balance cannot be negative';
    }
    
    if (settings.accrualRate < 0) {
      errors.accrualRate = 'Accrual rate cannot be negative';
    }
    
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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const updateSettings = useCallback((newSettings: PTOSettings) => {
    if (validateSettings(newSettings)) {
      // Convert empty/undefined values to 0 when saving
      const settingsToSave = {
        ...newSettings,
        maxRollover: newSettings.maxRollover ?? 0,
        maxBalance: newSettings.maxBalance ?? 0
      };
      setSettings(settingsToSave);
      return true;
    }
    return false;
  }, [setSettings, validateSettings]);

  return {
    settings,
    updateSettings,
    validationErrors,
    hasSettings: settings !== null
  };
}