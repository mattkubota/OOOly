import { useMemo } from 'react';
import { PTOEvent, PTOSettings } from '../types';
import { calculateNextAccrualDate } from '../utils/dateCalculations';
import { calculateYearEndProjection } from '../utils/ptoCalculations';

export function usePTOCalculations(settings: PTOSettings, events: PTOEvent[]) {
  const nextAccrual = useMemo(() => 
    calculateNextAccrualDate(settings.lastAccrualDate, settings.accrualPeriodType),
    [settings.lastAccrualDate, settings.accrualPeriodType]
  );

  const yearEndProjection = useMemo(() => 
    calculateYearEndProjection(settings, events),
    [settings, events]
  );

  const shouldWarnAboutRollover = useMemo(() => {
    if (!settings.hasMaxRollover) return false;
    return settings.currentBalance > (settings.maxRollover * 0.8);
  }, [settings]);

  const futureBalances = useMemo(() => {
    const balances = events.map(event => {
      const date = new Date(event.startDate);
      const priorEvents = events.filter(e => 
        new Date(e.startDate) < date
      );
      
      let balance = settings.currentBalance;
      priorEvents.forEach(e => {
        balance -= e.totalHours;
      });
      
      return {
        date,
        event,
        balance
      };
    });

    return balances.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [settings, events]);

  return {
    nextAccrual,
    yearEndProjection,
    shouldWarnAboutRollover,
    futureBalances
  };
}