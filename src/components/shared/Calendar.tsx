'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { colors } from '@/lib/constants';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get previous month's last days for padding
  const startDate = monthStart;
  const dayOfWeek = startDate.getDay();
  const previousMonthDays = dayOfWeek > 0 ? eachDayOfInterval({
    start: new Date(monthStart.setDate(monthStart.getDate() - dayOfWeek)),
    end: new Date(monthStart.setDate(monthStart.getDate() + dayOfWeek - 1)),
  }) : [];

  const allDays = [...previousMonthDays, ...daysInMonth];
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const isDateDisabled = (date: Date): boolean => {
    if (date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(format(date, 'yyyy-MM-dd'));
    }
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  return (
    <div
      className="w-full rounded-lg p-4"
      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
    >
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: colors.textPrimary }}
        >
          <ChevronLeft size={20} />
        </button>
        <h3 style={{ color: colors.textPrimary }} className="font-semibold text-center flex-1">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: colors.textPrimary }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold py-2"
            style={{ color: colors.textSecondary }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date, dayIndex) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDateObj && isSameDay(date, selectedDateObj);
              const isDisabled = isDateDisabled(date);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={dayIndex}
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  className="py-2 px-1 rounded text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? colors.accentCherry
                      : isTodayDate
                      ? colors.background
                      : 'transparent',
                    color: isSelected
                      ? 'white'
                      : isCurrentMonth
                      ? colors.textPrimary
                      : colors.textSecondary,
                    opacity: isCurrentMonth ? 1 : 0.5,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    borderColor: isTodayDate ? colors.accentCherry : 'transparent',
                    border: isTodayDate ? `2px solid ${colors.accentCherry}` : 'none',
                  }}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
