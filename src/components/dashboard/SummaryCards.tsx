// WHY: Users need quick access to key PTO metrics
// WHAT: Displays current balance, accrual rate, and next accrual date
// NOTE: Uses responsive grid layout for different screen sizes

import React from "react";
import { PTOSettings } from "../../types";
import { calculateNextAccrualDate } from "../../utils/dateCalculations";

interface SummaryCardsProps {
  settings: PTOSettings; // Current PTO settings for display
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ settings }) => {
  // WHY: Numbers need grammatically correct labels
  // WHAT: Handles singular/plural forms of words
  const pluralize = (num: number, word: string) =>
    `${num} ${word}${num === 1 ? "" : "s"}`;

  // WHY: Key metrics need equal visual weight and clear separation
  // WHAT: Grid layout with responsive breakpoints and dividers
  // NOTE: Uses sm: breakpoint for tablet and larger screens
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
        {/* WHY: Each metric needs consistent padding and typography
            WHAT: Card for available balance with responsive text sizes */}
        <div className="p-4">
          <h2 className="text-gray-600 mb-2 text-sm sm:text-base">
            Available Balance
          </h2>
          <div className="text-lg sm:text-2xl font-bold">
            {pluralize(settings.currentBalance, "hour")}
          </div>
        </div>

        {/* WHY: Accrual rate needs additional context
            WHAT: Shows rate with period type for clarity */}
        <div className="p-4">
          <h2 className="text-gray-600 mb-2 text-sm sm:text-base">
            Accrual Rate
          </h2>
          <div className="text-lg sm:text-2xl font-bold">
            {pluralize(settings.accrualRate, "hour")}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            per {settings.accrualPeriodType} period
          </div>
        </div>

        {/* WHY: Next accrual date helps with planning
            WHAT: Shows calculated next accrual date */}
        <div className="p-4">
          <h2 className="text-gray-600 mb-2 text-sm sm:text-base">
            Next Accrual
          </h2>
          <div className="text-lg sm:text-2xl font-bold">
            {calculateNextAccrualDate(
              settings.lastAccrualDate,
              settings.accrualPeriodType
            ).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
