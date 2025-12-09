/**
 * Schedule-related types
 */

export interface ScheduleItem {
  episode: string;
  episode_number: number;
  jname: string;
  link: string;
  slug: string;
  time: string;
  title: string;
  watch_link: string;
}

export interface AvailableDate {
  date: string;
  day: string;
  formatted: string;
  is_active: boolean;
}

export interface DailyScheduleResponse {
  available_dates: AvailableDate[];
  current_date: string;
  schedule: ScheduleItem[];
  timezone: string;
}

export interface DateScheduleResponse {
  date: string;
  schedule: ScheduleItem[];
}

export interface WeeklyScheduleResponse {
  end_date: string;
  start_date: string;
  week_schedule: Record<string, {
    date: string;
    schedule: ScheduleItem[];
  }>;
}
