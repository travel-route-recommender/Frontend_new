import type { DayKey } from "../data/workspace";

type DaySelectorProps = {
  days: DayKey[];
  activeDay: DayKey;
  onChange: (day: DayKey) => void;
};

export function DaySelector({ days, activeDay, onChange }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {days.map((day) => (
        <button
          key={day}
          onClick={() => onChange(day)}
          className={`h-12 shrink-0 rounded-[17px] px-5 text-sm font-black transition ${
            activeDay === day
              ? "bg-[#4F86F7] text-white shadow-[0_10px_18px_rgba(79,134,247,0.26)]"
              : "bg-white text-[#89AEE4] shadow-[0_8px_16px_rgba(91,129,190,0.12)] hover:bg-[#F7FBFF]"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
