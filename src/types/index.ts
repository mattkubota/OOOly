// WHY: Need consistent type definitions for PTO-related data structures
// WHAT: Defines core types used throughout the PTO tracking application
// NOTE: Uses string dates (YYYY-MM-DD format) for consistent date handling

export type AccrualPeriodType = "weekly" | "biweekly" | "semi-monthly";
export type DayType = "full" | "half" | "holiday" | "weekend";

// WHY: Need to track individual days within a PTO event
// WHAT: Defines the structure for a single day in a PTO request
// NOTE: Uses string format for dates to avoid timezone complications
export interface PTODay {
  date: string; // YYYY-MM-DD format
  type: DayType; // Type of day (full, half, holiday, weekend)
  isWeekend: boolean; // Quick access for weekend status
}

// WHY: Need to track complete PTO events
// WHAT: Defines the structure for a PTO request event
// NOTE: All dates use YYYY-MM-DD format
export interface PTOEvent {
  name: string; // Event description
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  days: PTODay[]; // Array of configured days
  totalHours: number; // Total PTO hours requested
  created: string; // YYYY-MM-DD format of creation date
}

// WHY: Need to track PTO settings and policies
// WHAT: Defines the structure for PTO configuration
// NOTE: Uses string format for dates
export interface PTOSettings {
  currentBalance: number;
  accrualRate: number;
  accrualPeriodType: AccrualPeriodType;
  lastAccrualDate: string; // YYYY-MM-DD format
  hasMaxRollover: boolean;
  maxRollover: number;
  hasMaxBalance: boolean;
  maxBalance: number;
}
