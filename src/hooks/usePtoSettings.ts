// WHY: New users need sensible starting values for PTO settings
// WHAT: Provides default configuration for PTO tracking
// NOTE: These values serve as a starting point and should be customized

import { PTOSettings } from "../types";

// WHY: Application needs fallback values when no settings exist
// WHAT: Defines conservative default values for all PTO settings
// NOTE: These defaults prioritize safety (zero values) to prevent accidental PTO overdraft
export const DEFAULT_SETTINGS: PTOSettings = {
  currentBalance: 0, // Start with zero available hours
  accrualRate: 0, // No automatic accrual by default
  accrualPeriodType: "biweekly", // Most common pay period type
  lastAccrualDate: new Date().toISOString().split("T")[0], // Today's date as starting point
  hasMaxRollover: false, // Enable rollover limit by default
  maxRollover: 0, // Conservative zero rollover
  hasMaxBalance: false, // Enable balance limit by default
  maxBalance: 0, // Conservative zero balance limit
};
