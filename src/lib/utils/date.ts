import {
  format,
  formatDistance,
  formatRelative,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  parse,
} from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';

/**
 * Format date for display (e.g., "Monday, 14 March 2023")
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE, dd MMMM yyyy');
}

/**
 * Format date and time for display (e.g., "Monday, 14 March 2023 at 2:30 PM")
 */
export function formatDisplayDateTime(date: Date | string, time: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDisplayDate(d)} at ${time}`;
}

/**
 * Get relative time (e.g., "in 2 days", "3 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
}

/**
 * Check if appointment is today
 */
export function isAppointmentToday(appointmentDate: Date | string): boolean {
  const d = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
  return isToday(d);
}

/**
 * Check if appointment is tomorrow
 */
export function isAppointmentTomorrow(appointmentDate: Date | string): boolean {
  const d = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
  return isTomorrow(d);
}

/**
 * Check if appointment is in the past
 */
export function isAppointmentInPast(appointmentDate: Date | string, slotTime: string): boolean {
  const d = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
  const [hours, minutes] = slotTime.split(':').map(Number);
  const appointmentDateTime = new Date(d);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  return isBefore(appointmentDateTime, new Date());
}

/**
 * Check if appointment can be cancelled (> 2 hours away)
 */
export function canCancelAppointment(appointmentDate: Date | string, slotTime: string): boolean {
  const d = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
  const [hours, minutes] = slotTime.split(':').map(Number);
  const appointmentDateTime = new Date(d);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const twoHoursFromNow = addHours(now, 2);

  return isBefore(now, appointmentDateTime) && isAfter(appointmentDateTime, twoHoursFromNow);
}

/**
 * Get countdown to appointment (e.g., "in 2 days", "in 3 hours")
 */
export function getAppointmentCountdown(appointmentDate: Date | string, slotTime: string): string {
  const d = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
  const [hours, minutes] = slotTime.split(':').map(Number);
  const appointmentDateTime = new Date(d);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  return formatDistance(new Date(), appointmentDateTime, { addSuffix: true });
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Check if time slot is available (not in the past)
 */
export function isTimeSlotAvailable(appointmentDate: Date | string, slotTime: string): boolean {
  return !isAppointmentInPast(appointmentDate, slotTime);
}

/**
 * Get slot duration in minutes
 */
export function getSlotDuration(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return endMinutes - startMinutes;
}

/**
 * Get day of week name (0-6, 0 = Sunday)
 */
export function getDayOfWeekName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}

/**
 * Check if date is within advance booking limit
 */
export function isWithinAdvanceBookingLimit(
  appointmentDate: Date | string,
  advanceDays: number = 30
): boolean {
  const d = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
  const maxDate = addDays(startOfDay(new Date()), advanceDays);
  return isBefore(d, maxDate);
}
