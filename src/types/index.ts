// WHY: The application needs strict typing to ensure consistent handling of PTO data
// WHAT: Defines the core type system for the PTO tracking application
// NOTE: These types form the foundation of type safety throughout the app

// WHY: Companies have different PTO accrual schedules that affect calculations
// WHAT: Defines the supported pay period types for PTO accrual
export type AccrualPeriodType = "weekly" | "biweekly" | "semi-monthly";

// WHY: PTO settings vary by company and need to be configurable
// WHAT: Defines the structure for storing and managing PTO policy settings
// NOTE: All numeric values represent hours unless otherwise specified
export interface PTOSettings {
  currentBalance: number; // Current available PTO hours
  accrualRate: number; // Hours accrued per pay period
  accrualPeriodType: AccrualPeriodType; // Frequency of accrual
  lastAccrualDate: string; // Date of most recent accrual
  hasMaxRollover: boolean; // Whether rollover is limited
  maxRollover: number; // Maximum hours that can roll over
  hasMaxBalance: boolean; // Whether total balance is limited
  maxBalance: number; // Maximum allowed balance
}

// WHY: Different types of days affect PTO calculations differently
// WHAT: Defines the possible types of days in a PTO request
// NOTE: 'full' = 8 hours, 'half' = 4 hours, others = 0 hours
export type DayType = "full" | "half" | "holiday" | "weekend";

// WHY: Each day in a PTO request needs specific handling
// WHAT: Defines the structure for individual days within a PTO event
export interface PTODay {
  date: Date; // The specific date
  type: DayType; // How this day should be counted
  isWeekend: boolean; // Quick reference for weekend status
}

// WHY: PTO requests need to track multiple pieces of information
// WHAT: Defines the structure for a complete PTO request
export interface PTOEvent {
  name: string; // Description of the time off
  startDate: string; // First day of PTO
  endDate: string; // Last day of PTO
  days: PTODay[]; // Detailed information for each day
  totalHours: number; // Total PTO hours requested
  created: string; // Timestamp for ordering events
}

// WHY: Form validation needs structured error reporting
// WHAT: Defines the structure for validation error messages
export interface ValidationError {
  field: string; // Which field had an error
  message: string; // User-friendly error message
}
