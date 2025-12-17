
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekPickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({ currentDate, onDateChange }) => {
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const startOfCurrentWeek = getStartOfWeek(currentDate);

  const navigateWeek = (weeks: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + weeks * 7);
    onDateChange(newDate);
  };

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  };

  const weeks = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(startOfCurrentWeek);
    date.setDate(date.getDate() + (i - 4) * 7);
    return {
      date,
      label: `Week ${getWeekNumber(date)} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      active: getWeekNumber(date) === getWeekNumber(currentDate)
    };
  });

  return (
    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
      <button 
        onClick={() => navigateWeek(-1)}
        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ChevronLeft size={20} className="text-slate-600" />
      </button>

      <select 
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
        value={getWeekNumber(currentDate)}
        onChange={(e) => {
          const selectedWeek = weeks.find(w => getWeekNumber(w.date) === parseInt(e.target.value));
          if (selectedWeek) onDateChange(selectedWeek.date);
        }}
      >
        {weeks.map((w, idx) => (
          <option key={idx} value={getWeekNumber(w.date)}>
            {w.label}
          </option>
        ))}
      </select>

      <button 
        onClick={() => navigateWeek(1)}
        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ChevronRight size={20} className="text-slate-600" />
      </button>
    </div>
  );
};

export default WeekPicker;
