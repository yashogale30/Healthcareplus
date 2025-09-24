// src/components/Calendar.tsx

'use client';

import React from 'react';
import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isFuture, addDays } from 'date-fns';
import styles from './Calendar.module.css';

type CycleData = {
  start_date: string;
  end_date: string;
};

type PredictionData = {
  nextPeriodStartDate: string;
  nextPeriodDuration: number; // Add this new field
  ovulationWindow: string[];
};

type CalendarProps = {
  month: Date;
  onDateClick: (date: Date) => void;
  periodCycles: CycleData[];
  predictions: PredictionData | null;
  selectedDates: string[];
  onMarkPeriods: () => void;
};

export const Calendar = ({ month, onDateClick, periodCycles, predictions, selectedDates, onMarkPeriods }: CalendarProps) => {
  const startDay = startOfMonth(month);
  const firstDayOffset = startDay.getDay();
  const calendarDays = eachDayOfInterval({ start: startDay, end: endOfMonth(month) });

  const selectedDatesInMonth = selectedDates.filter(dateStr => 
    new Date(dateStr).getMonth() === month.getMonth() && new Date(dateStr).getFullYear() === month.getFullYear()
  );

  const isSelected = (date: Date) => selectedDates.includes(format(date, 'yyyy-MM-dd'));

  // Create an array of predicted period dates
  let predictedPeriodDates: Date[] = [];
  if (predictions && predictions.nextPeriodStartDate) {
    const startDate = new Date(predictions.nextPeriodStartDate);
    const endDate = addDays(startDate, predictions.nextPeriodDuration - 1);
    predictedPeriodDates = eachDayOfInterval({ start: startDate, end: endDate });
  }

  const getDayStatus = (date: Date) => {
  // Add this check to ensure periodCycles is an array
   if (!periodCycles || !Array.isArray(periodCycles)) {
    return { isPeriod: false, isOvulation: false, isPredictedPeriod: false };
   }

  // Existing period check
   const isPeriod = periodCycles.some(cycle => 
    isSameDay(date, new Date(cycle.start_date)) || 
    (date > new Date(cycle.start_date) && date < new Date(cycle.end_date)) ||
    isSameDay(date, new Date(cycle.end_date))
   );

  // New predicted period check
   let predictedPeriodDates: Date[] = [];
   if (predictions && predictions.nextPeriodStartDate) {
    const startDate = new Date(predictions.nextPeriodStartDate);
    const endDate = addDays(startDate, predictions.nextPeriodDuration - 1);
    predictedPeriodDates = eachDayOfInterval({ start: startDate, end: endDate });
   }

   const isPredictedPeriod = predictedPeriodDates.some(pDate => isSameDay(date, pDate));
   const isOvulation = predictions?.ovulationWindow?.includes(format(date, 'yyyy-MM-dd'));

   return { isPeriod, isOvulation, isPredictedPeriod };
 };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{format(month, 'MMMM yyyy')}</h2>
      </div>
      <div className={styles.daysOfWeek}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className={styles.gridContainer}>
        {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} className={styles.day}></div>)}
        {calendarDays.map((date, i) => {
          const { isPeriod, isOvulation, isPredictedPeriod } = getDayStatus(date);
          const isMarked = isSelected(date);
          const isFutureDate = isFuture(date);
          
          let dayClasses = `${styles.day}`;
          
          if (isPeriod) {
            dayClasses += ` ${styles.periodDay}`;
          } else if (isPredictedPeriod) { // Add predicted period styling
            dayClasses += ` ${styles.predictedPeriodDay}`; 
          } else if (isOvulation) {
            dayClasses += ` ${styles.ovulationDay}`;
          } else if (isMarked) {
            dayClasses += ` ${styles.markedDay}`;
          } else if (isFutureDate) {
            dayClasses += ` ${styles.disabledDay}`;
          }

          return (
            <div
              key={i}
              className={dayClasses}
              onClick={() => !isFutureDate && onDateClick(date)}
            >
              {format(date, 'd')}
            </div>
          );
        })}
      </div>
      
      {selectedDatesInMonth.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={onMarkPeriods}
            className={styles.saveButton}
          >
            Mark my periods
          </button>
        </div>
      )}
    </div>
  );
};