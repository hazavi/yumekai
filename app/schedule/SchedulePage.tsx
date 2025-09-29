"use client";

import { useState } from "react";
import { DailyScheduleResponse, WeeklyScheduleResponse, ScheduleItem } from "@/models";
import { ScheduleCard, DateSelector } from "@/components";
import { api } from "@/lib/api";

interface SchedulePageProps {
  initialDailyData: DailyScheduleResponse | null;
  initialWeeklyData: WeeklyScheduleResponse | null;
}

export default function SchedulePage({ initialDailyData, initialWeeklyData }: SchedulePageProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [dailyData, setDailyData] = useState(initialDailyData);
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDailyData?.current_date) return initialDailyData.current_date;
    if (initialWeeklyData) {
      const firstDate = Object.keys(initialWeeklyData.week_schedule)[0];
      return firstDate || '';
    }
    return new Date().toISOString().split('T')[0]; // fallback to today
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = async (date: string) => {
    if (date === selectedDate) return;
    
    setLoading(true);
    setError(null);
    const previousDate = selectedDate;
    setSelectedDate(date);
    
    try {
      const newData = await api.schedule(date);
      if ('available_dates' in newData) {
        setDailyData(newData as DailyScheduleResponse);
      } else {
        // Handle date-specific response format
        const dateData = newData as { date: string; schedule: ScheduleItem[] };
        if (dailyData) {
          setDailyData({
            ...dailyData,
            current_date: dateData.date,
            schedule: dateData.schedule
          });
        }
      }
    } catch (error) {
      console.error('Error fetching schedule for date:', error);
      setError('Failed to load schedule for this date. Please try again.');
      // Revert to previous date if the fetch failed
      setSelectedDate(previousDate);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSchedule = (): ScheduleItem[] => {
    if (viewMode === 'daily') {
      // For daily mode, always show today's schedule
      return dailyData?.schedule || [];
    }
    if (viewMode === 'weekly' && weeklyData) {
      return weeklyData.week_schedule[selectedDate]?.schedule || [];
    }
    return [];
  };

  const getAvailableDates = () => {
    if (viewMode === 'weekly' && weeklyData) {
      return Object.keys(weeklyData.week_schedule).map(date => ({
        date,
        day: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        formatted: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        is_active: date === selectedDate
      }));
    }
    return dailyData?.available_dates || [];
  };

  if (!dailyData && !weeklyData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Schedule Unavailable</h1>
        <p className="text-white/60">Sorry, we couldn't load the anime schedule at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pt-20"> {/* Added pt-20 for navbar spacing */}
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Estimated Schedule</h1>
        <p className="text-white/60 text-sm sm:text-base">
          {viewMode === 'daily' && dailyData?.current_date && (
            <>Today's anime releases • </>
          )}
          {dailyData?.timezone && `Times shown in ${dailyData.timezone}`}
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center px-4">
        <div className="bg-[#1a1a1a] rounded-lg p-1 flex w-full max-w-xs">
          <button
            className={`flex-1 px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'daily'
                ? 'bg-purple-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setViewMode('daily')}
          >
            Today
          </button>
          <button
            className={`flex-1 px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'weekly'
                ? 'bg-purple-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => {
              setViewMode('weekly');
              if (weeklyData) {
                // If no date is selected or current date is not in weekly data, select first available date
                if (!selectedDate || !weeklyData.week_schedule[selectedDate]) {
                  const firstDate = Object.keys(weeklyData.week_schedule)[0];
                  if (firstDate) {
                    setSelectedDate(firstDate);
                  }
                }
              }
            }}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Date Selector - Only show in weekly mode */}
      {viewMode === 'weekly' && (
        <DateSelector
          dates={getAvailableDates()}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          loading={loading}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mx-4 sm:mx-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Schedule Content */}
      <div className="space-y-4 px-4 sm:px-0 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white/60">Loading schedule...</p>
          </div>
        ) : (
          <>
            {viewMode === 'daily' ? (
              // Daily view - show only today's schedule
              getCurrentSchedule().length > 0 ? (
                <div className="space-y-3">
                  {getCurrentSchedule().map((item, index) => (
                    <ScheduleCard key={`${item.slug}-${item.episode_number}-${index}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-3">No Anime Today</h3>
                    <p className="text-white/60">
                      There are no anime episodes scheduled for today.
                    </p>
                  </div>
                </div>
              )
            ) : (
              // Weekly view - show only selected day
              getCurrentSchedule().length > 0 ? (
                <div>
                  <div className="mb-4">
                    <div className="bg-gradient-to-r from-purple-600/10 to-transparent rounded-lg p-3 border border-purple-500/20">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm shadow-purple-500/50"></div>
                        {selectedDate && new Date(selectedDate).toLocaleDateString('en', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        <span className="text-xs text-white/50 font-normal bg-white/10 px-2 py-0.5 rounded-full">
                          {getCurrentSchedule().length} episode{getCurrentSchedule().length !== 1 ? 's' : ''}
                        </span>
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {getCurrentSchedule().map((item, index) => (
                      <ScheduleCard key={`${item.slug}-${item.episode_number}-${index}`} item={item} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-3">No Anime Scheduled</h3>
                    <p className="text-white/60">
                      There are no anime episodes scheduled for{' '}
                      {selectedDate && new Date(selectedDate).toLocaleDateString('en', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}