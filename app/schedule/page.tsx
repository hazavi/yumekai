import { Metadata } from "next";
import { api } from "@/lib/api";
import { DailyScheduleResponse, WeeklyScheduleResponse } from "@/models";
import SchedulePage from "./SchedulePage";

export const metadata: Metadata = {
  title: "Anime Schedule - YumeKai",
  description: "Check the daily and weekly anime release schedule with air times and episodes.",
};

// Force dynamic rendering - don't statically generate this page
export const dynamic = 'force-dynamic';

export default async function Schedule() {
  let dailyData = null;
  let weeklyData = null;

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
  } catch (err) {
    console.error('Schedule page error:', err);
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