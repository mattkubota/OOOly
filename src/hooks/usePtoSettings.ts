import { PTOSettings } from '../types';

export const DEFAULT_SETTINGS: PTOSettings = {
  currentBalance: 0,
  accrualRate: 0,
  accrualPeriodType: 'biweekly',
  lastAccrualDate: new Date().toISOString().split('T')[0],
  hasMaxRollover: true,
  maxRollover: 0,
  hasMaxBalance: true,
  maxBalance: 0
};