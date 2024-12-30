export type AccrualPeriodType = 'weekly' | 'biweekly' | 'semi-monthly';

export interface PTOSettings {
  currentBalance: number;
  accrualRate: number;
  accrualPeriodType: AccrualPeriodType;
  lastAccrualDate: string;
  hasMaxRollover: boolean;
  maxRollover: number;
  hasMaxBalance: boolean;
  maxBalance: number;
}

export type DayType = 'full' | 'half' | 'holiday' | 'weekend';

export interface PTODay {
  date: Date;
  type: DayType;
  isWeekend: boolean;
}

export interface PTOEvent {
  name: string;
  startDate: string;
  endDate: string;
  days: PTODay[];
  totalHours: number;
  created: string;
}

export interface ValidationError {
  field: string;
  message: string;
}