import type { AvailableDate } from "@/types";

interface DateSelectorProps {
  dates: AvailableDate[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  loading?: boolean;
}

export function DateSelector({
  dates,
  selectedDate,
  onDateChange,
  loading,
}: DateSelectorProps) {
  if (dates.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center px-4">
      <div className="bg-[#1a1a1a] rounded-lg p-2 overflow-x-auto max-w-full">
        <div className="flex gap-2 min-w-max pb-1">
          {dates.map((date) => (
            <button
              key={date.date}
              onClick={() => onDateChange(date.date)}
              disabled={loading}
              className={`flex flex-col items-center px-3 sm:px-4 py-3 rounded-lg text-sm font-medium transition-all min-w-[70px] sm:min-w-[80px] ${
                date.is_active || selectedDate === date.date
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-purple-600/20"
              } ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span className="text-xs opacity-80 mb-1">{date.day}</span>
              <span className="font-semibold text-xs sm:text-sm">
                {date.formatted}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
