import { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { DailyScheduleResponse, WeeklyScheduleResponse } from "@/models";
import SchedulePage from "./SchedulePage";

export const metadata: Metadata = {
  title: "Anime Schedule - YumeKai",
  description: "Check the daily and weekly anime release schedule with air times and episodes.",
};

export default async function Schedule() {
  let dailyData = null;
  let weeklyData = null;
  let error = null;

  try {
    const [dailyResult, weeklyResult] = await Promise.allSettled([
      api.schedule(),
      api.scheduleWeek()
    ]);

    if (dailyResult.status === 'fulfilled') {
      dailyData = dailyResult.value;
    } else {
      console.warn('Failed to fetch daily schedule:', dailyResult.reason);
    }

    if (weeklyResult.status === 'fulfilled') {
      weeklyData = weeklyResult.value;
    } else {
      console.warn('Failed to fetch weekly schedule:', weeklyResult.reason);
    }

    // If both failed, capture the error for debugging
    if (!dailyData && !weeklyData) {
      error = {
        daily: dailyResult.status === 'rejected' ? dailyResult.reason?.message : 'Unknown error',
        weekly: weeklyResult.status === 'rejected' ? weeklyResult.reason?.message : 'Unknown error'
      };
    }
  } catch (err) {
    console.error('Schedule page error:', err);
    error = { general: err instanceof Error ? err.message : 'Unknown error' };
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <SchedulePage 
          initialDailyData={dailyData as DailyScheduleResponse | null}
          initialWeeklyData={weeklyData as WeeklyScheduleResponse | null}
        />
      </div>
    </div>
  );
}