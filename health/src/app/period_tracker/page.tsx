'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '@/components/Calendar';
import { format, addMonths, subMonths } from 'date-fns';
import styles from '@/components/Calendar.module.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { div } from 'framer-motion/client';
type CycleData = {
  id: string;
  start_date: string;
  nextPeriodDuration: number;
  end_date: string;
};

type PredictionData = {
  nextPeriodStartDate: string;
  ovulationWindow: string[];
  nextPeriodDuration: number; // ✅ add this field
};

export default function period_tracker() {
  const [months, setMonths] = useState<Date[]>([]);
  const [periodCycles, setPeriodCycles] = useState<CycleData[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with a few months
    const today = new Date();
    setMonths([
      subMonths(today, 2),
      subMonths(today, 1),
      today,
      addMonths(today, 1),
      addMonths(today, 2),
    ]);
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop < 500) {
        setMonths(prevMonths => [subMonths(prevMonths[0], 1), ...prevMonths]);
      }

      if (scrollHeight - scrollTop - clientHeight < 500) {
        setMonths(prevMonths => [...prevMonths, addMonths(prevMonths[prevMonths.length - 1], 1)]);
      }
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [months]);

  // ... in src/app/page.tsx, find the fetchData function

  const fetchData = async () => {
    setLoading(true);
    const periodRes = await fetch('/api/period');
    const periodData = await periodRes.json();
    setPeriodCycles(periodData);

    if (periodData.length >= 2) {
      const predictRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodCycles: periodData }),
      });
      const predictData = await predictRes.json();

      // Add this line to see the data in your browser's console
      console.log("Prediction API response:", predictData); 

      setPredictions(predictData);
    }

    setLoading(false);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const savePeriodCycle = async () => {
    if (selectedDates.length === 0) return;

    const sortedDates = [...selectedDates].sort();
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const res = await fetch('/api/period', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, userId: 'dummy-user-1' }),
    });

    if (res.ok) {
      setSelectedDates([]);
      fetchData();
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem', fontSize: '1.25rem', fontWeight: '600' }}>Loading...</div>;
  }

  // src/app/page.tsx

// ... (imports) ...

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', paddingTop: '2rem', flexShrink: 0 }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#4b5563' }}>Period Tracker 🩸</h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', marginTop: '0.5rem' }}>Track your cycle and predict your fertile window.</p>
        </div>

        <div ref={scrollContainerRef} style={{ overflowY: 'auto', padding: '0 2rem' }}>
          {months.map((month, index) => (
            <Calendar
              key={index}
              month={month}
              onDateClick={handleDateClick}
              periodCycles={periodCycles}
              predictions={predictions}
              selectedDates={selectedDates}
              onMarkPeriods={savePeriodCycle}
            />
          ))}
          
          {selectedDates.length > 0 && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <button
                onClick={savePeriodCycle}
                className={styles.saveButton}
              >
                Mark my periods
              </button>
            </div>
          )}

          {/* This is the section you need to update */}
          {predictions && predictions.nextPeriodStartDate && (
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '32rem', margin: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Your Predictions ✨</h3>
              <p style={{ marginTop: '0.5rem' }}>
                Your next period is predicted to start around: **{format(new Date(predictions.nextPeriodStartDate), 'MMMM do')}**
              </p>
              <p style={{ marginTop: '0.5rem', color: '#3b82f6' }}>
                Your fertile window is from: **{format(new Date(predictions.ovulationWindow[0]), 'MMMM do')}** to **{format(new Date(predictions.ovulationWindow[predictions.ovulationWindow.length - 1]), 'MMMM do')}**
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );





}
