import React from 'react';
import { PTOSettings } from '../../types';
import { calculateNextAccrualDate } from '../../utils/dateCalculations';

interface SummaryCardsProps {
  settings: PTOSettings;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ settings }) => {
  const pluralize = (num: number, word: string) => 
    `${num} ${word}${num === 1 ? '' : 's'}`;

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="grid grid-cols-3 divide-x">
        <div className="p-4">
          <h2 className="text-gray-600 mb-2">Available Balance</h2>
          <div className="text-2xl font-bold">{pluralize(settings.currentBalance, 'hour')}</div>
        </div>
        <div className="p-4">
          <h2 className="text-gray-600 mb-2">Accrual Rate</h2>
          <div className="text-2xl font-bold">{pluralize(settings.accrualRate, 'hour')}</div>
          <div className="text-sm text-gray-500">per {settings.accrualPeriodType} period</div>
        </div>
        <div className="p-4">
          <h2 className="text-gray-600 mb-2">Next Accrual</h2>
          <div className="text-2xl font-bold">
            {calculateNextAccrualDate(settings.lastAccrualDate, settings.accrualPeriodType)
              .toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};