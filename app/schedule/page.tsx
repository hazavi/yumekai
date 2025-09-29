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
  try {
    const [dailyData, weeklyData] = await Promise.all([
      api.schedule().catch((error) => {
        console.warn('Failed to fetch daily schedule:', error);
        return null;
      }),
      api.scheduleWeek().catch((error) => {
        console.warn('Failed to fetch weekly schedule:', error);
        return null;
      })
    ]);

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
  } catch (error) {
    console.error('Error loading schedule:', error);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Schedule Unavailable</h1>
          <p className="text-white/60 mb-6">Sorry, we couldn&apos;t load the anime schedule at this time.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }
}